import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import CitiesForm from "components/Cms/Cities"

function AddCities() {
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Add Cities"} />
        <CitiesForm isEdit={false} />
      </Box>
    </>
  )
}

export default AddCities
