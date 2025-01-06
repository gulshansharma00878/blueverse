/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import { Box, Divider, Grid, Paper, Typography } from "@mui/material"
import isRead from "assets/images/notifications/isRead.svg"
import {
  // getNotificationList,
  imageMapNotification
  // permissionMapNotification
} from "helpers/Functions/notificationImageMap"
import AppLoader from "components/Loader/AppLoader"
import { readSingleNotification } from "helpers/Functions/getNotificationListing"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { machineAction } from "redux/store"
const NotificationListing = ({
  isPopUp,
  notifications,
  createNewData,
  handleNotificationClose
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [notificatonArr, setNotificationArr] = useState([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createNotificationData()
  }, [createNewData])

  const createNotificationData = () => {
    setLoading(true)
    let notificationMap = []
    notifications &&
      notifications.forEach((notification) => {
        notificationMap.push({
          isRead: notification?.read,
          title: notification?.modelDetail?.name,
          subTitle: notification?.message,
          date: lastActivity(notification?.createdAt),
          type: notification?.type,
          route: `/${notification?.link}`,
          id: notification?.notificationId
        })
      })
    setNotificationArr(notificationMap)
    setLoading(false)
  }

  const lastActivity = (dateString) => {
    const today = new Date()
    const old = new Date(dateString)
    const timeDifference = today - old
    const daysDiff = Math.floor(timeDifference / 1000 / 60)

    let activity
    if (daysDiff > 1440) {
      activity = `${(daysDiff / 24 / 60).toFixed()} day ago`
    } else if (daysDiff > 60) {
      activity = `${(daysDiff / 60).toFixed()} hrs ago`
    } else if (daysDiff < 60) {
      activity = `${daysDiff.toFixed()} min ago`
    }

    return activity
  }
  return (
    <Paper sx={{ width: "100%" }}>
      {loading && <AppLoader />}
      <Grid container sx={{ padding: "1rem" }}>
        {notificatonArr?.length > 0 ? (
          notificatonArr.map((item, i) => (
            <>
              {" "}
              <Grid
                key={i}
                item
                xs={12}
                sx={{
                  height: "8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  cursor: "pointer"
                }}
                onClick={() => {
                  isPopUp && handleNotificationClose()
                  readSingleNotification(item?.id)
                  navigate(item?.route)
                  if (item?.type === "MACHINE_HEALTH_SENSOR_FAILED") {
                    dispatch(machineAction.setActiveTab(1))
                  }
                }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ padding: "0 0.5rem", width: "2.5rem" }}>
                    {!item?.isRead && <img src={isRead} alt="read" style={{ width: "2rem" }} />}
                  </Box>
                  <Box marginRight={"1rem"} marginLeft={"1rem"}>
                    <img
                      src={imageMapNotification(item?.type)}
                      alt={item?.title}
                      style={{ width: "6rem" }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", width: "75%" }}>
                    <Typography variant="p1">{item?.title}</Typography>
                    <Typography variant="p3"> {item?.subTitle}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="p2" marginRight={"1rem"}>
                    {" "}
                    {item?.date}
                  </Typography>
                </Box>
              </Grid>
            </>
          ))
        ) : (
          <Grid
            item
            xs={12}
            sx={{
              height: "8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <Box>
              <Typography variant="p2" marginRight={"1rem"}>
                No Notifications Found
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  )
}

export default NotificationListing
