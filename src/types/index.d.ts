/**
 * 返回的基本数据格式
 * @param {number} code 状态码
 * @param {string} msg 状态说明
 * @param {T} data 返回的数据
 */
 export interface IResponse<T> {
  code: number
  msg: string
  data: T
}

/**
 * 列表返回的数据格式
 * @param {T[]} records 返回的列表 @extends T
 * @param {number} 数据总条数
 */
export interface IListResponse<T> {
  records: T[],
  total: number
}

/**
 * 列表基本请求参数
 * @param {string?} name 搜索的名称
 * @param {number} page 当前页数
 * @param {number} size 当前页显示条数
 * @param {any} other 其他参数
 */
export interface IListParams {
  name?: string
  page: number
  size: number
  [key: string]: any
}

/**
 * 文件列表信息
 * @param {string} preUrl 预览的图片url
 * @param {string} url 上传成功之后文件的url
 */
interface IFileItem {
  preUrl: string
  url: string
}

/**
 * 微信的预览对象
 * @param {string} url 要预览的url
 * @param {'video' | 'image'} type 类型
 * @param {string} poster 如果是视频，缩略图的url
 */
interface ISourceType {
  url: string;
  type: 'video' | 'image';
  poster: string;
}
