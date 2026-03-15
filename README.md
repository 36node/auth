# 36node auth service

[![CI](https://github.com/36node/auth/actions/workflows/ci.yml/badge.svg)](https://github.com/36node/auth/actions/workflows/ci.yml) [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Stargate auth 认证和用户服务

参考文档 [Auth 服务设计](https://adventurer.feishu.cn/docx/N7KMdUR8SoonnpxVRcJcgBSGnKf?from=from_copylink) 将 auth 模块独立成一个服务，并对它进行重构，使其符合总体设计目标。

领域实体

- User: 用户，代表系统内所有用户，包括 B 端管理员和 C 端用户 。
- Namespace：命名空间，代表组织架构层级，这个层级也可以作为用户和其它资源的属性。
- Session: 会话，用户和系统之间建立的会话抽象，会话中包 token、权限、ACL、refreshKey 等属性。
- Role: 角色，权限的集合。
- ThirdParty: 第三方授权记录。

> 注意: Token 会存在于 Session 中，但是为了安全起见又不会存储在数据库中。
> Session 一定是属于用户的，它可以被赋给设备或者服务使用。

session 可以在 auth 中管理，也可以自行管理。

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
$ pnpm dev


# debug mode
$ pnpm debug

# build dist
$ pnpm build

# production mode
$ pnpm start
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## env

根目录下有一个默认的 `.env` 文件是可以用于 dev 开发的，如果需要调整，在根目录下创建 `.env.local`，其中定义的环境变量会覆盖 `.env` 中定义的变量。

例如

```shell
PORT=9528
```

配置 Github 的 oauth 登录

```
# GITHUB
GITHUB_CLIENT_ID=Iv23lizBaVPIiABBCHaz
GITHUB_CLIENT_SECRET=041f46399c1396ec27d16851c1aa2aa479a3f5a5
GITHUB_AUTHORIZE_URL=https://github.com/login/oauth/authorize
GITHUB_ACCESS_TOKEN_URL=https://github.com/login/oauth/access_token
GITHUB_USER_INFO_URL=https://api.github.com/user
GITHUB_TID_FIELD=login
```

## 如何发布一个临时的 sdk 包

生成 openapi.json

```sh
## 启动一下工程就会自动生成 openapi.json 文件
NODE_ENV=development p dev
```

生成 sdk

```sh
p gen:sdk
```

发布 sdk

```sh
## 进入 sdk 文件夹
cd sdk

## 安装依赖
pnpm install

## 编译
pnpm build

## 发布 一个 prerelease
npm version prerelease
npm publish
```

## 关于时间戳

本系统在没有特殊说明的情况下，都是指 毫秒时间戳

## User ID Migration Runbook

将历史用户 `_id` 从 ObjectId 迁移为其字符串形式（`ObjectId.toString()`），并保持新用户支持显式 `id` 或自动 `nanoid`。

执行前提：

```sh
export USER_ID_MIGRATION_MAINTENANCE_MODE=true
```

建议执行顺序：

```sh
# 1) 预检查（有悬挂引用会直接失败）
pnpm migrate:user-ids:precheck

# 2) 干跑
pnpm migrate:user-ids:dry-run

# 3) 正式迁移（建议首轮保留备份）
pnpm migrate:user-ids:keep-backup

# 4) 迁移后验证
pnpm migrate:user-ids:verify
```

回滚：

```sh
# backup 名称来自迁移输出的 backupCollectionName
pnpm migrate:user-ids:rollback -- --backup=<backupCollectionName> --confirm
```

如果希望回滚时保留当前失败数据副本：

```sh
pnpm migrate:user-ids:rollback -- --backup=<backupCollectionName> --confirm --keep-current-users
```

## References

- [使用 pnpm 的 patch 命令打补丁](https://www.cnblogs.com/wang--chao/p/16612248.html)
- [生成 jwt private 和 public key 的方法](https://docs.mia-platform.eu/docs/runtime_suite/client-credentials/jwt_keys)
