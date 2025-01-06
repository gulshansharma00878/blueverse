import * as Yup from "yup"

export const oemManagerValidator = {
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
    dealerShip: []
  },
  validationSchema: Yup.object().shape({
    phone: Yup.string()
      .matches(/^\d+$/, "Phone number must only contain digits")
      .length(10, "Phone number must be 10 digits")
      .nullable()
      .required("Phone Number is required"),
    name: Yup.string()
      .required("Please enter manager name to continue")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .max(35, "Maximum of 35 characters allowed")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Please enter email address of manager"),

    region: Yup.array().min(1).required("Please Select region to continue"),
    oem: Yup.string().required(),
    state: Yup.array().min(1).required("Please Select state to continue"),
    city: Yup.array().min(1).required("Please Select city to continue"),
    dealerShip: Yup.array().min(1).required("Please Select city to continue")
  })
}
