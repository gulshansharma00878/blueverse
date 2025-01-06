import { Box, Typography } from "@mui/material"
import React from "react"
import { useStyles } from "../../DealerInfoStyles"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import moment from "moment"

function AccordionData({ data }) {
  const styles = useStyles()

  function combineTypes(data) {
    const types = data?.reduce((acc, obj) => {
      if (!acc?.includes(obj.type)) {
        acc?.push(obj.type)
      }
      return acc
    }, [])

    return types?.join(" , ") || "- -"
  }

  function findCheapestDealer(dealers) {
    let cheapestDealer = dealers?.[0]
    for (let i = 1; i < dealers?.length; i++) {
      if (dealers[i]?.dealerPerWashPrice < cheapestDealer?.dealerPerWashPrice) {
        cheapestDealer = dealers?.[i]
      }
    }
    return cheapestDealer
  }

  const innerData = [
    {
      heading: "Washes Opted",
      value: combineTypes(data?.machineSubscriptionSetting?.pricingTerms)
    },

    {
      heading: "Minimum Wash Commitment",
      value: data?.machineSubscriptionSetting?.minimumWashCommitme
    },
    {
      heading: "Commencement Date",
      value: moment(data?.invoice_date).format("DD/MM/YYYY")
    },
    {
      heading: "Security Deposit",
      value: formatCurrency(data?.machineSubscriptionSetting?.securityDeposited, "INR ")
    },
    {
      heading: `Price (${
        findCheapestDealer(data?.machineSubscriptionSetting?.pricingTerms)?.type
      }-Per Wash)`,
      value: formatCurrency(
        findCheapestDealer(data?.machineSubscriptionSetting?.pricingTerms)?.dealerPerWashPrice,
        "INR "
      )
    },
    {
      heading: "Manpower Price (Per Wash)",
      value: formatCurrency(
        findCheapestDealer(data?.machineSubscriptionSetting?.pricingTerms)?.manpowerPricePerWash,
        "INR "
      )
    },
    {
      heading: "Taxable Amount",
      value: formatCurrency(data?.machineSubscriptionSetting?.taxableAmount, "INR ")
    },
    {
      heading: "CGST (9%)",
      value: formatCurrency(data?.machineSubscriptionSetting?.cgst, "INR ")
    },
    {
      heading: "SGST (9%)",
      value: formatCurrency(data?.machineSubscriptionSetting?.sgst, "INR ")
    },
    {
      heading: "Total Amount Paid",
      value: formatCurrency(data?.machineSubscriptionSetting?.total, "INR ")
    }
  ]

  return (
    <>
      {innerData?.map((item, index) => {
        return (
          <Box key={index} sx={styles.accordionOuterCard}>
            <Typography
              color={index == 9 ? "text.main" : "text.gray"}
              sx={index == 9 ? styles.accordionHeadingText1 : styles.accordionHeadingText}>
              {item?.heading}
            </Typography>
            <Typography sx={styles.amountData} variant={index == 9 ? "h6" : "s1"} color="text.main">
              {item?.value}
            </Typography>
          </Box>
        )
      })}
    </>
  )
}

export default AccordionData
