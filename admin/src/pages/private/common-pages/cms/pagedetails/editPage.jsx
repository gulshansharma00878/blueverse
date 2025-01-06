import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import PageForm from "components/Cms/PageDetail"
import { useSelector } from "react-redux"

function EditPage() {
  const pageData = useSelector((state) => state.cms.pageData)
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={"Edit Page"} />
        <PageForm isEdit={true} pageData={pageData} />
      </Box>
    </>
  )
}

export default EditPage
