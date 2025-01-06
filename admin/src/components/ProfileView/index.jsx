import React, { useState } from "react"
import {
  Box,
  Typography,
  // OutlinedInput,
  Divider,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment
} from "@mui/material"
// import UserImg from "assets/images/backgrounds/healthicons_ui-user-profile-outline (1).png"
import "./ProfileView.scss"
import { Formik, Form } from "formik"
import { ProfileFormValidator } from "helpers/validators/profileForm"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useTheme } from "@mui/system"
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import { ProfileService } from "network/profileService"
import Toast from "components/utilities-components/Toast/Toast"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { AuthService } from "network/authService"
// import InputField from "components/utilities-components/InputField/InputField"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteDealer from "assets/images/placeholders/deleteDealer.webp"
import { useCookies } from "react-cookie"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import OutlinedInputField from "components/utilities-components/InputField/OutlinedInput"
function ProfileView({ userProfileDetail }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [imageAnchorEl, setImageAnchorEl] = useState(null)
  const [editable, setEditable] = useState(false)
  const [profileUrl, setProfileUrl] = useState("")
  const [loader, setLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [imgData, setImgData] = useState(
    userProfileDetail?.profileImg ? userProfileDetail?.profileImg : null
  )

  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies([CookieKeys.Auth])

  const initialValues = {
    file: "",
    name: userProfileDetail?.name ? userProfileDetail?.name : "",
    email: userProfileDetail?.email ? userProfileDetail?.email : "",
    phone: userProfileDetail?.phoneNumber ? userProfileDetail?.phoneNumber : ""
  }

  const getNameInitials = (name) => {
    const nameArr = name.split(" ")
    const initials = nameArr.map((word) => word.charAt(0)).join("")
    return initials
  }

  const SUPPORTED_FORMATS = ["image/jpeg", "image/png"]

  const onChangePicture = async (e, formik) => {
    if (e.target.files[0]) {
      formik.setFieldValue("file", e.currentTarget.files[0])
      setImageAnchorEl(null)
      const reader = new FileReader()
      reader.addEventListener("load", async () => {
        let check = SUPPORTED_FORMATS.includes(e.target.files[0].type)
        if (check) {
          e.target.files[0]?.size > 1024 && setLoading(true)
          let payLoad = {
            image: e.target.files[0]
          }
          let uploadImgResponse = await ProfileService.uploadAdminProfile(payLoad)
          if (uploadImgResponse.code === 200 && uploadImgResponse.success) {
            setImgData(reader.result)
            setProfileUrl(uploadImgResponse?.data?.url)
            Toast.showInfoToast(`Image uploaded successfully`)
            setLoading(false)
          } else {
            setImgData(null)
            setProfileUrl("")
            setLoading(false)
          }
        } else {
          setImgData(null)
          setProfileUrl("")
          setLoading(false)
        }
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleLogout = async () => {
    const response = await AuthService.logoutOnClick({}, cookies?.authToken)
    if (response.success) {
      const cookieNames = Object.keys(cookies)
      cookieNames.forEach((cookie) => {
        removeCookie(cookie, CookieOptions)
      })
      dispatch(coreAppActions.logout())
      Toast.showInfoToast(`${response.message}`)
    } else {
      const cookieNames = Object.keys(cookies)
      cookieNames.forEach((cookie) => {
        removeCookie(cookie, CookieOptions)
      })
      dispatch(coreAppActions.logout())
      Toast.showInfoToast(`You have been logged out`)
    }
    dispatch(coreAppActions.updatePopupModal(false))
  }
  const handleSubmit = async (data) => {
    setLoader(true)
    const updatedValues = {}

    if (data.name !== initialValues.name) {
      updatedValues.username = data?.name
    }
    if (data.phone !== initialValues.phone) {
      updatedValues.phone = data?.phone
    }
    if (data.email !== initialValues.email) {
      updatedValues.email = data?.email
    }
    if (profileUrl) {
      updatedValues.profile_img = profileUrl
    }
    if (Object.keys(updatedValues).length > 0) {
      const updateResponse = await ProfileService.updateAdminProfile(updatedValues)
      if (updateResponse.code === 200 && updateResponse.success) {
        if (data.email !== initialValues.email) {
          setLoader(false)
          dispatch(coreAppActions.updatePopupModal(true))
          setTimeout(handleLogout, 7000)
        } else {
          Toast.showInfoToast(`${updateResponse?.message}`)

          const getUser = await AuthService.getUserProfile()
          if (getUser.code === 200 && getUser.success) {
            let statePayload = {
              userId: getUser?.data?.user?.userId,
              role: getUser?.data?.user?.role,
              username: getUser?.data?.user?.username,
              email: getUser?.data?.user?.email,
              phone: getUser?.data?.user?.phone,
              profileImg: getUser?.data?.user?.profileImg,
              subRoleId: getUser?.data?.user?.subRole?.subRoleId,
              permissions: getUser?.data?.user?.subRole,
              parentUserId: getUser?.data?.user?.parentUserId
            }
            dispatch(
              coreAppActions.login({
                user: statePayload
              })
            )
            setLoader(false)
          }
        }

        // setEditable(false)
      } else {
        Toast.showErrorToast(`${updateResponse?.message}`)
        setLoader(false)
      }
    } else {
      setLoader(false)
    }
    setEditable(false)
  }

  function handleDelete(formik) {
    setProfileUrl("DELETE")
    setImageAnchorEl(null)
    setImgData(null)
    formik.setFieldValue("file", null)
    Toast.showInfoToast(`Image deleted successfully.`)
  }

  function handleCancel(formik) {
    formik.resetForm()
    setEditable(false)
  }

  return (
    <>
      {loader ? (
        <AppLoader />
      ) : (
        <Box className="box_container">
          {loading && <AppLoader />}
          <Box className="name_container">Profile</Box>
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileFormValidator.validationSchema}
            onSubmit={handleSubmit}>
            {(formik) => {
              if (formik.errors.file) {
                Toast.showErrorToast(`${formik.errors.file}`)
                formik.setFieldError("file", null)
                formik.setFieldValue("file", null)
                setImgData(null)
              }
              return (
                <Form>
                  <Box className="profile_form_container">
                    <Box className="img_container">
                      <Avatar
                        className="img_avtar"
                        style={{
                          backgroundColor: theme.palette.primary.main,
                          position: "relative"
                        }}
                        src={imgData}>
                        {!formik.values.file && (
                          <Typography variant="h5">
                            {getNameInitials(formik.values.name)}
                          </Typography>
                        )}
                      </Avatar>

                      {editable && (
                        <>
                          <IconButton
                            className="edit_img_box"
                            onClick={(event) => setImageAnchorEl(event.currentTarget)}
                            // onClick={() => document.getElementById("imageInput").click()}
                          >
                            <MoreVertIcon />
                            <input
                              id="imageInput"
                              type="file"
                              name="file"
                              style={{ display: "none" }}
                              accept="image/*"
                              onChange={(e) => onChangePicture(e, formik)}
                            />
                          </IconButton>
                          <Menu
                            anchorEl={imageAnchorEl}
                            open={Boolean(imageAnchorEl)}
                            onClose={() => setImageAnchorEl(null)}
                            classes={{ paper: "menu-paper" }}>
                            <MenuItem
                              className="img_menu_box"
                              onClick={() => document.getElementById("imageInput").click()}>
                              <InsertPhotoOutlinedIcon color="primary" />
                              <Typography variant="p2">Choose Image (max 2mb)</Typography>
                            </MenuItem>
                            {imgData && (
                              <MenuItem
                                className="img_menu_box"
                                onClick={() => handleDelete(formik)}>
                                <DeleteOutlineOutlinedIcon color="error" />
                                <Typography variant="p2">Delete</Typography>
                              </MenuItem>
                            )}
                          </Menu>
                        </>
                      )}
                    </Box>
                    <Box className="profile_wrapper">
                      <Box className="inner_wrapper">
                        <Box className="input_box">
                          <Typography variant="s1">Name</Typography>
                          <OutlinedInputField
                            size="medium"
                            name="name"
                            value={formik.values.name}
                            inputProps={{
                              style: {
                                paddingBottom: "2.5rem"
                              }
                            }}
                            variant="filled"
                            type="text"
                            margin="normal"
                            fullWidth
                            disabled={!editable}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                          />
                          {formik.touched.name ? <ErrorText text={formik.errors.name} /> : ""}
                        </Box>
                      </Box>
                      <Box className="inner_wrapper">
                        <Box className="input_box">
                          <Typography variant="s1">Email</Typography>

                          <OutlinedInputField
                            size="medium"
                            name="email"
                            inputProps={{
                              style: {
                                paddingBottom: "2.5rem"
                              }
                            }}
                            value={formik.values.email}
                            variant="filled"
                            type="email"
                            margin="normal"
                            fullWidth
                            disabled={!editable}
                            sx={{ marginTop: "-1rem" }}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                          />
                          {formik.touched.email ? <ErrorText text={formik.errors.email} /> : ""}
                        </Box>
                        <Box className="input_box">
                          <Typography variant="s1">Phone Number</Typography>
                          <OutlinedInputField
                            size="medium"
                            name="phone"
                            inputProps={{
                              style: {
                                paddingBottom: "2.5rem"
                              }
                            }}
                            value={formik.values?.phone ? formik.values?.phone : ""}
                            variant="filled"
                            startAdornment={
                              <InputAdornment position="start">
                                <Typography variant="p1" color="text.main">
                                  +91
                                </Typography>{" "}
                              </InputAdornment>
                            }
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            fullWidth
                            margin="normal"
                            sx={{ marginTop: "-1rem" }}
                            disabled={!editable}
                          />
                          {formik.touched.phone ? <ErrorText text={formik.errors.phone} /> : ""}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="divider_container">
                    <Divider light />
                  </Box>
                  <Box className="button_container">
                    {!editable ? (
                      <Button
                        variant="outlined"
                        className="profile_editBtn"
                        onClick={() => setEditable(true)}>
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          className="profile_editBtn"
                          onClick={() => handleCancel(formik)}>
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          className="profile_editBtn"
                          color="primary"
                          type="submit">
                          Save
                        </Button>
                      </>
                    )}
                  </Box>
                </Form>
              )
            }}
          </Formik>
          <PopupModal>
            <PopUpChild
              height={506}
              heading={`Your email is updated successfully and your session is expired. You are being re-directed to the login page.`}
              showBtn={false}
              // handleClose={handleClose}
              src={DeleteDealer}
              // handleClick={handleDeleteDealer}
            />
          </PopupModal>
        </Box>
      )}
    </>
  )
}

export default ProfileView
