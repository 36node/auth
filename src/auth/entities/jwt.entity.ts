export interface Acl {
  [key: string]: string[];
}

/**
 * @description JWT Payload
 * 同时支持两种权限模式: ACL/RBAC
 */
export class JwtPayload {
  uid: string; // 用户 ID
  source?: string; // 第三方来源
  client?: string; // 客户端/设备
  permissions?: string[]; // 用户动态权限
  ns?: string; // 该用户或资源所属的 namespace
  type?: string[]; // 类型，支持设置多个
}
