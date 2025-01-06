import React from "react"
import { Badge, Box, Grid, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useStyles } from "./BillingHeaderStyle.js"
import SearchBar from "../../utilities-components/Search/index.jsx"
import DownloadIcon from "../../../assets/images/icons/downloadIcon.svg"
import FilterIcon from "../../../assets/images/icons/filterIcon.svg"
import AmountCard from "components/utilities-components/AmountCard/index.jsx"
// import DarkWallet from "assets/images/icons/smallWallet.webp"
import Coins from "assets/images/icons/coins.svg"
import Billing from "assets/images/icons/Billing.svg"
import { dateMonthFormat } from "helpers/app-dates/dates.js"

function BillingHeader(props) {
  const styles = useStyles()

  const {
    heading,
    badgeData,
    searchEnabled = false,
    searchQuery,
    setQuery,
    filterEnabled = false,
    handleDrawer,
    downloadEnabled = false,
    handleDownload = () => {},
    setCurrentPage = () => {},
    amountCardVisible = true,
    totalAmountDue = 0,
    totalAmountReceive = 0,
    selectedDate = null,
    isFilterUsed
  } = props

  const theme = useTheme()
  const smMobile = useMediaQuery(theme.breakpoints.down("sm"))

  let actionsButtonsFlag = searchEnabled || filterEnabled || downloadEnabled

  const SearchBox = () => {
    return (
      <SearchBar
        setQuery={setQuery}
        searchQuery={searchQuery}
        setCurrentPage={setCurrentPage}
        whiteBgEnabled={smMobile ? false : true}
      />
    )
  }
  const FilterBox = () => {
    return (
      <Badge color="primary" variant="dot" invisible={!isFilterUsed}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          // className="filtericonBox"
          sx={[styles?.iconBox, smMobile ? styles?.marginZero : styles?.marginLeft]}
          onClick={handleDrawer}>
          <img src={FilterIcon} style={styles.icon} />
        </IconButton>
      </Badge>
    )
  }
  const DownloadBox = () => {
    return (
      <Box sx={[styles?.marginLeft, styles?.borderLeft]}>
        <IconButton
          aria-label="open drawer"
          edge="start"
          color="inherit"
          onClick={() => handleDownload()}
          sx={[styles?.iconBox, styles?.marginLeft]}>
          <img src={DownloadIcon} style={styles.icon} />
        </IconButton>
      </Box>
    )
  }

  return (
    <>
      <Grid sx={styles.boxHeightNormal} justifyContent="space-between" container>
        <Grid xs={amountCardVisible ? 2 : 4} item container>
          <Grid sx={styles.innerHeading} item>
            <Typography variant="h6">{heading}</Typography>
            {badgeData || badgeData === 0 ? (
              <Badge
                sx={[
                  styles?.alignCenter,
                  styles?.display,
                  styles?.justifyCenter,
                  styles?.smallMarginLeft,
                  styles?.badge
                ]}>
                <Typography variant="p2">{badgeData}</Typography>
              </Badge>
            ) : null}
          </Grid>
        </Grid>
        {amountCardVisible && (
          <Grid xs={8} item container sx={styles.amountCardBox}>
            <Box>
              <AmountCard
                title="Total Amount Due (incl.Gst)"
                imgSrc={Billing}
                amount={totalAmountDue}
                type={"cash"}
              />
            </Box>
            <Box item display={"flex"} alignItems="center" justifyContent={"flex-end"}>
              <AmountCard
                title={"Total Amount Due Recieved"}
                imgSrc={Coins}
                amount={totalAmountReceive}
                type={"credit"}
              />
            </Box>
          </Grid>
        )}
        {!smMobile && (
          <Grid xs={2} sx={styles.buttonBox} item>
            {searchEnabled && <SearchBox />}
            {filterEnabled && <FilterBox />}
            {downloadEnabled && <DownloadBox />}
          </Grid>
        )}
        {selectedDate && (
          <Grid item xs={12} sx={[styles.dateBox, { marginTop: "0.5rem" }]}>
            {selectedDate?.initialStartDate ? (
              <Box sx={styles.dateBox}>
                <Box sx={{ fontWeight: "600" }}>Start Date : </Box>
                <Box>{dateMonthFormat(selectedDate?.initialStartDate, "DD/MM/YYYY")}</Box>
              </Box>
            ) : null}
            {selectedDate?.initialEndDate ? (
              <Box sx={styles.dateBox}>
                <Box sx={{ fontWeight: "600" }}>End Date : </Box>
                <Box>{dateMonthFormat(selectedDate?.initialEndDate, "DD/MM/YYYY")}</Box>
              </Box>
            ) : null}
          </Grid>
        )}
      </Grid>
      {smMobile && actionsButtonsFlag && (
        <Grid xs={12} item>
          <Box sx={styles.allIconBox}>
            <Box>{filterEnabled && <FilterBox />}</Box>
            <Box sx={styles.dateBox}>
              {searchEnabled && <SearchBox />}
              {downloadEnabled && <DownloadBox />}
            </Box>
          </Box>
        </Grid>
      )}
    </>
  )
}

export default BillingHeader
