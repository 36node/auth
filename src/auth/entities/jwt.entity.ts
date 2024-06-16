export interface Acl {
  [key: string]: string[];
}

/**
 * @description JWT Payload
 * 同时支持两种权限模式: ACL/RBAC
 */
export class JwtPayload {
  roles: string[]; // RBAC 角色列表
  ns?: string; // 该用户或资源所属的 namespace
  acl?: Acl; // ACL 权限控制列表
  super?: boolean; // 是否是超级管理员
}
