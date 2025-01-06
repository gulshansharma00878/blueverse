import React from "react"
import { Box } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import "../Cms.scss"
import { useSelector } from "react-redux"
import ViewPageDetail from "components/Cms/PageDetail/viewPageDetail"
function ViewPage() {
  const pageData = useSelector((state) => state.cms.pageData)
  return (
    <>
      <Box sx={{ mt: "20px" }}>
        <BackHeader title={pageData?.privacyPolicy} />
        <ViewPageDetail pageData={pageData} />
      </Box>
    </>
  )
}

export default ViewPage
