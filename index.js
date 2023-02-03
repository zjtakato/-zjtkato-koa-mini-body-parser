/**
 * mini版的koa-bodyparser - index.js
 * Author:
 * zjtakato <zjtakato@gmail.com>
 */

const parser = require('co-body');

/**
 * koa的数据传输内容解析器, 支持json, form, xml 格式的内容传输
 * @param {MainOptionsDto} options - options对象
 * @returns {void}
 */
module.exports = (options) => {
  console.log('@zjtakato/koa-mini-body-paraer init');

  // 参数处理
  options = options || {};
  const handleError = options.onError; // 自定义错误处理

  // 支持的数据交换格式
  const defaultEnableTypes = ['json', 'form', 'xml'];

  // json格式支持的内容类型(content-type)
  const jsonTypes = ['application/json', 'application/json-patch+json', 'application/vnd.api+json', 'application/csp-report'];

  // form格式支持的内容类型(content-type)
  const formTypes = ['application/x-www-form-urlencoded'];

  // xml格式支持的内容类型(content-type)
  const xmlTypes = ['text/xml', 'application/xml'];

  return async (ctx, next) => {
    // 解析前检查是否已经paser过了,如果paser过那直接通过
    if (ctx.request.body !== undefined) return await next();
    if (ctx.disableBodyParser) return await next();

    // 根据使用不同的content-type去使用不同的解析方法
    try {
      let result = {};
      if (ctx.request.is(jsonTypes)) {
        result = await parser.json(ctx, coBodyOptionsFormat(options, 'json'));
      }
      if (ctx.request.is(formTypes)) {
        result = await parser.form(ctx, coBodyOptionsFormat(options, 'form'));
      }
      if (ctx.request.is(xmlTypes)) {
        result = (await parser.text(ctx, coBodyOptionsFormat(options, 'xml'))) || '';
      }
      // 将解析的内容挂载到ctx.request.body 上
      ctx.request.body = result.parsed ? result.parsed : {};
    } catch (error) {
      if (handleError) {
        // 如果传递了自定义错误处理函数,那么就把error透传过去
        onerror(err, ctx);
      } else {
        throw err;
      }
    }
    await next();
  };
};

/**
 * 转换成co-body options参数支持的类型
 * @param {Object} options - 传入koa-mini-body-parser的参数
 * @param {'json' | 'xml' | 'form'} type - 当前传输数据的类型
 * @returns {CoBodyOptionsDto}
 */
function coBodyOptionsFormat(options, type) {
  /** @type {CoBodyOptionsDto} */
  const res = { ...options };
  res.limit = options[type + 'Limit'];
  res.returnRawBody = true;
  return res;
}

// -------------------------------------------------- types ------------------------------------------------------------
/**
 * co-body options dto
 * @typedef {Object} CoBodyOptionsDto
 * @property {string} limit - 限制数据大小
 * @property {boolean} returnRawBody - 是否返回解析的数据
 */

/**
 * @callback onErrorCallBackDto
 * @param {Error} error - 异常
 * @param {any} ctx - koa-ctx上下文
 */

/**
 * @zjtakato/koa-mini-body-parser options dto
 * @typedef {Object} MainOptionsDto
 * @property {onErrorCallBackDto=} onError - 自定义错误处理回调函数
 * @property {string=} formLimit - 透传到co-body的urlencoded内容最大限制 默认为56kb
 * @property {string=} jsonLimit 透传到co-body的json内容大最限制 默认为1mb
 * @property {string=} xmlLimit 透传的到co-body的xml内容最大限制 默认为1mb
 */
