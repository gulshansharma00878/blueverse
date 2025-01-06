import React, { useEffect, useState } from "react"
import { Divider, Grid, Stack, Typography, Box } from "@mui/material"
import { useStyles } from "../AdvanceMemoStyles"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import Success from "assets/images/icons/successIcon.webp"
import { dateMonthFormat, getMonthName } from "helpers/app-dates/dates"
import { getMinPricePlan } from "helpers/Functions/dealerUtilities"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
function PaymentSuccess({ paymentData, memoData, handleDownload }) {
  const user = userDetail()
  const navigate = useNavigate()
  const [washTypeLable, setWashTypeLable] = useState("")

  useEffect(() => {
    if (paymentData) {
      let label = getMinPricePlan(
        Array.isArray(paymentData?.transactionMemoDetail?.pricingTerms)
          ? paymentData?.transactionMemoDetail?.pricingTerms
          : []
      )
      setWashTypeLable(label)
    }
  }, [paymentData])
  const ItemRow = ({ label, value }) => {
    return (
      <Grid style={{ marginBottom: "2.8rem" }} container>
        <Grid item xs={6}>
          <Typography variant="p1" color="text.gray" sx={{ fontWeight: "500" }}>
            {label}
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="s1" color="text.main">
            {value}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const styles = useStyles()
  const itemList2 = [
    { item: "Paid Through", value: paymentData?.bankcode },
    { item: "Transaction ID", value: paymentData?.txnid },
    { item: "Paid On", value: dateMonthFormat(paymentData?.addedon, "DD/MM/YYYY") }
  ]

  const itemList1 = [
    { value: "BlueVerse India Private Limited" },
    { value: memoData?.outlet?.city?.state?.blueverseAddress },
    { value: "PAN No. CRDP5201Q" },
    {
      value: `GSTIN ${
        memoData?.outlet?.city?.state?.stateGstNo ? memoData?.outlet?.city?.state?.stateGstNo : "-"
      }`
    }
  ]

  const itemList3 = [
    { value: memoData?.outlet?.name },
    { value: memoData?.outlet?.address },
    { value: "New Delhi- 110043, Delhi" },
    { value: `GSTIN ${memoData?.outlet?.gstNo}` }
  ]

  return (
    <Box sx={styles.outerContainer}>
      <Box sx={styles.innerContainer}>
        {/* Section # 1 : Payment details */}
        <Stack spacing="0.8rem">
          {itemList2.map((item, index) => (
            <Grid container key={index}>
              <Grid item xs={6} sm="4">
                <Typography variant="p2">{item.item}</Typography>
              </Grid>
              <Grid item xs={6} sm="4" textAlign={{ xs: "right", sm: "left" }}>
                <Typography variant="p2">{item.value}</Typography>
              </Grid>
            </Grid>
          ))}
        </Stack>
        {/* Section 2 : Biller & customer */}
        <Grid
          item
          rowGap="2.4rem"
          style={{
            marginTop: "2.4rem"
          }}
          container>
          <Grid xs={12} sm={6} item>
            <Typography variant="p2" marginBottom="1.2rem" component="p">
              Biller :
            </Typography>
            {itemList1.map((item, index) => (
              <Typography
                key={index}
                marginBottom="0.2rem"
                variant={index === 0 ? "s1" : "p2"}
                component="p"
                color="text.main">
                {item.value}
              </Typography>
            ))}
          </Grid>
          <Grid xs={12} sm={6} item container justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
            <Box>
              <Typography variant="p2" marginBottom="1.2rem" component="p">
                Customer :
              </Typography>
              {itemList3.map((item, index) => (
                <Typography
                  key={index}
                  marginBottom="0.2rem"
                  variant={index === 0 ? "s1" : "p2"}
                  component="p"
                  color="text.main">
                  {item.value}
                </Typography>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Grid
          style={{ marginTop: "22px", padding: "10px 0px" }}
          item
          container
          justifyContent="space-between">
          <Typography variant="s1">
            {memoData?.machine?.name} - Invoice{" "}
            {getMonthName(paymentData?.transactionMemoDetail?.month)}
          </Typography>
          <Stack>
            <Typography variant="p3">Invoice ID</Typography>
            <Typography variant="s1">{paymentData?.transactionMemoDetail?.memoId}</Typography>
          </Stack>
        </Grid>
        <Divider sx={{ marginBottom: "1rem" }} />
        <Box>
          {paymentData?.transactionMemoDetail?.pricingTerms ? (
            // This block contains pricing terms which will be visible with advance memo payment.
            // ... but would not be visible when top-up recharge is done as per BE team confirmation
            <Stack>
              <ItemRow label="Washes Opted" value={washTypeLable} />
              <ItemRow
                label="Minimum Wash Commitment"
                value={paymentData?.transactionMemoDetail?.minimumWashCommitment}
              />
              <ItemRow
                label={washTypeLable}
                value={formatCurrency(
                  paymentData?.transactionMemoDetail?.pricingTerms?.find(
                    (x) => x?.type === washTypeLable
                  )?.dealerPerWashPrice
                )}
              />
              <ItemRow
                label="Manpower Price (Per Wash)"
                value={formatCurrency(
                  paymentData?.transactionMemoDetail?.pricingTerms?.find(
                    (x) => x?.type === washTypeLable
                  )?.manpowerPricePerWash
                )}
              />
            </Stack>
          ) : null}
          <Stack>
            <ItemRow
              label="Taxable Amount"
              value={paymentData?.transactionMemoDetail?.taxableAmount}
            />
            <ItemRow label="CGST" value={paymentData?.transactionMemoDetail?.cgst} />
            <ItemRow label="SGST" value={paymentData?.transactionMemoDetail?.sgst} />
          </Stack>
        </Box>
        <Divider />
        <Grid container sx={{ marginTop: "2.8rem" }}>
          <Grid item xs={6}>
            <Typography variant="s1" color="text.main">
              Total Amount Paid
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right" }}>
            <Typography variant="h6" color="text.main">
              INR {paymentData?.transactionMemoDetail?.totalAmount}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={styles.innerContainer}>
        <Grid item container justifyContent="space-between">
          <Grid xs={6}>
            <Stack>
              <Typography variant="p3" color="text.gray">
                Paid Through
              </Typography>
              <Typography variant="p3" color="text.main">
                {paymentData?.bankcode}
              </Typography>
            </Stack>
          </Grid>
          <Grid xs={6} container justifyContent="flex-end">
            <Stack>
              <Typography variant="p3" color="text.main">
                Date: {dateMonthFormat(paymentData?.addedon, "DD/MM/YYYY, hh:mm A")}
              </Typography>
              <Grid item container direction="row">
                <Typography variant="p3" color="text.gray">
                  Transaction ID{" "}
                </Typography>
                <Typography variant="p3" color="text.main">
                  {paymentData?.txnid}
                </Typography>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
        <Stack alignItems="center" width="100%" spacing="5.2rem" textAlign="center">
          <img src={Success} style={{ width: "13.2rem", height: "13.2rem" }} />
          <Typography variant="h5" color="text.green">
            Thank you for your payment!
          </Typography>
          <Stack spacing="0.5rem">
            <Typography variant="p1" color="text.main">
              A Receipt for this transaction has been sent via email for your records.
            </Typography>
            <Typography
              variant="p1"
              color="primary.main"
              style={{ cursor: "pointer" }}
              onClick={handleDownload}>
              Click here to Download
            </Typography>
          </Stack>
          <Stack spacing="0.5rem">
            <Typography variant="p1" color="text.main">
              Total Payment Amount
            </Typography>
            <Typography variant="h5" color="text.main">
              INR {paymentData?.transactionMemoDetail?.totalAmount}
            </Typography>
          </Stack>
          <Stack spacing="0.5rem">
            <Typography variant="s1">Payment Method</Typography>
            <Typography variant="p2" color="text.main">
              {paymentData?.bankcode}
            </Typography>
            <Typography variant="p2" color="text.main">
              {paymentData?.mihpayid}
            </Typography>
          </Stack>
          <PrimaryButton
            style={{ width: "80%" }}
            type="submit"
            variant="contained"
            onClick={() => navigate(`/${user?.role}/wallet/transaction-history`)}>
            Go To Home
          </PrimaryButton>
        </Stack>
      </Box>
    </Box>
  )
}

export default PaymentSuccess
