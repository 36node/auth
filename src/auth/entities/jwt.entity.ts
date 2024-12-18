export interface Acl {
  [key: string]: string[];
}

/**
 * @description JWT Payload
 * 同时支持两种权限模式: ACL/RBAC
 */
export class JwtPayload {
  sid?: string; // 会话 ID
  permissions?: string[]; // 受限的权限
  ns?: string; // 该用户或资源所属的 namespace
  type?: string; // 登录端类型
  groups?: string[]; // 用户组
}
