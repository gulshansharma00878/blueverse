/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import EmptyState from "components/utilities-components/EmptyState"
import Box from "@mui/system/Box"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import dealerEmptyState from "assets/images/placeholders/dealerEmptyState.webp"
import { useNavigate } from "react-router-dom"
import { useStyles } from "../utilities-components/ListingTable/TableListStyles"
import { Badge, Grid, IconButton, Typography } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import SearchBar from "components/utilities-components/Search"
import PaginationComponent from "components/utilities-components/Pagination"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { coreAppActions, dealerActions } from "redux/store"
import { useDispatch } from "react-redux"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteDealer from "assets/images/placeholders/deleteDealer.webp"
import Toast from "components/utilities-components/Toast/Toast"
import { DealerService } from "network/dealerService"
import moment from "moment"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import useMediaQuery from "@mui/material/useMediaQuery"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import FilterIcon from "assets/images/icons/filterIcon.svg"
import { getTotalRegion } from "helpers/Functions/dealerUtilities"

let setTotalLength = 0

function createData(
  dealerid,
  uniqueId,
  dealername,
  outletcount,
  walletbalance,
  status,
  emailid,
  phonenumber,
  region,
  oem,
  kyc,
  addedon,
  action
) {
  return {
    dealerid,
    uniqueId,
    dealername,
    outletcount,
    walletbalance,
    status,
    emailid,
    phonenumber,
    region,
    oem,
    kyc,
    addedon,
    action
  }
}

