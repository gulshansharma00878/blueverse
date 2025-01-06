import React from "react"
import { Box } from "@mui/material"
import ProfileView from "components/ProfileView"
import { userDetail } from "hooks/state"
import "./Profile.scss"
import UpdatePassword from "components/UpdatePassword"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
function AdminProfile() {
  const user = userDetail()
  return (
    <Box>
      <CommonHeader
        heading="Account Settings"
        isButtonVisible={false}
        backBtn
        // isMobile={isMobile}
      />
      {/* <Typography variant="h6">Account Settings</Typography> */}
      <Box className="profile_container">
        <ProfileView userProfileDetail={user} />
        <UpdatePassword />
      </Box>
    </Box>
  )
}

export default AdminProfile
