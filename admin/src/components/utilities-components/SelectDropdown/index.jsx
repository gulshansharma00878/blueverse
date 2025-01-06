import React from "react"
import { useField } from "formik"
import { Box, Select, MenuItem } from "@mui/material"
import { NewIcon } from "../DropDown/DropDown"

const SelectDropdown = (props) => {
  const { name, options, placeholder } = props
  const [field] = useField(name)

  const handleChange = (event) => {
    const { value } = event.target
    field.onChange(event)
    props.onChange && props.onChange(value) // Pass the value to the parent component if onChange is provided
  }

  return (
    <>
      <Select
        id={name}
        name={name}
        fullWidth
        type="text"
        value={field.value}
        onChange={handleChange}
        displayEmpty
        IconComponent={NewIcon}
        inputProps={{ "aria-label": "Without label" }}
        sx={{ padding: 1 }}>
        <MenuItem value="" disabled>
          <Box sx={{ fontSize: "1.6rem" }}>{placeholder}</Box>
        </MenuItem>
        {options &&
          options.map((item, index) => (
            <MenuItem key={index} value={item.value}>
              <span style={{ fontSize: "1.6rem" }}>{item.label}</span>
            </MenuItem>
          ))}
      </Select>
    </>
  )
}

export default SelectDropdown
