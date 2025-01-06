import * as Yup from "yup"

export const subAdminValidator = {
  initialValues: {
    name: "",
    email: "",
    contact: "",
    status: "Active",
    role: ""
  },
  validationSchema: Yup.object().shape({
    name: Yup.string()
      .required("Please enter Sub Admin name to continue")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Please enter Sub Admin email to continue"),
    contact: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Please Enter a valid Phone Number")
      .nullable(),
    role: Yup.string().required("Please Select Role")
  })
}
