import * as Yup from "yup"
import { EmailValidation } from "./emailValidation"
import { PasswordValidation } from "./passwordValidation"
export const LoginValidator = {
  initialValues: {
    email: "",
    password: ""
  },
  validationSchema: Yup.object().shape({
    email: EmailValidation,
    password: PasswordValidation,
    acceptTerms: Yup.bool().oneOf([true], "Accept Terms & Conditions to Sign in")
  })
}
