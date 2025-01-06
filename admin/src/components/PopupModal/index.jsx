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
      sx={{ zIndex: 2500 }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box className={`popUp`} style={styles}>
        {children}
        {/* <Grid container direction="column">
          <Grid item xs={12} className={`child display`}>
          </Grid>
        </Grid> */}
      </Box>
    </Modal>
  )
}

export default PopupModal
