import * as Yup from "yup"

export const StateFormValidator = {
  initialValues: {
    state: "",
    region: "",
    stateGstNo: "",
    blueverseAddress: ""
  },
  validationSchema: Yup.object().shape({
    state: Yup.string().required("State is required"),
    region: Yup.string().required("Region is required")
  })
}
