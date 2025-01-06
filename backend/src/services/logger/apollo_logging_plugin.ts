import cuid from 'cuid';
import { logger } from './logger';

// https://blog.dadops.co/2021/06/23/child-loggers/
export const loggerPlugin = {
  requestDidStart(initialRequestContext: any) {
    const start = process.hrtime.bigint();

    // Set the logger information
    initialRequestContext.logger = logger.child({
      requestId: cuid(),
      operationName: initialRequestContext.request.operationName,
    });

    return {
      didEncounterErrors({ logger, errors }: any) {
        errors.forEach((error: any) =>
          logger.error('didEncounterErrors ' + error)
        );
      },
      willSendResponse({ logger, response }: any) {
        const end = process.hrtime.bigint();
        const logData = {
          scope: 'APOLLO',
          responseTime: (Number(end - start) / 1e6).toFixed(0),
          content_length: JSON.stringify(response).length,
          rawQuery: initialRequestContext.request.query,
        };

        // IntrospectionQueries and healthz requests are quite noisy so we can drop them to
        // debug level
        if (
          ['IntrospectionQuery', 'HealthzQuery'].includes(
            initialRequestContext.request.operationName
          )
        ) {
          logger.debug(logData);
        } else {
          logger.info(logData);
        }
      },
    };
  },
};
