import * as Yup from "yup"

export const agentValidator = {
  initialValues: {
    name: "",
    email: "",
    contact: ""
  },
  validationSchema: Yup.object().shape({
    name: Yup.string()
      .required("Please enter agent name to continue")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Please enter email address of agent"),
    contact: Yup.string()
      .matches(/^\d+$/, "Phone number must only contain digits")
      .length(10, "Phone number must be 10 digits")
  })
}
