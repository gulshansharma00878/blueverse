import React from "react"
import { Typography, MenuItem, FormControlLabel, Checkbox } from "@mui/material"
import styles from "./selector.module.scss"

const Selector = (props) => {
  const { items, select, selected } = props

  return (
    <>
      {items?.map((item, i) => {
        return (
          <MenuItem disableRipple disableTouchRipple key={i} className={"select_item_second"}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected?.has(item.value)}
                  onChange={select.bind(null, item?.value)}
                  value={item.value}
                  className={styles["checkbox"]}
                  size="large"
                  disableRipple
                  sx={{
                    "& .MuiSvgIcon-root": {
                      width: "2.4rem",
                      height: "2.4rem",
                      color: selected?.has(item.value) ? "primary" : "background.grey5"
                    }
                  }}
                />
              }
              label={
                <Typography variant="p1" color="text.main" sx={{ marginLeft: "1.6rem" }}>
                  {item.label}
                </Typography>
              }
            />
          </MenuItem>
        )
      })}
    </>
  )
}

export default Selector
