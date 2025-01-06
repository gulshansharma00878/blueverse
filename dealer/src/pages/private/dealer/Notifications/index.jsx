/* eslint-disable no-unused-vars*/
import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react"
import { Box, Grid, Paper, Typography, useMediaQuery } from "@mui/material"
import NotificationListing from "components/NotificationListing"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import PaginationComponent from "components/utitlities-components/Pagination"
import { getNotifications, readAllNotifications } from "helpers/Functions/getNotificationListing"
import AppLoader from "components/Loader/AppLoader"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { userDetail } from "hooks/state"

const Notifications = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const dispatch = useDispatch()
  const user = userDetail()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [notifications, setnotifications] = useState([])
  const [notificationsCount, setnotificationsCount] = useState("")
  const [loading, setLoading] = useState(false)
  const refetcherCount = useSelector((state) => state?.app?.refetch)
  const [refetch, setRefetch] = useState(false)
  const [employeePermission, setEmployeePermission] = useState({
    advance: {},
    topup: {},
    taxInvoice: {},
    blueverseCredit: {},
    wallet: {},
    machine: {},
    employee: {}
  })
  useEffect(() => {
    getNotifications(
      user,
      setDealerNotifications,
      setNotificationsCount,
      setAppLoader,
      pagination,
      currentPage,
      itemsPerPage,
      employeePermission
    )
  }, [itemsPerPage, currentPage, refetch, notificationsCount])

  useEffect(() => {
    getAllpermission()
    dispatch(coreAppActions.setRefetch(refetcherCount + 1))
  }, [])

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const setDealerNotifications = (notifications) => {
    setnotifications(notifications)
  }

  const setNotificationsCount = (count) => {
    setnotificationsCount(count)
  }

  const setAppLoader = (appLoader) => {
    setLoading(appLoader)
  }

  const pagination = (paginationObj) => {
    setCurrentPage(paginationObj?.currentPage)
    setTotalRecord(paginationObj?.totalItems)
    setItemsPerPage(paginationObj?.perPage)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const readAll = () => {
    readAllNotifications(setLoading, setRefetch)
    dispatch(coreAppActions.setRefetch(0))
  }

  async function getAllpermission() {
    if (user.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        let topupPermissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        let taxInvoicePermissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        let creditPermissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")
        let walletPermissionJson = getPermissionJson(user, "wallet")
        let machinePermissionJson = getPermissionJson(user, "machine details")
        let employeePermissionJson = getPermissionJson(user, "manage employees")

        setEmployeePermission({
          ...employeePermission,
          advance: permissionJson?.permissionObj,
          topup: topupPermissionJson?.permissionObj,
          taxInvoice: taxInvoicePermissionJson?.permissionObj,
          blueverseCredit: creditPermissionJson?.permissionObj,
          wallet: walletPermissionJson?.permissionObj,
          machine: machinePermissionJson?.permissionObj,
          employee: employeePermissionJson?.permissionObj
        })
      }
    }
  }

  return (
    <>
      {loading && <AppLoader />}
      <Grid container>
        <Grid item xs={10}>
          <CommonHeader
            heading="Notifications "
            badgeData={notificationsCount}
            isMobile={isMobile}
            backBtn
            isButtonVisible={false}
          />
        </Grid>
        <Grid item xs={2} display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
          <Typography
            variant="p2"
            color="background.blue2"
            sx={{ cursor: "pointer" }}
            onClick={readAll}>
            Mark All As Read
          </Typography>
        </Grid>
      </Grid>
      <Paper
        sx={{ boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.2)", marginTop: "2rem", width: "100%" }}>
        <Box>
          <NotificationListing createNewData={loading} notifications={notifications} />
        </Box>
      </Paper>
      <Grid container mt={2}>
        <Grid item xs={12}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalRecord={totalRecord}
            title={"Notifications"}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default Notifications
