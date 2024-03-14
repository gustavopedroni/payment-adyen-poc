import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.prettyPrint({ colorize: true, depth: 10 }),
  ),
  transports: [new transports.Console()],
})
