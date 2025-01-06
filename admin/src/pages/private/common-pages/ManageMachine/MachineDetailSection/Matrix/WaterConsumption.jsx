import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import MachineDetailHeader from "components/ManageMachine/MachineDetailHeader"
import ListingTable from "components/utilities-components/ListingTable"
import { ManageMachinesServices } from "network/manageMachinesServices"
import styles from "./Matrix.module.scss"
import { useParams } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import moment from "moment"
import PaginationComponent from "components/utilities-components/Pagination"
import { capitaliseString } from "helpers/Functions/formateString"
import { subtractAndValidate } from "helpers/Functions/formateString"
import { exportMachineTranscation } from "./matrixUtilities"
import { convertToISO } from "helpers/app-dates/dates"

function WaterConsumption() {
  const params = useParams()
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [waterConsumptionData, setWaterConsumptionData] = useState([])
  const [sort, setSort] = useState("DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [machineName, setMachineName] = useState("")
  const [loader, setLoader] = useState(false)
  useEffect(() => {
    getTranscationDetail()
  }, [startDate, endDate, itemsPerPage, currentPage, sort])

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
      setWaterConsumptionData(
        machineResponse?.data?.transactions ? machineResponse?.data?.transactions : []
      )
      setMachineName(machineResponse?.data?.machine?.name)
      setTotalRecord(machineResponse?.data?.pagination?.totalItems)
      setLoader(false)
    } else {
      setWaterConsumptionData([])
      setLoader(false)
      setTotalRecord(0)
      setMachineName("")
    }
  }

  const handleDownload = async () => {
    setLoader(true)
    const param = [
      `${
        params?.machineId
      }?type=${"WATER_CONSUMPTION"}&fromDate=${startDate}&toDate=${endDate}&sort=${sort}&offset=${currentPage}&limit=${itemsPerPage}`
    ]
    await exportMachineTranscation(param)
    setLoader(false)
  }

  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  function createData(no, sku, washType, treatedWater, freshWater, recycledWater, dateTime) {
    return {
      no,
      sku,
      washType,
      treatedWater,
      freshWater,
      recycledWater,
      dateTime
    }
  }

  let waterUsedData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    waterConsumptionData &&
    waterConsumptionData.length > 0 &&
    waterConsumptionData.map((list, i) => {
      return waterUsedData.push(
        createData(
          i + 1,
          list?.SkuNumber,
          capitaliseString(list?.washType?.Name),
          list?.WaterUsed,
          list?.WaterWastage,
          subtractAndValidate(Number(list?.WaterUsed), Number(list?.WaterWastage)),
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  const changePageCount = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
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
      id: "treatedWater",
      label: "Treated Water (L)"
    },
    {
      id: "freshWater",
      label: "Fresh Water (L)"
    },
    {
      id: "recycledWater",
      label: "Recycled Water (L)"
    },
    {
      id: "dateTime",
      label: (
        <Box className={styles.dateColumn}>
          Date & Time
          <IconButton
            edge="start"
            aria-label="open drawer"
            className={styles.sortBox}
            sx={{ ml: "1rem" }}
            color="inherit"
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
  return (
    <>
      <Box>
        <MachineDetailHeader
          title={`${machineName ? machineName + " - Water Consumption" : ""}`}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          downloadEnabled={true}
          handleDownload={handleDownload}
          dateFilter={true}
        />
        <Box sx={{ mt: "4rem" }}>
          <ListingTable columns={columns} tableData={waterUsedData} />
        </Box>
        <Box sx={{ mt: "2rem" }}>
          <PaginationComponent
            title={"Washes"}
            currentPage={currentPage}
            onPageChange={changePage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={changePageCount}
            totalRecord={totalRecord}
          />
        </Box>
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default WaterConsumption
