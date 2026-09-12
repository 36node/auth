# 验证码接入与安全切换

业务后端通过 auth 签发和消费图形、短信、邮箱验证码。auth 仅供可信后端调用，所有请求携带 `x-api-key`；浏览器和 App 只接收验证码 key、有效期或图形，不能接收答案或 API key。

## 配置与策略

验证码以明文保存在数据库的 `code` 字段，不需要额外密钥配置。只有签发响应返回答案，查询接口仅返回元数据，成功消费时原子清除答案。图形答案统一转为大写后保存和校验；数据库读取权限可以访问尚未清除的验证码。

默认使用以下策略；`CAPTCHA_POLICY_JSON` 和 `CAPTCHA_REDIS_PREFIX` 均可省略。

| 类型 | 答案 | 有效期 | 单条错误次数 | 同一对象签发限制 | 同一对象校验请求限制 |
| --- | --- | --- | --- | --- | --- |
| `image` | 默认 4 位英数字；可传 4～8 位英数字，不区分大小写 | 120 秒 | 3 | 间隔 1 秒，滚动 1 分钟 20 次 | 滚动 1 分钟 30 次 |
| `sms` | 服务端生成 6 位数字，保留前导零 | 300 秒 | 5 | 间隔 60 秒，滚动 1 小时 5 次、24 小时 10 次 | 滚动 10 分钟 20 次 |
| `email` | 服务端生成 6 位数字，保留前导零 | 600 秒 | 5 | 间隔 60 秒，滚动 1 小时 5 次、24 小时 10 次 | 滚动 10 分钟 20 次 |

限流按 `kind + subject` 共享，不随用途、重发或撤销重置；获准进入校验流程的正确和错误请求均占用额度，超过额度的请求直接拒绝。签发与校验分别计数，下游失败不返还额度。

`CAPTCHA_POLICY_JSON` 可覆盖每类策略的 `expiresInS、maxAttempts、issueIntervalS、issueLimits、verifyLimits`，未提供字段沿用表中默认值。例如：

```dotenv
CAPTCHA_POLICY_JSON={"sms":{"maxAttempts":3,"issueLimits":[{"windowS":3600,"limit":4},{"windowS":86400,"limit":8}]}}
CAPTCHA_REDIS_PREFIX=auth:captcha
```

策略中的有效期限制为 1～600 秒，单条错误次数为 1～10，签发间隔为 1～86400 秒。每组限流规则包含 1～3 个窗口，窗口为 1～86400 秒，额度为 1～10000。非法配置拒绝启动。所有实例的策略及 Redis 前缀保持一致；任意更换前缀会丢失原有限流上下文。

短信发送需配置真实 `SMS_PROVIDER` 及供应商凭据；默认 `blackhole` 不发送短信。邮件默认 `EMAIL_TRANSPORTER=blackhole`，同样不投递。

## 接口

以下路径相对于实际部署的 `PREFIX`。请求和响应使用 JSON。

| API | 输入 | 输出与语义 |
| --- | --- | --- |
| `POST /captchas` | 必填 `kind、purpose、subject`；仅 `image` 可选传 `code` | `201`；返回 `id、key、kind、purpose、subject、expireAt、maxAttempts、failedAttempts、status、createdAt、updatedAt`，并且仅在本次响应中包含 `code` |
| `POST /captchas/@verifyCaptcha` | 必填 `key、code、kind、purpose、subject` | `200 {"success":true/false}`；成功即消费，不可再次使用 |
| `GET /captchas` | 可按 `key、kind、purpose、subject` 筛选，支持 `_limit、_offset、_sort` | 元数据数组；不提供答案或按答案筛选 |
| `GET /captchas/:captchaId` | 文档 id | 元数据；不存在返回 `404 CAPTCHA_NOT_FOUND` |
| `POST /captchas/@count` | query 与列表相同 | `{"count": number}` |
| `DELETE /captchas/:key` | 本次签发的 key，注意不是文档 id | 幂等 `204`；旧 key 不会撤销新码 |

