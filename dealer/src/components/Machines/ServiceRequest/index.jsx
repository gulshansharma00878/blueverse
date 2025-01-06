/* eslint-disable no-unused-vars*/
import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react"
import { useNavigate } from "react-router-dom"
import { Box, Grid, useMediaQuery, IconButton, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import AppLoader from "components/Loader/AppLoader"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { ArrowDownward } from "@mui/icons-material"
import Toast from "components/utitlities-components/Toast/Toast"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { dateMonthFormat } from "helpers/app-dates/dates"
import PopUpChild from "components/utitlities-components/PopUpChild"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import GenerateRequest from "assets/images/placeholders/generateService.png"
import PopupModal from "components/PopupModal"
import CommonFooter from "components/utitlities-components/CommonFooter"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { userDetail } from "hooks/state"
function ServiceRequest({ startDate = "", endDate = "", machineName }) {
  const theme = useTheme()
  const user = userDetail()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const params = useParams()
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [loading, setLoading] = useState(false)
  const [requestsRaised, setRequestRaised] = useState([])
  const [sort, setSort] = useState("DESC")
  const [totalLength, setTotalLength] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [popUp, setPopUp] = useState("")
  const [reFetch, setReFetch] = useState(false)
  useEffect(() => {
    getServiceRequests()
    handleClose()
  }, [reFetch, sort, itemsPerPage, currentPage, startDate, endDate])
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  const getServiceRequests = async () => {
    setLoading(true)
    const param = [
      `${params?.machineId}?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}&fromDate=${startDate}&toDate=${endDate}`
    ]
    const response = await ManageMachinesServices.machinesServices(param)
    if (response?.success && response?.code === 200) {
      const requiredData = response?.data?.records.map((requests, i) => {
        return {
          index: i + 1,
          serialNo: requests?.serviceId,
          requestedOn: dateMonthFormat(requests?.createdAt, "DD/MM/YYYY hh:mm A")
        }
      })
      setRequestRaised(requiredData)
      setTotalRecord(response?.data?.pagination?.totalItems)
      if (response?.data?.pagination?.totalItems != 0) {
        // length of the list
        setTotalLength(response?.data?.pagination?.totalItems)
      } else {
        if (response?.data?.pagination?.totalItems == 0 && searchQuery != "") {
          // when we are searching in list
          setTotalLength(1)
        } else {
          // when we are not searching
          setTotalLength(0)
        }
      }

      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const columns = [
    { id: "id", label: "Sr.No.", minWidth: 30 },
    {
      id: "requestId",
      label: "Service ID ",
      minWidth: 300
    },

    {
      id: "date",
      label: (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {" "}
          Request Date{" "}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className="filtericonBox"
            sx={{ display: "flex", justifyContent: "center", marginLeft: "1rem" }}
            onClick={handleSort.bind(null, sort)}>
            {sort === "DESC" ? (
              <ArrowUpwardIcon
                color="primary"
                //  sx={styles?.IconButton}
              />
            ) : (
              <ArrowDownward
                color="primary"
                //  sx={styles?.IconButton}
              />
            )}
          </IconButton>
        </Box>
      )
    }
  ]
  const createData = (id, requestId, date) => {
    return { id, requestId, date }
  }
  let tableData = []
  let creatRow =
    requestsRaised &&
    requestsRaised.length > 0 &&
    requestsRaised.map((list, i) => {
      return tableData.push(createData(list?.index, list?.serialNo, list?.requestedOn))
    })
  const exportServiceRequest = async () => {
    setLoading(true)
    const param = [`${params?.machineId}?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}`]
    const response = await ManageMachinesServices.exportmachinesServices(param)
    if (response.code == 200 && response.success) {
      const a = document.createElement("a")
      a.href = response?.data?.records
      a.download = "advance-memo.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      Toast.showInfoToast(`${response?.message}`)
      setLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      setLoading(false)
    }
  }
  const handleChangePage = (page) => {
    setCurrentPage(page)
  }
  const handlePerPageItemsChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  const geenreateServiceRequest = async () => {
    const response = await ManageMachinesServices.generateMachineRequest(params?.machineId)
    if (response?.code === 200 && response?.success) {
      Toast.showInfoToast(`${response?.message}`)
      handleClose()
      setReFetch((prev) => !prev)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  let popupMap = {
    generate: (
      <PopUpChild
        heading={`Generate Service Request`}
        subHeading={`Do you want to create a service request for ${machineName}?`}
        handleClose={handleClose}
        src={GenerateRequest}
        handleClick={geenreateServiceRequest}
      />
    )
  }
  const handlePopUp = (item) => {
    setPopUp("generate")
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleNavigate = (row) => {
    navigate( `/${user?.role}/machines/create/service/${params?.machineId}`)
  }

  let btnTxt = "Generate Service Request"

  return (
    <Box>
      {loading && <AppLoader />}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "2rem" }}>
        <Typography variant="s1">Service Requests</Typography>
        {!isMobile && (
          <>
            {/* <PrimaryButton width={"fit-content"} onClick={handlePopUp}>
              {btnTxt}
            </PrimaryButton> */}
            <PrimaryButton width={"fit-content"} onClick={handleNavigate}>
            {btnTxt}
          </PrimaryButton>
        </>
        )}
      </Box>
      <ListingTable columns={columns} tableData={tableData} />
      {totalRecord !== 0 && (
        <Grid container mt={2}>
          <Grid
            item
            xs={12}
            // sx={styles?.topMargin}
          >
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handleChangePage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handlePerPageItemsChange}
              totalRecord={totalRecord}
              title={"Service Requests"}
            />
          </Grid>
        </Grid>
      )}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
      {isMobile && (
        <CommonFooter>
          <PrimaryButton width={isMobile ? "100%" : "fit-content"} onClick={handlePopUp}>
            {btnTxt}
          </PrimaryButton>
        </CommonFooter>
      )}
    </Box>
  )
}

export default ServiceRequest
