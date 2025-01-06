// default api response parser.

/**
 * @description API Success model
 */
export class APIResponse {
  constructor(data = {}, code) {
    this.success = true
    this.data = data?.data
    this.error = data?.error
    this.message = data?.message
    this.code = code
  }
}

/**
 * @description API Error model
 */
export class APIError {
  constructor(code, error = "", message = "") {
    this.success = false
    this.data = null
    this.error = error
    this.message = message
    this.code = code
  }
}
