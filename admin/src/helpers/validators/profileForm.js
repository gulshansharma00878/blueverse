import * as Yup from "yup"

const SUPPORTED_FORMATS = ["image/jpeg", "image/png"]

export const ProfileFormValidator = {
  validationSchema: Yup.object().shape({
    file: Yup.mixed()
      .test(
        "FILE_SIZE",
        "Image file size exceeds maximum allowed which is 2MB.",
        (value) => !value || (value && value.size <= 2097152)
      )
      .test(
        "FILE_FORMAT",
        "Unsupported image file format. Only png, jpeg, and jpg format is supported.",
        (value) => !value || (value && SUPPORTED_FORMATS.includes(value.type))
      ),
    name: Yup.string()
      .required("Name is required")
      .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field ")
      .matches(/^(?!\s+$).*/, "First Alphabet cannot be space")
      .trim()
      .max(35, "Maximum of 35 characters allowed"),
    email: Yup.string().required("Email ID is required").trim().email("Invalid Email id"),
    phone: Yup.string()
      .matches(/^\d+$/, "Phone number must only contain digits")
      .length(10, "Phone number must be 10 digits")
      .nullable()
  })
}
