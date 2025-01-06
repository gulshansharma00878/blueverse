import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import OemForm from "components/Cms/OEM"
function AddOem() {
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Add Oem"} />
        <OemForm isEdit={false} />
      </Box>
    </>
  )
}

export default AddOem
