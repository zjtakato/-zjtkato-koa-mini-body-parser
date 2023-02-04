export interface MainOptionsDto {
  /** 自定义错误处理callback */
  onError?: OnErrorCallBackDto;
  /** 透传到co-body的urlencoded内容最大限制 默认为56kb */
  formLimit?: string;
  /** 透传到co-body的json内容大最限制 默认为1mb */
  jsonLimit?: string;
  /** 透传的到co-body的xml内容最大限制 默认为1mb */
  xmlLimit?: string;
}

/**
 * @param {Error} error - 捕获到的异常对象
 * @param {any} ctx - koa ctx对象
 */
export type OnErrorCallBackDto = (error: Error, ctx: any) => {};

export interface CoBodyOptionsDto {
  /** 限制数据大小 */
  limit?: string;
  /** 是否返回解析的数据 */
  returnRawBody?: boolean;
}
