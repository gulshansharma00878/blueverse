import React from "react"
import { Box, Typography } from "@mui/material"
import styles from "./CustomerDetail.module.scss"
import { useTheme } from "@mui/system"
import earthImage from "../../../assets/images/Logo/earth-logo.webp"
import WashTypeFlag from "components/utitlities-components/WashTypeFlag"
import { dateMonthFormat } from "helpers/app-dates/dates"

function CustomerSection(props) {
  const { customerData } = props
  const theme = useTheme()
  return (
    <Box className={styles.customer_container}>
      <Box className={styles.detail_container}>
        <Box className={styles.section2}>
          <Box className={styles.inner_box}>
            <Box className={styles.flag}>
              <WashTypeFlag rightPosition={false} washType={customerData?.washType?.Name} />
            </Box>
            <Typography variant="s1" sx={{ width: "100%" }} component={"div"}>
              Machine: {customerData?.machine?.name ? customerData?.machine?.name : "NA"}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2">
              {customerData?.machine?.outlet?.name ? customerData?.machine?.outlet?.name : ""}
              {customerData?.machine?.outlet?.address
                ? " - " + customerData?.machine?.outlet?.address
                : ""}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
              {customerData?.machine?.outlet?.city?.state?.region?.name} -{" "}
              {customerData?.machine?.outlet?.city?.state?.name},{" "}
              {customerData?.machine?.outlet?.city?.name}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
              Wash Time :{" "}
            </Typography>
            <Typography variant="p2">
              {dateMonthFormat(customerData?.AddDate, "DD/MM/YYYY hh:mm A")}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.section3}>
          <Box className={styles.inner_box}>
            <Typography variant="s1">
              Totals:{" "}
              {customerData?.machineWallet
                ? "INR " +
                  Number(
                    customerData?.machineWallet?.totalAmount
                      ? customerData?.machineWallet?.totalAmount
                      : 0
                  )
                : "NA"}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
              Base Price:
            </Typography>
            <Typography variant="p2">
              {customerData?.machineWallet?.baseAmount
                ? "INR " + customerData?.machineWallet?.baseAmount
                : "NA"}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2">
              <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                Cgst (9%):{" "}
              </Typography>
              {customerData?.machineWallet?.cgst
                ? "INR " + customerData?.machineWallet?.cgst
                : "NA"}
            </Typography>
            <Typography variant="p2">
              <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                Sgst (9%):{" "}
              </Typography>
              {customerData?.machineWallet?.sgst
                ? "INR " + customerData?.machineWallet?.sgst
                : "NA"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={styles.banner_container}>
        <Box className={styles.earth_banner}>
          <img src={earthImage} alt="Earth" className={styles.image} />
          <Box className={styles.text_box}>
            <Typography variant="s1" component={"div"}>
              Congratulations!{" "}
            </Typography>
            <Typography variant="p4" component={"div"}>
              You Have{" "}
              <Typography variant="p1">Recycled and Reuse {163} Litres Of Water</Typography> From
              This Bike Wash!
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CustomerSection
