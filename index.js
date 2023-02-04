/**
 * mini版的koa-bodyparser - index.js
 * Author:
 * zjtakato <zjtakato@gmail.com>
 */

const parser = require('co-body');

/**
 * koa的数据传输内容解析器, 支持json, form, xml 格式的内容传输
 * @param {import('./types').MainOptionsDto} options - options对象
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
 * @param {import('./types').MainOptionsDto} options - 传入koa-mini-body-parser的参数
 * @param {'json' | 'xml' | 'form'} type - 当前传输数据的类型
 * @returns {import('./types').CoBodyOptionsDto}
 */
function coBodyOptionsFormat(options, type) {
  /** @type {import('./types').CoBodyOptionsDto} */
  const res = { ...options };
  res.limit = options[type + 'Limit'];
  res.returnRawBody = true;
  return res;
}
