// This is utility component which will provide rounded borders, backdrop, open & close options
import React from "react"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import { useSelector } from "react-redux"
import "./popUpModal.scss"

const PopupModal = ({ handleClose, styles = {}, children }) => {
  const modalOpenState = useSelector((state) => state?.app?.popUpModalState)

  return (
    <Modal
      open={modalOpenState}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose()
        }
      }}
      classes={{ root: { padding: "2rem, 0" } }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        "& > .MuiBackdrop-root": {
          backdropFilter: "blur(28px)"
        }
      }}>
      <Box className={`popUp`} style={styles}>
        {children}
      </Box>
    </Modal>
  )
}

export default PopupModal
