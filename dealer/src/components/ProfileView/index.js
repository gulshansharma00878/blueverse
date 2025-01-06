import React from "react"
import { Box, Divider, CardMedia } from "@mui/material"
import UserImg from "assets/images/backgrounds/healthicons_ui-user-profile-outline (1).png"
import "./ProfileView.scss"

function ProfileView({ userProfileDetail }) {
  return (
    <>
      <Box className="box_container">
        <Box className="name_container">{userProfileDetail?.name}</Box>
        <Box className="divider_container">
          <Divider light />
        </Box>
        <Box>
          <Box className="inner_wrapper">
            <Box className="img_container">
              <CardMedia
                className="userimg"
                component="img"
                image={UserImg}
                alt="profile"
                name="file"
              />
            </Box>
            <Box className="content_container">
              <Box className="firstContainer">
                <Box className="inner_container">
                  <Box className="heading_text">Name</Box>
                  <Box className="name_text">{userProfileDetail?.name}</Box>
                </Box>
              </Box>
              <Box>
                <Box className="inner_container">
                  <Box className="heading_text">Email Id</Box>
                  <Box className="name_text">
                    {userProfileDetail.email ? userProfileDetail.email : "..."}
                  </Box>
                </Box>
              </Box>
              <Box>
                <Box className="inner_container">
                  <Box className="heading_text">Contact Number</Box>
                  <Box className="name_text">
                    {userProfileDetail?.phoneNumber ? userProfileDetail?.phoneNumber : "..."}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default ProfileView
