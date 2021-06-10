import { request } from '@/utils/request';
import { IResponse } from '@/types/index.d';
import { IUser } from '@/types/user';

/**
 * 登录类型
 */
export enum ILoginType {
  pc = 'PC',
  wechat = 'WX'
}

/**
 * 登录所需参数
 * @param {string} username 账号
 * @param {string} password 密码
 * @param {ILoginType} type 登录类型
 * @param {string} codeId 小程序的code
 */
export interface ILoginParams {
  username: string
  password: string
  type: ILoginType
  codeId: string
}

/**
 * 获取主页菜单列表
 */
export const login = (data: ILoginParams) => request<IResponse<IUser>>({
  url: 'login',
  method: 'POST',
  data
});
