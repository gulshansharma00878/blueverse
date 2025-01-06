import { useTheme } from "@emotion/react"
import { Box, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import React, { useEffect, useState } from "react"
import { useStyles } from "./ManageMachinesStyles"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import { ManageMachinesServices } from "network/manageMachinesServices"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { capitaliseString } from "helpers/Functions/formateString"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { useDispatch } from "react-redux"
import { machineAction } from "redux/store"
function createData(
  machine,
  dealership,
  oem,
  servicecenter,
  region,
  state,
  city,
  status,
  washes,
  machinewallet,
  machineId
) {
  return {
    dealership,
    oem,
    servicecenter,
    machine,
    region,
    state,
    city,
    status,
    washes,
    machinewallet,
    machineId
  }
}

function ManageMachines() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [machineData, setMachineData] = useState()
  const [loader, setLoader] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [oemIds, setOemIds] = useState([])
  const [cityIds, setCityIds] = useState([])
  const [stateIds, setStateIds] = useState([])
  const [regionIds, setRegionIds] = useState([])
  const [dealership, setDealership] = useState([])
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [machineStatus, setMachineStatus] = useState()
  const [outlets, setOutlets] = useState()
  const [machineIds, setMachineIds] = useState([])
  const [machineStatusCount, setMachineStatusCount] = useState()
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  useEffect(() => {
    getMachinesList()
    getMachineStatus()
  }, [itemsPerPage, currentPage, searchQuery, filterUpdate])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const columns = [
    {
      id: "machine",
      label: "Machine"
    },
    {
      id: "dealership",
      label: "Dealership"
    },
    {
      id: "oem",
      label: "OEM"
    },
    {
      id: "servicecenter",
      label: "Service Center"
    },
    {
      id: "region",
      label: "Region"
    },
    {
      id: "state",
      label: "State"
    },
    {
      id: "city",
      label: "City"
    },

    {
      id: "status",
      label: "Status"
    },
    {
      id: "washes",
      label: "Washes"
    },
    {
      id: "machinewallet",
      label: "Machine Wallet"
    }
  ]

  const handleDownload = async () => {
    setLoader(true)

    const params = {
      offset: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      machineIds: machineIds?.toString(),
      stateIds: stateIds?.toString(),
      cityIds: cityIds?.toString(),
      regionIds: regionIds?.toString(),
      oemIds: oemIds?.toString(),
      outletIds: outlets?.toString(),
      status: machineStatus?.toString(),
      dealerIds: dealership?.toString()
    }

    const response = await ManageMachinesServices.downloadMachinesList(params)
    if (response.code == 200 && response.success) {
      const a = document.createElement("a")
      a.href = response?.data?.records
      a.download = "washes.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setLoader(false)
      Toast.showInfoToast(`CSV Downloaded succesfully`)
    } else {
      setLoader(false)
      Toast.showErrorToast(`Something went wrong`)
    }
  }

  const machineCountdata = [
    {
      id: 1,
      washType: "Total Active Machines",
      count: machineStatusCount?.activeMachine || 0,
      color: theme.palette.background.blue7
    },
    {
      id: 2,
      washType: "Total Inactive Machines",
      count: machineStatusCount?.inactiveMachine || 0,
      color: theme.palette.background.pink1
    }
  ]

  const handleFilter = (...params) => {
    setRegionIds(params[3])
    setCityIds(params[5])
    setStateIds(params[4])
    setOemIds(params[6])
    setMachineIds(params[8])
    setMachineStatus(params[10])
    setOutlets(params[11])
    setFilterUpdate(filterUpdate + 1)
    setOutlets(params[11])
    setDealership(params[7])
    setOpenDrawer(false)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  const onDrawerFilter = () => {
    setOpenDrawer((prev) => !prev)
  }

  function onCloseFilter() {
    setOpenDrawer(false)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const getMachineStatus = async () => {
    const params = {
      search: searchQuery,
      machineIds: machineIds?.toString(),
      stateIds: stateIds?.toString(),
      cityIds: cityIds?.toString(),
      regionIds: regionIds?.toString(),
      oemIds: oemIds?.toString(),
      outletIds: outlets?.toString(),
      status: machineStatus?.toString(),
      dealerIds: dealership?.toString()
    }

    const response = await ManageMachinesServices.machinesStatusCount(params)

    if (response.success && response.code === 200) {
      setMachineStatusCount(response?.data)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const getMachinesList = async () => {
    setLoader(true)

    const params = {
      offset: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      machineIds: machineIds?.toString(),
      stateIds: stateIds?.toString(),
      cityIds: cityIds?.toString(),
      regionIds: regionIds?.toString(),
      oemIds: oemIds?.toString(),
      outletIds: outlets?.toString(),
      status: machineStatus?.toString(),
      dealerIds: dealership?.toString()
    }

    const response = await ManageMachinesServices.machinesList(params)

    if (response.success && response.code === 200) {
      setMachineData(response?.data?.machines)
      if (response?.data?.machines?.length === 0) {
        setCurrentPage(1)
        setTotalRecord(0)
      } else {
        setTotalRecord(response?.data?.pagination?.totalItems)
      }
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  let creatRow =
    machineData &&
    machineData.length > 0 &&
    machineData.map((list) => {
      return createData(
        <Typography key={list?.machineGuid} variant="p3" sx={styles.machineName}>
          {list?.name || "NA"}
        </Typography>,
        list?.outlet?.dealer?.username || "NA",
        list?.outlet?.dealer?.oem?.name || "NA",
        list?.outlet?.name || "NA",
        list?.outlet?.city?.state?.region?.name || "NA",
        list?.outlet?.city?.state?.name || "NA",
        list?.outlet?.city?.name || "NA",
        <Typography variant="p3" color={list?.status == "ACTIVE" ? "text.green" : "text.red1"}>
          {capitaliseString(list.status) || "NA"}
        </Typography>,
        formatCurrency(list.washesCount, "") || "NA",
        formatCurrency(list.walletBalance, "") || "NA",
        list?.machineGuid
      )
    })

  const handleNavigate = (row) => {
    navigate(`/${user?.role}/manage-machines/details/${row?.machineId}`)
    dispatch(machineAction.setActiveTab(0))
  }

  return (
    <Box container>
      {loader ? <AppLoader /> : null}
      <CommonHeader heading="Manage Machines" />
      <Box columnGap={2} sx={{ display: "flex", mt: "1.6rem", mb: "4rem" }}>
        {machineCountdata.map((item, i) => {
          return (
            <Box key={i} sx={{ ...styles.wash_count_box, backgroundColor: item.color }}>
              <Typography variant="s1" component={"div"}>
                {item.washType}
              </Typography>
              <Typography variant="h5" component={"div"}>
                {item.count}
              </Typography>
            </Box>
          )
        })}
      </Box>

      <CommonHeader
        badgeData={totalRecord}
        heading="All Machines"
        searchEnabled={true}
        filterEnabled={true}
        setQuery={setQuery}
        searchQuery={searchQuery}
        handleDrawer={handleDrawer}
        downloadEnabled={totalRecord != 0 ? true : false}
        setCurrentPage={setCurrentPage}
        handleDownload={handleDownload}
        isFilterUsed={isFilterUsed}
        isMobile={isMobile}
      />
      <Box sx={{ mt: "16px", mb: "16px" }}>
        <ListingTable columns={columns} tableData={creatRow} navigate={handleNavigate} />
      </Box>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalRecord / itemsPerPage)}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalRecord={totalRecord}
        title={"Machines"}
      />
      <FilterDrawer
        open={openDrawer}
        handleDrawer={onDrawerFilter}
        handleFilter={handleFilter}
        handlecloseFilter={onCloseFilter}
        showDate={false}
        machineStatusFilter={true}
        outletFilter={true}
        showUsedFilter={showUsedFilter}
      />
    </Box>
  )
}

export default ManageMachines
