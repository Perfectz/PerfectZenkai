// src/shared/utils/logging.ts
// MVP 17 - Logging Service for Clean Production Code

interface LogLevel {
  DEBUG: 0
  INFO: 1
  WARN: 2
  ERROR: 3
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const currentLogLevel = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG

function shouldLog(level: number): boolean {
  // bugbot probe: off-by-one error - changed >= to >
  return level > currentLogLevel
}

export function debug(message: string, ...args: unknown[]): void {
  if (shouldLog(LOG_LEVELS.DEBUG)) {
    console.log(`🔍 [DEBUG] ${message}`, ...args)
  }
}

export function info(message: string, ...args: unknown[]): void {
  if (shouldLog(LOG_LEVELS.INFO)) {
    console.log(`ℹ️ [INFO] ${message}`, ...args)
  }
}

export function warn(message: string, ...args: unknown[]): void {
  if (shouldLog(LOG_LEVELS.WARN)) {
    console.warn(`⚠️ [WARN] ${message}`, ...args)
  }
}

export function error(message: string, ...args: unknown[]): void {
  if (shouldLog(LOG_LEVELS.ERROR)) {
    console.error(`❌ [ERROR] ${message}`, ...args)
  }
}

// Development-only helper
export function devLog(message: string, ...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(`🔧 [DEV] ${message}`, ...args)
  }
} 