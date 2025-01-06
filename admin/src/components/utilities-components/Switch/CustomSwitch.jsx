import * as React from "react"
import FormGroup from "@mui/material/FormGroup"
// import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import { styled } from "@mui/material/styles"
import { Typography } from "@mui/material"
import Grid from "@mui/material/Grid"

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: "4.6rem",
  height: "2.4rem",
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: "1.5rem"
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(5px)"
    }
  },
  "& .MuiSwitch-switchBase": {
    padding: "0rem",
    margin: "0.3rem",
    "&.Mui-checked": {
      transform: "translateX(2.2rem)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        width: "4.6rem !important"
      }
    }
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: "1.8rem",
    height: "1.8rem",
    borderRadius: 10,
    transition: theme.transitions.create(["width"], {
      duration: 200
    })
  },
  "& .MuiSwitch-track": {
    borderRadius: 12,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box"
  }
}))

const CustomSwitch = ({ value, handleChange, label, name = "switch" }) => {
  return (
    <FormGroup>
      <Grid container gap="1rem" flexWrap="nowrap" marginTop="1rem" alignItems="center">
        <AntSwitch checked={value} onChange={handleChange} name={name} id="custom_switch" />
        <Typography
          variant="s1"
          color="text.main"
          component="label"
          htmlFor="custom_switch"
          sx={{ cursor: "pointer" }}>
          {label}
        </Typography>
      </Grid>
    </FormGroup>
  )
}
export default CustomSwitch
