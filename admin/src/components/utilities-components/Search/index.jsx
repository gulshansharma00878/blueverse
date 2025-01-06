import React, { useState } from "react"
import { IconButton, Box, Popper, InputBase } from "@mui/material"
import SearchIcon from "../../../assets/images/icons/searchIcon.svg"
import CloseIcon from "@mui/icons-material/Close"
import { styled } from "@mui/material/styles"
import { useStyles } from "./SearchStyles.js"

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("md")]: {
    minWidth: "12rem"
  }
}))

const CloseIconWrapper = styled("span")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  color: "#A8A8A8",
  height: "100%",
  top: 0,
  right: "0.3rem",
  paddingLeft: "1.5rem",
  width: "1.8rem",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  height: "4rem",
  border: "0.1rem solid #E5E5E5",
  borderRadius: "0.4rem",
  color: "#383838",
  marginRight: "0.2rem",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "1.4rem",
    lineHeight: "1.8rem",
    color: "#3b3c3d",
    padding: theme.spacing(1, 5, 1, 4),
    paddingLeft: "0.5rem",
    paddingright: "1rem",
    transition: theme.transitions.create("width"),
    width: "8rem",
    [theme.breakpoints.up("md")]: {
      width: "13rem"
    }
  }
}))

function SearchBar({ setQuery, searchQuery, setCurrentPage, whiteBgEnabled = false }) {
  const styles = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const [closeToggle, setCloseToggle] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSearch = (e) => {
    setQuery(e.target.value)
    if (setCurrentPage) {
      setCurrentPage(1)
    }
    if (e.target.value.length > 0) {
      setCloseToggle(true)
    } else {
      setQuery("")
      setCloseToggle(false)
    }
  }
  function handleClear() {
    setQuery("")
    setCloseToggle(false)
  }

  const handleClick = (event) => {
    if (anchorEl) {
      setAnchorEl(null)
      setOpen(false)
      setQuery("")
    } else {
      setQuery("")
      setCloseToggle(false)
      setAnchorEl(event.currentTarget)
      setOpen(true)
    }
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label="open drawer"
        edge="start"
        sx={[whiteBgEnabled ? styles?.whiteBg : styles?.secondaryBg, styles?.borderRadius]}>
        <img src={SearchIcon} style={styles.icon} />
      </IconButton>
      <Box>
        <Popper open={open} anchorEl={anchorEl} placement={"left"}>
          <Box
            sx={{
              flexGrow: 1,
              display: "inline",
              border: " border: 1px solid #E5E5E5",
              borderRadius: "0.4rem"
            }}>
            <Search onChange={(e) => handleSearch(e)}>
              <StyledInputBase
                sx={[whiteBgEnabled && styles?.whiteBg, styles.searchBox]}
                spellCheck="false"
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                autoFocus
              />
              {closeToggle ? (
                <CloseIconWrapper>
                  <IconButton onClick={handleClear}>
                    <CloseIcon size="small" sx={{ height: "1.5rem", width: "1.5rem" }} />
                  </IconButton>
                </CloseIconWrapper>
              ) : null}
            </Search>
          </Box>
        </Popper>
      </Box>
    </>
  )
}

export default SearchBar
