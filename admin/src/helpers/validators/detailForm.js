import * as Yup from "yup"
// import { checkTest } from "./dealerDetailForm"
export const FormValidator = {
  initialValues: {
    name: "",
    mobile: "",
    email: "",
    hsrpNumber: "",
    maufacturer: "",
    modal: ""
  },
  validationSchema: Yup.object().shape({
    name: Yup.string()
      .required("Please enter customer name to continue")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed"),
    mobile: Yup.string().matches(/^[6-9]\d{9}$/, "Invalid Phone Number"),
    email: Yup.string().email("Enter a Valid Email"),
    hsrpNumber: Yup.string()
      .matches(/^[aA-zZ0-9-]+$/g, "Invalid HSRP Number")
      .required("Please enter vehicle HSRP number")
      .matches(/^(?!\s+$).*/, "Invalid HSRP number")
      .test("is-valid", "HSRP Number cannot contain only alphabets and Numbers", (val) => {
        const regexCheck = /^[aA-zZ0-9-]+$/g
        if (val.match(regexCheck)) {
          const textRegex = /^[A-Za-z]+$/
          const numberTextRegex = /^[0-9]*$/
          if (textRegex.test(val)) {
            return false
          } else if (numberTextRegex.test(val)) {
            return false
          }
          return true
        } else {
          return false
        }
      }),
    maufacturer: Yup.string(),
    modal: Yup.string()
  })
}
