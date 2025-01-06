import React, { useState, useEffect } from "react"
import { Box, IconButton, Typography } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import styles from "./MachineDetailHeader.module.scss"
import { useNavigate } from "react-router-dom"
import DateFilter from "components/utitlities-components/DateFilter"
import { dateOptions } from "helpers/app-dates/dates"
import moment from "moment"
import DownloadIcon from "assets/images/icons/downloadIcon.svg"
import LinearProgressBar from "./LinearProgressBar"
import ErrorIcon from "@mui/icons-material/Error"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

function MachineDetailHeader({
  title,
  dealer,
  outlet,
  address,
  region,
  dateFilter = false,
  setStartDate,
  setEndDate,
  downloadEnabled = false,
  handleDownload = () => {},
  progressBarEnabled = false,
  progressBarValue
}) {
  const navigate = useNavigate()
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])

  useEffect(() => {
    if (dateFilter) {
      handleDateSelect(selectedDateOption)
    }
  }, [dateOptions])
  const handleBack = () => {
    navigate(-1)
  }

  const handleDateSelect = (option) => {
    setSelectedDateOption(option)
    if (option.label === "Select") {
      setStartDate("")
      setEndDate("")
    } else if (option.label === "Custom") {
      option.value?.startRangeDate && setStartDate(option.value?.startRangeDate)
      option.value?.endRangeDate && setEndDate(option.value?.endRangeDate)
    } else {
      const startDateformat = moment()
        .subtract(option.value - 1, "days")
        .format("YYYY-MM-DD")
      const endDateformat = moment().format("YYYY-MM-DD")
      if (option.value === 1) {
        setStartDate(startDateformat)
        setEndDate(startDateformat)
      } else {
        setStartDate(startDateformat)
        setEndDate(endDateformat)
      }
    }
  }

  return (
    <Box className={styles.machine_header_container}>
      <Box className={`${styles.back_header_box} ${dealer ? "" : styles.align_item}`}>
        <Box>
          <IconButton
            color="inherit"
            aria-label="back icon"
            onClick={handleBack}
            //   className="backIconBox"
            className={styles.backIconBox}>
            <ArrowBackIcon color="primary" fontSize="large" />
          </IconButton>
        </Box>

        <Box className={styles.title_box}>
          <Box className={styles.inner_title_box}>
            {" "}
            <Typography variant="h6">{title}</Typography>
            {progressBarEnabled && (
              <>
                {progressBarValue === 100 ? (
                  <CheckCircleIcon className={styles.success_icon} fontSize="large" />
                ) : (
                  <ErrorIcon className={styles.error_icon} fontSize="large" />
                )}
                <LinearProgressBar value={progressBarValue} max={100} />
              </>
            )}
          </Box>
          {dealer && (
            <>
              <Box className={styles.inner_title_box}>
                <Typography variant="p2">{dealer + ","}</Typography>
                <Typography variant="p2" color="text.gray">
                  {outlet}
                </Typography>
              </Box>
              <Box className={styles.inner_title_box}>
                <Typography variant="p2" color="text.gray">
                  {address + `${region ? "," : "."}`}
                </Typography>
                <Typography variant="p2" color="text.gray">
                  {region}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Box className={styles.filter_box}>
        {dateFilter && (
          <Box>
            <DateFilter
              dateOptions={dateOptions}
              selectedDateOption={selectedDateOption}
              handleDateSelect={handleDateSelect}
              style={{ width: "22rem" }}
              //   activeTab={activeTab}
            />
          </Box>
        )}
        {downloadEnabled && (
          <Box sx={{ ml: "3rem" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={styles.icon_box}
              onClick={() => handleDownload()}>
              <img src={DownloadIcon} style={{ width: "2.4rem", height: "2.4rem" }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MachineDetailHeader
