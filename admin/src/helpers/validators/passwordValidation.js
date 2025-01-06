import * as Yup from "yup"

export const PasswordValidation = Yup.string()
  .required("Password is Required")
  .matches(/^\S*$/, "Password cannot contain whitespace")
  .min(8, "Minimum password length is 8 characters")
  .max(32, "Maximum password length is 32 characters")
  .matches(/([a-z])/, "At least one character should be lowercase")
  .matches(/([A-Z])/, "At least one character should be Uppercase")
  .matches(/(\d+)/, "At least one character should be a number")
  .matches(/[^\w]/, "At least one character should be a special case character")
