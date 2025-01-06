import * as Yup from "yup"
import { EmailValidation } from "./emailValidation"

export const FPValidator = {
  initialValues: {
    email: "",
    verificationCode: ""
  },
  validationSchema: Yup.object().shape({
    email: EmailValidation
  })
}