`kind` 是 `image / sms / email`；`purpose` 为以小写字母开头的 1～64 位业务标识，可包含小写字母、数字、下划线、点、冒号和连字符。`subject` 是最多 320 字符的非空字符串，由业务后端确定：短信使用实际账号手机号，邮箱使用实际账号邮箱，图形使用服务端签发的匿名会话 ID。

手机号、邮箱严格沿用现有账号查找规则，本次不做手机号格式或邮箱大小写归一化。签发时的 `subject` 必须与提交给认证接口的账号值完全一致，调用方应复用账号系统已有的标准值。

OpenAPI 和 SDK 将 GET/DELETE 的路径参数统一命名为 `identifier`，避免同层级重复模板路径：GET 传文档 id，DELETE 传本次签发 key。实际 URL 路径不变。

创建时指定 `key、expireAt` 不再生效；没有绑定字段的旧请求返回 `400`。`PATCH /captchas/:captchaId` 已删除。错误、过期、已使用、次数耗尽或场景不符均验证失败；认证接口继续使用原有的 `AUTH_FAILED` 或 `CAPTCHA_INVALID` 业务错误。累计限流返回 `429 CAPTCHA_RATE_LIMITED`，`Retry-After` 是需要等待的秒数。依赖不可用或超时返回 `503 CAPTCHA_UNAVAILABLE`。

## 手机号登录示例

所有调用在业务后端执行。下面的 `fetch` 代码适用于 Node.js 22；`AUTH_BASE_URL` 包含实际的路由前缀，`AUTH_API_KEY` 仅保存在业务后端。

```js
async function authRequest(path, body, method = 'POST') {
  const response = await fetch(`${process.env.AUTH_BASE_URL}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.AUTH_API_KEY,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const error = new Error(`Auth returned ${response.status}`);
    error.status = response.status;
    error.retryAfter = response.headers.get('retry-after');
    throw error;
  }
  return response.status === 204 ? undefined : response.json();
}

// 收到用户的“发送验证码”请求后，由业务后端确定手机号和用途。
const phone = '13800138000';
const issued = await authRequest('/captchas', {
  kind: 'sms', purpose: 'login', subject: phone,
});
await authRequest('/sms/@sendSms', {
  phone,
  sign: process.env.SMS_SIGN,
  template: process.env.SMS_TEMPLATE,
  params: { code: issued.code },
});
// 发给前端的响应仅包含 key、expireAt，禁止返回 issued.code。
const frontendResponse = { key: issued.key, expireAt: issued.expireAt };

