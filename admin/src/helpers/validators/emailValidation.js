import * as Yup from "yup"

export const EmailValidation = Yup.string()
  .email("Enter a valid email")
  .required("Email Id is Required")
