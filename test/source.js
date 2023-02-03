/**!
 * koa-body-parser - index.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var parse = require('co-body');
var copy = require('copy-to');

/**
 * @param [Object] opts
 *   - {String} jsonLimit default '1mb'
 *   - {String} formLimit default '56kb'
 *   - {string} encoding default 'utf-8'
 *   - {Object} extendTypes
 */

module.exports = function (opts) {
  opts = opts || {};
  var detectJSON = opts.detectJSON;
  var onerror = opts.onerror;

  var enableTypes = opts.enableTypes || ['json', 'form'];
  var enableForm = checkEnable(enableTypes, 'form');
  var enableJson = checkEnable(enableTypes, 'json');
  var enableText = checkEnable(enableTypes, 'text');
  var enableXml = checkEnable(enableTypes, 'xml');

  opts.detectJSON = undefined;
  opts.onerror = undefined;

  // force co-body return raw body
  opts.returnRawBody = true;

  // default json types
  var jsonTypes = [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report',
  ];

  // default form types
  var formTypes = [
    'application/x-www-form-urlencoded',
  ];

  // default text types
  var textTypes = [
    'text/plain',
  ];

  // default xml types
  var xmlTypes = [
    'text/xml',
    'application/xml',
  ];

  var jsonOpts = formatOptions(opts, 'json');
  var formOpts = formatOptions(opts, 'form');
  var textOpts = formatOptions(opts, 'text');
  var xmlOpts = formatOptions(opts, 'xml');

  var extendTypes = opts.extendTypes || {};

  extendType(jsonTypes, extendTypes.json);
  extendType(formTypes, extendTypes.form);
  extendType(textTypes, extendTypes.text);
  extendType(xmlTypes, extendTypes.xml);

  return async function bodyParser(ctx, next) {
    // 判断ctx.request.body是否已经被设置过，如果是则直接通过
    if (ctx.request.body !== undefined) return await next();
    // disableBodyParser 为True，直接通过不解析，见API
    if (ctx.disableBodyParser) return await next();
    try {
      // 解析body的入口
      const res = await parseBody(ctx);
      ctx.request.body = 'parsed' in res ? res.parsed : {};
      if (ctx.request.rawBody === undefined) ctx.request.rawBody = res.raw;
    } catch (err) {
      if (onerror) {
        onerror(err, ctx);
      } else {
        throw err;
      }
    }
    await next();
  };
  // 分别对json、from、text、xml四种格式进行解析，其他的直接返回{}
  async function parseBody(ctx) {
    // enableJson 是否开启JSON解析, option 参数配置
    // detectJSON 自定义检测是否为JSON请求 option 参数配置
    // Content-Type是否为JSON相关
    if (enableJson && ((detectJSON && detectJSON(ctx)) || ctx.request.is(jsonTypes))) {
      // 最终还是使用co-body去解析
      return await parse.json(ctx, jsonOpts);
    }
    if (enableForm && ctx.request.is(formTypes)) {
      return await parse.form(ctx, formOpts);
    }
    if (enableText && ctx.request.is(textTypes)) {
      return await parse.text(ctx, textOpts) || '';
    }
    if (enableXml && ctx.request.is(xmlTypes)) {
      return await parse.text(ctx, xmlOpts) || '';
    }
    return {};
  }
};

// 格式化options, 返回的对象将作为 co-parser 的 options参数
function formatOptions(opts, type) {
  var res = {};
  copy(opts).to(res);
  res.limit = opts[type + 'Limit'];
  return res;
}

function extendType(original, extend) {
  if (extend) {
    if (!Array.isArray(extend)) {
      extend = [extend];
    }
    extend.forEach(function (extend) {
      original.push(extend);
    });
  }
}

function checkEnable(types, type) {
  return types.includes(type);
}
