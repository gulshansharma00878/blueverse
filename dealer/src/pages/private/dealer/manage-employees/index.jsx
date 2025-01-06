// INFO : This page will render listing for dealer employees
import React, { useEffect, useState } from "react"
import ListingTable from "components/utitlities-components/ListingTable"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import Box from "@mui/system/Box"
import IconButton from "@mui/material/IconButton"
import { ManageEmployeeService } from "network/manageEmployeesService"
import AppLoader from "components/Loader/AppLoader"
import { dateMonthFormat } from "helpers/app-dates/dates"
import styles from "./manageEmployees.module.scss"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import PaginationComponent from "components/utitlities-components/Pagination"
import { useNavigate } from "react-router-dom"
import Toast from "components/utitlities-components/Toast/Toast"
import { userDetail } from "hooks/state"

function createData(userId, uniqueId, username, roleType, emailId, phoneNo, addedon) {
  return {
    userId,
    uniqueId,
    username,
    roleType,
    emailId,
    phoneNo,
    addedon
  }
}

const ManageEmployees = () => {
  const [sortingDescending, setSortingDescending] = useState(true)
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navigate = useNavigate()
  const user = userDetail()

  useEffect(() => {
    fetchEmployeesList()
  }, [currentPage, itemsPerPage, searchQuery, sortingDescending])

  async function fetchEmployeesList() {
    setIsLoading(true)
    const param = [
      `?offset=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&sort=${
        sortingDescending ? "NEW" : "OLD"
      }`
    ]
    const response = await ManageEmployeeService.getEmployeeList(param)

    if (response.success && response.code === 200) {
      //   console.log("Response ==> ", response?.data?.employees)
      // Toast.showInfoToast(response?.message)
      let employees = response?.data?.employees
      let pagination = response?.data?.pagination

      if (employees) {
        let data = employees.map((item) =>
          createData(
            item?.userId,
            item?.uniqueId,
            item?.username,
            item?.subRole?.name,
            item?.email,
            item?.phone,
            dateMonthFormat(item?.createdAt, "DD/MM/YYYY")
          )
        )
        setTableData(data)
      }
      if (pagination) {
        setCurrentPage(pagination?.currentPage)
        setTotalPages(pagination?.totalPages)
        setTotalRecords(pagination?.totalItems)
        setItemsPerPage(pagination?.perPage)
      }
    } else {
      Toast.showErrorToast(response?.message)
    }
    setIsLoading(false)
  }

  const columns = [
    {
      id: "uniqueId",
      label: "ID"
    },
    {
      id: "username",
      label: "Name"
    },
    {
      id: "roleType",
      label: "Role Type"
    },
    {
      id: "emailId",
      label: "Email Id"
    },
    {
      id: "phoneNo",
      label: "Phone Number"
    },
    {
      id: "addedon",
      label: (
        <Box className={styles["addedOn"]}>
          <Box>Added On</Box>
          <IconButton
            onClick={() => {
              setSortingDescending((prev) => !prev)
            }}>
            {sortingDescending ? <ArrowDownwardOutlinedIcon /> : <ArrowUpwardOutlinedIcon />}
          </IconButton>
        </Box>
      )
    }
  ]

  const navigationHandler = (row) => {
    navigate(`/${user?.role}/manage-employees/details/` + row?.userId)
  }

  return (
    <Box>
      <Box className={styles["topHeader"]}>
        <CommonHeader
          heading="Manage Employees"
          badgeData={tableData?.length}
          searchEnabled={true}
          searchQuery={searchQuery}
          setQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
        />
      </Box>
      <Box>
        <ListingTable
          cursor="pointer"
          columns={columns}
          tableData={tableData}
          navigationHandler={navigationHandler}
        />
      </Box>
      <Box className={styles["paginationBox"]}>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecord={totalRecords}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => setItemsPerPage(val)}
          onPageChange={(val) => setCurrentPage(val)}
          label="Employees"
        />
      </Box>
      {isLoading && <AppLoader />}
    </Box>
  )
}

export default ManageEmployees
