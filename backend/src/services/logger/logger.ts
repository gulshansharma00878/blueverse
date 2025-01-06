const pino = require('pino');

let transport;

// Transport to a prettyfied console
if (!!process.env.LOG_PRETTY) {
  transport = {
    target: './pino-pretty-transport',
    options: {
      colorize: true,
      levelFirst: false,
      suppressFlushSyncWarning: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore:
        'pid,hostname,responseTime,content_length,requestId,operationName,scope,rawQuery,dd',
    },
  };
}
// Transport to a log file
else if (!!process.env.LOG_TO_FILE) {
  transport = {
    target: 'pino/file',
    options: {
      destination: './logs/server.log',
      mkdir: true,
    },
  };
}

// Transport to the console
else {
  // Transport to the console
  transport = {
    target: 'pino/file',
  };
}

export const logger = pino({
  transport,
  formatters: {
    level(level: any) {
      return { level };
    },
  },
});

// const baseErrorLogger = logger.error;
// logger.error = function (msgObj) {
//   baseErrorLogger('----->', msgObj);
// };
