import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import MachineDetailHeader from "components/Machines/MachineDetailHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import { ManageMachinesServices } from "network/manageMachinesServices"
import styles from "./Matrix.module.scss"
import { useParams } from "react-router-dom"
import AppLoader from "components/Loader/AppLoader"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { dateMonthFormat } from "helpers/app-dates/dates"
import PaginationComponent from "components/utitlities-components/Pagination"
import moment from "moment"
import { capitaliseString } from "helpers/Functions/formateString"
import { exportMachineTranscation } from "./matrixUtilities"
import { convertToISO } from "helpers/app-dates/dates"

function ChemicalPerformance() {
  const params = useParams()
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
  const [chemicalPerformanceData, setChemicalPerformanceData] = useState([])
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [loader, setLoader] = useState(false)
  const [sort, setSort] = useState("ASC")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [machineName, setMachineName] = useState("")
  const [totalRecord, setTotalRecord] = useState(0)
  useEffect(() => {
    getTranscationDetail()
  }, [startDate, endDate, sort, itemsPerPage, currentPage])

  const handleSort = (sortValue) => {
    sortValue === "ASC" ? setSort("DESC") : setSort("ASC")
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
      setChemicalPerformanceData(
        machineResponse?.data?.transactions ? machineResponse?.data?.transactions : []
      )
      setTotalRecord(machineResponse?.data?.pagination?.totalItems)
      setMachineName(machineResponse?.data?.machine?.name)
      setLoader(false)
    } else {
      setChemicalPerformanceData([])
      setTotalRecord(0)
      setMachineName("")
      setLoader(false)
    }
  }

  const chemicalColumns = [
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
      id: "shampooUsed",
      label: "Shampoo Used (ml)"
    },
    {
      id: "foamUsed",
      label: "Foam Used (ml)"
    },
    {
      id: "waxUsed",
      label: "Wax Used (ml)"
    },
    {
      id: "dateTime",
      label: (
        <Box className={styles.dateColumn}>
          Date & Time
          <IconButton
            aria-label="open drawer"
            edge="start"
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

  function createData(no, sku, washType, shampooUsed, foamUsed, waxUsed, dateTime) {
    return {
      no,
      sku,
      washType,
      shampooUsed,
      foamUsed,
      waxUsed,
      dateTime
    }
  }

  let chemicalData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    chemicalPerformanceData &&
    chemicalPerformanceData.length > 0 &&
    chemicalPerformanceData.map((list, i) => {
      return chemicalData.push(
        createData(
          i + 1,
          list?.SkuNumber,
          capitaliseString(list?.washType?.Name),
          list?.ShampooUsed,
          list?.FoamUsed,
          list?.WaxUsed,
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  const handleDownload = async () => {
    setLoader(true)
    const param = [
      `${
        params?.machineId
      }?type=${"CHEMICAL_PERFORMANCE"}&fromDate=${startDate}&toDate=${endDate}&sort=${sort}&offset=${currentPage}&limit=${itemsPerPage}`
    ]
    await exportMachineTranscation(param)
    setLoader(false)
  }

  const changePage = (page) => {
    setCurrentPage(page)
  }

  const changePageCount = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <>
      <Box>
        <MachineDetailHeader
          title={`${machineName ? machineName + " - Chemical Performance" : ""}`}
          setStartDate={setStartDate}
          dateFilter={true}
          setEndDate={setEndDate}
          downloadEnabled={true}
          handleDownload={handleDownload}
        />

        <Box sx={{ mt: "4rem" }}>
          <ListingTable columns={chemicalColumns} tableData={chemicalData} />
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

export default ChemicalPerformance
