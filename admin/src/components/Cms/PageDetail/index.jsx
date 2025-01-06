import React, { useEffect } from "react"
import {
  Box,
  Typography,
  OutlinedInput,
  Divider,
  Button,
  Switch,
  useTheme,
  useMediaQuery
} from "@mui/material"
import "../Cms.scss"
import { useNavigate } from "react-router-dom"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { CmsService } from "network/cmsService"
import Toast from "components/utilities-components/Toast/Toast"
import { cmsActions } from "redux/store"
import { useDispatch } from "react-redux"
import { userDetail } from "hooks/state"
import CommonFooter from "components/utilities-components/CommonFooter"

function PageForm({ isEdit, pageData = {} }) {
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [text, setText] = React.useState("")
  const [pageName, setPageName] = React.useState("")
  const [activeChecked, setActiveChecked] = React.useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    setPageName(pageData?.privacyPolicy)
    setText(pageData?.termsOfUse)
    setActiveChecked(pageData?.isActive)
  }, [isEdit])

  const handleCancel = () => {
    dispatch(cmsActions.setTabActive(0))
    navigate(`/${user.role}/cms`)
  }

  const handleChange = (html) => {
    setText(html)
  }

  const handlePageName = (e) => {
    setPageName(e.target.value)
  }

  const handleChecked = (e) => {
    setActiveChecked(e.target.checked)
  }

  const handleSubmit = async () => {
    let payLoad = {
      privacy_policy: pageName,
      terms_of_use: text,
      isActive: activeChecked.toString()
    }
    if (isEdit) {
      let param = [pageData?.policyId]
      let pageUpdateResponse = await CmsService.editPage(payLoad, param)
      if (pageUpdateResponse.code === 200 && pageUpdateResponse.success) {
        Toast.showInfoToast(`${pageUpdateResponse?.message}`)
      } else {
        Toast.showErrorToast(`${pageUpdateResponse?.message}`)
      }
    }
    dispatch(cmsActions.setTabActive(0))
    navigate(`/${user.role}/cms`)
  }
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"]
    ]
  }

  const ActionButtons = ({ isFormValid }) => {
    return (
      <Box className="cms_btn_box">
        <Button variant="outlined" className="cancel_btn" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className={isFormValid ? "save_button" : "save_button disable"}
          onClick={handleSubmit}>
          {isEdit ? "Update" : "Save"}
        </Button>
      </Box>
    )
  }

  const isFormValid = true
  return (
    <>
      <Box className="container_box">
        <Box className="form_container">
          <Box className="input_box">
            <Typography variant="s1">Page Name</Typography>
            <OutlinedInput
              placeholder="Page Name"
              name="pagename"
              className="cms_input_field"
              value={pageName}
              onChange={handlePageName}
              sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
            />
          </Box>
          <ReactQuill value={text} onChange={handleChange} modules={modules} />
          <Box className="input_box">
            <Typography variant="p1" className="status_lable">
              Status
            </Typography>
            <Box>
              <Typography variant="s1">Active</Typography>
              <Switch
                color="primary"
                checked={activeChecked}
                onChange={handleChecked}
                name={"oemCheck"}
              />
            </Box>
          </Box>
          {!isMobile && <Divider />}
          {isMobile ? (
            <CommonFooter>
              <ActionButtons isFormValid={isFormValid} />
            </CommonFooter>
          ) : (
            <ActionButtons />
          )}
        </Box>
      </Box>
    </>
  )
}

export default PageForm
