# 36node auth service

[![CI](https://github.com/36node/auth/actions/workflows/ci.yml/badge.svg)](https://github.com/36node/auth/actions/workflows/ci.yml) [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

认证和用户服务

参考文档 [Auth 服务设计](https://adventurer.feishu.cn/docx/N7KMdUR8SoonnpxVRcJcgBSGnKf?from=from_copylink) 将 auth 模块独立成一个服务，并对它进行重构，使其符合总体设计目标。

领域实体

- User: 用户，代表系统内所有用户，包括 B 端管理员和 C 端用户 。
- Namespace：命名空间，代表组织架构层级，这个层级也可以作为用户和其它资源的属性。
- Session: 会话，用户和系统之间建立的会话抽象，会话中包 token、权限、ACL、refreshKey 等属性。
- Role: 角色，权限的集合。

> 注意: Token 会存在于 Session 中，但是为了安全起见又不会存储在数据库中。
> Session 一定是属于用户的，它可以被赋给设备或者服务使用。

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
$ pnpm start


# debug mode
$ pnpm start:debug

# production mode
$ pnpm start:prod

# build dist
$ pnpm build
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

根目录下创建如下文件

- `.env`

放入自定义的环境变量

```shell
PORT=9527
MQTT_URL=mqtt://localhost:1883
```

## Token for development

Admin token

```text
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTcwMzQwMDIzMCwiZXhwIjoxNzA5NDQ4MjMwfQ.MZDQN-_OTiwPK4iwPQRMBMWzKLcOZrjgczOGQHoDbpaFXU4oo4CDZP0Uij5_GwQ4dJg5Ww2JSlXe1MaecYOkvsY0t_M_vPUIZP2g2ppT5U8fOEzL_lnU_HPYQ0T7_GzBM7VciN0bPEgK-gXb8Xn5It1OpMVZ5irfxkr_LYsMB_g
```

生成秘钥对的方法:

```
## 私钥
ssh-keygen -t rsa -b 2048 -m PEM -f private.key

## 公钥
ssh-keygen -f private.key -e -m PKCS8 > public.key
```

## 如何发布一个临时的 sdk 包

生成 openapi.json

```sh
## 启动一下工程就会自动生成 openapi.json 文件
NODE_ENV=development p start
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

## References

- [使用 pnpm 的 patch 命令打补丁](https://www.cnblogs.com/wang--chao/p/16612248.html)
- [生成 jwt private 和 public key 的方法](https://docs.mia-platform.eu/docs/runtime_suite/client-credentials/jwt_keys)
