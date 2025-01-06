// INFO : This page will render analytical data in graphical form for feedback response for particular feedback form.
import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Analytics from "components/FeedbackPanel/Analytics"
import BackButtonIcon from "assets/images/icons/backButtonIcon.svg"
import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { FeedBackService } from "network/feedbackService"
import Toast from "components/utilities-components/Toast/Toast"
import { parseData } from "./feedBackUtility"
import styles from "./feedbackAnalytics.module.scss"
import { useSelector } from "react-redux"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import IconWrapper from "components/utilities-components/IconWrapper"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { userDetail } from "hooks/state"
import CommonFooter from "components/utilities-components/CommonFooter"
const FeedbackAnalytics = () => {
  const params = useParams()
  const user = userDetail()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState()
  const [subAdminPermission, setSubadminPermission] = useState()
  const formDetails = useSelector((state) => state.feedBack.formDetails)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [exportURL, setExportURL] = useState("")
  useEffect(() => {
    fetchAnalytics()
  }, [])

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "feedback response")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const exportDataHandler = () => {
    Toast.showInfoToast("Data exported successfully.")
  }

  const backButtonHandler = () => {
    navigate(-1)
  }

  const fetchAnalytics = async () => {
    const [response, exportResponse] = await Promise.all([
      FeedBackService.getAnalytics(params?.id),
      FeedBackService.getExportURL(params?.id)
    ])

    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      let questionsData = response?.data?.question ? response?.data?.question : []
      // Parse data and save to state =>

      const parsedData = questionsData.map((question) => {
        if (question.questionType === "COMMENT") {
          return parseData["COMMENT"](question)
        } else {
          return parseData["MULTIPLE_CHOICE"](question)
        }
      })

      setAnalyticsData({
        totalResponse: response?.data?.responseCount ? response?.data?.responseCount : 0,
        data: parsedData
      })
      setIsLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      backButtonHandler()
    }

    // Response Handling for Export Response
    if (exportResponse?.success && exportResponse?.code === 200) {
      setExportURL(exportResponse?.data?.records)
    }
  }

  const isDisabled = user.role === "subadmin" ? !subAdminPermission?.exportPermission : false
  return (
    <div>
      <Grid container className={styles.headerBox}>
        <Grid item xs={isMobile ? 12 : 4} container alignItems="center" flexWrap="nowrap">
          <Grid item>
            <IconWrapper imgSrc={BackButtonIcon} clickHandler={backButtonHandler} />
          </Grid>
          <Grid item className={styles.detailsText}>
            <Typography variant="h7" color="text.main" component="p">
              {`${formDetails?.oem?.name} ${formDetails?.region?.name} ${formDetails?.state?.name} Feedback`}
            </Typography>
            <Typography variant="p1" color="text.main" component="p">
              {`${formDetails?.region?.name}- ${formDetails?.state?.name}- ${formDetails?.city?.name}- ${formDetails?.oem?.name}`}
            </Typography>
            <Typography variant="p1" color="text.gray" component="p">
              {`${formDetails?.dealer?.map((x) => x).join(",")} : ${formDetails?.machines?.join(
                ","
              )}`}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={4} textAlign="center">
          <Typography
            variant="p1"
            color="primary"
            component="p"
            sx={{ marginTop: isMobile ? "1rem" : 0 }}>
            {analyticsData ? analyticsData.totalResponse : 0} Responses
          </Typography>
        </Grid>

        {!isMobile && (
          <Grid item xs={4} className={styles.button}>
            <a href={exportURL} style={{ pointerEvents: isDisabled ? "none" : "" }}>
              <PrimaryButton disabled={!exportURL || isDisabled} onClick={exportDataHandler}>
                Export
              </PrimaryButton>
            </a>
          </Grid>
        )}
      </Grid>
      {isLoading ? (
        <AppLoader />
      ) : (
        <Analytics
          data={analyticsData?.data}
          commentsDataIndex={analyticsData?.data?.findIndex((x) => x?.questionType === "COMMENT")}
        />
      )}
      {isMobile && (
        <CommonFooter>
          <Grid item xs={12} className={styles.button}>
            <a href={exportURL} style={{ pointerEvents: isDisabled ? "none" : "" }}>
              <PrimaryButton
                disabled={!exportURL || isDisabled}
                onClick={exportDataHandler}
                sx={{ width: "93vw" }}>
                Export
              </PrimaryButton>
            </a>
          </Grid>
        </CommonFooter>
      )}
    </div>
  )
}

export default FeedbackAnalytics
