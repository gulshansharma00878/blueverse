import { Badge, Grid, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material"
import Box from "@mui/material/Box"
import React from "react"
import { useStyles } from "./CommonHeaderStyles.js"
import BackButtonIcon from "assets/images/icons/backButtonIcon.svg"
import AddIcon from "assets/images/icons/addIcon.svg"
import { useNavigate } from "react-router-dom"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import SearchBar from "../Search/index.jsx"
import DownloadIcon from "../../../assets/images/icons/downloadIcon.svg"
import FilterIcon from "../../../assets/images/icons/filterIcon.svg"
import SecondaryButton from "../SecondaryButton/SecondaryButton.jsx"
import { dateMonthFormat } from "helpers/app-dates/dates.js"
import CommonFooter from "../CommonFooter/index.jsx"
import IconWrapper from "../IconWrapper/index.jsx"
import MultipleSelect from "../Mulit-Select/MultiSelect.jsx"
import DateSelect from "../DatePicker/DatePicker.jsx"
function CommonHeader(props) {
  const styles = useStyles()
  const navigate = useNavigate()
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const {
    heading,
    btnTxt,
    noPlusBtn,
    headerStyle = {},
    handleClick = () => {},
    backBtn = false,
    badgeData,
    searchEnabled = false,
    searchQuery,
    setQuery,
    filterEnabled = false,
    handleDrawer,
    backBtnHandler = null,
    buttonStyle = null,
    downloadEnabled = false,
    handleDownload = () => {},
    isButtonVisible = true,
    twoBtn,
    width = "229",
    innerTableHeader = false,
    setCurrentPage = () => {},
    headerDate = null,
    selectedDate = null,
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
    isMobile = false,
    btnDissable = false,
    showDropDown1 = false,
    showDropDown2 = false,
    showCard = false,
    CardComponent,
    isFilterUsed
  } = props
  const goBack = () => {
    backBtnHandler !== null ? backBtnHandler() : navigate(-1)
  }

  let dropdownFlag = showDropDown1 || showDropDown2
  let dateFiltersFlag = startDateLabel || endDateLabel
  let actionsButtonsFlag = searchEnabled || filterEnabled || downloadEnabled
  const PrimaryActionButton = () => {
    return (
      <PrimaryButton
        width={isMobile ? "100%" : width}
        disabled={btnDissable}
        onClick={handleClick}
        style={buttonStyle}>
        <Box sx={styles.imgTag}>
          {!noPlusBtn && <img src={AddIcon} alt="button logo" style={styles.buttonImg} />}
          <div>{btnTxt}</div>
        </Box>
      </PrimaryButton>
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

  const DropDownBoxes = () => {
    return (
      <Grid container item xs="auto" sx={styles.dropDownBox}>
        {showDropDown1 && (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <MultipleSelect
              style={{ width: "100%", backgroundColor: "#FFF" }}
              items={showDropDown1?.data}
              onSelect={(values) => {
                showDropDown1?.handleDropDown(values)
              }}
              selectedItems={showDropDown1?.value}
              selectAll
              label={showDropDown1?.label}
            />
          </Grid>
        )}
        {showDropDown2 && (
          <Grid item sx={{ width: { xs: "47.5%", md: "22.4rem" } }}>
            <MultipleSelect
              style={{ width: "100%", backgroundColor: "#FFF" }}
              items={showDropDown2?.data}
              onSelect={(values) => {
                showDropDown2?.handleDropDown(values)
              }}
              selectedItems={showDropDown2?.value}
              selectAll
              label={showDropDown2?.label}
            />
          </Grid>
        )}
      </Grid>
    )
  }

  const DualButtons = () => {
    return (
      <Box sx={styles.dualButtons}>
        <SecondaryButton
          onClick={() => twoBtn[0]?.handleClick()}
          disabled={twoBtn[0]?.btnDissable}
          style={styles.editButton}>
          {twoBtn[0]?.heading}
        </SecondaryButton>
        <PrimaryButton
          onClick={() => twoBtn[1]?.handleClick()}
          disabled={twoBtn[1]?.btnDissable}
          style={styles.deleteButton}>
          {twoBtn[1]?.heading}
        </PrimaryButton>
      </Box>
    )
  }

  // const SearchBox = () => {
  //   return (
  //     <SearchBar
  //       setQuery={setQuery}
  //       searchQuery={searchQuery}
  //       setCurrentPage={setCurrentPage}
  //       whiteBgEnabled = {isMobile ? false : true}
  //     />
  //   )
  // }
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
        sx={[
          backBtn
            ? styles.boxHeightBack
            : innerTableHeader
            ? styles.boxHeightBack
            : styles.boxHeightNormal,
          headerStyle
        ]}
        container>
        {/* Section : I */}
        <Grid xs="auto" md={"auto"} item container alignItems="center">
          {backBtn ? (
            <IconWrapper
              imgSrc={BackButtonIcon}
              clickHandler={goBack}
              wrapperStyle={{ marginRight: "2.4rem" }}
            />
          ) : null}
          {showCard ? CardComponent : null}
          <Box sx={styles.innerHeading}>
            <Typography variant="h6">{heading}</Typography>
            {badgeData ? (
              <Box sx={styles.badge}>
                <Typography variant="p2" color="white">
                  {badgeData}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Grid>
        {/* Section : II */}
        <Grid
          container
          justifyContent={
            (dropdownFlag && actionsButtonsFlag) || (dateFiltersFlag && !isTablet)
              ? "space-between"
              : "flex-end"
          }
          md={(dropdownFlag && actionsButtonsFlag) || (dateFiltersFlag && !isTablet) ? 8 : "auto"}
          xs={"auto"}
          item>
          {!isTablet && (showDropDown1 || showDropDown2) ? <DropDownBoxes /> : null}
          {!isTablet && (startDateLabel || endDateLabel) ? <DateFilterBoxes /> : null}
          {isButtonVisible && btnTxt && !isMobile ? <PrimaryActionButton /> : null}
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
          {twoBtn?.length && !isMobile ? <DualButtons /> : null}
        </Grid>
        {headerDate && (
          <Grid item xs={12}>
            Last Updated On:&nbsp;{dateMonthFormat(headerDate, "DD/MM/YYYY hh:mm A")}
          </Grid>
        )}
        {selectedDate && (
          <Grid item xs={12} sx={styles.dateBox}>
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

        {isMobile && isButtonVisible && btnTxt ? (
          <CommonFooter>
            <PrimaryActionButton />
          </CommonFooter>
        ) : null}
        {isMobile && twoBtn?.length ? (
          <CommonFooter>
            <DualButtons />
          </CommonFooter>
        ) : null}
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
