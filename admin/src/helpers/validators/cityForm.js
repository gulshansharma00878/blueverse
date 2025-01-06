import * as Yup from "yup"

export const CityFormValidator = {
  initialValues: {
    city: "",
    state: "",
    region: ""
  },
  validationSchema: Yup.object().shape({
    city: Yup.string().required("city is required"),
    state: Yup.string().required("State is required"),
    region: Yup.string().required("Region is required")
  })
}
