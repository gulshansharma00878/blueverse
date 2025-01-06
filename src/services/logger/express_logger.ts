const pino = require('pino');

let transport;

// Transport to a prettyfied console
if (!!process.env.LOG_PRETTY) {
  transport = {
    target: './pino-pretty-express-transport',
    options: {
      colorize: true,
      levelFirst: false,
      suppressFlushSyncWarning: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname,req,res,responseTime,dd',
    },
  };
}

// Transport to a log file
else if (!!process.env.LOG_TO_FILE) {
  transport = {
    target: 'pino/file',
    options: {
      destination: './logs/express.log',
      mkdir: true,
    },
  };
}

// Transport to the console
else {
  transport = {
    target: 'pino/file',
  };
}

export const ExpressLogger = pino({
  transport,
  formatters: {
    level(level: any) {
      return { level };
    },
  },
});
