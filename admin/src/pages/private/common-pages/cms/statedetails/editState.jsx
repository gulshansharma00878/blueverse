import React from "react"
import BackHeader from "components/utilities-components/BackHeader"
import { Box } from "@mui/material"
import "../Cms.scss"
import StateForm from "components/Cms/State"
import { useSelector } from "react-redux"
function EditState() {
  const stateData = useSelector((state) => state.cms.stateData)

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Edit State"} />
        <StateForm isEdit={true} stateData={stateData} />
      </Box>
    </>
  )
}

export default EditState
