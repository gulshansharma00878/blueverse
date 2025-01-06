import { Badge, Grid, IconButton, Typography, useMediaQuery } from "@mui/material"
import Box from "@mui/material/Box"
import React from "react"
import { useStyles } from "./CommonHeaderStyles.js"
import BackBtn from "assets/images/icons/backIcon.svg"
import { useNavigate } from "react-router-dom"
import SearchBar from "../Search/index.jsx"
import DownloadIcon from "../../../assets/images/icons/downloadIcon.svg"
import FilterIcon from "../../../assets/images/icons/filterIcon.svg"
import MultiSelect from "../Mulit-Select/MultiSelect.jsx"
import { dateMonthFormat } from "helpers/app-dates/dates.js"
import DateSelect from "../DatePicker/DatePicker.jsx"
import { useTheme } from "@mui/material"

function CommonHeader(props) {
  const styles = useStyles()
  const navigate = useNavigate()
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const {
    heading,
    handleDownload = () => {},
    backBtn = false,
    showCard = false, // Use this when to display a card-like box into this header-comp
    CardComponent, // If showCard=true, then pass complete component in this prop
    headerStyle = {},
    showDropDown1 = false,
    showDropDown2 = false,
    badgeData,
    searchEnabled = false,
    searchQuery,
    setQuery,
    filterEnabled = false,
    handleDrawer,
    backBtnHandler = null,
    downloadEnabled = false,
    headingStyle = { variant: "", color: "" },
    setCurrentPage = () => {},
    headerDate = null,
    startDateLabel = null,
    startDatevalue,
    startDateHandle,
    endDateLabel = null,
    endDatevalue,
    endDateHandle,
    maxStartDate = null,
    maxEndDate = null,
    minEndDate = null,
    minStartDate = null,
    selectedDate = null,
    isFilterUsed,
    isMobile = false
    // noPlusBtn
    // width = "229"
  } = props

  const goBack = () => {
    backBtnHandler !== null ? backBtnHandler() : navigate(-1)
  }

  let dropdownFlag = showDropDown1 || showDropDown2
  let dateFiltersFlag = startDateLabel || endDateLabel
  let actionsButtonsFlag = searchEnabled || filterEnabled || downloadEnabled

  const DropDownBoxes = () => {
    return (
      <Grid container sx={styles.dropDownBox}>
        {showDropDown1 && (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <MultiSelect
              style={{ width: "100%" }}
              items={showDropDown1?.data}
              searchEnabled
              searchPlaceholder="Search"
              onSelect={(values) => {
                showDropDown1?.handleDropDown(values)
              }}
              selectedItems={showDropDown1?.value}
              selectAll
              label={
                showDropDown1?.placeholder ? showDropDown1.placeholder : "Select Service Center"
              }
              placeholder={
                showDropDown1?.placeholder ? showDropDown1.placeholder : "Select Service Center"
              }
            />
          </Grid>
        )}
        {showDropDown2 && (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <MultiSelect
              style={{ width: "100%" }}
              items={showDropDown2?.data}
              searchEnabled
              searchPlaceholder="Search"
              onSelect={(values) => {
                showDropDown2?.handleDropDown(values)
              }}
              selectedItems={showDropDown2?.value}
              selectAll
              label={showDropDown2?.placeholder ? showDropDown2.placeholder : "Select Machine"}
              placeholder={
                showDropDown2?.placeholder ? showDropDown2.placeholder : "Select Machine"
              }
            />
          </Grid>
        )}
      </Grid>
    )
  }

  const DateFilterBoxes = () => {
    return (
      <Grid container sx={styles.dropDownBox}>
        {startDateLabel ? (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <DateSelect
              label={startDateLabel}
              value={startDatevalue}
              onChange={startDateHandle}
              maxDate={maxStartDate}
              minDate={minStartDate}
              style={styles.dateSelect}
            />
          </Grid>
        ) : null}
        {endDateLabel ? (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <DateSelect
              label={endDateLabel}
              value={endDatevalue}
              onChange={endDateHandle}
              maxDate={maxEndDate}
              minDate={minEndDate}
              style={styles.dateSelect}
            />
          </Grid>
        ) : null}
      </Grid>
    )
  }

  const FilterBox = () => {
    return (
      <Badge color="primary" variant="dot" invisible={!isFilterUsed}>
        <IconButton
          onClick={handleDrawer}
          color="inherit"
          aria-label="open drawer"
          edge="start"
          // className="filtericonBox"
          sx={[
            styles?.iconBox,
            {
              backgroundColor: isMobile
                ? theme.palette.secondary?.main
                : theme.palette.background.default,
              marginLeft: isMobile ? "0rem" : "2rem"
            }
          ]}>
          <img src={FilterIcon} style={styles.icon} />
        </IconButton>
      </Badge>
    )
  }
  const DownloadBox = () => {
    return (
      <Box sx={styles?.borderLeft}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={[
            styles?.iconBox,
            styles?.marginLeft,
            {
              backgroundColor: isMobile
                ? theme.palette.secondary?.main
                : theme.palette.background.default
            }
          ]}
          onClick={() => handleDownload()}>
          <img src={DownloadIcon} style={styles.icon} />
        </IconButton>
      </Box>
    )
  }

  return (
    <>
      <Grid
        justifyContent="space-between"
        sx={[backBtn ? styles.boxHeightBack : styles.boxHeightNormal, headerStyle]}
        container>
        {/* Section : I */}
        <Grid xs={"auto"} md={3} item container>
          {backBtn ? (
            <Grid item sx={styles.backBtn}>
              <img
                onClick={goBack}
                style={{ height: "4.4rem", width: "4.4rem", cursor: "pointer" }}
                src={BackBtn}
                alt="back logo"
              />
            </Grid>
          ) : null}
          {showCard ? CardComponent : null}
          <Grid sx={styles.innerHeading} item>
            <Typography
              variant={headingStyle.variant ? headingStyle.variant : "h6"}
              color={headingStyle.color ? headingStyle.color : "text.main"}>
              {heading}
            </Typography>
            {badgeData ? (
              <Box sx={styles.badge}>
                <Typography variant="p2" color="white">
                  {badgeData}
                </Typography>
              </Box>
            ) : null}
          </Grid>
        </Grid>
        {/* Section : II */}
        <Grid
          container
          justifyContent={
            (dropdownFlag && actionsButtonsFlag) || (dateFiltersFlag && !isTablet)
              ? "space-between"
              : "flex-end"
          }
          md={9}
          xs={"auto"}
          item>
          {!isTablet && (showDropDown1 || showDropDown2) ? <DropDownBoxes /> : null}
          {!isTablet && (startDateLabel || endDateLabel) ? <DateFilterBoxes /> : null}
          {!isMobile && (
            <Grid sx={styles.buttonBox} item>
              {searchEnabled && (
                <SearchBar
                  setQuery={setQuery}
                  searchQuery={searchQuery}
                  setCurrentPage={setCurrentPage}
                  whiteBgEnabled={isMobile ? false : true}
                />
              )}
              {filterEnabled && <FilterBox />}
              {downloadEnabled && <DownloadBox />}
            </Grid>
          )}
        </Grid>

        {headerDate && (
          <Grid item xs={12}>
            <Typography sx={styles?.time}>
              {" "}
              Last Updated On:&nbsp;{dateMonthFormat(headerDate, "DD/MM/YYYY hh:mm A")}{" "}
            </Typography>
          </Grid>
        )}

        {selectedDate && (
          <Grid item xs={12} sx={styles.dateBox} marginTop={"0.5rem"}>
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
            {/* <Typography sx={styles?.time}>
              Start Date:&nbsp;{dateMonthFormat(selectedDate?.initialStartDate, "DD/MM/YYYY")}&nbsp;
              End Date:&nbsp;{dateMonthFormat(selectedDate?.initialEndDate, "DD/MM/YYYY")}
            </Typography> */}
          </Grid>
        )}
      </Grid>
      {isMobile && actionsButtonsFlag && (
        <Grid xs={12} item>
          <Box sx={styles.allIconBox}>
            <Box>{filterEnabled && <FilterBox />}</Box>
            <Box sx={styles.dateBox}>
              {searchEnabled && (
                <SearchBar
                  setQuery={setQuery}
                  searchQuery={searchQuery}
                  setCurrentPage={setCurrentPage}
                  whiteBgEnabled={isMobile ? false : true}
                />
              )}
              {downloadEnabled && <DownloadBox />}
            </Box>
          </Box>
        </Grid>
      )}
      {isTablet && (showDropDown1 || showDropDown2) ? <DropDownBoxes /> : null}
      {isTablet && (startDateLabel || endDateLabel) ? <DateFilterBoxes /> : null}
    </>
  )
}

export default CommonHeader
