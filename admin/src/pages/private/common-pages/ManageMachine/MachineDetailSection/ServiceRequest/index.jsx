/* eslint-disable no-unused-vars*/
import React, { useEffect, useState } from "react"
import { Box, Grid, IconButton, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import { useTheme } from "@emotion/react"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"
import { useParams } from "react-router-dom"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { dateMonthFormat } from "helpers/app-dates/dates"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { ArrowDownward } from "@mui/icons-material"

function ServiceRequest({ startDate = "", endDate = "" }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const params = useParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [loading, setLoading] = useState(false)
  const [requestsRaised, setRequestRaised] = useState([])
  const [sort, setSort] = useState("DESC")
  const [totalLength, setTotalLength] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    getServiceRequests()
  }, [sort, itemsPerPage, currentPage, startDate, endDate])
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
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
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
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
  const tableData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    requestsRaised &&
    requestsRaised.length > 0 &&
    requestsRaised.map((list, i) => {
      return tableData.push(createData(list?.index, list?.serialNo, list?.requestedOn))
    })
  const exportServiceRequest = async () => {
    setLoading(true)
    const param = [
      `${params?.machineId}?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}&fromDate=${startDate}&toDate=${endDate}`
    ]
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
  return (
    <Box>
      {loading && <AppLoader />}
      <CommonHeader
        heading="Service Requests "
        downloadEnabled
        handleDownload={exportServiceRequest}
        headerStyle={{ backgroundColor: "inherit", marginBottom: "2rem" }}
        //   buttonStyle={styles?.createBtn}
        // isButtonVisible={
        //   !isEmpty
        //     ? user.role === "subadmin"
        //       ? subAdminPermission?.createPermission
        //       : user?.role === "admin" && true
        //     : false
        // }
      />{" "}
      <Box sx={{ marginTop: "2rem" }}>
        <ListingTable columns={columns} tableData={tableData} />
      </Box>
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
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Service Requests"}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ServiceRequest
