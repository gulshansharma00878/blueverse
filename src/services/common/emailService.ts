'use strict'
import * as nodemailer from 'nodemailer'
import stringConstants from '../../common/stringConstants'
import { config } from '../../config/config'
import createError from 'http-errors'

// async..await is not allowed in global scope, must use a wrapper
async function emailService(email: any, subject: any, body: any, html: any) {
  try {
    if (!email) {
      throw createError(400, stringConstants.systemMessage.EMAIL_NOT_PROVIDED)
    }
    if (!subject) {
      throw createError(
        400,
        stringConstants.systemMessage.EMAIL_SUBJECT_NOT_EXISTS
      )
    }
    if (!body && !html) {
      throw createError(
        400,
        stringConstants.systemMessage.EMAIL_BODY_NOT_EXISTS
      )
    }
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: config.nodemailerConfig.host,
      port: config.nodemailerConfig.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.nodemailerConfig.username,
        pass: config.nodemailerConfig.password,
      },
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: config.nodemailerConfig.fromEmail, // sender address
      to: email, //'bar@example.com, baz@example.com',
      subject: subject, // Subject line
      text: body ? body : '', // plain text body
      html: html ? html : '', // html body
    })
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info.messageId
  } catch (err) {
    return Promise.reject(err)
  }
}

export { emailService }
