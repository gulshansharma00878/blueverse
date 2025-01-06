import * as Yup from "yup"
export const PhoneValidator = {
  initialValues: {
    mobile: "",
    verificationCode: ""
  },
  validationSchema: Yup.object().shape({
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^[6-9]\d{9}$/, "Invalid Phone Number"),
    verificationCode: Yup.string()
      .matches(/^[0-9]+$/, "Only Numbers are Allowed")
      .length(6, "OTP must be exactly 6 digits")
      .required("OTP is required")
  })
}
