import React from "react"
import Popover from "@mui/material/Popover"
import CardMedia from "@mui/material/CardMedia"
import PricingTermsImage from "assets/images/placeholders/pricing-terms.webp"

const PricingTermPopup = ({ handleClose, id, anchorEl, open }) => {
  return (
    <div>
      <Popover
        id={id}
        open={open}
        sx={{
          height: "75vh",
          [`& .MuiPopover-paper`]: { boxShadow: "0 0 0.5rem 0.3rem #00000057" }
        }}
        disableRestoreFocus
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right"
        }}>
        <CardMedia src={PricingTermsImage} component="img" />
      </Popover>
    </div>
  )
}

export default PricingTermPopup
