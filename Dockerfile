###################
# Create base image with PNPM installed
###################

FROM node:22-alpine3.21 AS base
ENV CI=1
RUN apk --no-cache add libc6-compat
RUN npm install -g pnpm@10.28.1

###################
# Copy just my dependency files
###################

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY ssl ./ssl
COPY templates ./templates
COPY bin ./bin

###################
# Install all dependencies and build
###################

FROM deps AS builder
WORKDIR /app
RUN pnpm fetch
COPY . .
RUN pnpm install --offline
RUN pnpm build

###################
# Install production only dependencies
###################

FROM deps AS runner
ENV NODE_ENV production
RUN pnpm fetch --prod
COPY --from=builder /app/dist ./dist
RUN pnpm install --offline --prod

# Container-level health check (Docker only, NOT K8s). Hits /health which
# pings Redis + MongoDB. Choose /health over /hello here because Docker does
# not distinguish liveness vs readiness, so the more informative endpoint is
# preferable. Override PORT via the container env if not the default 3000.
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Recommended K8s probe configuration (add under Deployment containers[].*):
#
#   livenessProbe:                       # decides "should I restart the container?"
#     httpGet: { path: /hello, port: 3000 }   # /hello never touches deps
#     initialDelaySeconds: 10
#     periodSeconds: 10
#     timeoutSeconds: 2
#     failureThreshold: 3                # restart after ~30s of no response
#   readinessProbe:                      # decides "should I receive traffic?"
#     httpGet: { path: /health, port: 3000 }  # /health pings Redis + MongoDB
#     initialDelaySeconds: 5
#     periodSeconds: 10
#     timeoutSeconds: 3
#     failureThreshold: 2                # drop from Endpoints after ~20s
#
# The split matters: dependency outages (Redis failover, Mongo network blip)
# only make /health return 503, which pulls the pod out of the Service. /hello
# keeps returning 200, so the container is NOT restarted. Restarting on a
# dependency outage helps nothing and stampedes the recovering dependency.

CMD [ "pnpm", "start" ]
