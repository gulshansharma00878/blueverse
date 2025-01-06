import React, { useEffect, useState } from "react"
import { useStyles } from "./SubscriptionSettingStyles"
import { Grid, Typography } from "@mui/material"
import InputField from "components/utilities-components/InputField/InputField"
import InfoIcon from "@mui/icons-material/Info"
import Cards from "./Cards/Cards"
import MachineSummary from "./MachineSummary"
import PricingTermPopup from "./PricingTermPopup"
import { useSelector, useDispatch } from "react-redux"
import { dealerActions } from "redux/store"
import { checkMachineDataCompletion } from "components/DealerPanel/dealerUtilities"
import DateSelect from "components/utilities-components/DatePicker/DatePicker"
import moment from "moment"
import dayjs from "dayjs"
import { getLastDayOfMonth } from "helpers/app-dates/dates"
const valuesArray = []

for (let i = 1; i <= 31; i++) {
  const obj = { label: i, value: i }
  valuesArray.push(obj)
}

function SubscriptionSetting({ index }) {
  const currentDate = new Date()
  const lastDayOfMonth = getLastDayOfMonth(currentDate)
  const styles = useStyles()
  const details = useSelector((state) => state.dealer.subscriptionDetails)[index]
  const dataCompletionCheck = useSelector((state) => state.dealer.completionCounter)[index]

  useEffect(() => {
    details && checkMachineDataCompletion(details?.machine, dispatch, dealerActions, index)
  }, [])

  const dispatch = useDispatch()

  const onChangeHandler = (fieldName, value) => {
    let prev = { ...details.machine }

    if (fieldName === "invoice_date") {
      prev[fieldName] = moment(value.toString()).format()
    } else {
      let targetValue = isNaN(parseInt(value)) ? "" : parseInt(value)
      prev[fieldName] = targetValue
    }

    // Checking data completion
    checkMachineDataCompletion(prev, dispatch, dealerActions, index)

    dispatch(
      dealerActions.updateMachineSettings({
        index: index,
        details: { ...details, machine: prev }
      })
    )
  }

  // const [innerValue, setInnerValue] = useState()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <Grid container sx={styles.outerBox}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="s1">Security Deposit:</Typography>
        </Grid>
        <Grid xs={12} sm={6} item>
          <InputField
            size="medium"
            name="deposit"
            label="Amount"
            InputProps={{ disableUnderline: true }}
            value={details?.machine?.security_deposited}
            variant="filled"
            onChange={(e) => onChangeHandler("security_deposited", e.target.value)}
            type="text"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <Grid sx={{ mt: 4 }} container justifyContent="space-between" alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="s1">Commencement Date:</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateSelect
            style={styles.dateInputField}
            value={dayjs(details?.machine?.invoice_date)}
            onChange={(value) => onChangeHandler("invoice_date", value)}
            minDate={dayjs(currentDate)}
            maxDate={dayjs(lastDayOfMonth)}
          />
          {/* <DropDown
            style={{ marginTop: "2.5rem" }}
            value={details?.machine?.invoice_date}
            items={valuesArray}
            handleChange={onChangeHandler.bind(null, "invoice_date")}
            label="Commencement Date"
          /> */}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 4 }} container justifyContent="space-between" alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="s1">Minimum Wash Commitment (per month):</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputField
            size="medium"
            name="wash"
            label="Number of washes"
            InputProps={{ disableUnderline: true }}
            value={details?.machine?.minimum_wash_commitment}
            variant="filled"
            onChange={(e) => onChangeHandler("minimum_wash_commitment", e.target.value)}
            type="text"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <Grid
        direction="column"
        container
        sx={{ mt: 5, borderTop: "0.1rem solid #C9D8EF", paddingTop: "3.6rem" }}>
        <Grid item container alignItems="center" marginBottom={2}>
          <Typography variant="s1">Pricing Terms</Typography>
          <InfoIcon
            aria-describedby={id}
            onMouseEnter={handleClick}
            color="primary"
            fontSize="large"
            sx={{ ml: 2, cursor: "pointer" }}
          />
          <PricingTermPopup handleClose={handleClose} id={id} anchorEl={anchorEl} open={open} />
        </Grid>
        <Cards index={index} />
      </Grid>
      {dataCompletionCheck && (
        <MachineSummary
          total={details?.machine?.total}
          cgst={details?.machine?.cgst}
          sgst={details?.machine?.sgst}
          taxableAmount={details?.machine?.taxable_amount}
        />
      )}
    </Grid>
  )
}

export default SubscriptionSetting
