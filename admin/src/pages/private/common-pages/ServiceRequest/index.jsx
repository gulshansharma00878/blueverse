import React, { useEffect, useState } from "react"
import { Box, Grid, IconButton } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import { ServiceRequestService } from "network/services/serviceRequests"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"
import { createData, sortRequestData } from "./serviceRequestUtility"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { ArrowDownward } from "@mui/icons-material"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"

const AllServiceRequest = () => {
  const user = userDetail()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [loading, setLoading] = useState(false)
  const [serviceRequests, setServiceRequests] = useState([])
  const [sort, setSort] = useState("DESC")
  const [subAdminPermission, setSubadminPermission] = useState()
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedMachines, setSelectedMachines] = useState([])
  useEffect(() => {
    getServiceRequests()
  }, [sort, itemsPerPage, currentPage, filterUpdate])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "service request")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }
  const handleFilter = (...params) => {
    setSelectedMachines(params[14])
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }
  const handlecloseFilter = () => {
    setOpenDrawer(false)
  }
  const exportServiceRequest = async () => {
    const params = [
      `?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}&machineIds=${selectedMachines}`
    ]
    const response = await ServiceRequestService.exportServiceRequest(params)
    if (response.code == 200 && response.success) {
      const a = document.createElement("a")
      a.href = response?.data?.records
      a.download = "advance-memo.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      Toast.showInfoToast(`${response?.message}`)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const columns = [
    {
      id: "requestIds",
      label: "Service ID "
    },
    {
      id: "machines",
      label: "Machine"
    },
    {
      id: "oems",
      label: "OEM"
    },
    {
      id: "dealerShips",
      label: "Service Center"
    },
    {
      id: "regions",
      label: "Region"
    },
    {
      id: "states",
      label: "State"
    },
    {
      id: "citys",
      label: "City"
    },
    {
      id: "dates",
      label: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          Request Date
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

  const getServiceRequests = async () => {
    setLoading(true)
    const params = [`?offset=${currentPage}&limit=${itemsPerPage}&machineIds=${selectedMachines}`]
    const response = await ServiceRequestService.getServiceRequest(params)
    if (response?.success && response?.code === 200) {
      const requiredSortedData = sortRequestData(response?.data?.records)
      setServiceRequests(requiredSortedData)
      setTotalRecord(response?.data?.pagination?.totalItems)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const tableData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    serviceRequests &&
    serviceRequests.length > 0 &&
    serviceRequests.map((list) => {
      return tableData.push(
        createData(
          list?.requestId,
          list?.machine,
          list?.oem,
          list?.dealerShip,
          list?.region,
          list?.state,
          list?.city,
          list?.date
        )
      )
    })
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  return (
    <Box>
      {loading && <AppLoader />}
      <CommonHeader
        handleDownload={exportServiceRequest}
        heading="Service Requests"
        downloadEnabled={user.role === "subadmin" ? subAdminPermission?.exportPermission : true}
        badgeData={totalRecord}
        isFilterUsed={isFilterUsed}
        filterEnabled={true}
        handleDrawer={handleDrawer}
      />
      <Box sx={{ mt: "2rem" }}>
        <ListingTable tableData={tableData} columns={columns} />
      </Box>
      {totalRecord !== 0 && (
        <Grid container mt={2}>
          <Grid
            item
            xs={12}
            // sx={styles?.topMargin}
          >
            <PaginationComponent
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalRecord={totalRecord}
              title={"Service Requests"}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </Grid>
        </Grid>
      )}
      <FilterDrawer
        open={openDrawer}
        handleDrawer={handleDrawer}
        handleFilter={handleFilter}
        handlecloseFilter={handlecloseFilter}
        oemFilter={false}
        machineFilter={false}
        dealerFilter={false}
        stateFilter={false}
        cityFilter={false}
        regionFilter={false}
        showUsedFilter={showUsedFilter}
        showMachinesOnly={true}
        showDate={false}
      />
    </Box>
  )
}

export default AllServiceRequest
