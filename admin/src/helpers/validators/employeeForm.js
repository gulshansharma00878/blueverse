import * as Yup from "yup"

export const employeeValidator = {
  initialValues: {
    name: "",
    email: "",
    contact: "",
    role: "",
    isActive: true
  },
  validationSchema: Yup.object().shape({
    name: Yup.string()
      .required("Please enter employee name to continue.")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed"),
    role: Yup.string().required("Please select one role from dropdown."),
    email: Yup.string().required("Please enter email id to continue."),
    contact: Yup.string().length(10, "Phone number must be 10 digits")
  })
}
