import React from "react"
import FirstPageIcon from "assets/images/icons/firstPageIcon.svg"
import LastPageIcon from "assets/images/icons/lastPageIcon.svg"
import PreviousPageIcon from "assets/images/icons/previousPageIcon.svg"
import NextPageIcon from "assets/images/icons/nextPageIcon.svg"
import ExpandMoreIcon from "assets/images/icons/expandMoreIcon.svg"
import IconWrapper from "../IconWrapper"
import useStyles from "./paginationStyles"
import { Box, Typography, MenuItem, Menu, Grid } from "@mui/material"

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalRecord,
  title
}) {
  const styles = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleItemsPerPageChange = (event) => {
    onItemsPerPageChange(parseInt(event.target.value))
  }

  const handleMenuItemClick = (value) => {
    const ans = parseInt(value)
    if (!isNaN(ans)) {
      onItemsPerPageChange(ans)
      handleClose()
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalRecord)

  return (
    <Grid
      container
      alignItems="center"
      gap={{ xs: 2, sm: 0 }}
      sx={{ marginBottom: { xs: "12.5rem", sm: "0rem" } }}>
      {/* 12.5rem to match the height of common footer */}
      {/* Left Side Part */}
      <Grid
        item
        xs={12}
        sm={4}
        container
        alignItems="center"
        gap={"3.2rem"}
        justifyContent={{ sm: "flex-start", xs: "center" }}>
        <Typography variant="p2">Records per page:</Typography>
        <Box sx={styles.dropdownBox}>
          <Typography variant="p1">{itemsPerPage}</Typography>
          <Box>
            <IconWrapper clickHandler={handleClick} imgSrc={ExpandMoreIcon} />
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              sx={styles.menuPaper}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              onChange={handleItemsPerPageChange}>
              <MenuItem value={10} onClick={() => handleMenuItemClick(10)}>
                <Typography variant="p1" color="text.main">
                  10
                </Typography>
              </MenuItem>
              <MenuItem value={20} onClick={() => handleMenuItemClick(20)}>
                <Typography variant="p1" color="text.main">
                  20
                </Typography>
              </MenuItem>
              <MenuItem value={50} onClick={() => handleMenuItemClick(50)}>
                <Typography variant="p1" color="text.main">
                  50
                </Typography>
              </MenuItem>
              <MenuItem value={100} onClick={() => handleMenuItemClick(100)}>
                <Typography variant="p1" color="text.main">
                  100
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Grid>
      {/* Right Side Part */}
      <Grid
        item
        xs={12}
        sm={8}
        container
        alignItems="center"
        justifyContent={{ sm: "flex-end", xs: "center" }}
        gap={"2.4rem"}>
        <Grid item xs={12} sm="auto" textAlign="center">
          <Typography variant="p1">
            Showing : &nbsp;
            <b>
              {startIndex} - {endIndex}{" "}
            </b>
            of {totalRecord} {title}
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto" container justifyContent="center" gap={"2.4rem"}>
          <IconWrapper
            clickHandler={() => onPageChange(1)}
            imgSrc={FirstPageIcon}
            disable={currentPage === 1 ? true : false}
          />
          <IconWrapper
            clickHandler={() => onPageChange(currentPage - 1)}
            imgSrc={PreviousPageIcon}
            disable={currentPage === 1 ? true : false}
          />
          <IconWrapper
            clickHandler={() => onPageChange(currentPage + 1)}
            imgSrc={NextPageIcon}
            disable={totalRecord === 0 || currentPage === totalPages}
          />
          <IconWrapper
            clickHandler={() => onPageChange(totalPages)}
            imgSrc={LastPageIcon}
            disable={totalRecord === 0 || currentPage === totalPages}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}
