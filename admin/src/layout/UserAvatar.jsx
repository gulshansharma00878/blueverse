// INFO : This component will mount on top righ of App Bar ( application top right corner) and will show user name initials and sign-out option.

import React from "react"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { styled } from "@mui/material/styles"
import { useStyles } from "./privateLayoutStyles"
import { Typography } from "@mui/material"
import LogoutIcon from "@mui/icons-material/Logout"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import PortraitIcon from "@mui/icons-material/Portrait"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"

const UserAvatar = ({
  username,
  handleClick,
  handleClose,
  handleLogout,
  open,
  anchor,
  profileImage
}) => {
  const styles = useStyles()
  const navigate = useNavigate()
  const user = userDetail()

  const StyledMenu = styled(Menu)(() => {
    return {
      "& .MuiMenu-paper": {
        boxShadow: "#00000047 0px 0px 8px 0px",
        borderRadius: "0rem",
        borderBottomRightRadius: "2rem",
        borderBottomLeftRadius: "2rem",
        width: "15rem",
        marginLeft: `calc(100% - 21rem)`
      },
      "& .MuiMenuItem-root": {
        minHeight: "0rem"
      }
    }
  })

  const navigateProfile = () => {
    navigate(`/${user?.role}/profile`)
  }
  const getNameInitials = (name) => {
    const nameArr = name.split(" ")
    const initials = nameArr.map((word) => word.charAt(0)).join("")
    return initials
  }
  return (
    <Box sx={{ marginRight: "2rem" }}>
      <Box sx={styles.avatarContainer} onClick={handleClick}>
        <Avatar sx={styles.avatar} src={profileImage}>
          {!profileImage && <Typography variant="h6">{getNameInitials(username)}</Typography>}
        </Avatar>
        <Typography variant="p1" color="black">
          {username?.split(" ")[0]}
        </Typography>
        {open ? (
          <ArrowDropUpIcon fontSize="large" color="primary" />
        ) : (
          <ArrowDropDownIcon fontSize="large" color="primary" />
        )}
      </Box>
      <StyledMenu
        id="basic-menu"
        autoFocus={false}
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button"
        }}>
        <MenuItem onClick={navigateProfile}>
          <Box sx={styles.menuItem}>
            <Typography variant="p1">Profile</Typography>
            <PortraitIcon color="primary" fontSize="large" />
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Box sx={styles.menuItem}>
            <Typography variant="p1">Logout</Typography>
            <LogoutIcon color="primary" fontSize="large" />
          </Box>
        </MenuItem>
      </StyledMenu>
    </Box>
  )
}

export default UserAvatar
