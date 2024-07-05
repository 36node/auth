###################
# Create base image with PNPM installed
###################

FROM node:18-alpine AS pnpm
ENV CI=1
RUN apk --no-cache add libc6-compat
RUN npm install -g pnpm

###################
# Copy just my dependency files
###################

FROM pnpm AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ssl templates bin .env ./

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
CMD [ "pnpm", "start:prod" ]
