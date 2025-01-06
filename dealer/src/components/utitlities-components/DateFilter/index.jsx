import React, { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import MenuItemStyled from "../DropDown/MenuItemStyled"
import OutlinedInputField from "../InputField/OutlinedInput"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import DateSelect from "../DatePicker/DatePicker"
import InputLabel from "@mui/material/InputLabel"
import useStyles from "../DropDown/dropDownStyles"
import { NewIcon } from "../DropDown/DropDown"
import ErrorText from "../InputField/ErrorText"
import moment from "moment"

const DateFilter = (props) => {
  const {
    dateOptions,
    handleDateSelect,
    selectedDateOption,
    style,
    showError = "",
    helperText = "",
    disabled
  } = props
  const dropDownStyles = useStyles()
  const [startRangeDate, setStartRangeDate] = useState(null)
  const [endRangeDate, setEndRangeDate] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setStartRangeDate(null)
    setEndRangeDate(null)
  }, [])

  const getActualDateRange = (option) => {
    if (option.label === "Select") {
      return ""
    } else if (option.label === "Custom") {
      const startDate = moment(startRangeDate?.toString()).format("ll")
      const endDate = moment(endRangeDate?.toString()).format("ll")
      return `${startDate} - ${endDate}`
    } else {
      const startDate = moment()
        .subtract(option.value - 1, "days")
        .format("MMM DD, YY")
      const endDate = moment().format("MMM DD, YY")
      if (option.value === 1) {
        return `${startDate}`
      } else {
        return `${startDate} - ${endDate}`
      }
    }
  }

  const handleChange = (key, value) => {
    let option = {
      label: "Custom",
      value: {
        startRangeDate: "",
        endRangeDate: ""
      }
    }
    if (key === "start") {
      option.value.startRangeDate = moment(value.toString()).format("YYYY-MM-DD")
      setStartRangeDate(value)
    } else {
      option.value.endRangeDate = moment(value.toString()).format("YYYY-MM-DD")
      setEndRangeDate(value)
      setOpen(false)
    }
    handleDateSelect(option)
  }

  const clickHandler = (option) => {
    handleDateSelect(option)
    setOpen(false)
    setStartRangeDate(null)
    setEndRangeDate(null)
  }

  const menuCloseHandler = (e) => {
    const temp = e.target?.getAttribute("class")
    // This setup is done to prevent menu close when user clicks on date-select input field
    // Because select MUI fires onClick/onClose on each click in the menu and on clicking its backdrop as well.
    if (temp?.search("MuiBackdrop") !== -1) {
      // console.log("fired backdrop")
      setOpen(false)
    }
  }

  return (
    <Box sx={[dropDownStyles.dropDown]}>
      <FormControl
        fullWidth
        style={style}
        variant="filled"
        disabled={disabled}
        error={showError}
        helperText={helperText}>
        <InputLabel id="demo-simple-select-label" sx={dropDownStyles.label}>
          {getActualDateRange(selectedDateOption)}
        </InputLabel>
        <Select
          onOpen={() => {
            setOpen(true)
          }}
          onClose={menuCloseHandler}
          error={showError}
          sx={dropDownStyles.select}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          open={open}
          input={<OutlinedInputField />}
          value={selectedDateOption.value}
          renderValue={() => {
            return <div>{selectedDateOption.label}</div> // This is required to render label 'Custom' when its selected otherwise MUI select displays complete 'date-select' boxes from its menu options.
          }}
          IconComponent={NewIcon}
          MenuProps={{ classes: { paper: `menuPaper` } }}>
          {dateOptions?.map((item, index) =>
            item?.label === "Custom" ? (
              <MenuItemStyled
                value={item.value}
                key={index.toString()}
                disableRipple
                sx={{ "&.MuiMenuItem-root:hover": { backgroundColor: "inherit" } }}>
                <Grid container gap={1}>
                  <DateSelect
                    label="Start Date"
                    value={startRangeDate}
                    onChange={(value) => handleChange("start", value)}
                    maxDate={endRangeDate}
                    futureDisable={true}
                  />
                  <DateSelect
                    label="End Date"
                    value={endRangeDate}
                    onChange={(value) => handleChange("end", value)}
                    minDate={startRangeDate}
                    futureDisable={true}
                  />
                </Grid>
              </MenuItemStyled>
            ) : (
              <MenuItemStyled
                value={item.value}
                key={index.toString()}
                onClick={() => clickHandler(item)}>
                {item?.label}
              </MenuItemStyled>
            )
          )}
          {dateOptions?.length === 0 && (
            <MenuItemStyled disabled>No options available</MenuItemStyled>
          )}
        </Select>
        {helperText && showError && <ErrorText text={helperText} />}
      </FormControl>
    </Box>
  )
}

export default DateFilter
