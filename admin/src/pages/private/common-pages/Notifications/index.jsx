import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react"
import { Box, Grid, Paper, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import NotificationListing from "components/NotificationListing"
import PaginationComponent from "components/utilities-components/Pagination"
import { getNotifications, readAllNotifications } from "helpers/Functions/getNotificationListing"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const Notifications = () => {
  const theme = useTheme()
  const user = userDetail()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const dispatch = useDispatch()
  const refetcherCount = useSelector((state) => state?.app?.refetch)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [notifications, setnotifications] = useState([])
  const [notificationsCount, setnotificationsCount] = useState([])
  const [loading, setLoading] = useState(false)
  const [refetch, setRefetch] = useState(false)
  const [subAdminPermission, setSubAdminPermission] = useState({
    advance: {},
    topup: {},
    taxInvoice: {},
    blueverseCredit: {},
    machine: {},
    dealer: {},
    service: {}
  })

  useEffect(() => {
    getAllpermission()
    dispatch(coreAppActions.setRefetch(refetcherCount + 1))
  }, [])
  useEffect(() => {
    getNotifications(
      user,
      setDealerNotifications,
      setNotificationsCount,
      setAppLoader,
      pagination,
      currentPage,
      itemsPerPage,
      subAdminPermission
    )
  }, [itemsPerPage, currentPage, refetch, subAdminPermission])

  async function getAllpermission() {
    if (user.role == "subadmin") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        let topupPermissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        let taxInvoicePermissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        let creditPermissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")
        let machinePermissionJson = getPermissionJson(user, "machine details")
        let dealerPermissionJson = getPermissionJson(user, "dealer")
        let servicePermissionJson = getPermissionJson(user, "service request")
        setSubAdminPermission({
          ...subAdminPermission,
          advance: permissionJson?.permissionObj,
          topup: topupPermissionJson?.permissionObj,
          taxInvoice: taxInvoicePermissionJson?.permissionObj,
          blueverseCredit: creditPermissionJson?.permissionObj,
          machine: machinePermissionJson?.permissionObj,
          dealer: dealerPermissionJson?.permissionObj,
          service: servicePermissionJson?.permissionObj
        })
      }
    }
  }
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
          <NotificationListing notifications={notifications} createNewData={loading} />
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
