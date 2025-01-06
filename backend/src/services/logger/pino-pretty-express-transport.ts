import pretty from 'pino-pretty';

// https://github.com/pinojs/pino-pretty#integration
module.exports = (opts: any) =>
  pretty({
    ...opts,
    messageFormat: (context: any) => {
      const { req, res, responseTime, dd }: any = context;
      const trace_id = !!dd && !!dd.trace_id ? dd.trace_id : null;
      const contentLength = res.headers['content-length'];
      return (
        `[EXPRESS] ${req.method} | ${req.url} | ${res.statusCode} | ${responseTime}ms` +
        (!!contentLength ? ` | ${contentLength} B` : '') +
        (!!trace_id ? ` | dd: ${trace_id}` : '') +
        ` | ${req.remoteAddress.replaceAll('::ffff:', '')}`
      );
    },
  });
