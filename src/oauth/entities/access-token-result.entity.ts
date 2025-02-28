export class AccessTokenResult {
  access_token: string;
  expires_in?: number; // 秒数
  refresh_token?: string;
  refresh_token_expires_in?: number; // 秒数
  token_type?: string;
  scope?: string;
  [key: string]: any;
}
