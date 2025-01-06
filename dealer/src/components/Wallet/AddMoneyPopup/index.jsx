import React, { useEffect, useState } from "react"
import { Box, Typography, TextField, Button, IconButton, CircularProgress } from "@mui/material"
import styles from "./AddMoneyPopup.module.scss"
import { useFormik } from "formik"
import { useTheme } from "@mui/material"
import { AddMoneyValidator } from "helpers/validators/addMoney"
import CloseIcon from "@mui/icons-material/Close"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import { WalletService } from "network/walletService"
import Toast from "components/utitlities-components/Toast/Toast"
import { userDetail } from "hooks/state"

function AddMoneyPopup({ daysCount, monthlyTotal, machineId, washBasePrice = 0 }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const user = userDetail()

  const [loader, setLoader] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  useEffect(() => {
    if (daysCount <= 0) {
      handleCountTotal()
    }
  }, [daysCount])

  const handleSubmit = async () => {
    setLoader(true)
    const payLoad = {
      type: "TOPUP",
      furl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/fail-payment`,
      surl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/success-payment`,
      machineId: machineId,
      amount: totalAmount
    }
    let addMoney = await WalletService.createPayment(payLoad)
    if (addMoney.success && addMoney.code === 200) {
      const hash = addMoney.data.hash
      const paymentFormContainer = document.getElementById("payment-form-container")
      paymentFormContainer.innerHTML = hash
      paymentFormContainer.querySelector("form").submit()
      // setLoader(false)
    } else {
      Toast.showErrorToast(`${addMoney?.message}`)
      setLoader(false)
    }
  }

  const formik = useFormik({
    initialValues: AddMoneyValidator.initialValues,
    validationSchema: AddMoneyValidator.validationSchema,
    onSubmit: handleSubmit
  })

  const handleCountTotal = () => {
    handleFormikForm(Number(monthlyTotal))
  }
  const handleAmountChange = (e) => {
    formik.handleChange(e)
    handleFormikForm(e.target.value)
  }

  const handleWashChange = (e) => {
    formik.handleChange(e)
    let totalVal = Number(e.target.value * washBasePrice)
    handleFormikWashForm(e.target.value, totalVal)
  }

  const handleFormikForm = (val) => {
    const amount = parseFloat(val ? val : 0)
    const sgst = (amount * 0.09).toFixed(2)
    const cgst = (amount * 0.09).toFixed(2)
    const total = (amount + parseFloat(sgst) + parseFloat(cgst)).toFixed(2)
    if (!isNaN(total)) {
      setTotalAmount(val)
      formik.setValues({
        ...formik.values,
        amount: val,
        sgst: sgst,
        cgst: cgst,
        total: total
      })
    } else {
      formik.setValues({
        ...formik.values,
        amount: "",
        sgst: "",
        cgst: "",
        total: ""
      })
    }
  }

  const handleFormikWashForm = (washCount, val) => {
    const amount = parseFloat(val)
    const sgst = (amount * 0.09).toFixed(2)
    const cgst = (amount * 0.09).toFixed(2)
    const total = (amount + parseFloat(sgst) + parseFloat(cgst)).toFixed(2)

    if (!isNaN(total)) {
      setTotalAmount(val)
      formik.setValues({
        ...formik.values,
        wash: washCount,
        sgst: sgst,
        cgst: cgst,
        total: total
      })
    } else {
      formik.setValues({
        ...formik.values,
        wash: "",
        amount: ""
      })
    }
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const TaxComponent = (
    <Typography variant="p3" component={"div"} className={styles.tax_box}>
      Tax :{" "}
      {formik.values.total >= 0 ? (
        <Box className={styles.gst_box}>
          <Typography variant="p3" color={theme.palette.text.gray}>
            CGST <span className={styles.gst_text}>INR {formik.values.cgst}</span>
          </Typography>
          <Typography variant="p3">+</Typography>
          <Typography variant="p3" color={theme.palette.text.gray}>
            SGST <span className={styles.gst_text}>INR {formik.values.sgst}</span>
          </Typography>
        </Box>
      ) : (
        <span className={styles.p3_text}> To be Calculate..</span>
      )}
    </Typography>
  )

  const TotalComponent = (
    <Box className={styles.inner_box}>
      {formik.values.total >= 0 && (
        <Typography color={theme.palette.text.gray} variant="div" className={styles.text_box}>
          Total : <span className={styles.inr_text}> INR {formik.values.total}</span>{" "}
        </Typography>
      )}
    </Box>
  )

  return (
    <>
      {loader ? (
        <Box className={styles.loader_box}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box className="close_header">
            <IconButton onClick={handleClose}>
              <CloseIcon color="primary" />
            </IconButton>
          </Box>
          <Box className={styles.containerBox}>
            <Box>
              <Typography variant="p1">ADD MONEY TO YOUR WALLET</Typography>
            </Box>
            <Box>
              <form onSubmit={formik.handleSubmit}>
                <Box className={styles.form_container}>
                  <Box className={styles.inner_box}>
                    <Typography variant="p2">Amount</Typography>
                    <TextField
                      placeholder="Enter amount"
                      name="amount"
                      value={formik.values.amount}
                      className={styles.inputfield}
                      onChange={(e) => handleAmountChange(e)}
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.4rem" }}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount}
                      disabled={!!formik.values.wash}
                      InputProps={{
                        startAdornment: formik.values.amount ? (
                          <Box display="flex" alignItems="center">
                            <Typography variant="p2">INR</Typography>
                            <Box marginLeft={1} />
                          </Box>
                        ) : null
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="p1">OR</Typography>
                  </Box>
                  <Box className={styles.inner_box}>
                    <Typography variant="p2">
                      Washes ( Base Amount : INR {washBasePrice} )
                    </Typography>
                    <TextField
                      placeholder="Enter Wash"
                      name="wash"
                      value={formik.values.wash}
                      className={styles.inputfield}
                      onChange={(e) => handleWashChange(e)}
                      disabled={!!formik.values.amount}
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.4rem" }}
                      // error={formik.touched.amount && Boolean(formik.errors.amount)}
                      // helperText={formik.touched.amount && formik.errors.amount}
                    />
                  </Box>
                  <Box sx={{ display: { xs: "block", sm: "block", md: "none" }, mt: "1.5rem" }}>
                    {TaxComponent}
                  </Box>
                  <Box sx={{ display: { xs: "block", sm: "block", md: "none" }, mt: "1.5rem" }}>
                    {TotalComponent}
                  </Box>
                  <Box className={styles.inner_box}>
                    <Button
                      className={styles.btn_container}
                      variant="contained"
                      type="submit"
                      disabled={!formik.values.amount && !formik.values.wash}>
                      Add Money
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
            <Box sx={{ display: { xs: "none", sm: "none", md: "block" } }}>{TaxComponent}</Box>
            <Box sx={{ display: { xs: "none", sm: "none", md: "block" } }}>{TotalComponent}</Box>
          </Box>
        </>
      )}
      <div id="payment-form-container"></div>
    </>
  )
}

export default AddMoneyPopup
