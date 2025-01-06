import { Box, Grid, Typography } from "@mui/material"
import Toast from "components/utilities-components/Toast/Toast"
import { DealerService } from "network/dealerService"
import React, { useEffect, useState } from "react"
import ArrowUpwardOutlinedIcon from "assets/images/icons/sortUpperIcon.svg"
import { useStyles } from "./EmployeeListStyles"
import moment from "moment"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import ListingTable from "components/utilities-components/ListingTable"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import PaginationComponent from "components/utilities-components/Pagination"
import { coreAppActions } from "redux/store"
import { useDispatch } from "react-redux"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteDealer from "assets/images/placeholders/deleteDealer.webp"
import PopupModal from "components/PopupModal"
import SearchBar from "components/utilities-components/Search"
import { useNavigate } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

function createData(employeeid, name, roletype, emailid, phonenumber, status, addedon, action) {
  return {
    employeeid,
    name,
    roletype,
    emailid,
    phonenumber,
    status,
    addedon,
    action
  }
}

// const listData = [
//   {
//     id: "1",
//     username: "asd",
//     isActive: true,
//     outlets: "890",
//     email: "p@gmail.com",
//     phone: "+90121312"
//   }
// ]

const EmployeeList = ({ dealerId, disableDelete, isDisableDelete }) => {
  const dispatch = useDispatch()
  const user = userDetail()
  const styles = useStyles()
  const navigate = useNavigate()
  const [totalRecord, setTotalRecord] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [resourcesSortIcon, setResourcesSortIcon] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [popUp, setPopUp] = useState(null)
  const [listData, setListData] = useState()
  const [sortType, setSortType] = useState("NEW")
  const [item, setItem] = useState()
  const [loader, setLoader] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getEmplyoeeList()
  }, [sortType, searchQuery, itemsPerPage, currentPage])

  useEffect(() => {
    setTotalRecord(10)
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

  const handleResourceSorting = () => {
    setResourcesSortIcon(!resourcesSortIcon)
    setSortType(resourcesSortIcon ? "OLD" : "NEW")
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleDeactivate = async () => {
    setLoader(true)
    let userID = [item?.userId]
    const payload = { isActive: !item?.isActive }
    const response = await DealerService.deactivateEmployee(payload, userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getEmplyoeeList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }
  const handleDeleteEmployee = async () => {
    setLoader(true)
    let userID = [item?.userId]

    const response = await DealerService.deleteEmployee(userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      getEmplyoeeList()
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const editEmployee = (list) => {
    navigate(`/${user.role}/edit-employee/${dealerId}`, {
      state: { data: list, dealerId: dealerId }
    })
  }

  const deleteEmployee = (item) => {
    disableDelete(true)
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const deactivatedEmployee = (item) => {
    disableDelete(true)
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  // get employee list

  const getEmplyoeeList = async () => {
    setLoader(true)
    const param = {
      dealerId: dealerId,
      sort: sortType,
      search: searchQuery,
      offset: currentPage,
      limit: itemsPerPage
    }

    const response = await DealerService.getEmployeeList(param)
    if (response.success && response.code === 200) {
      setListData(response?.data?.employees)
      setTotalRecord(response?.data?.pagination?.totalItems)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  let creatRow = listData?.map((list) => {
    return createData(
      list?.uniqueId,
      list?.username,
      list?.subRole?.name,
      list?.email || "- -",
      list?.phone,
      <Typography variant="p2" color={list?.isActive == true ? "text.green" : "error.main"}>
        {list?.isActive ? "Active" : "Inactive"}
      </Typography>,
      moment(list?.createdAt).format("DD/MM/YY"),
      <KebabMenu
        editItem={() => {
          editEmployee(list)
        }}
        deleteItem={() => {
          deleteEmployee(list)
        }}
        deactivateItem={() => {
          deactivatedEmployee(list)
        }}
        list={list}
        hideActivate={false}
        hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
        hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
      />
    )
  })

  let popupMap = {
    deactivate: (
      <PopUpChild
        heading={`${item?.isActive ? "Deactivate" : "Activate"} This Employee?`}
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
        subHeading={`Are you sure you want to delete this Employee?`}
        heading={`Remove Employee ?`}
        handleClose={handleClose}
        src={DeleteDealer}
        handleClick={handleDeleteEmployee}
      />
    )
  }

  const columns = [
    {
      id: "employeeid",
      label: "Employee ID"
    },
    {
      id: "name",
      label: "Name"
    },
    {
      id: "roletype",
      label: "Role Type"
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
      id: "status",
      label: "Status"
    },

    {
      id: "addedon",
      label: (
        <Box sx={styles.tableHeader}>
          <Box>Added On</Box>
          <Box onClick={handleResourceSorting}>
            {resourcesSortIcon ? (
              <img
                src={ArrowUpwardOutlinedIcon}
                style={{ padding: "5px", cursortableHeader: "pointer" }}
                alt="upArrow"
              />
            ) : (
              <img
                src={ArrowUpwardOutlinedIcon}
                style={{ padding: "5px", cursor: "pointer", transform: "rotate(180deg)" }}
                alt="upArrow"
              />
            )}
          </Box>
        </Box>
      )
    },
    {
      id: "action",
      label: "Action"
    }
  ]
  return (
    <>
      <Grid sx={styles.employeeBox} container>
        <Grid item xs={12}>
          <CommonHeader
            buttonStyle={{ marginLeft: "20px" }}
            width="auto"
            innerTableHeader={true}
            heading="Employees"
            btnTxt={"Create Employee Profile"}
            noPlusBtn={false}
            isButtonVisible={user.role === "subadmin" ? subAdminPermission?.createPermission : true}
            handleClick={() => navigate(`/${user.role}/create-employee/${dealerId}`)}
          />
        </Grid>
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
        <Grid sx={styles.tableBox} xs={12} item>
          <ListingTable columns={columns} tableData={creatRow} />
          <Grid sx={styles.topMargin}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Employee"}
            />
          </Grid>
          {isDisableDelete && <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>}
        </Grid>
        {loader && <AppLoader />}
      </Grid>
    </>
  )
}

export default EmployeeList
