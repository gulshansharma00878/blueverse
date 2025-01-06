import * as Yup from "yup"

export const DealerDetailValidator = Yup.object({
  outlet: Yup.array().of(
    Yup.object().shape({
      outletName: Yup.string().required("Enter service center name"),
      gstin: Yup.string()
        .matches(
          /^(?![0-9]*$)[a-zA-Z0-9]{15}$/,
          "GSTIN number should contain only 15 alphanumeric characters"
        )
        .required("Enter GST no.")
        .test("is-valid", "GSTIN number should contain only 15 alphanumeric characters", (val) =>
          checkTest(val)
        ),
      region: Yup.string().required("Select region"),
      state: Yup.string().required("Select state"),
      city: Yup.string().required("Select city"),
      address: Yup.string().required("Enter address")
    })
  ),
  dealerName: Yup.string()
    .required("Please enter dealer name to continue")
    .matches(/^(?!\s+$).*/, "First Alphabet cannot be space")
    .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
    .max(35, "Maximum of 35 characters allowed"),
  oem: Yup.string().required("Please select oem"),
  email: Yup.string().email().required("Please enter email address of dealer"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .matches(/^[6-9]\d{9}$/, "Invalid Phone Number")
    .matches(/^\d+$/, "Phone number must only contain digits")
    .required("Phone number is required"),
  pan: Yup.string()
    .matches(
      /^(?![0-9]*$)[a-zA-Z0-9]+$/,
      "PAN number should contain only 10 alphanumeric characters"
    )
    .required("Please enter your PAN number")
    .test("is-valid", "PAN number should contain only 10 alphanumeric characters", (val) =>
      checkTest(val)
    ),

  latitude: Yup.string(),
  longitude: Yup.string()
})
export const checkTest = (val) => {
  const textRegex = /^[A-Za-z]+$/
  if (textRegex.test(val)) {
    return false
  } else {
    return true
  }
}
