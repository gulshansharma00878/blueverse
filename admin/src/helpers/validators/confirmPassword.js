import * as Yup from "yup"
import { PasswordValidation } from "./passwordValidation"

export const ConfirmPasswordValidator = {
  initialValues: {
    password: "",
    confirmPassword: ""
  },
  validationSchema: Yup.object().shape({
    password: PasswordValidation,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords doesn't match")
      .required("Confirm Password is required")
  })
}
