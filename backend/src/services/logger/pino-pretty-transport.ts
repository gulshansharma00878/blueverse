// import pretty from 'pino-pretty';
const pretty = require('pino-pretty');

// https://github.com/pinojs/pino-pretty#integration
module.exports = (opts: any) =>
  pretty({
    ...opts,
    messageFormat: ({
      scope,
      requestId,
      content_length,
      operationName,
      responseTime,
      rawQuery,
      msg,
      dd,
    }: any) => {
      const trace_id = !!dd && !!dd.trace_id ? dd.trace_id : null;
      return (
        (!!scope ? `[${scope}] ` : '[LOGGER] ') +
        (!!operationName ? `${operationName} | ` : '') +
        (!!responseTime ? `${responseTime}ms | ` : '') +
        (!!content_length ? `${content_length} B | ` : '') +
        (!!requestId ? `${requestId} | ` : '') +
        (!!trace_id ? `dd: ${trace_id} | ` : '') +
        (!!msg ? `msg: ${msg}` : '') +
        (!!rawQuery ? `rawQuery:\n${rawQuery}` : '')
      );
    },
  });
