export const throwError = (error: string) => {
  throw new Error(`[vue-router-dom] ${error}`)
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throwError(message)
  }
}
