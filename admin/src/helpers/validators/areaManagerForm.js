import * as Yup from "yup"

export const managerValidator = {
  initialValues: {
    name: "",
    email: "",
    phone: "",
    description: "",
    status: "Active",
    region: [],
    state: [],
    city: [],
    oem: "",
    oemSelected: true,
    dealers: []
  },
  validationSchema: Yup.object().shape({
    name: Yup.string()
      .required("Please enter area manager name to continue")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be a space")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Please enter email address of area manaager"),
    region: Yup.array().min(1).required("Please Select region to continue"),
    city: Yup.array().min(1).required("Please Select city to continue"),
    oem: Yup.string().required(),
    state: Yup.array().min(1).required("Please Select state to continue"),
    phone: Yup.string()
      .matches(/^\d+$/, "Phone number must only contain digits")
      .length(10, "Phone number must be 10 digits")
      .nullable(),
    dealers: Yup.array().min(1).required()
  })
}
