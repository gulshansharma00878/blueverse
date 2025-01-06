import * as Yup from "yup"
import { EmailValidation } from "./emailValidation"

export const FPValidator = {
  initialValues: {
    email: ""
  },
  validationSchema: Yup.object().shape({
    email: EmailValidation
  })
}
