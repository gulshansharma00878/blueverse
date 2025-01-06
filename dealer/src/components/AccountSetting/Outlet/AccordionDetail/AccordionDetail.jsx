import { Box, Divider, Grid, Typography, useMediaQuery } from "@mui/material"
import React from "react"
import { useStyles } from "./AccordionDetailStyles"
import MinimumBox from "./MinimumBox"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import WashCard from "./WashCard"
import { useTheme } from "@emotion/react"

function AccordionDetail({ data }) {
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Grid container sx={styles?.gridContainer}>
      <Grid item xs={12} display={"flex"} justifyContent={isMobile ? "center" : "space-between"}>
        {" "}
        <Box display={"flex"} alignItems={"center"}>
          <Box sx={styles?.machineName}>
            <Typography align="center">{data?.machineName}</Typography>{" "}
          </Box>
          <Box marginLeft={"1rem"}>
            <MinimumBox
              heading="Minimum Wash Commitment"
              subHeading={data?.subscriptionData?.minimumWashCommitme}
              direction={"column"}
            />
          </Box>
        </Box>
        {!isMobile && (
          <Box>
            <MinimumBox
              heading="Taxable Amount"
              subHeading={formatCurrency(data?.subscriptionData?.taxableAmount)}
              direction={"column"}
            />{" "}
          </Box>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{ margin: "1rem auto" }}
        display={"flex"}
        justifyContent={"space-between"}>
        <Box
          display={"flex"}
          justifyContent={isMobile ? "space-around" : ""}
          width={isMobile ? "100%" : "50%"}>
          {isMobile && (
            <Box>
              <MinimumBox
                heading="Taxable Amount"
                subHeading={formatCurrency(data?.subscriptionData?.taxableAmount)}
                direction={"column"}
              />{" "}
            </Box>
          )}
          <Divider orientation="vertical" />
          <Box display={""}>
            <MinimumBox
              heading="CGST (9%) "
              subHeading={`${formatCurrency(data?.subscriptionData?.cgst)}`}
              direction={"row"}
            />{" "}
            <MinimumBox
              heading="SGST (9%) "
              subHeading={formatCurrency(data?.subscriptionData?.sgst)}
              direction={"row"}
            />
          </Box>
        </Box>
        {!isMobile && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <MinimumBox
              heading="On Monthly Wash Revenue"
              subHeading={formatCurrency(data?.subscriptionData?.total)}
              direction={"row"}
            />{" "}
            <MinimumBox
              heading="Minimum guarantee "
              subHeading={"(incl.GST)"}
              direction={"row"}
              flexEnd
            />
          </Box>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        margin={"1rem auto"}
        alignItems={"center"}
        justifyContent={"center"}
        display={"flex"}
        flexDirection={"column"}>
        {isMobile && (
          <Box>
            <MinimumBox
              heading="On Monthly Wash Revenue"
              subHeading={formatCurrency(data?.subscriptionData?.total)}
              direction={"row"}
            />{" "}
            <MinimumBox
              heading="Minimum guarantee "
              subHeading={"(incl.GST)"}
              direction={"row"}
              flexEnd={!isMobile ? true : false}
            />
          </Box>
        )}
      </Grid>
      <Divider sx={{ marginTop: "1rem" }} />
      <Grid
        container
        style={{
          padding: "20px 0px",
          borderTop: "1px solid #C9D8EF"
        }}>
        {data?.subscriptionData?.pricingTerms &&
          data?.subscriptionData?.pricingTerms?.map((item, index) => {
            return <WashCard item={item} key={index} />
          })}
      </Grid>
    </Grid>
  )
}

export default AccordionDetail
