# 用户 ID 一次性迁移 Runbook

## 目标与范围

- 目标：将历史用户的 ObjectId 主键迁移为字符串主键，且值等于原 ObjectId 的 stringify 结果。
- 新用户规则：导入时可显式传入 id，不传则由应用自动生成 nanoid。
- 迁移方式：停机窗口内一次性迁移到位。
- 回滚方式：基于备份集合重命名回滚，必要时整库快照恢复。

## 一次性改造方案（仅方案 A）

### 方案 A：应用脚本方案

使用仓库内脚本完成以下动作：

1. 预检查。
2. 干跑校验。
3. 迁移时创建临时 users 集合并重建索引。
4. 原 users 重命名为备份集合。
5. 临时集合重命名为 users。
6. 迁移后完整性校验。

优点：流程可重复、日志和返回结构统一、带保护开关与回滚命令。

## 执行前提

1. 维护窗口已批准并公告。
2. Mongo 与 Redis 全量快照已完成。
3. 应用写流量已停止。
4. 设置迁移保护变量：

```sh
export USER_ID_MIGRATION_MAINTENANCE_MODE=true
```

## 标准执行清单

### 步骤 1：预检查

```sh
ts-node scripts/user-id-migration-precheck.ts
```

通过条件：

1. 输出包含 ok: true。
2. danglingThirdParty、danglingSessions、danglingInviter 全为 0。

失败处理：

1. 立即停止迁移。
2. 修复悬挂引用。
3. 重新执行预检查。

### 步骤 2：干跑

```sh
ts-node scripts/migrate-user-ids.ts --dry-run
```

通过条件：

1. 输出 mode 为 dry-run。
2. 输出 ok: true。
3. 无重复目标 ID 报错。

失败处理：

1. 停止迁移。
2. 处理重复目标 ID 或异常数据。

### 步骤 3：正式迁移（建议保留备份）

```sh
ts-node scripts/migrate-user-ids.ts --keep-backup --confirm
```

通过条件：

1. 输出 mode 为 apply。
2. 输出 ok: true。
3. 输出包含 backupCollectionName。
4. 输出 integrity.ok: true。

操作要求：

1. 记录 backupCollectionName 到变更单。

失败处理：

1. 不进入后续验证。
2. 立即执行回滚命令，或恢复数据库快照。

### 步骤 4：迁移后验证

```sh
ts-node scripts/user-id-migration-precheck.ts
```

通过条件：

1. 输出 ok: true。

失败处理：

1. 执行回滚。
2. 继续保持维护模式并排查。

### 步骤 5：应用回归冒烟

```sh
pnpm test -- src/user/user.service.spec.ts
pnpm test:e2e -- test/user.e2e-spec.ts test/auth-login-logout.e2e-spec.ts
```

通过条件：

1. 测试全部通过。

失败处理：

1. 执行回滚。
2. 保持维护窗口，不对外恢复。

### 步骤 6：发布与登录验证

1. 部署新版本。
2. 按计划失效旧会话。
3. 要求重新登录。
4. 观察登录成功率和认证错误率。

## 回滚

### 快速回滚（备份集合重命名）

```sh
ts-node scripts/rollback-user-ids.ts --backup=<backupCollectionName> --confirm
```

如需保留当前失败 users 集合快照：

```sh
ts-node scripts/rollback-user-ids.ts --backup=<backupCollectionName> --confirm --keep-current-users
```

通过条件：

1. 输出 mode 为 rollback。
2. 输出 ok: true。

## 迁移后清理

1. 稳定期结束后，清理备份集合。
2. 关闭维护模式变量：

```sh
unset USER_ID_MIGRATION_MAINTENANCE_MODE
```

3. 归档迁移报告、完整性校验结果和回滚演练记录。
