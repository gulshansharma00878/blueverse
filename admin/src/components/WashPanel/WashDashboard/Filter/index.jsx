import React from "react"
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined"
import {
  Box,
  Popover,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Divider,
  Typography
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import "./Filter.scss"
import { capitaliseString } from "helpers/Functions/formateString"
function Filter({
  filterOptions,
  handleSelectAll,
  handleSelectOption,
  handleSelectAllStatus = () => {},
  selectedProfileOptions,
  selectedOptions,
  abandoned = false,
  profileStatus = false,
  profileOptions,
  handleProfileSelect = () => {}
}) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <Box>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        className={abandoned ? "filtericonBox2" : "filtericonBox"}
        onClick={handleClick}>
        <FilterAltOutlinedIcon
          color="primary"
          fontSize="large"
          sx={{ height: "2.4rem", width: "2.4rem" }}
        />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        sx={{ top: "0.5rem" }}>
        <Box className="filter_container">
          <Box className="menu_container">
            <MenuItem disableRipple disableTouchRipple className={"select_item"}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedOptions.length === filterOptions.length}
                    onChange={handleSelectAll}
                    className="checkbox"
                  />
                }
                label={
                  <Typography variant="p1" sx={{ marginLeft: "10px" }}>
                    All Wash Type
                  </Typography>
                }
                className={"filter_popup_checkbox"}
              />
            </MenuItem>
            <Divider sx={{ color: "#C9D8EF" }} />
            <Box className="menu_item_container">
              {filterOptions.map((option) => (
                <MenuItem
                  disableRipple
                  disableTouchRipple
                  key={option.value}
                  className={"select_item_second"}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOptions.includes(option.value)}
                        onChange={handleSelectOption}
                        value={option.value}
                        className="checkbox"
                      />
                    }
                    label={
                      <Typography variant="p1" sx={{ marginLeft: "10px" }}>
                        {capitaliseString(option.label)}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))}
            </Box>
          </Box>
          {profileStatus && (
            <Box className="menu_container">
              <Divider sx={{ color: "#C9D8EF" }} />
              <MenuItem disableRipple disableTouchRipple className={"select_item"}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedProfileOptions.length === profileOptions.length}
                      onChange={handleSelectAllStatus}
                      className="checkbox"
                    />
                  }
                  label={
                    <Typography variant="p1" sx={{ marginLeft: "10px" }}>
                      All Status
                    </Typography>
                  }
                  className={"filter_popup_checkbox"}
                />
              </MenuItem>
              <Divider sx={{ color: "#C9D8EF" }} />
              <Box className="menu_item_container">
                {profileOptions.map((option, i) => (
                  <MenuItem
                    disableRipple
                    disableTouchRipple
                    key={i}
                    className={"select_item_second"}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedProfileOptions.includes(option.value)}
                          onChange={handleProfileSelect}
                          value={option.value}
                          className="checkbox"
                        />
                      }
                      label={
                        <Typography variant="p1" sx={{ marginLeft: "10px" }}>
                          {option.label}
                        </Typography>
                      }
                    />
                  </MenuItem>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  )
}

export default Filter
