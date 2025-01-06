import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import OemForm from "components/Cms/OEM"
import { useSelector } from "react-redux"

function EditOem() {
  const oemData = useSelector((state) => state.cms.oemData)

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Edit Oem"} />
        <OemForm isEdit={true} oemData={oemData} />
      </Box>
    </>
  )
}

export default EditOem