// 用户输入短信答案后，由业务后端转调；保持 code 为字符串。
async function login(phone, key, code) {
  return authRequest('/auth/@loginByPhone', {
    phone, key, code, autoRegister: true,
  });
}
```

创建与发送仍是两次调用。供应商确定拒绝发送时，可调用 `DELETE /captchas/${issued.key}` 撤销本次验证码；发送超时、网络中断等结果不确定的情况不得自动再次发送。不要记录完整请求、验证码或供应商异常对象。

登录响应包含访问令牌 `token、tokenExpireAt` 和会话信息；会话的 `key` 可作为刷新令牌，区别于验证码 key。

## 图形、邮箱与其他认证流程

图形验证和对应操作在同一次业务请求中完成。例如，后端签发 `{kind:"image", purpose:"send_sms", subject:匿名会话ID}`，使用创建响应中的答案绘制图片，仅将图片及 key 返回前端。用户提交图形答案并请求短信时，后端从可信会话上下文取得 `subject`，调用 `@verifyCaptcha`；成功后才执行短信签发与发送。取消“先预校验、后用原码提交操作”的调用流程。

邮箱登录使用 `kind=email、purpose=login、subject=实际邮箱`，通过通用邮件接口发送后，调用 `/auth/@loginByEmail`，提交 `email、key、code`。

| 认证接口 | auth 固定的验证码上下文 |
| --- | --- |
| `@loginByPhone` / `@loginByEmail` | `sms/email + login + 实际账号`；`autoRegister` 仍使用 `login` |
| `@registerByPhone` / `@registerByEmail` | `sms/email + register + 实际账号` |
| `@resetPasswordByPhone` / `@resetPasswordByEmail` | `sms/email + reset_password + 实际账号` |

auth 自行确定认证用途及验证对象，不使用客户端传入的场景值。认证接口先校验并消费验证码，再查询、创建或修改账号。成功消费后，即使账号不存在、业务操作失败或客户端没收到响应，也不恢复验证码；用户需重新获取。

同一 `kind + purpose + subject` 重发时原子轮换 key，以数据库写入顺序为准，旧 key 立即失效。不同用途不能混用验证码。过期清理由 MongoDB TTL 异步执行，是否可用始终由校验条件决定。

业务后端还需落实真实 IP、匿名会话、实际短信/邮件发送次数和供应商费用配额限制。auth 的签发限流只约束验证码签发，不代表通用发送接口的实际发送配额。

## 发送记录变化

所有消息只记录元数据，不区分是否为验证码：

- 短信记录保留手机号、签名、模板、消息组、状态及时间，不保存 `params`。
- 邮件记录保留发件人、收件人、状态及时间，不保存 `subject、content`。
- 发送请求仍接受完整短信参数和邮件标题/正文，用于实际发送。
- 记录 CRUD 不再接受这些内容字段，查询也不返回尚未迁移的历史内容。

排查使用记录 id、状态、时间及供应商控制台。auth 的结构化事件包含 `captcha_issued、captcha_verified、captcha_invalid、captcha_rate_limited、captcha_dependency_failed、sms_sent、sms_send_failed、email_sent、email_send_failed`，不包含答案或原始请求。

## 同步切换与迁移

这是一次不兼容升级。更新业务后端和对应 SDK 后，在同一窗口切换；旧验证码需要重新获取。

1. 准备适配后的业务后端及 auth，确认生产限流策略；先生成、核对 OpenAPI 和 SDK。
2. 在目标环境运行只读统计：`pnpm migrate:captcha-security`。连接使用该环境的 `MONGO_URL`；输出只包含计数。
3. 在业务入口暂停验证码签发、认证及相关发送，停止旧版本实例写入。
4. 显式执行迁移：`CAPTCHA_MAINTENANCE_MODE=true pnpm migrate:captcha-security --execute`。该环境变量只确认维护状态，不会替你暂停流量。
5. 同步部署新 auth 与调用方，验证图形、短信、邮箱链路，再恢复入口。

执行模式删除缺少绑定信息或仍保存旧 `codeHash` 的验证码，清除历史短信 `params` 和邮件 `subject、content`，建立作用域唯一索引和到期 TTL。脚本只操作这三个集合，可重复执行；保留绑定完整的新格式明文验证码和已消费记录。新应用也会同步验证码索引，因此必须先完成旧数据迁移，再启动新实例。

切换失败时保持验证码入口暂停，修复后再开放；不恢复旧验证码或历史消息内容。

上线后统计验证码成功率、无效比例、429 比例、依赖故障及发送失败率，确认调用方没有遗留预校验、错误用途或旧删除参数。

## 验证与 SDK

```sh
pnpm test:security
pnpm test:e2e --runInBand
pnpm lint
pnpm build
NODE_ENV=development node bin/generate-swagger.js
pnpm gen:sdk
```

运行全量 e2e 前，将 `MONGO_URL` 和 `MONGO_TEST_BASE_URL` 指向专用测试数据库服务；已有认证/用户测试会清空其连接的测试数据库。

生成文档时使用隔离的数据库配置。Jest 发送器使用 blackhole；安全测试使用临时 MongoDB 和专用 Redis 键，不清空共享 Redis。CI 要求安全单测、集成测试、构建、lint 及 OpenAPI 一致性检查通过，并通过既有工作流发布对应 SDK。
