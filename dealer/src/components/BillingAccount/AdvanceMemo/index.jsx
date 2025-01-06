import { Box, Divider, Grid, Typography, useMediaQuery, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useStyles } from "./AdvanceMemoStyles"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import { numberToWord } from "helpers/Functions/numberToWord"
import MemoTable from "components/utitlities-components/MemoTable/index"
import ContentBox from "components/utitlities-components/ContentBox/ContentBox"
import ContentBoxInfo from "components/utitlities-components/ContentBox/ContentBoxInfo"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import SecondaryButton from "components/utitlities-components/SecondaryButton/SecondaryButton"
import AppLoader from "components/Loader/AppLoader"
import { BillingService } from "network/billingServices"
import Toast from "components/utitlities-components/Toast/Toast"
import { useParams, useNavigate } from "react-router-dom"
import { dateMonthFormat, getMonthName, getMonthDates } from "helpers/app-dates/dates"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { billingActions } from "redux/store"
import {
  columns,
  createData,
  topUpColumns,
  createTopUpData,
  creditsColumns,
  createBVCredits,
  detailsColumn,
  taxInvoiceColumns,
  createInvoiceData
} from "../billingUtilities"

function ViewAdvanceMemo({
  payment = false,
  closePopup = () => {},
  handlePayment = () => {},
  popupMemoId = null
}) {
  const styles = useStyles()
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isTopUp = useSelector((state) => state?.billing?.isTopUp)
  const memoId = params?.memoId
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [loader, setLoader] = useState(false)
  const [data, setData] = useState()
  const [listData, setListData] = useState()
  const [memoTypes, setMemoTypes] = useState("")
  const [calculations, setCalculations] = useState()
  const HSN_NUMEBR = 999719

  useEffect(() => {
    getMemoDetail()
  }, [memoId])

  const getMemoDetail = async () => {
    setLoader(true)
    let param = [popupMemoId || memoId]
    let memoDetail = await BillingService.memoDetail(param)
    if (memoDetail.code === 200 && memoDetail.success) {
      if (memoDetail?.data?.type === "TAX_INVOICE") {
        setListData(getInvoiceObject(memoDetail?.data))
      } else {
        setListData(memoDetail?.data?.pricingTerms)
      }
      memoDetail?.data?.type === "ADVANCE_MEMO" &&
        setCalculations(calculateDetails(memoDetail?.data))
      setData(memoDetail?.data)
      setMemoTypes(memoDetail?.data?.type)
    } else {
      Toast.showErrorToast(memoDetail?.message)
    }
    setLoader(false)
  }
  const calculateDetails = (data) => {
    let baseAmount, cgst, sgst, total
    const minimumData = findMinimumPriceObject(data?.pricingTerms)
    const calc =
      parseFloat(minimumData[0]?.manpowerPricePerWash) +
      parseFloat(minimumData[0]?.dealerPerWashPrice)
    baseAmount = calc * data?.minimumWashCommitment
    cgst = (baseAmount * data?.gstPercentage?.cgst) / 100
    sgst = (baseAmount * data?.gstPercentage?.sgst) / 100
    total = baseAmount + sgst + cgst
    return { baseAmount, cgst, sgst, total }
  }
  const getInvoiceObject = (recievedListing) => {
    return recievedListing?.invoiceData?.length > 0
      ? getInvoices(recievedListing?.invoiceData)
      : createInvoiceObject(recievedListing?.pricingTerms)
  }
  const createInvoiceObject = (pricingTerms) => {
    let requireArray = []
    pricingTerms.forEach((pricingTerm) => {
      requireArray.push({
        baseAmount:
          parseFloat(pricingTerm?.manpowerPricePerWash) +
          parseFloat(pricingTerm?.dealerPerWashPrice),
        cgst: "0",
        sgst: "0",
        totalAmount: "0",
        washType: pricingTerm?.type,
        manpowerPricePerWash: pricingTerm?.manpowerPricePerWash,
        dealerPerWashPrice: pricingTerm?.dealerPerWashPrice,
        count: "0",
        hsnNo: HSN_NUMEBR
      })
    })
    return requireArray
  }
  const getInvoices = (invoicesArray) => {
    let requiredArray = []

    const invoiceMap = new Map(
      invoicesArray.map((obj) => {
        return [obj.key, obj.value]
      })
    )
    const valuesArray = Array.from(invoiceMap.values())
    const indexforHSN = Math.floor(valuesArray?.length / 2)
    valuesArray.forEach((invoice, index) => {
      if (index === indexforHSN) {
        requiredArray.push({
          ...invoice,
          hsnNo: HSN_NUMEBR
        })
      } else {
        requiredArray.push({
          ...invoice,
          hsnNo: " "
        })
      }
    })
    return requiredArray
  }
  function findMinimumPriceObject(pricingTerm) {
    let minimumPrice = Infinity
    let minimumPriceObject = null

    for (let i = 0; i < pricingTerm?.length; i++) {
      const object = pricingTerm?.[i]
      const totalPrice =
        (object?.dealerPerWashPrice || 0 + object?.manpowerPricePerWash || 0) *
          data?.minimumWashCommitment || 1

      if (totalPrice < minimumPrice) {
        minimumPrice = totalPrice
        minimumPriceObject = object
      }
    }
    return [minimumPriceObject]
  }

  function typeOfWash(value) {
    switch (value) {
      case "SILVER":
        return "Silver Price (Per Wash)"
      case "GOLD":
        return "Gold Price (Per Wash)"
      case "PLATINUM":
        return "Platinum Price (Per Wash)"
      default:
        break
    }
  }

  function memoType(value) {
    switch (value) {
      case "ADVANCE_MEMO":
        return "Advance Memo"
      case "TOPUP_MEMO":
        return "Top up Memo"
      case "TAX_INVOICE":
        return "Tax Invoice"
      case "BLUEVERSE_CREDIT":
        return "BlueVerse Credits Memo"
      default:
        break
    }
  }
  const itemList1 = [
    { value: "BlueVerse India Private Limited", style: styles?.value1 },
    { value: data?.memoDetail?.outlet?.stateBlueverseAdd },
    { value: "PAN No. CRDP5201Q" },
    {
      value: `GSTIN ${
        data?.memoDetail?.outlet?.stateGstNo ? data?.memoDetail?.outlet?.stateGstNo : "-"
      }`
    }
  ]

  const itemList2 = [
    {
      item: "Paid Through",
      value: data?.paymentTransaction?.webhookResponse?.order_card_name || "N.A."
    },
    { item: "Transaction ID", value: data?.paymentTransaction?.transactionId || "N.A." },
    { item: "Paid On", value: dateMonthFormat(data?.paidOn, "DD MMM, YYYY") || "N.A." }
  ]

  const itemList3 = [
    { value: "Billing Address", style: styles.billingAddress },
    { value: data?.dealer?.username },
    { value: data?.outlet?.name },
    { value: data?.outlet?.address },
    {
      value:
        data?.outlet?.city?.name +
        ", " +
        data?.outlet?.city?.state?.name +
        ", " +
        data?.outlet?.city?.state?.region?.name
    },
    { value: `GSTIN ${data?.outlet?.gstNo}` }
  ]

  function itemListDetail(value) {
    switch (value) {
      case "ADVANCE_MEMO":
        return [
          { item: "Memo ID", value: data?.memoId },
          { item: "Memo Date", value: dateMonthFormat(data?.createdAt, "DD MMM, YYYY") },
          { item: "Terms:", value: "Due on Reciept" },
          { item: "Machine No", value: data?.machine?.name },
          { item: "Due Date", value: dateMonthFormat(data?.dueDate, "DD MMM, YYYY") }
        ]
      case "TOPUP_MEMO":
        return [
          { item: "Memo ID", value: data?.memoId },
          { item: "Memo Date", value: dateMonthFormat(data?.createdAt, "DD MMM, YYYY") },
          { item: "Machine No", value: data?.machine?.name }
        ]
      case "TAX_INVOICE":
        return [
          { item: "Invoice ID", value: data?.memoId },
          { item: "Invoice Date", value: dateMonthFormat(data?.createdAt, "DD MMM, YYYY") },
          { item: "Machine No", value: data?.machine?.name },
          {
            item: "Original Advance memo Invoice Id",
            value: data?.invoiceId ? data?.invoiceId : "-"
          },
          { item: "Original Invoice Date", value: dateMonthFormat(data?.paidOn, "DD MMM, YYYY") }
        ]
      case "BLUEVERSE_CREDIT":
        return [
          { item: "Memo ID", value: data?.memoId },
          { item: "Memo Date", value: dateMonthFormat(data?.createdAt, "DD MMM, YYYY") },
          { item: "Machine No", value: data?.machine?.name },
          {
            item: "Original Tax Invoice Id",
            value: data?.invoiceId ? data?.invoiceId : "-"
          },
          { item: "Original Invoice Date", value: dateMonthFormat(data?.paidOn, "DD MMM, YYYY") }
        ]
      default:
        break
    }
  }

  const getItemCase = () => {
    switch (memoTypes) {
      case "ADVANCE_MEMO":
        return [
          {
            item: "Amount Before GST",
            value: formatCurrency(calculations?.baseAmount, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "CGST (9%)",
            value: formatCurrency(calculations?.cgst, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "SGST (9%)",
            value: formatCurrency(calculations?.sgst, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "Total",
            value: formatCurrency(calculations?.total, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "Topup Amount",
            value: `- ${formatCurrency(data?.topupAmountAdjusted, "INR ")}`,
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "Invoice Total",
            value: formatCurrency(
              getInvoiceTotal(calculations?.total, data?.topupAmountAdjusted),
              "INR "
            ),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          }
        ]
      case "BLUEVERSE_CREDIT":
        return [
          {
            item: "BlueVerse Credits (Floor Round Off)",
            value: formatCurrency(Math.round(data?.creditRemainingBalance), " "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "Credit Note Total",
            value: formatCurrency(Math.round(data?.creditRemainingBalance), " "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          }
        ]
      default:
        return [
          {
            item: "Amount Before GST",
            value: formatCurrency(data?.taxableAmount, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "CGST (9%)",
            value: formatCurrency(data?.cgst, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },
          {
            item: "SGST (9%)",
            value: formatCurrency(data?.sgst, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          },

          {
            item: "Invoice Total",
            value: formatCurrency(data?.totalAmount, "INR "),
            style: styles.invoiceSection,
            style1: styles.invoiceSection
          }
        ]
    }
  }
  const getInvoiceTotal = (total, topUp) => {
    const calc = parseFloat(total) - parseFloat(topUp)
    return calc
  }
  const getTotal = (washes, price) => {
    return parseFloat(washes) * parseFloat(price)
  }
  let tableData = []
  switch (memoTypes) {
    case "ADVANCE_MEMO":
      listData &&
        findMinimumPriceObject(listData)?.map((list, index) => {
          return tableData.push(
            createData(
              index + 1,
              typeOfWash(list?.type),
              data?.minimumWashCommitment === 0 ? "0" : data?.minimumWashCommitment,
              formatCurrency(list?.dealerPerWashPrice, ""),
              formatCurrency(list?.manpowerPricePerWash, ""),
              formatCurrency(calculations?.baseAmount, ""),
              calculations?.sgst,
              calculations?.cgst,
              formatCurrency(calculations?.total, "")
            )
          )
        })
      break
    case "TOPUP_MEMO":
      tableData.push(
        createTopUpData(
          1,
          "Top Up",
          formatCurrency(data?.taxableAmount, ""),
          data?.sgst,
          data?.cgst,
          formatCurrency(data?.totalAmount, "")
        )
      )
      break
    case "TAX_INVOICE":
      listData &&
        listData.map((list, idx) => {
          return tableData.push(
            createInvoiceData(
              idx + 1,
              typeOfWash(list?.washType) ?? "NA",
              list?.hsnNo,
              list?.count,
              formatCurrency(list?.baseAmount, ""),
              JSON.stringify(getTotal(list?.count, list?.baseAmount))
            )
          )
        })
      break
    case "BLUEVERSE_CREDIT":
      listData &&
        findMinimumPriceObject(listData)?.map((list, index) => {
          return tableData.push(
            createBVCredits(
              index + 1,
              typeOfWash(list?.type),
              data?.minimumWashCommitment === 0 ? "0" : data?.minimumWashCommitment,
              formatCurrency(data?.creditRemainingBalance, "")
            )
          )
        })
      break
    default:
      break
  }

  const handleBack = () => {
    switch (memoTypes) {
      case "ADVANCE_MEMO":
        dispatch(billingActions.setBillingTabActive(0))
        break
      case "TOPUP_MEMO":
        dispatch(billingActions.setBillingTabActive(1))
        break
      case "TAX_INVOICE":
        dispatch(billingActions.setBillingTabActive(2))
        break
      case "BLUEVERSE_CREDIT":
        dispatch(billingActions.setBillingTabActive(3))
        break
      default:
        break
    }
    navigate(-1)
  }
  const getNumberToWord = () => {
    switch (memoTypes) {
      case "ADVANCE_MEMO":
        return getInvoiceTotal(calculations?.total, data?.topupAmountAdjusted) > 0
          ? numberToWord(getInvoiceTotal(calculations?.total, data?.topupAmountAdjusted))
          : numberToWord(0)
      case "BLUEVERSE_CREDIT":
        return numberToWord(data?.creditRemainingBalance)
      default:
        return numberToWord(data?.totalAmount)
    }
  }
  let totaltax
  const getTotalTax = (cgst, sgst) => {
    totaltax = parseFloat(cgst) + parseFloat(sgst)
    return totaltax
  }
  const bottomData = [
    {
      hsnNo: HSN_NUMEBR,
      total: data?.taxableAmount,
      sgst: data?.sgst,
      cgst: data?.cgst,
      totalTax: JSON.stringify(getTotalTax(data?.sgst, data?.cgst))
    }
  ]
  const getPaymentDetails = () => {
    if (memoTypes === "ADVANCE_MEMO") {
      return getInvoiceTotal(calculations?.total, data?.topupAmountAdjusted) > 0
        ? formatCurrency(getInvoiceTotal(calculations?.total, data?.topupAmountAdjusted), "INR ")
        : 0
    } else {
      return getInvoiceTotal(data?.totalAmount, data?.topupAmountAdjusted) > 0
        ? formatCurrency(getInvoiceTotal(data?.totalAmount, data?.topupAmountAdjusted))
        : 0
    }
  }
  const handleDownload = () => {
    if (data?.pdfAddress) {
      const a = document.createElement("a")
      a.href = data?.pdfAddress
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Box style={{ position: "relative" }}>
      <Box sx={{ padding: payment ? "2.4rem 2rem" : 0 }}>
        <CommonHeader
          backBtn={payment ? false : true}
          heading={data?.memoId}
          downloadEnabled={data?.pdfAddress ? true : false}
          handleDownload={handleDownload}
          headerStyle={{ paddingLeft: 0, backgroundColor: "inherit" }}
          backBtnHandler={handleBack}
        />
        <Box sx={styles.innerBox_container}>
          <Grid container sx={styles.detailBox}>
            <ContentBox img item={itemList1} xs={12} sm={4} />
            {data?.status == "PAID" &&
            data?.type !== "TAX_INVOICE" &&
            data?.type !== "BLUEVERSE_CREDIT" ? (
              <ContentBoxInfo
                item={itemList2}
                firstColAlign={isMobile ? "left" : "right"}
                secondColAlign="left"
              />
            ) : null}
          </Grid>
          <Box sx={styles.machineInfo}>
            <Typography variant="h6" color="primary.main" sx={styles.textDeco}>
              {data?.machine?.name} - {memoType(data?.type)} {getMonthName(data?.month)},{" "}
              {dateMonthFormat(data?.createdAt, "YYYY")}
            </Typography>
          </Box>
          <Grid justifyContent="space-between" container rowGap="1.6rem">
            <ContentBox item={itemList3} xs={6} />
            <Grid item xs="12" sm="auto">
              <ContentBoxInfo
                item={itemListDetail(memoTypes)}
                rowGap="0.4rem"
                firstColAlign={isMobile ? "left" : "right"}
                secondColAlign={isMobile ? "left" : "right"}
              />
            </Grid>
          </Grid>
          <Box
            style={isTopUp ? { borderTop: "none", padding: "0rem 0rem 2rem 0px" } : null}
            sx={styles.washSection_box}>
            {!isTopUp ? (
              <Grid item xs={12} sx={styles.washSection}>
                <Typography variant="s1">Minimum Wash Commitment (per month):</Typography>
                <Typography variant="s1">
                  {formatCurrency(data?.minimumWashCommitment, "")}
                </Typography>
              </Grid>
            ) : null}
            {data?.type === "BLUEVERSE_CREDIT" && (
              <Grid item xs={12} sx={styles.washSection}>
                <Typography variant="s1">Actual Washes Consumed:</Typography>
                <Typography variant="s1">{formatCurrency(data?.washesDone, "")}</Typography>
              </Grid>
            )}
          </Box>

          <Grid
            style={{
              margin: "2rem 0rem 2rem 0rem",
              paddingBottom: "2rem",
              borderBottom: "0.1rem solid #C9D8EF"
            }}
            item
            xs={12}>
            <MemoTable
              columns={
                memoTypes === "BLUEVERSE_CREDIT"
                  ? creditsColumns
                  : memoTypes === "TOPUP_MEMO"
                  ? topUpColumns
                  : memoTypes === "TAX_INVOICE"
                  ? taxInvoiceColumns
                  : columns
              }
              tableData={tableData}
            />
          </Grid>
          <Grid justifyContent="flex-end" item xs={12} container>
            <ContentBoxInfo
              // item={memoTypes === "BLUEVERSE_CREDIT" ? itemForCredit : itemList5}
              item={getItemCase()}
              variant="s1"
              secondColWeight="600"
              rowGap="3.2rem"
              firstColAlign={isMobile ? "left" : "right"}
              tableWidth={isMobile ? "100%" : "fit-content"}
            />
          </Grid>
          <Grid
            style={{
              marginTop: "2.4rem",
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              backgroundColor: theme?.palette?.secondary?.main,
              padding: "1.6rem"
            }}
            justifyContent="space-between"
            item
            xs={12}
            container
            rowGap="0.8rem">
            <Typography color="text.main" sx={styles.amountText}>
              Total Payable Amount (In Words)
            </Typography>
            <Typography sx={styles.amount} color="text.main">
              {getNumberToWord()}
            </Typography>
          </Grid>
          {memoTypes === "TAX_INVOICE" && (
            <>
              <Divider />
              <Grid
                style={{
                  margin: "3.6rem 0rem 2.4rem 0rem",
                  paddingBottom: "2.4rem"
                }}
                item
                xs={12}>
                <MemoTable columns={detailsColumn} tableData={bottomData} /> <Divider />
              </Grid>
              <Grid
                style={{
                  margin: "2.4rem auto",
                  borderLeft: `4px solid ${theme.palette.background.blue2}`,
                  backgroundColor: theme?.palette?.secondary?.main,
                  padding: "1.6rem"
                }}
                justifyContent="space-between"
                item
                rowGap="0.8rem"
                xs={12}
                container>
                <Typography color="text.main" sx={styles.amountText}>
                  Total Tax Paid (In Words)
                </Typography>
                <Typography sx={styles.amount} color="text.main">
                  {numberToWord(totaltax)}
                </Typography>
              </Grid>
              <Divider />
            </>
          )}

          <Grid
            item
            container
            justifyContent={isMobile ? "center" : "flex-end"}
            style={{ marginTop: "8.4rem" }}
            xs={12}>
            <Box style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography color="text.main" sx={styles.blueverseText}>
                For BlueVerse India Private Limited
              </Typography>
              <Typography color="primary.main" sx={styles.signature}>
                (Authorised Signatory)
              </Typography>
            </Box>
          </Grid>
          <Grid item container direction="column" style={{ marginTop: "3rem" }}>
            <Typography color="text.main" variant="p4">
              Please note: Charges for payment must be accepted and covered by the payer
            </Typography>
            <Typography
              style={{ padding: "1.2rem 0rem 1.2rem 0rem", borderBottom: "1px solid black" }}
              color="text.main"
              variant="p4">
              This {memoType(data?.type)} is for the period pertaining from{" "}
              {getMonthDates(data?.month).startDate} to {getMonthDates(data?.month).endDate}
            </Typography>
            <Typography style={{ marginTop: "1.2rem" }} variant="p1">
              BlueVerse India Private Limited, &nbsp;{data?.outlet?.city?.state?.blueverseAddress}
              ,&nbsp; PAN No. CRDP5201Q, &nbsp;
              {`GSTIN ${
                data?.outlet?.city?.state?.stateGstNo ? data?.outlet?.city?.state?.stateGstNo : "-"
              }`}
              {/* BlueVerse India Private Limited, Plot No. 7, Sector- 127, Nagar Kasol, Himachal
              Pradesh 320877, PAN No. CRDP5201Q,GSTIN 872649237402480 */}
            </Typography>
          </Grid>
        </Box>
      </Box>
      {/* same component with payment button  */}
      {payment ? (
        <Box sx={styles.memoFooter}>
          <Box id="amount-section">
            <Typography id="abc" variant="s1" color="text.gray">
              Total: &nbsp;
            </Typography>
            <Typography variant="h6" color="text.main" component="span">
              {getPaymentDetails()}
            </Typography>
          </Box>
          <Box id="button-section">
            <SecondaryButton
              type="submit"
              variant="contained"
              size="large"
              onClick={() => closePopup()}>
              Cancel
            </SecondaryButton>

            {getInvoiceTotal(data?.totalAmount, data?.topupAmountAdjusted) > 0 && (
              <PrimaryButton
                type="submit"
                variant="contained"
                size="large"
                onClick={(e) => handlePayment(e, data)}>
                Proceed To Payment
              </PrimaryButton>
            )}
          </Box>
        </Box>
      ) : null}
      {loader && <AppLoader />}
    </Box>
  )
}

export default ViewAdvanceMemo
