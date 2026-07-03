import type { LoggerOptions } from 'pino';

export function createLogger(isProduction: boolean): LoggerOptions {
  return {
    level: isProduction ? 'info' : 'debug',
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
  };
}
