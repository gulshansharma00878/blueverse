import React, { Fragment, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import EmptyState from "components/utitlities-components/EmptyState"
import ManageWashEmptyPlaceholder from "assets/images/backgrounds/manageWashEmptyState.webp"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
// import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import { useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "@mui/system"
import Typography from "@mui/material/Typography"
import styles from "./washManagement.module.scss"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import moment from "moment"
import { ManageWashService } from "network/manageWashService"
import { sortData } from "components/utitlities-components/Drawer/drawerSort"
import { useSelector } from "react-redux"
import Toast from "components/utitlities-components/Toast/Toast"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import { IconButton, useMediaQuery } from "@mui/material"
import AppLoader from "components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { getMonthDays } from "helpers/app-dates/dates"

const WashList = () => {
  const userID = useSelector((state) => state?.app?.user?.userId)
  const user = userDetail()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const searchParams = new URLSearchParams(window.location.search)
  let initialStartDate = searchParams.get("startDate")
  let initialEndDate = searchParams.get("endDate")
  const location = useLocation()
  let machineList = location?.state?.machineId
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [washTabelData, setWashTabelData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [totalRecord, setTotalRecord] = useState(0)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [washTypeData, setWashType] = useState()
  const [washTypeCount, setWashTypeCount] = useState()
  const [resourcesSortIcon, setResourcesSortIcon] = useState(true)
  const [sortKey, setSortKey] = useState("")
  const [sortType, setSortType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [latestDate, setLatestDate] = useState("")
  const [employeePermission, setEmployeePermission] = useState()
  const [washDate, setWashDate] = useState({
    initialEndDate: initialEndDate,
    initialStartDate: initialStartDate
  })
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  useEffect(() => {
    getOutlet()
    getWashCount()
    getAllpermission()
  }, [])
  useEffect(() => {
    getMachines()
  }, [dropDownOutletData?.length])
  useEffect(() => {
    getWashCount()
  }, [searchQuery, filterUpdate, dropDownOutletData, dropDownMachineData])

  useEffect(() => {
    washTabelData?.length > 0 && setLatestDate(washTabelData[0]?.AddDate)
  }, [washTabelData?.length])

  useEffect(() => {
    if (machineList) {
      setDropDownMachineData(machineList)
    }
  }, [])

  useEffect(() => {
    getWashdetails()
  }, [
    searchQuery,
    itemsPerPage,
    currentPage,
    filterUpdate,
    dropDownOutletData,
    dropDownMachineData,
    sortType
  ])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilter = (startDate, endDate, selectedWashType) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setFilterUpdate(filterUpdate + 1)
    setWashType(selectedWashType)
    setOpenDrawer(false)
    setWashDate({ initialEndDate: null, initialStartDate: null })
  }

  const handleResourceSorting = () => {
    setResourcesSortIcon(!resourcesSortIcon)
    setSortKey("WashTime")
    setSortType(resourcesSortIcon ? "DESC" : "ASC")
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  function createData(
    srn,
    sku,
    outlet,
    machine,
    washType,
    price,
    shampoo,
    foam,
    wax,
    electricity,
    washTime
  ) {
    return {
      srn,
      sku,
      outlet,
      machine,
      washType,
      price,
      shampoo,
      foam,
      wax,
      electricity,
      washTime
    }
  }

  const handleNavigate = (id, route) => {
    navigate(`${route}${id}`)
  }

  let washData = []

  washTabelData.map((list, index) => {
    return washData.push(
      createData(
        index + 1,
        <Box key={list?.transactionGuid}>{list?.SkuNumber}</Box>,
        list?.machine?.outlet?.name,
        list?.machine?.name || "- -",
        list?.washType?.Name,
        list?.machineWallet?.totalAmount,
        list?.ShampooUsed,
        list?.FoamUsed,
        list?.WaxUsed,
        list?.ElectricityUsed,
        moment(list?.AddDate).format("DD/MM/YYYY hh:mm A")
      )
    )
  })

  function handlecloseFilter() {
    setOpenDrawer(false)
  }

  const getMachines = async () => {
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const response = await ManageWashService.getMachines(params)

    if (response.success && response.code === 200) {
      const key = "machineGuid"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setMachines(sortedData)
      if (sortedData?.length === 1) {
        setDropDownMachineData(sortedData)
      }
    } else {
      Toast.showErrorToast(`${response.message}`)
    }
  }

  const getOutlet = async () => {
    const params = [`?dealerIds=${userID}`]
    const response = await ManageWashService.getOutlet(params)
    if (response.success && response.code === 200) {
      const key = "outletId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data?.outlets)
      setOutlet(sortedData)
      if (sortedData?.length === 1) {
        setDropDownOutletData(sortedData)
      }
    } else {
      Toast.showErrorToast(`${response.message}`)
    }
  }

  const getWashdetails = async () => {
    setIsLoading(true)
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: dropDownMachineData.map((item) => {
          return item?.value
        }),
        oemIds: [],
        cityIds: [],
        stateIds: [],
        regionIds: [],
        dealerIds: [],
        outletIds: dropDownOutletData.map((item) => {
          return item?.value
        }),
        washTypeIds: washTypeData
      },
      search: searchQuery,
      sort_by: {
        key: sortKey,
        type: sortType
      },
      limit: itemsPerPage,
      offset: currentPage
    }

    let washResponse = await ManageWashService.getWashList(payLoad)
    if (washResponse.code === 200 && washResponse.success) {
      setWashTabelData(washResponse?.data?.records)
      setTotalRecord(washResponse?.data?.pagination?.totalItems)
      // setWashTypeCount(washResponse?.data?.washTypeCount)
      setIsLoading(false)
    } else {
      setWashTabelData([])
      setTotalRecord(0)
      // setWashTypeCount()
      setIsLoading(false)
    }
  }

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "manage washes")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  const getWashCount = async () => {
    setIsLoading(true)
    const data = {}
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: dropDownMachineData.map((item) => {
          return item?.value
        }),

        oemIds: [],
        cityIds: [],
        stateIds: [],
        regionIds: [],
        dealerIds: [],
        outletIds: dropDownOutletData.map((item) => {
          return item?.value
        }),
        washTypeIds: washTypeData
      },
      search: searchQuery
    }
    let washCountResponse = await ManageWashService.getWashTypeCount(payLoad)
    if (washCountResponse?.code === 200 && washCountResponse?.success) {
      washCountResponse?.data?.records.forEach((item) => {
        const name = item?.Name?.toLowerCase()
        if (name === "gold") {
          data.gold = data.gold ? data.gold + Number(item?.count) : Number(item?.count)
        } else if (name === "silver") {
          data.silver = data.silver ? data.silver + Number(item?.count) : Number(item?.count)
        } else if (name === "platinum") {
          data.platinum = data.platinum ? data.platinum + Number(item?.count) : Number(item?.count)
        } else {
          data.other = data.other ? data.other + Number(item?.count) : Number(item?.count)
        }
      })
      data.total =
        parseInt(data?.gold || 0) + parseInt(data?.silver || 0) + parseInt(data?.platinum || 0)
      setWashTypeCount(data)
      setIsLoading(false)
    } else {
      setWashTypeCount()
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: dropDownMachineData.map((item) => {
          return item?.value
        }),
        oemIds: [],
        cityIds: [],
        stateIds: [],
        regionIds: [],
        dealerIds: [],
        outletIds: dropDownOutletData.map((item) => {
          return item?.value
        }),
        washTypeIds: washTypeData
      }
    }
    const response = await ManageWashService.downloadWashList(payLoad)
    if (response.code == 200 && response.success) {
      const a = document.createElement("a")
      a.href = response?.data?.records
      a.download = "washes.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setIsLoading(false)
      Toast.showInfoToast(`CSV Downloaded succesfully`)
    } else {
      setIsLoading(false)
    }
  }

  const washCountData = [
    {
      id: 1,
      washType: "Total Washes",
      count: washTypeCount?.total ? washTypeCount?.total : 0,
      color: theme.palette.secondary.main
    },
    {
      id: 2,
      washType: "Silver Washes",
      count: washTypeCount?.silver ? washTypeCount?.silver : 0,
      color: theme.palette.background.pink1
    },
    {
      id: 3,
      washType: "Gold Washes",
      count: washTypeCount?.gold ? washTypeCount?.gold : 0,
      color: theme.palette.secondary.main
    },
    {
      id: 4,
      washType: "Platinum Washes",
      count: washTypeCount?.platinum ? washTypeCount?.platinum : 0,
      color: theme.palette.background.pink1
    }
  ]

  const columns = [
    {
      id: "srn",
      label: "Sr No.",
      minWidth: 100
    },
    {
      id: "sku",
      label: "SKU",
      minWidth: 100
    },
    {
      id: "outlet",
      label: "Service Center",
      minWidth: 100
    },
    {
      id: "machine",
      label: "Machine",
      minWidth: 100
    },
    {
      id: "washType",
      label: "Wash type",
      minWidth: 100
    },
    {
      id: "price",
      label: "Price (INR) Incl. GST",
      minWidth: 100
    },

    {
      id: "shampoo",
      label: "Shampoo Used (ml)",
      minWidth: 100
    },
    {
      id: "foam",
      label: "Foam Used (ml)",
      minWidth: 100
    },
    {
      id: "wax",
      label: "Wax Used (ml)",
      minWidth: 100
    },
    {
      id: "electricity",
      label: "Electricity Used (kwh)",
      minWidth: 100
    },
    {
      id: "washTime",
      label: (
        <Box className={styles.tabel_header}>
          <Box>Wash Time</Box>
          <IconButton onClick={handleResourceSorting}>
            {resourcesSortIcon ? (
              <ArrowUpwardOutlinedIcon color="primary" />
            ) : (
              <ArrowDownwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 100
    }
  ]

  return (
    <>
      <Box>
        {washData ? (
          <Fragment>
            <Box className={styles["wash_header_box"]} sx={{ mt: "1.6rem", mb: "1.6rem" }}>
              {washCountData.map((item, i) => {
                return (
                  <Box
                    key={i}
                    className={styles["wash_count_box"]}
                    sx={{ backgroundColor: item.color }}>
                    <Typography variant="p2" component={"div"}>
                      {item.washType}
                    </Typography>
                    <Typography variant="h6" component={"div"}>
                      {item.count}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
            <CommonHeader
              showDropDown1={{
                data: outletData,
                handleDropDown: (val) => {
                  setDropDownOutletData(val)
                },
                value: dropDownOutletData
              }}
              showDropDown2={{
                data: machines,
                handleDropDown: (val) => {
                  setDropDownMachineData(val)
                },
                value: dropDownMachineData
              }}
              isFilterUsed={isFilterUsed}
              heading="Washes"
              searchEnabled={true}
              filterEnabled={true}
              setQuery={setQuery}
              handleDrawer={handleDrawer}
              searchQuery={searchQuery}
              downloadEnabled={
                user?.role == "employee"
                  ? employeePermission?.exportPermission
                    ? true
                    : false
                  : true
              }
              handleDownload={handleDownload}
              setCurrentPage={setCurrentPage}
              headerDate={!startDate && !endDate && !washTypeData && latestDate}
              badgeData={totalRecord}
              selectedDate={
                washDate?.initialStartDate
                  ? washDate
                  : { initialStartDate: startDate, initialEndDate: endDate }
              }
              isMobile={isMobile}
            />
            <Box sx={{ mt: "1.6rem", mb: "1.6rem" }}>
              <ListingTable
                navigationHandler={(list) => {
                  handleNavigate(list?.sku?.key, `/${user?.role}/wash-list/`)
                }}
                columns={columns}
                tableData={washData}
                cursor="pointer"
              />
            </Box>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
            />
            <FilterDrawer
              showUsedFilter={showUsedFilter}
              moduleType={true}
              open={openDrawer}
              handleDrawer={handleDrawer}
              handleFilter={handleFilter}
              handlecloseFilter={handlecloseFilter}
              onLoadDate={washDate?.initialStartDate ? washDate : getMonthDays()}
            />
          </Fragment>
        ) : (
          <Fragment>
            <CommonHeader heading="Manage Washes" headingStyle={{ ...{ variant: "h7" } }} />
            <EmptyState imgSrc={ManageWashEmptyPlaceholder} />
          </Fragment>
        )}
      </Box>
      {isLoading && <AppLoader />}
    </>
  )
}

export default WashList
