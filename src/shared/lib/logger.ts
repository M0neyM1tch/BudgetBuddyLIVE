// src/shared/lib/logger.ts
import { env } from './env';

const noop = () => {};

export const logger = {
  log:   env.app.isDev ? console.log.bind(console)   : noop,
  warn:  env.app.isDev ? console.warn.bind(console)  : noop,
  error: env.app.isDev ? console.error.bind(console) : noop,
  info:  env.app.isDev ? console.info.bind(console)  : noop,
};