import React, { useEffect, useState } from "react"
import { Box, Grid, IconButton, Typography, useTheme } from "@mui/material"
import { AgentService } from "network/agentService"
import { useNavigate } from "react-router-dom"
import Toast from "components/utilities-components/Toast/Toast"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import { useStyles } from "components/utilities-components/ListingTable/TableListStyles.js"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import AgentManagement from "../CreateAgent/AgentManagement"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { agentActions, coreAppActions } from "redux/store"
import { useDispatch } from "react-redux"
import SearchBar from "components/utilities-components/Search"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteAgent from "assets/images/placeholders/deleteAgent.webp"
import moment from "moment"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import useMediaQuery from "@mui/material/useMediaQuery"

let setTotalLength = 0

function createData(AgentID, AgentName, Status, EmailID, PhoneNumber, AddedOn, Action) {
  return {
    AgentID,
    AgentName,
    Status,
    EmailID,
    PhoneNumber,
    AddedOn,
    Action
  }
}

function AgentList() {
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [listData, setListData] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [loader, setLoader] = useState(false)
  const [item, setItem] = useState()
  const [popUp, setPopUp] = useState(null)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [resourcesSortIcon, setResourcesSortIcon] = useState({ name: false, addedOn: false })
  const [sortType, setSortType] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    getAgentList()
  }, [itemsPerPage, currentPage, searchQuery, sortType])

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "agent")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const showTextColor = (key) => {
    switch (key) {
      case true:
        return styles.active
      case false:
        return styles.inactive
      default:
        break
    }
  }

  const handleClick = () => {
    navigate(`/${user.role}/agent/add`)
  }

  // eslint-disable-next-line no-unused-vars
  const editAgent = (list) => {
    navigate(`/${user.role}/agent/edit`)
    dispatch(agentActions?.setAgentDetail(list))
  }

  const deactivateAgent = (item) => {
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const deleteAgent = (item) => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const handleDeleteAgent = async () => {
    let userID = [item?.userId]
    setLoader(true)
    const response = await AgentService.deleteAgent(userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getAgentList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleDeactivate = async () => {
    setLoader(true)
    let userID = [item?.userId]
    const payload = { is_active: !item?.isActive }
    const response = await AgentService.deactivateAgent(payload, userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getAgentList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handleResourceSorting = () => {
    setResourcesSortIcon({ ...resourcesSortIcon, name: !resourcesSortIcon.name, addedOn: false })
    setSortType(resourcesSortIcon.name ? { username: "DESC" } : { username: "ASC" })
  }

  const handleResourceSortingAddedOn = () => {
    setResourcesSortIcon({ ...resourcesSortIcon, addedOn: !resourcesSortIcon.addedOn, name: false })
    setSortType(resourcesSortIcon.addedOn ? { createdAt: "DESC" } : { createdAt: "ASC" })
  }

  const getAgentList = async () => {
    setLoader(true)
    const param = {
      offset: currentPage,
      limit: itemsPerPage,
      username: searchQuery,
      sort_key: Object?.keys(sortType)[0],
      sort_type: sortType[Object?.keys(sortType)[0]]
    }

    const response = await AgentService.getAgentList(param)
    if (searchQuery != "") {
      setCurrentPage(1)
    }
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
      setListData(response?.data?.records)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

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
        subHeading={`Do you want to delete ${item?.uniqueId}- ${item?.username} ?`}
        heading={`Remove this ID?`}
        handleClose={handleClose}
        src={DeleteAgent}
        handleClick={handleDeleteAgent}
      />
    )
  }

  const columns = [
    {
      id: "AgentID",
      label: "Agent ID"
    },
    {
      id: "AgentName",
      label: (
        <Box className={"tabel_header"}>
          <Box>Agent Name</Box>
          <IconButton onClick={handleResourceSorting}>
            {resourcesSortIcon.name ? <ArrowUpwardOutlinedIcon /> : <ArrowDownwardOutlinedIcon />}
          </IconButton>
        </Box>
      )
    },
    {
      id: "Status",
      label: "Status"
    },
    {
      id: "EmailID",
      label: "Email ID"
    },
    {
      id: "PhoneNumber",
      label: "Phone Number"
    },
    {
      id: "AddedOn",
      label: (
        <Box className={"tabel_header"}>
          <Box>Added On</Box>
          <IconButton onClick={handleResourceSortingAddedOn}>
            {resourcesSortIcon.addedOn ? (
              <ArrowUpwardOutlinedIcon />
            ) : (
              <ArrowDownwardOutlinedIcon />
            )}
          </IconButton>
        </Box>
      )
    },
    {
      id: "Action",
      label: "Action"
    }
  ]

  const creatRow = listData?.map((list) => {
    return createData(
      list?.uniqueId,
      list?.username,
      <Typography sx={showTextColor(list?.isActive)}>
        {list?.isActive ? "Active" : "Inactive"}
      </Typography>,
      list?.email,
      list?.phone,
      moment(list?.createdAt).format("DD/MM/YY"),
      <KebabMenu
        editItem={(list) => {
          editAgent(list)
        }}
        deleteItem={(list) => {
          deleteAgent(list)
        }}
        deactivateItem={(item) => {
          deactivateAgent(item)
        }}
        list={list}
        hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
        hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
      />
    )
  })

  return (
    <>
      {setTotalLength > 0 ? (
        <Grid container>
          <CommonHeader
            handleClick={handleClick}
            heading="Agent Management"
            btnTxt="Create Agent Profile"
            btnType="normal"
            isButtonVisible={user.role === "subadmin" ? subAdminPermission?.createPermission : true}
            isMobile={isMobile}
          />
          <Grid justifyContent="space-between" alignItems="center" container sx={styles.searchBox}>
            <Grid item>
              <Typography sx={styles.records} variant="p2">
                {totalRecord} Records
              </Typography>
            </Grid>
            <Grid item>
              <SearchBar setQuery={setQuery} searchQuery={searchQuery} />
            </Grid>
          </Grid>
          <Grid sx={styles.topMargin} xs={12}>
            <ListingTable rowNavigate={false} columns={columns} tableData={creatRow} />
            <Grid sx={styles.topMargin}>
              <PaginationComponent
                currentPage={currentPage}
                totalPages={Math.ceil(totalRecord / itemsPerPage)}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalRecord={totalRecord}
                title={"Agents"}
              />
            </Grid>
          </Grid>
          <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
        </Grid>
      ) : (
        <AgentManagement />
      )}
      {loader && <AppLoader />}
    </>
  )
}

export default AgentList
