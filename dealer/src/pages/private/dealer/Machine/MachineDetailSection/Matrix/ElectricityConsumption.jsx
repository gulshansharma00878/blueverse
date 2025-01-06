import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import MachineDetailHeader from "components/Machines/MachineDetailHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import { ManageMachinesServices } from "network/manageMachinesServices"
import styles from "./Matrix.module.scss"
import { useParams } from "react-router-dom"
import AppLoader from "components/Loader/AppLoader"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import moment from "moment"
import PaginationComponent from "components/utitlities-components/Pagination"
import { capitaliseString } from "helpers/Functions/formateString"
import { exportMachineTranscation } from "./matrixUtilities"
import { convertToISO } from "helpers/app-dates/dates"

function ElectricityConsumption() {
  const params = useParams()
  const [electricityConsumptionData, setElectricityConsumptionData] = useState([])
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [loader, setLoader] = useState(false)
  const [sort, setSort] = useState("ASC")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecord, setTotalRecord] = useState(0)
  const [machineName, setMachineName] = useState("")
  useEffect(() => {
    getTranscationDetail()
  }, [startDate, endDate, sort, itemsPerPage, currentPage])

  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  const getTranscationDetail = async () => {
    setLoader(true)
    let param = [
      `${params?.machineId}?fromDate=${convertToISO(startDate)}&toDate=${convertToISO(
        endDate,
        true
      )}&sort=${sort}&offset=${currentPage}&limit=${itemsPerPage}`
    ]
    const machineResponse = await ManageMachinesServices.machineTransaction(param)
    if (machineResponse.success && machineResponse.code === 200) {
      setMachineName(machineResponse?.data?.machine?.name)
      setElectricityConsumptionData(
        machineResponse?.data?.transactions ? machineResponse?.data?.transactions : []
      )
      setTotalRecord(machineResponse?.data?.pagination?.totalItems)
      setLoader(false)
    } else {
      setElectricityConsumptionData([])
      setTotalRecord(0)
      setLoader(false)
      setMachineName("")
    }
  }

  const changePage = (page) => {
    setCurrentPage(page)
  }

  const columns = [
    {
      id: "no",
      label: "Sr No"
    },
    {
      id: "sku",
      label: "SKU"
    },
    {
      id: "washType",
      label: "Wash Type"
    },
    {
      id: "electricityUsed",
      label: "Electricity Used"
    },
    {
      id: "voltR",
      label: "Volt R"
    },
    {
      id: "voltY",
      label: "Volt Y"
    },
    {
      id: "voltB",
      label: "Volt B"
    },
    {
      id: "dateTime",
      label: (
        <Box className={styles.dateColumn}>
          Date & Time
          <IconButton
            color="inherit"
            aria-label="open drawer"
            className={styles.sortBox}
            edge="start"
            sx={{ ml: "1rem" }}
            onClick={handleSort.bind(null, sort)}>
            {sort === "ASC" ? (
              <ArrowUpwardIcon color="primary" />
            ) : (
              <ArrowDownward color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 100
    }
  ]

  function createData(no, sku, washType, electricityUsed, voltR, voltY, voltB, dateTime) {
    return {
      no,
      sku,
      washType,
      electricityUsed,
      voltR,
      voltY,
      voltB,
      dateTime
    }
  }

  let electricityData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    electricityConsumptionData &&
    electricityConsumptionData.length > 0 &&
    electricityConsumptionData.map((list, i) => {
      return electricityData.push(
        createData(
          i + 1,
          list?.SkuNumber,
          capitaliseString(list?.washType?.Name),
          list?.ElectricityUsed,
          list?.Volt_R_N_IOT,
          list?.Volt_Y_N_IOT,
          list?.Volt_B_N_IOT,
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  const changePageCount = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleDownload = async () => {
    setLoader(true)
    const param = [
      `${
        params?.machineId
      }?type=${"ELECTRICITY_CONSUMPTION"}&fromDate=${startDate}&toDate=${endDate}&sort=${sort}&offset=${currentPage}&limit=${itemsPerPage}`
    ]
    await exportMachineTranscation(param)
    setLoader(false)
  }

  return (
    <>
      <Box>
        <MachineDetailHeader
          title={`${machineName ? machineName + " - Electricity Consumption" : ""}`}
          dateFilter={true}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleDownload={handleDownload}
          downloadEnabled={true}
        />

        <Box sx={{ mt: "4rem" }}>
          <ListingTable columns={columns} tableData={electricityData} />
        </Box>
        <Box sx={{ mt: "2rem" }}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={changePage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={changePageCount}
            totalRecord={totalRecord}
            title={"Washes"}
          />
        </Box>
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default ElectricityConsumption
