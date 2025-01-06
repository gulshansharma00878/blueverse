import React from "react"
import { Box, Typography, Divider, Button, Switch } from "@mui/material"
import "../Cms.scss"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"

function ViewPageDetail({ pageData = {} }) {
  const navigate = useNavigate()
  const user = userDetail()

  const handleNavigate = async () => {
    navigate(`/${user.role}/cms/edit-page/${pageData?.policyId}`)
  }

  return (
    <>
      <Box className="container_box">
        <Box className="form_container">
          <div dangerouslySetInnerHTML={{ __html: pageData?.termsOfUse }} />
          <Box className="input_box">
            <Typography variant="p1" className="status_lable">
              Status
            </Typography>
            <Box>
              <Typography variant="s1">Active</Typography>
              <Switch color="primary" checked={pageData?.isActive} name={"oemCheck"} />
            </Box>
          </Box>
          <Divider />
          <Box className="cms_btn_box">
            <Button variant="contained" className={"save_button"} onClick={handleNavigate}>
              {"Edit"}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default ViewPageDetail
