/* eslint-disable no-unused-vars*/

import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material"
import { Box, Grid, IconButton, useMediaQuery } from "@mui/material"
import AppLoader from "components/Loader/AppLoader"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { ArrowDownward } from "@mui/icons-material"
import Toast from "components/utitlities-components/Toast/Toast"
import { ServiceRequestService } from "network/serviceRequests"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { useSelector } from "react-redux"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import { userDetail } from "hooks/state"
const sortRequestData = (responseData) => {
  const requiredData = responseData.map((data) => {
    return {
      id: data?.serviceRequestId,
      requestId: data.serviceId,
      machine: data?.machine?.name,
      dealerShip: data?.machine?.outlet?.name,
      date: dateMonthFormat(data?.createdAt, "DD/MM/YYYY hh:mm A")
    }
  })
  return requiredData
}
export const createData = (requestIds, machines, dealerShips, dates) => {
  return { requestIds, machines, dealerShips, dates }
}
const AllServiceRequests = ({ permission = {} }) => {
  const theme = useTheme()
  const user = userDetail()
  const userID = useSelector((state) => state?.app?.user?.userId)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [loading, setLoading] = useState(false)
  const [requestsRaised, setRequestRaised] = useState([])
  const [sort, setSort] = useState("ASC")
  const [totalLength, setTotalLength] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceRequests, setServiceRequests] = useState([])
  const [outletData, setOutlet] = useState([])
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [machines, setMachines] = useState([])

  useEffect(() => {
    fetchOutlets(userID, setOutlets)
  }, [])
  useEffect(() => {
    dropDownOutletData?.length !== 0 && getMachines()
  }, [dropDownOutletData?.length])
  const setOutlets = (outletList) => {
    setOutlet(outletList)
    if (outletList.length === 1) {
      setDropDownOutletData(outletList)
    }
  }
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  useEffect(() => {
    getServiceRequests()
  }, [
    sort,
    searchQuery,
    itemsPerPage,
    currentPage,
    dropDownOutletData?.length,
    dropDownMachineData?.length
  ])

  const columns = [
    {
      id: "requestIds",
      label: "Service ID ",
      minWidth: 350
    },
    {
      id: "machines",
      label: "Machine",
      minWidth: 350
    },

    {
      id: "dealerShips",
      label: "Service Center",
      minWidth: 350
    },

    {
      id: "dates",
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
  const tableData = []
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const exportServiceRequest = async () => {
    const outletIdArrays =
      dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value)
    const outletIdStrings = outletIdArrays.toString()
    const machineIdArrays =
      dropDownMachineData?.length > 0 && dropDownMachineData.map((item) => item?.value)
    const machineIdStrings = machineIdArrays.toString()

    const params = [
      `?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}&outletIds=${outletIdStrings}&machineIds=${machineIdStrings}`
    ]
    const response = await ServiceRequestService.exportServiceRequest(params)
    if (response.code == 200 && response.success) {
      const a = document.createElement("a")
      a.href = response?.data?.records
      a.download = "ServiceRequests.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      Toast.showInfoToast(`${response?.message}`)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  const getServiceRequests = async () => {
    setLoading(true)
    const outletIdArray =
      dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value)
    const outletIdString = outletIdArray.toString()
    const machineIdArray =
      dropDownMachineData?.length > 0 && dropDownMachineData.map((item) => item?.value)
    const machineIdString = machineIdArray.toString()

    const params = [
      `?offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}&outletIds=${outletIdString}&machineIds=${machineIdString}`
    ]
    const response = await ServiceRequestService.getServiceRequest(params)
    if (response?.success && response?.code === 200) {
      const requiredSortedData = sortRequestData(response?.data?.records)
      setServiceRequests(requiredSortedData)
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
  const getMachines = async () => {
    setLoading(true)
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setLoading(false)
  }
  let creatRow =
    serviceRequests &&
    serviceRequests.length > 0 &&
    serviceRequests.map((list, i) => {
      return tableData.push(
        createData(list?.requestId, list?.machine, list?.dealerShip, list?.date)
      )
    })
  return (
    <Grid>
      <Grid item xs={12}>
        {loading && <AppLoader />}
        <CommonHeader
          heading="Service Requests "
          downloadEnabled
          handleDownload={
            user?.role == "employee"
              ? permission?.exportPermission
                ? exportServiceRequest
                : false
              : exportServiceRequest
          }
          showDropDown1={
            outletData?.length > 1 && {
              data: outletData,
              handleDropDown: (val) => {
                setDropDownOutletData(val)
              },
              value: dropDownOutletData,
              placeholder: "Select Service Centre"
            }
          }
          showDropDown2={
            machines?.length > 1 && {
              data: machines,
              handleDropDown: (val) => {
                setDropDownMachineData(val)
              },
              value: dropDownMachineData,
              placeholder: "Select Machines"
            }
          }
          // isMobile={isMobile}
        />{" "}
        <Box sx={{ marginTop: "1rem" }} />
        <ListingTable columns={columns} tableData={tableData} notSticky={true} />
        {totalRecord !== 0 && (
          <Grid container mt={2}>
            <Grid item xs={12}>
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
      </Grid>
    </Grid>
  )
}

export default AllServiceRequests
