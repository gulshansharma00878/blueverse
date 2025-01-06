import { Popover, Typography, Box, Stack, Divider } from "@mui/material"
import React from "react"
import EditIcon from "assets/images/icons/edit.svg"
import DeactivateIcon from "assets/images/icons/deactivateIcon.svg"
import ActivateIcon from "assets/images/icons/activateIcon.svg"
import DeleteIcon from "assets/images/icons/deleteIcon.svg"
import MoreIcon from "assets/images/icons/moreVerticalIcon.svg"
import IconWrapper from "../IconWrapper"
import { useStyles } from "./KebabMenuStyles"

function KebabMenu({
  list,
  editItem = () => {},
  deleteItem = () => {},
  deactivateItem = () => {},
  hideEdit,
  hideActivate,
  hideDelete
}) {
  const styles = useStyles()

  const handlePopUpClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [anchorEl, setAnchorEl] = React.useState(null)

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <Box style={{ cursor: "pointer" }}>
      {/* <img src={MoreIcon} onClick={handlePopUpClick} height="32px" width="32px" /> */}
      <IconWrapper imgSrc={MoreIcon} clickHandler={handlePopUpClick} />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        sx={styles.popover}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}>
        <Stack divider={<Divider />} sx={styles.outerBox}>
          {!hideEdit && (
            <Box
              onClick={() => {
                editItem(list)
              }}
              sx={styles.popBox}>
              <IconWrapper imgSrc={EditIcon} />
              <Typography sx={{ color: "text.main" }} variant="p2">
                Edit
              </Typography>
            </Box>
          )}
          {!hideActivate && (
            <Box
              onClick={() => {
                deactivateItem(list)
                handleClose()
              }}
              sx={styles.popBox}>
              {!list?.isActive ? (
                <IconWrapper imgSrc={ActivateIcon} />
              ) : (
                <IconWrapper imgSrc={DeactivateIcon} />
              )}
              <Typography sx={{ color: "text.main" }} variant="p2">
                {list?.isActive ? "Deactivate" : "Activate"}
              </Typography>
            </Box>
          )}
          {!hideDelete && (
            <Box
              onClick={() => {
                deleteItem(list)
                handleClose()
              }}
              sx={styles.popBox}>
              <IconWrapper imgSrc={DeleteIcon} />
              <Typography sx={{ color: "text.main" }} variant="p2">
                Delete
              </Typography>
            </Box>
          )}
        </Stack>
      </Popover>
    </Box>
  )
}

export default KebabMenu