const DealerPanel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const styles = useStyles()
  const user = userDetail()
  const searchParams = new URLSearchParams(window.location.search)
  let initialStartDate = searchParams.get("startDate")
  let initialEndDate = searchParams.get("endDate")
  const [totalRecord, setTotalRecord] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [listData, setListData] = useState()
  const [popUp, setPopUp] = useState(null)
  const [item, setItem] = useState()
  const [loader, setLoader] = useState(true)
  const [resourcesSortIcon, setResourcesSortIcon] = useState(false)
  const [sortType, setSortType] = useState("NEW")
  const [subAdminPermission, setSubadminPermission] = useState()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [oemId, setOemId] = useState()
  const [selectedRegion, setSelectedRegion] = useState()
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [dealerDate, setDealerDate] = useState({
    initialEndDate: initialEndDate,
    initialStartDate: initialStartDate
  })
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  const isMobile = useMediaQuery("(max-width:600px)")

  useEffect(() => {
    getDealerList()
  }, [itemsPerPage, currentPage, searchQuery, sortType, dealerDate])

  useEffect(() => {
    setTotalRecord(10)
  }, [])

  useEffect(() => {
    dispatch(dealerActions.setDealerTabActive(0))
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "dealer")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  // Resetting dealerActions States as they should be empty when on listing page
  useEffect(() => {
    dispatch(dealerActions.resetDealerStates())
  }, [])

  const deleteDealer = (item) => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const handleResourceSorting = () => {
    setResourcesSortIcon(!resourcesSortIcon)
    setSortType(resourcesSortIcon ? "NEW" : "OLD")
  }

  const deactivatedDealer = (item) => {
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const createDealerHandler = () => {
    navigate(`/${user?.role}/dealers/create-dealer`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  const handleDeleteDealer = async () => {
    setLoader(true)
    let userID = [item?.userId]

    const response = await DealerService.deleteDealer(userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getDealerList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const editDealer = (list) => {
    navigate(`/${user?.role}/dealers/edit-dealer/` + list?.userId)
  }

  const handleDeactivate = async () => {
    setLoader(true)
    let userID = [item?.userId]
    const payload = { is_active: !item?.isActive, username: item?.username }
    const response = await DealerService.deactivateDealer(payload, userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getDealerList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handleNavigate = (list) => {
    navigate(`/${user.role}/dealer-detail/${list?.dealerid}`)
  }

  const handlecloseFilter = () => {
    setOpenDrawer(false)
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
    selectedMachine,
    selectedMemoFilter,
    selectedMachineStatusFilter,
    selectedOutlets,
    selectedTransactionType,
    selectedSource
  ) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
    setOemId(selectedOEM)
    setSelectedRegion(selectedRegion)
    setDealerDate({ initialEndDate: "", initialStartDate: "" })
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const getDealerList = async () => {
    setLoader(true)
    const param = {
      offset: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      sort: sortType,
      startDate: dealerDate?.initialStartDate != "" ? dealerDate?.initialStartDate : startDate,
      endDate: dealerDate?.initialEndDate != "" ? dealerDate?.initialEndDate : endDate,
      oemIds: oemId?.map((item) => item).join(","),
      regionIds: selectedRegion?.join(",")
    }

    const response = await DealerService.getDealerList(param)
    if (response.success && response.code === 200) {
      if (response?.data?.pagination?.totalItems != 0) {
        // length of the list
        setTotalLength = response?.data?.pagination?.totalItems
      } else {
        if (response?.data?.pagination?.totalItems == 0 && searchQuery != "") {
          // when we are searching in list
          setTotalLength = 1
        } else {
          // when we are not searching
          setTotalLength = 0
        }
      }
      setTotalRecord(response?.data?.pagination?.totalItems)
      setListData(response?.data?.dealers)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
    setLoader(false)
  }

  let creatRow = listData?.map((list) => {
    return createData(
      list?.userId,
      list?.uniqueId ? list?.uniqueId : "-",
      list?.username,
      list?.outlets?.length,
      formatCurrency(list?.machinesWalletBalance, "") || "- -",
      <Typography sx={list?.isActive ? styles.active : styles.inactive}>
        {list?.isActive ? "Active" : "Inactive"}
      </Typography>,
      list?.email,
      list?.phone,
      getTotalRegion(list?.outlets),
      list?.oem?.name || "NA",
      list?.isKycDone ? "Done" : "Pending",
      moment(list?.createdAt).format("DD/MM/YY"),
      <KebabMenu
        editItem={(list) => {
          editDealer(list)
        }}
        deleteItem={(item) => {
          deleteDealer(item)
        }}
        deactivateItem={(item) => {
          deactivatedDealer(item)
        }}
        list={list}
        hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
        hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
      />
    )
  })

  let popupMap = {
    deactivate: (
      <PopUpChild
        heading={`${item?.isActive ? "Deactivate" : "Activate"} This Id ?`}
        subHeading={`Do you want to ${item?.isActive ? "Deactivate" : "Activate"} ${
          item?.uniqueId
        } - ${item?.username} ?`}
        handleClose={handleClose}
        src={DeactivatePopUp}
        handleClick={handleDeactivate}
      />
    ),
    delete: (
      <PopUpChild
        height={506}
        subHeading={`Do you want to delete ${item?.uniqueId}- ${item?.username} ?`}
        heading={`Remove this ID?`}
        handleClose={handleClose}
        src={DeleteDealer}
        handleClick={handleDeleteDealer}
      />
    )
  }

  const columns = [
    {
      id: "uniqueId",
      label: "Dealership ID"
    },
    {
      id: "dealername",
      label: "Dealership Name"
    },
    {
      id: "outletcount",
      label: "Service Center Count"
    },
    {
      id: "walletbalance",
      label: "Wallet Balance"
    },
    {
      id: "status",
      label: "Status"
    },
    {
      id: "emailid",
      label: "Email ID"
    },
    {
      id: "phonenumber",
      label: "Phone Number"
    },
    {
      id: "region",
      label: "Region"
    },
    {
      id: "oem",
      label: "OEM"
    },
    {
      id: "kyc",
      label: "KYC"
    },
    {
      id: "addedon",
      label: (
        <Box className={"tabel_header"}>
          <Box>Added On</Box>
          <IconButton onClick={handleResourceSorting}>
            {resourcesSortIcon ? <ArrowUpwardOutlinedIcon /> : <ArrowDownwardOutlinedIcon />}
          </IconButton>
        </Box>
      )
    },
    {
      id: "action",
      label: "Action"
    }
  ]
  return (
    <Box>
      <CommonHeader
        heading="Dealership Management"
        btnTxt={"Create Dealership Profile"}
        noPlusBtn={false}
        handleClick={createDealerHandler}
        isButtonVisible={user.role === "subadmin" ? subAdminPermission?.createPermission : true}
        isMobile={isMobile}
        isFilterUsed={isFilterUsed}
      />
      <Grid container>
        <Grid justifyContent="space-between" alignItems="center" container sx={styles.searchBox}>
          <Grid item>
            <Typography sx={styles.records} variant="p2">
              {totalRecord} Records
            </Typography>
          </Grid>
          <Grid
            item
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
            <SearchBar
              setQuery={setQuery}
              searchQuery={searchQuery}
              setCurrentPage={setCurrentPage}
            />
            <Badge color="primary" variant="dot" invisible={!isFilterUsed}>
              <img src={FilterIcon} onClick={handleDrawer} style={styles.icon} />
            </Badge>{" "}
          </Grid>
        </Grid>
        <Grid sx={styles.topMargin} xs={12} item>
          <ListingTable columns={columns} tableData={creatRow} navigate={handleNavigate} />
          <Grid sx={styles.topMargin}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Dealership"}
            />
          </Grid>
          <FilterDrawer
            open={openDrawer}
            handleDrawer={handleDrawer}
            handleFilter={handleFilter}
            handlecloseFilter={handlecloseFilter}
            machineFilter={false}
            dealerFilter={false}
            stateFilter={false}
            cityFilter={false}
            regionFilter={true}
            onLoadDate={dealerDate}
            moduleType={true}
            showUsedFilter={showUsedFilter}
          />
        </Grid>
        <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
      </Grid>
      {loader && <AppLoader />}
    </Box>
  )
}

export default DealerPanel
