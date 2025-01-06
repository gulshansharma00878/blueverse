import * as Yup from "yup"

export const OemFormValidator = {
  initialValues: {
    oem: "",
    oemCheck: true
  },
  validationSchema: Yup.object().shape({
    oem: Yup.string().required("oem is required")
  })
}
