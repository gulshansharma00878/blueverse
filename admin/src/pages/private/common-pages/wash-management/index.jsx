import React, { useState, useEffect } from "react"
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material"
import AddIcon from "@mui/icons-material/Add";
import PrimaryButton from "components/utilities-components/Button/CommonButton"

import "./WashList.scss"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "@mui/system"
import { ManageWashService } from "network/manageWashService"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import moment from "moment"
import Toast from "components/utilities-components/Toast/Toast"
import { userDetail } from "hooks/state"
import { dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"
import AppLoader from "components/utilities-components/Loader/AppLoader"

function WashList() {
  const navigate = useNavigate()
  const user = userDetail()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const searchParams = new URLSearchParams(window.location.search)
  let initialStartDate = searchParams.get("startDate")
  let initialEndDate = searchParams.get("endDate")
  const location = useLocation()
  let machineList = location?.state?.machineId
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [washTabelData, setWashTabelData] = useState([])
  const [machineIds, setMachineIds] = useState([])
  const [oemIds, setOemIds] = useState([])
  const [cityIds, setCityIds] = useState([])
  const [stateIds, setStateIds] = useState([])
  const [regionIds, setRegionIds] = useState([])
  const [washTypeIds, setWashTypeIds] = useState([])
  const [dealerIds, setDealerIds] = useState([])
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [resourcesSortIcon, setResourcesSortIcon] = useState(true)
  const [sortKey, setSortKey] = useState("")
  const [sortType, setSortType] = useState("")
  const [washTypeCount, setWashTypeCount] = useState()
  const [loader, setLoader] = useState(false)
  const [latestDate, setLatestDate] = useState("")
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  const [washDate, setWashDate] = useState({
    initialEndDate: initialEndDate,
    initialStartDate: initialStartDate
  })

  useEffect(() => {
    getWashCount()
  }, [searchQuery, filterUpdate, washDate, machineIds])

  useEffect(() => {
    getWashdetails()
  }, [washDate, searchQuery, itemsPerPage, currentPage, filterUpdate, sortType, machineIds])

  useEffect(() => {
    washTabelData?.length > 0 && setLatestDate(washTabelData[0]?.AddDate)
  }, [washTabelData?.length])

  useEffect(() => {
    if (machineList) {
      setMachineIds(
        machineList?.map((item) => {
          return item?.value
        })
      )
    }
  }, [])

  useEffect(() => {
    if (user?.role === "areaManager" || user?.role === "oemManager") {
      getOemForm()
    }
  }, [])

  const getOemForm = () => {
    const oemSet = new Set()
    if (!oemSet.has(user?.oemId)) {
      oemSet.add(user?.oemId)
    }
    setOemIds(Array.from(oemSet))
    setFilterUpdate(filterUpdate + 1)
  }

  const getWashdetails = async () => {
    setLoader(true)
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: machineIds,
        oemIds: oemIds,
        cityIds: cityIds,
        stateIds: stateIds,
        regionIds: regionIds,
        dealerIds: dealerIds,
        washTypeIds: washTypeIds
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
      setLoader(false)
    } else {
      setWashTabelData([])
      setTotalRecord(0)
      setLoader(false)
    }
  }

  const getWashCount = async () => {
    setLoader(true)
    const data = {}
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: machineIds,
        oemIds: oemIds,
        cityIds: cityIds,
        stateIds: stateIds,
        regionIds: regionIds,
        dealerIds: dealerIds,
        washTypeIds: washTypeIds
      },
      search: searchQuery
    }
    let washCountResponse = await ManageWashService.getWashTypeCount(payLoad)
    if (washCountResponse.code === 200 && washCountResponse.success) {
      washCountResponse?.data?.records.forEach((item) => {
        const name = item.Name.toLowerCase()
        if (name === "gold") {
          data.gold = data.gold ? data.gold + Number(item.count) : Number(item.count)
        } else if (name === "silver") {
          data.silver = data.silver ? data.silver + Number(item.count) : Number(item.count)
        } else if (name === "platinum") {
          data.platinum = data.platinum ? data.platinum + Number(item.count) : Number(item.count)
        } else {
          data.other = data.other ? data.other + Number(item.count) : Number(item.count)
        }
      })
      data.total =
        parseInt(data?.gold || 0) + parseInt(data?.silver || 0) + parseInt(data?.platinum || 0)
      setWashTypeCount(data)
      setLoader(false)
    } else {
      setWashTypeCount()
      setLoader(false)
    }
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  const handleFilter = (
    startDate,
    endDate,
    selectedWashType,
    selectedRegion,
    selectedState,
    selectedCity,
    selectedOEM,
    selectedDealer,
    selectedMachine
  ) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setWashTypeIds(selectedWashType)
    setRegionIds(selectedRegion)
    setOemIds(selectedOEM)
    setCityIds(selectedCity)
    setStateIds(selectedState)
    setDealerIds(selectedDealer)
    setMachineIds(selectedMachine)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
    setWashDate({ initialEndDate: null, initialStartDate: null })
  }

  function handlecloseFilter() {
    setOpenDrawer(false)
  }
  const setQuery = (val) => {
    setSearchQuery(val)
  }

  function createData(
    sku,
    dealership,
    oem,
    outlet,
    machine,
    region,
    state,
    city,
    washType,
    price,
    shampoo,
    foam,
    wax,
    electricity,
    washTime
  ) {
    return {
      sku,
      dealership,
      oem,
      outlet,
      machine,
      region,
      state,
      city,
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
  const handleImportNavigate = () => {
    navigate(`import`)
  }

  const handleResourceSorting = () => {
    setResourcesSortIcon(!resourcesSortIcon)
    setSortKey("WashTime")
    setSortType(resourcesSortIcon ? "DESC" : "ASC")
    // handleSorting("resourceName", resourcesSortIcon ? "0" : "1");
  }

  const handleDownload = async () => {
    setLoader(true)
    const payLoad = {
      filters: {
        startDate: washDate?.initialStartDate ? washDate?.initialStartDate : startDate,
        endDate: washDate?.initialEndDate ? washDate?.initialEndDate : endDate,
        machineIds: machineIds,
        oemIds: oemIds,
        cityIds: cityIds,
        stateIds: stateIds,
        regionIds: regionIds,
        dealerIds: dealerIds,
        washTypeIds: washTypeIds
      },
      search: searchQuery
    }
    const response = await ManageWashService.downloadWashList(payLoad)
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

  let washData = []

  // eslint-disable-next-line no-unused-vars
  let creatRow =
    washTabelData &&
    washTabelData.length > 0 &&
    washTabelData.map((list) => {
      return washData.push(
        createData(
          <Box
            sx={{ cursor: "pointer" }}
            onClick={() => handleNavigate(list?.transactionGuid, `/${user?.role}/wash-list/`)}>
            {list?.SkuNumber}
          </Box>,
          list?.machine?.outlet?.dealer?.username,
          list?.machine?.outlet?.dealer?.oem?.name,
          list?.machine?.outlet?.name,
          list?.machine?.name,
          list?.machine?.outlet?.city?.state?.region?.name,
          list?.machine?.outlet?.city?.state?.name,
          list?.machine?.outlet?.city?.name,
          list?.washType?.Name,
          list?.machineWallet?.totalAmount,
          list?.ShampooUsed,
          list?.FoamUsed,
          list?.WaxUsed,
          list?.ElectricityUsed,
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  const columns = [
    {
      id: "sku",
      label: "SKU",
      minWidth: 100
    },
    {
      id: "dealership",
      label: "Dealership",
      minWidth: 100
    },
    {
      id: "oem",
      label: "OEM",
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
      id: "region",
      label: "Region",
      minWidth: 100
    },
    {
      id: "state",
      label: "State",
      minWidth: 100
    },
    {
      id: "city",
      label: "City",
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
        <Box className={"tabel_header"}>
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

  const washCountData = [
    {
      id: 1,
      washType: "Total Washes",
      count: washTypeCount?.total ? washTypeCount?.total : 0,
      color: theme.palette.background.blue7
    },
    {
      id: 2,
      washType: "Silver Washes",
      count: washTypeCount?.silver ? washTypeCount?.silver : 0,
      color: theme.palette.background.gray2
    },
    {
      id: 3,
      washType: "Gold Washes",
      count: washTypeCount?.gold ? washTypeCount?.gold : 0,
      color: theme.palette.background.pink3
    },
    {
      id: 4,
      washType: "Platinum Washes",
      count: washTypeCount?.platinum ? washTypeCount?.platinum : 0,
      color: theme.palette.background.gray3
    }
  ]
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  return (
    <>
      <Box>
        <Box className="wash_header_box" sx={{ mt: "1.6rem", mb: "1.6rem" }}>
          {washCountData.map((item, i) => {
            return (
              <Box key={i} className="wash_count_box" sx={{ backgroundColor: item.color }}>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "last",
            alignItems: "center",
          }}
        >
          {/* <Button
            onClick={handleImportNavigate}
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            sx={{
              width: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          > Import </Button> */}

        </Box>

        <CommonHeader

          heading="Washes"
          searchEnabled={true}
          filterEnabled={true}
          setQuery={setQuery}
          searchQuery={searchQuery}
          handleDrawer={handleDrawer}
          downloadEnabled={totalRecord > 0 ? true : false}
          handleDownload={handleDownload}
          setCurrentPage={setCurrentPage}
          selectedDate={
            washDate?.initialStartDate
              ? washDate
              : { initialStartDate: startDate, initialEndDate: endDate }
          }
          headerDate={
            !startDate &&
            !endDate &&
            washTypeIds?.length === 0 &&
            regionIds?.length === 0 &&
            stateIds?.length === 0 &&
            cityIds?.length === 0 &&
            oemIds?.length === 0 &&
            dealerIds?.length === 0 &&
            machineIds?.length === 0 &&
            latestDate
          }
          isFilterUsed={isFilterUsed}
          isMobile={isMobile}
          importButton={(
            // <Button
            //   onClick={handleImportNavigate}
            //   variant="outlined"  // This creates an outlined button
            //   color="primary"      // Optional: Adds primary color to the button
            //   sx={{ margin: 2 }}  
            //   startIcon={<AddIcon />}
            // >
            //   Import
            // </Button>
            <PrimaryButton
                // variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleImportNavigate}>
                Import
            </PrimaryButton>
          )}
        />


        <Box sx={{ mt: "16px", mb: "16px" }}>
          <ListingTable columns={columns} tableData={washData} rowNavigate={false} />
        </Box>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(totalRecord / itemsPerPage)}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalRecord={totalRecord}
          title={"Washes"}
        />

        <FilterDrawer
          open={openDrawer}
          handleDrawer={handleDrawer}
          handleFilter={handleFilter}
          handlecloseFilter={handlecloseFilter}
          washTypeFilter={true}
          onLoadDate={washDate?.initialStartDate ? washDate : getMonthDays()}
          onLoadMachine={machineList}
          moduleType={true}
          showUsedFilter={showUsedFilter}
        />
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default WashList
