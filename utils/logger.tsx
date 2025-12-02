// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  action?: string
  metadata?: Record<string, any>
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    // const timestamp = new Date().toISOString()
    // const logData = {
    //   timestamp,
    //   level,
    //   message,
    //   ...context,
    // }

    // Console in development
    if (process.env.NODE_ENV === 'development') {
      console[level === 'info' ? 'log' : level](`[${level.toUpperCase()}]`, message, context)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, DataDog, etc.
      // this.sendToMonitoring(level, logData)
    }
  }

  // private sendToMonitoring(level: LogLevel, data: any) {
  //   // Integration with your monitoring service
  //   // Example for Sentry:
  //   // if (level === 'error') {
  //   //   Sentry.captureException(new Error(data.message), {
  //   //     contexts: { custom: data.metadata },
  //   //     user: { id: data.userId },
  //   //   })
  //   // }
  // }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }
}

export const logger = new Logger()