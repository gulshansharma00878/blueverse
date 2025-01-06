import React, { useEffect, useState } from "react"
import { Box, Divider, Grid, Typography, useTheme } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import ContentBox from "components/utilities-components/ContentBox/ContentBox"
import { useStyles } from "./AdvanceMemoStyles"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import MemoTable from "components/utilities-components/MemoTable"
import ContentBoxInfo from "components/utilities-components/ContentBox/ContentBoxInfo"
import { useParams } from "react-router-dom"
import { dateMonthFormat, getMonthDates } from "helpers/app-dates/dates"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { BillingService } from "network/billingServices"
import { numberToWord } from "helpers/Functions/numberToWord"
import {
  columns,
  createData,
  createTopUpData,
  createInvoiceData,
  topUpColumns,
  createCreditData,
  creditColumns,
  taxInvoiceColumns,
  detailsColumn
} from "../billingUtilities"
import { getMonthName } from "helpers/app-dates/dates"
import { useNavigate } from "react-router-dom"
import { billingActions } from "redux/store"
import { useDispatch } from "react-redux"
import useMediaQuery from "@mui/material/useMediaQuery"
function ViewAdvanceMemo() {
  const styles = useStyles()
  const params = useParams()
  const theme = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTab = useMediaQuery(theme.breakpoints.down("md"))
  const memoId = params?.memoId
  const HSN_NUMEBR = 999719
  const [loader, setLoader] = useState(false)
  const [data, setData] = useState()
  const [listData, setListData] = useState()
  const [memoType, setMemoType] = useState()
  const [calculations, setCalculations] = useState()
  useEffect(() => {
    getMemoDetail()
  }, [memoId])

  const getMemoDetail = async () => {
    setLoader(true)
    let param = [memoId]
    let memoDetail = await BillingService.memoDetail(param)
    if (memoDetail.code === 200 && memoDetail.success) {
      if (memoDetail?.data?.type === "TAX_INVOICE") {
        setListData(getInvoiceObject(memoDetail?.data))
      } else {
        setListData(memoDetail?.data?.pricingTerms)
      }
      setData(memoDetail?.data)

      memoDetail?.data?.type === "ADVANCE_MEMO" &&
        setCalculations(calculateDetails(memoDetail?.data))
      setMemoType(memoDetail?.data?.type)
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
            item: "Original Advance Invoice Id",
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
            item: "Original TopUp Invoice Id",
            value: data?.invoiceId ? data?.invoiceId : "-"
          },
          { item: "Original Invoice Date", value: dateMonthFormat(data?.paidOn, "DD MMM, YYYY") }
        ]
      default:
        break
    }
  }
  const getItemCase = (value) => {
    switch (value) {
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
  function findMinimumPriceObject(data) {
    let minimumPrice = Infinity
    let minimumPriceObject = null

    for (let i = 0; i < data?.length; i++) {
      const object = data?.[i]
      const totalPrice = object?.dealerPerWashPrice + object?.manpowerPricePerWash + 10

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
        return "Silver Wash"
      case "GOLD":
        return "Gold Wash"
      case "PLATINUM":
        return "Platinum Wash"
      default:
        break
    }
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
          ...invoice
        })
      }
    })
    return requiredArray
  }
  const getTotal = (washes, price) => {
    return parseFloat(washes) * parseFloat(price)
  }
  let tableData = []
  switch (memoType) {
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
              list?.hsnNo ?? " ",
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
            createCreditData(
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

  function memoDetailType(value) {
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

  const handleBack = () => {
    switch (memoType) {
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
  const getNumberToWord = (value) => {
    switch (value) {
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
    <>
      {loader ? (
        <AppLoader />
      ) : (
        <Grid container>
          <CommonHeader
            backBtn
            heading={data?.memoId}
            backBtnHandler={handleBack}
            headerStyle={{ paddingLeft: 0 }}
            downloadEnabled={data?.pdfAddress ? true : false}
            handleDownload={handleDownload}
          />
          <Grid sx={styles.innerBox_container}>
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
            <Grid item xs={12} sx={styles.machineInfo}>
              <Typography variant="h6" color="background.blue2" sx={styles.textDeco}>
                {data?.machine?.name} - {memoDetailType(data?.type)} {getMonthName(data?.month)},{" "}
                {dateMonthFormat(data?.createdAt, "YYYY")}{" "}
              </Typography>
            </Grid>
            <Grid justifyContent="space-between" item container xs={12} rowGap="1.6rem">
              <ContentBox item={itemList3} xs={6} gap={"0.4rem"} />
              <Grid item xs="12" sm="auto">
                <ContentBoxInfo
                  item={itemListDetail(data?.type)}
                  rowGap="0.4rem"
                  firstColAlign={isMobile ? "left" : "right"}
                  secondColAlign={isMobile ? "left" : "right"}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sx={styles.washSection_box}>
              <Grid item xs={12} sx={styles.washSection}>
                <Typography variant="s1">Minimum Wash Commitment (per month):</Typography>
                <Typography variant="s1">
                  {formatCurrency(data?.minimumWashCommitment, "")}
                </Typography>
              </Grid>
              {data?.type === "BLUEVERSE_CREDIT" && (
                <Grid item xs={12} sx={styles.washSection}>
                  <Typography variant="s1">Actual Washes Consumed:</Typography>
                  <Typography variant="s1">{formatCurrency(data?.washesDone, "")}</Typography>
                </Grid>
              )}
            </Grid>
            <Grid
              style={{
                margin: "3.6rem 0rem 2.4rem 0rem",
                paddingBottom: "2.4rem",
                borderBottom: "0.1rem solid #C9D8EF"
              }}
              item
              xs={12}>
              <MemoTable
                columns={
                  memoType === "TOPUP_MEMO"
                    ? topUpColumns
                    : memoType === "BLUEVERSE_CREDIT"
                    ? creditColumns(isMobile, isTab)
                    : memoType === "TAX_INVOICE"
                    ? taxInvoiceColumns
                    : columns
                }
                tableData={tableData}
              />
            </Grid>
            <Grid justifyContent="flex-end" item xs={12} container>
              <ContentBoxInfo
                item={getItemCase(data?.type)}
                variant="s1"
                secondColWeight="600"
                rowGap="3.2rem"
                firstColAlign={isMobile ? "left" : "right"}
                tableWidth={isMobile ? "100%" : "fit-content"}
              />
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
                Total Payable Amount (In Words)
              </Typography>
              <Typography sx={styles.amount} color="text.main">
                {getNumberToWord(data?.type)}
              </Typography>
            </Grid>
            {memoType === "TAX_INVOICE" && (
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
              style={{ marginTop: "10.4rem" }}
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
            <Grid item container direction="column" style={{ marginTop: "6rem" }}>
              <Typography color="text.main" variant="p4">
                Please note: Charges for payment must be accepted and covered by the payer
              </Typography>
              <Typography
                style={{
                  padding: "1.2rem 0rem 1.2rem 0rem",
                  borderBottom: `1px solid ${theme.palette.background.blue1}`
                }}
                color="text.main"
                variant="p4">
                This {memoDetailType(data?.type)} is for the period pertaining from
                {getMonthDates(data?.month).startDate} to {getMonthDates(data?.month).endDate}
              </Typography>
              <Typography style={{ marginTop: "1.2rem" }} variant="p1">
                BlueVerse India Private Limited, {data?.outlet?.city?.state?.blueverseAddress}, PAN
                No. CRDP5201Q,GSTIN{" "}
                {data?.outlet?.city?.state?.stateGstNo
                  ? data?.outlet?.city?.state?.stateGstNo
                  : "-"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  )
}

export default ViewAdvanceMemo
