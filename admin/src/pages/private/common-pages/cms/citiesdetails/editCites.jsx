import React from "react"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import { Box } from "@mui/material"
import CitiesForm from "components/Cms/Cities"
import { useSelector } from "react-redux"

function EditCities() {
  const citiesData = useSelector((state) => state.cms.citiesData)

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Edit Cities"} />
        <CitiesForm isEdit={true} citiesData={citiesData} />
      </Box>
    </>
  )
}

export default EditCities
