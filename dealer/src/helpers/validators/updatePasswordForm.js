import * as Yup from "yup"
import { PasswordValidation } from "./passwordValidation"

export const PasswordFormValidator = {
  initialValues: {
    currentpassword: "",
    newpassword: "",
    repassword: ""
  },
  validationSchema: Yup.object().shape({
    currentpassword: Yup.string()
      .required("We need your current password to confirm your changes")
      .trim()
      .matches(/^\S*$/, "Current Password cannot contain whitespace"),
    newpassword: PasswordValidation,
    repassword: Yup.string()
      .required("Confirm Password is Required")
      .trim()
      .oneOf([Yup.ref("newpassword")], "The passwords don't match. Please try again.")
      .matches(/^\S*$/, "Confirm Password cannot contain whitespace")
  })
}
