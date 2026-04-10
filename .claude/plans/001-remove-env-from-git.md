# 将 .env 移出 Git，默认配置内置到 config.ts

## 背景

当前 `.env` 被提交到 Git，存在安全隐患（密钥泄露），且开发者容易混淆"默认配置"与"本地覆盖"的边界。目标：

- 合理的开发默认值内置到 `config.ts`（通过 `loadEnv` 的 `default` 参数）
- `.env` 从 Git 历史中永久移除
- 提供 `.env.example` 作为开发者参考

## 步骤

### Step 1: 更新 `src/config/config.ts` — 补充开发默认值

将 `.env` 中适合作为开发默认值的配置移入 `loadEnv` 的 `default` 参数。**敏感信息和各类密钥不设默认值**。

具体变更：

```ts
export const port = loadEnv('PORT', { default: '9527' });

export const auth = {
  maxLoginAttempts: toInteger(loadEnv('MAX_LOGIN_ATTEMPTS', { default: '5' })),
  loginLockInS: toInteger(loadEnv('LOGIN_LOCK_IN_S', { default: '60' })),
  jwtSecretKey: loadEnv('JWT_SECRET_KEY'),           // 无默认值，不设则走 RS256
  apiKey: loadEnv('API_KEY'),                         // 无默认值，敏感
  refreshTokenExpiresIn: loadEnv('REFRESH_TOKEN_EXPIRES_IN', { default: '7d' }),
  tokenExpiresIn: loadEnv('TOKEN_EXPIRES_IN', { default: '1d' }),
};

export const captcha = {
  expiresInS: toInteger(loadEnv('CAPTCHA_EXPIRES_IN_S', { default: '300' })),
  codeLength: toInteger(loadEnv('CAPTCHA_CODE_LENGTH', { default: '6' })),
};

export const email = {
  transporter: loadEnv('EMAIL_TRANSPORTER', { default: 'nodemailer' }) as EmailTransporter,
  nodemailer: {
    pool: true,
    host: loadEnv('NODEMAILER_HOST', { default: 'smtp.qq.com' }),
    port: Number(loadEnv('NODEMAILER_PORT', { default: '465' })),
    secure: toBoolean(loadEnv('NODEMAILER_SECURE', { default: 'true' })),
    // ... auth user/pass 无默认值
  },
  // ...
};

export const mongo = {
  url: loadEnv('MONGO_URL', { default: 'mongodb://localhost/auth-dev' }),
};

export const redis = {
  url: loadEnv('REDIS_URL', { default: 'redis://localhost' }),
};
```

**不设默认值的变量**（敏感/运行时特定）：
- `JWT_SECRET_KEY`, `API_KEY`, `ROOT_SESSION_KEY`
- `NODEMAILER_AUTH_USER`, `NODEMAILER_AUTH_PASS`, `POSTMARK_API_TOKEN`
- 所有 ALIYUN_*, VOLCENGINE_*, JIGUANG_* 密钥
- OAuth provider 相关变量（动态加载，已有 `required: true`）

### Step 2: 创建 `.env.example`

提供一份注释完善的模板文件，列出所有可配置变量，敏感值留空：

```env
# ============ 基础配置 ============
# PORT=9527
# PREFIX=

# ============ 数据库 ============
# MONGO_URL=mongodb://localhost/auth-dev
# REDIS_URL=redis://localhost

# ============ JWT ============
# 设置此值将使用 HS256 算法；不设置则使用 RS256（需要 ssl/private.key）
# JWT_SECRET_KEY=
API_KEY=

# ============ 登录安全 ============
# MAX_LOGIN_ATTEMPTS=5
# LOGIN_LOCK_IN_S=60

# ============ 验证码 ============
# CAPTCHA_EXPIRES_IN_S=300
# CAPTCHA_CODE_LENGTH=6

# ... 完整列出所有变量
```

已有默认值的变量注释掉并标注默认值，必须由开发者填写的变量不注释。

### Step 3: 更新 `.gitignore`

将 `.env.*` 改为同时忽略 `.env`：

```gitignore
# env
.env
.env.*
.envrc
```

### Step 4: 更新 Dockerfile

当前 `Dockerfile:16` 显式 `COPY .env`。移除此行——生产环境应通过容器编排注入环境变量，不应依赖 `.env` 文件：

```dockerfile
# 修改前
COPY package.json pnpm-lock.yaml .env ./

# 修改后
COPY package.json pnpm-lock.yaml ./
```

### Step 5: 从 Git 历史中永久移除 `.env`

```bash
# 从 Git 索引中移除（保留本地文件）
git rm --cached .env

# 用 git-filter-repo 从历史中清除（需安装 git-filter-repo）
git filter-repo --path .env --invert-paths
```

> **注意**：`git filter-repo` 会重写所有提交历史，需要 force push。所有协作者需要重新 clone。如果团队影响较大，也可以只做 `git rm --cached .env` 从当前开始停止追踪，不重写历史。

### Step 6: 更新 README.md

更新 env 章节，说明新的配置方式：
- 开发默认值已内置到 `config.ts`，多数情况下无需 `.env` 即可启动
- 如需覆盖，复制 `.env.example` 为 `.env.local` 并修改
- 生产环境通过环境变量注入

## 文件变更汇总

| 文件 | 操作 |
|------|------|
| `src/config/config.ts` | 修改 — 添加开发默认值 |
| `.env.example` | 新增 |
| `.gitignore` | 修改 — 添加 `.env` |
| `Dockerfile` | 修改 — 移除 COPY .env |
| `README.md` | 修改 — 更新 env 说明 |
| `.env` | 从 Git 移除（本地保留） |
