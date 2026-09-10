import winston from 'winston';
import { config } from '../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format for local development (colored, clean console printf)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

// Log format for production (uncolored, structured JSON format for collectors)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: config.NODE_ENV === 'development' ? devFormat : prodFormat
  })
];

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
});
