export interface Acl {
  [key: string]: string[];
}

/**
 * @description JWT Payload
 * 同时支持两种权限模式: ACL/RBAC
 */
export class JwtPayload {
  sid?: string; // 会话 ID
  source?: string; // 来源
  permissions?: string[]; // 角色之外的权限
  ns?: string; // 该用户或资源所属的 namespace
  type?: string; // 登录端类型
  groups?: string[]; // 用户组
  roles?: string[]; // 角色
}
