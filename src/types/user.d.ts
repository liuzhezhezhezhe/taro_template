/**
 * 用户来源
 * @param {LDAP} 从ldap导入
 * @param {COM} 正常创建
 */
 export enum IUserOrigin {
  LDAP = 0,
  COM = 1
}

/**
 * 用户信息
 * @param {number} id 用户id
 * @param {string} username 用户名
 * @param {string} avatar 用户头像
 * @param {string} phone 电话号码
 * @param {IUserOrigin} fromLdap 用户来源
 * @param {string} token 用户当前正在使用的token
 */
export interface IUser {
  id: number;
  username: string;
  avatar: string;
  phone: string;
  fromLdap: IUserOrigin;
  token: string;
}
