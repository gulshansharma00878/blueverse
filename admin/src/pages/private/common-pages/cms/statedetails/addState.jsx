import React from "react"
import { Box } from "@mui/material"
import "../Cms.scss"
import BackHeader from "components/utilities-components/BackHeader"

import StateForm from "components/Cms/State"
function AddState() {
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Add New State"} />
        <StateForm isEdit={false} />
      </Box>
    </>
  )
}

export default AddState
