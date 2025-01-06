import React, { useState } from "react"
import Box from "@mui/system/Box"
import Grid from "@mui/material/Grid"
import "./Analytics.scss"
import MetricsCard from "./MetricsCard"
import VerticalBarChart from "components/utilities-components/Charts/VerticalBarChart"
import HorizontalStackedBarChart from "components/utilities-components/Charts/HorizontalStackedBarChar"
import FeedbackResponses from "./FeedbackResponses"
import EmptyMetricState from "../EmptyMetricsState"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import PopupModal from "components/PopupModal"
import ResponseModal from "./ResponseModal/ResponseModal"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useTheme, useMediaQuery } from "@mui/material"
import { useStyles } from "../feedbackStyles"
const Analytics = ({ data, commentsDataIndex }) => {
  const [activeAnalytics, setActiveAnalytics] = useState(null)
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const styles = useStyles()
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const viewAllHandler = (questionId) => {
    setActiveAnalytics(questionId)
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const getStyles = () => {
    return isMobile ? [styles?.display, styles?.column] : null
  }
  const getActiveQuestionData = () => {
    let question = { questionTitle: "", responseCount: 0, questionId: "" }
    let index = ""
    index = data.findIndex((x) => x.questionId === activeAnalytics)
    if (index > -1) {
      question = data[index]
    }

    return { question, index }
  }

  return (
    <Box sx={{ flexGrow: 1, marginBottom: isMobile ? "15rem" : 0 }}>
      <Grid container spacing={2} sx={getStyles()}>
        <Grid item xs={isMobile ? 12 : 8}>
          <Grid container spacing={2}>
            {data
              .filter((x) => x.questionType !== "COMMENT")
              .map((item, index) => {
                return (
                  <Grid item xs={isMobile ? 12 : 6} key={index}>
                    <MetricsCard
                      questionNo={index + 1}
                      questionTitle={item.questionTitle}
                      responseCount={item.responseCount}
                      viewAllHandler={viewAllHandler.bind(null, item?.questionId)}
                      isMobile={isMobile}>
                      {item.responseCount === 0 ? (
                        <EmptyMetricState />
                      ) : item.questionType === "RATING" ? (
                        <HorizontalStackedBarChart data={item.analyticsData} />
                      ) : (
                        <VerticalBarChart data={item.analyticsData} />
                      )}
                    </MetricsCard>
                  </Grid>
                )
              })}
          </Grid>
        </Grid>
        {Boolean(commentsDataIndex >= 0) && (
          <Grid item xs={isMobile ? 12 : 4}>
            <MetricsCard
              questionNo={data.length}
              questionTitle={data[commentsDataIndex].questionTitle}
              responseCount={data[commentsDataIndex].responseCount}
              viewAllHandler={viewAllHandler.bind(null, data[commentsDataIndex]?.questionId)}
              isChart={false}
              isMobile={isMobile}>
              {data[commentsDataIndex].responseCount === 0 ? (
                <EmptyMetricState />
              ) : (
                <FeedbackResponses data={data[commentsDataIndex].analyticsData} />
              )}
            </MetricsCard>
          </Grid>
        )}
      </Grid>
      {activeAnalytics !== null && (
        <div>
          <PopupModal handleClose={handleClose}>
            <ResponseModal
              data={getActiveQuestionData()}
              closeHandler={handleClose}
              loadingQuestion={setIsQuestionLoading}
            />
          </PopupModal>
          {isQuestionLoading && <AppLoader />}
        </div>
      )}
    </Box>
  )
}

export default Analytics
