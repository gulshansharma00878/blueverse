import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import PageForm from "components/Cms/PageDetail"
function AddPage() {
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Add New Page"} />
        <PageForm isEdit={false} />
      </Box>
    </>
  )
}

export default AddPage
