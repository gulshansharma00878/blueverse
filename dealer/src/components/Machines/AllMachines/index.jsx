import { Grid, Typography } from "@mui/material"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import { capitaliseString } from "helpers/Functions/formateString"
import React, { useEffect, useState } from "react"
import { useStyles } from "./AllMachinesStyles"
import { ManageMachinesServices } from "network/manageMachinesServices"
import AppLoader from "components/Loader/AppLoader"
import Toast from "components/utitlities-components/Toast/Toast"
import { sortData } from "components/utitlities-components/Drawer/drawerSort"
import { ManageWashService } from "network/manageWashService"
import { useSelector } from "react-redux"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
import { formatCurrency } from "helpers/Functions/formatCurrency"

function createData(machine, servicecenter, washes, status) {
  return {
    machine,
    servicecenter,
    washes,
    status
  }
}

const columns = [
  {
    id: "machine",
    label: "Machine"
  },
  {
    id: "servicecenter",
    label: "Service Centre"
  },
  {
    id: "washes",
    label: "Washes"
  },
  {
    id: "status",
    label: "Status"
  }
]

function AllMachines() {
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const userID = useSelector((state) => state?.app?.user?.userId)

  const [data, setData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [loader, setLoader] = useState(false)
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])

  useEffect(() => {
    getMachineListing()
  }, [dropDownOutletData, dropDownMachineData])

  useEffect(() => {
    getMachines()
    getOutlet()
  }, [])

  const getMachines = async () => {
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const machineResponse = await ManageWashService.getMachines(params)

    if (machineResponse.success && machineResponse.code === 200) {
      const labelKey = "name"
      const key = "machineGuid"
      const sortedData = sortData(labelKey, key, machineResponse?.data)
      setMachines(sortedData)
      if (sortedData?.length === 1) {
        setDropDownMachineData(sortedData)
      }
    } else {
      Toast.showErrorToast(`${machineResponse.message}`)
    }
  }

  const getOutlet = async () => {
    const params = [`?dealerIds=${userID}`]
    const outletResponse = await ManageWashService.getOutlet(params)
    if (outletResponse.success && outletResponse.code === 200) {
      const labelKey = "name"
      const key = "outletId"
      const sortedData = sortData(labelKey, key, outletResponse?.data?.outlets)
      setOutlet(sortedData)
      if (sortedData?.length === 1) {
        setDropDownOutletData(sortedData)
      }
    } else {
      Toast.showErrorToast(`${outletResponse.message}`)
    }
  }

  const getMachineListing = async () => {
    setLoader(true)
    const param = {
      offset: currentPage,
      limit: itemsPerPage,
      outletIds: dropDownOutletData
        ?.map((item) => {
          return item?.value
        })
        .join(","),
      machineIds: dropDownMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await ManageMachinesServices.machineList(param)

    if (response.success && response.code === 200) {
      setData(response?.data?.machines)
      setTotalRecord(response?.data?.pagination?.totalItems)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const rowData = data?.map((item) => {
    return createData(
      <Typography key={item?.machineGuid} variant="p3" sx={styles.machineName}>
        {item?.name || "NA"}
      </Typography>,
      item?.outlet?.name || "NA",
      formatCurrency(item?.washesCount || 0, ""),
      <Typography variant="p3" color={item?.status == "ACTIVE" ? "text.green" : "text.red1"}>
        {capitaliseString(item?.status) || "NA"}
      </Typography>
    )
  })

  const handleNavigate = (row) => {
    navigate(`/${user?.role}/machines/details/${row?.machine?.key}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <CommonHeader
          showDropDown1={{
            data: outletData,
            handleDropDown: (val) => {
              setDropDownOutletData(val)
            },
            value: dropDownOutletData,
            placeholder: "Select Service Centre"
          }}
          showDropDown2={{
            data: machines,
            handleDropDown: (val) => {
              setDropDownMachineData(val)
            },
            value: dropDownMachineData,
            placeholder: "Select Machines"
          }}
          heading="All Machines"
          badgeData={totalRecord}
          //   searchEnabled={true}
          //   filterEnabled={true}
          //   setQuery={setQuery}
          //   handleDrawer={handleDrawer}
          //   searchQuery={searchQuery}
          // downloadEnabled={
          //   user?.role == "employee" ? (employeePermission?.exportPermission ? true : false) : true
          // }
          // handleDownload={handleDownload}
          // setCurrentPage={setCurrentPage}
          // headerDate={!startDate && !endDate && !washTypeData && latestDate}
        />
      </Grid>
      <Grid item xs={12} sx={{ marginTop: "2rem" }}>
        <ListingTable
          cursor="pointer"
          navigationHandler={handleNavigate}
          columns={columns}
          tableData={rowData}
        />
      </Grid>
      <Grid item xs={12} sx={{ marginTop: "2rem" }}>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(totalRecord / itemsPerPage)}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalRecord={totalRecord}
          label="Machines"
        />
      </Grid>
      {loader && <AppLoader />}
    </Grid>
  )
}

export default AllMachines
