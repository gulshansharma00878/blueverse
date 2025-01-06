import React, { useState, useEffect } from "react"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import { Checkbox, Divider, InputAdornment, Typography, Box } from "@mui/material"
import InputField from "../InputField/InputField"
import { NewIcon } from "../DropDown/DropDown"
import ErrorText from "../InputField/ErrorText"
import OutlinedInputField from "../InputField/OutlinedInput"
import useStyles from "../DropDown/dropDownStyles"
import useMultiSelectStyles from "./mutiSeletStyles"
import IconWrapper from "../IconWrapper"
import SearchIcon from "../../../assets/images/icons/searchIcon.svg"

export default function MultipleSelect(props) {
  const {
    id,
    label,
    items,
    searchEnabled,
    searchPlaceholder,
    selectedItems,
    onSelect,
    style,
    disabled,
    selectAll,
    onBlur,
    helperText,
    showError
    // className
  } = props
  const [query, setQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState([])
  const dropDownStyles = useStyles()
  const multiSelectStyles = useMultiSelectStyles()

  useEffect(() => {
    setFilteredItems(items ? items : [])
  }, [items])
  useEffect(() => {
    items &&
      setFilteredItems(
        items.filter((item) => item.label?.toLowerCase().includes(query?.toLowerCase()))
      )
  }, [query])
  const onToggle = (value) => {
    let newSelectedItems = []
    if (selectedItems.some((item) => item.value === value)) {
      // remove case
      newSelectedItems = selectedItems.filter((item) => item.value !== value)
    } else {
      //add case
      newSelectedItems = [...selectedItems].concat(items.filter((item) => item.value === value))
    }
    if (onSelect) {
      onSelect(newSelectedItems)
    }
  }
  const handleToggleAll = () => {
    if (onSelect) {
      //Select all items
      onSelect(items)
    }
    if (selectedItems.length === items.length) {
      //Unselect all items
      onSelect([])
    }
  }
  const handleGetCheckBox = (isOn, value, valueText) => {
    return (
      <Box sx={multiSelectStyles.menuItem}>
        {value !== "noData" ? (
          <Box sx={multiSelectStyles.checkboxContainer}>
            <Checkbox checked={isOn} size="large" />
          </Box>
        ) : null}
        <span>{valueText}</span>
      </Box>
    )
  }

  return (
    <FormControl
      style={style}
      variant="filled"
      disabled={disabled}
      error={showError}
      helperText={helperText}>
      <InputLabel id={id} sx={dropDownStyles.label}>
        {label}
      </InputLabel>
      <Select
        onBlur={onBlur}
        helperText={helperText}
        labelId={id}
        multiple
        value={selectedItems}
        sx={dropDownStyles.select}
        IconComponent={NewIcon}
        input={<OutlinedInputField />}
        renderValue={(selected) => {
          if (selected.length > 0) {
            if (selected.length === 1) {
              return <span style={{ fontSize: "1.6rem" }}>{selected[0]?.label}</span>
            } else {
              return (
                <span style={{ fontSize: "1.6rem" }}>
                  {filteredItems?.length == selected?.length ? "All" : selected[0]?.label}
                  <span>
                    {filteredItems?.length == selected?.length
                      ? ""
                      : ` ( + ${selected?.length - 1} )`}
                  </span>
                </span>
              )
            }
          }
        }}
        MenuProps={{
          PaperProps: { style: multiSelectStyles.menuContainer }
        }}>
        {!items ? (
          <MenuItem>
            <Typography variant="p1" sx={{ color: "text.gray" }}>
              No Data
            </Typography>
          </MenuItem>
        ) : (
          <>
            {searchEnabled && items?.length !== 0 && (
              <div>
                <InputField
                  value={query}
                  variant="filled"
                  placeholder={searchPlaceholder}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                  fullWidth
                  sx={{
                    [`& .MuiFilledInput-input`]: { paddingTop: "0px", paddingBottom: "0px" },
                    ["& .MuiFilledInput-root.Mui-focused"]: { border: "0px !important" },
                    ["& .MuiFilledInput-root:hover"]: { border: "0px !important" },
                    ["& .MuiFilledInput-root"]: {
                      borderRadius: "0px !important",
                      border: "0px !important",
                      borderBottom: "1px solid gray",
                      paddingLeft: "0.6rem"
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end" sx={{ marginRight: "1rem" }}>
                        <IconWrapper imgSrc={SearchIcon} />
                      </InputAdornment>
                    ),
                    disableUnderline: true
                  }}
                />
                <Divider />
                {query !== "" && (
                  <div
                    onClick={() => {
                      setQuery("")
                    }}
                    className="cursor-pointer"></div>
                )}
              </div>
            )}
            {filteredItems && filteredItems?.length > 0 && selectAll ? (
              <>
                <MenuItem
                  key="selectAll"
                  value="selectAll"
                  className="row-center cursor-pointer"
                  style={{
                    padding: 10,
                    zIndex: 100,
                    backgroundColor: "#fff",
                    fontSize: "1.6rem"
                  }}
                  onClick={handleToggleAll}>
                  {!items ? (
                    <Typography variant="c1" style={{ marginTop: -4 }}>
                      No Data
                    </Typography>
                  ) : (
                    handleGetCheckBox(
                      items?.length !== 0 && selectedItems?.length === items?.length,
                      items?.length === 0 ? "noData" : "selectAll",
                      items?.length === 0 ? "No Data" : "Select All"
                    )
                  )}
                </MenuItem>
                <Divider />
              </>
            ) : (
              filteredItems &&
              filteredItems?.length === 0 && (
                <MenuItem
                  style={{
                    padding: 10,
                    zIndex: 100,
                    backgroundColor: "#fff",
                    fontSize: "1.6rem"
                  }}>
                  <Typography variant="p1" sx={{ color: "text.gray" }}>
                    No Data
                  </Typography>
                </MenuItem>
              )
            )}

            {filteredItems &&
              filteredItems.map((item) => (
                <MenuItem
                  id="items"
                  key={item.value}
                  className="row-center cursor-pointer"
                  onClick={() => onToggle(item.value)}
                  style={{
                    padding: 10,
                    backgroundColor: "#fff",
                    fontSize: "1.6rem"
                  }}>
                  {handleGetCheckBox(
                    selectedItems.map((item) => item?.value).includes(item?.value),
                    "",
                    item.label
                  )}
                </MenuItem>
              ))}
          </>
        )}
      </Select>
      {helperText && showError && <ErrorText text={helperText} />}
    </FormControl>
  )
}
