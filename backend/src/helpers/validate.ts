'use strict'

import { validationResult, ValidationChain } from 'express-validator'
import createError from 'http-errors'
import { first } from 'lodash'

export const execValidation = (req: any, res: any, next: any): any => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    const errorArray = result.array()
    const errorMsg = errorArray.length
      ? `${first(errorArray)?.param} value is ${first(errorArray)?.msg}`
      : {}
    return next(createError(422, errorMsg))
  }

  return next()
}

export const _validate = (validationChains: ValidationChain[]) => {
  return [...validationChains, execValidation]
}
