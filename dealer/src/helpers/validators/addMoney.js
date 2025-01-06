import * as Yup from "yup"

export const AddMoneyValidator = {
  initialValues: {
    amount: "",
    wash: ""
  },
  validationSchema: Yup.object().shape({
    amount: Yup.string()
      // .required("Amount is required")
      .matches(/^[0-9]+$/, "Only Numbers are Allowed"),
    wash: Yup.string().matches(/^[0-9]+$/, "Only Numbers are Allowed")
  })
}
