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

function WaterQuality() {
  const params = useParams()
  const [waterQualityData, setWaterQualityData] = useState([])
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [sort, setSort] = useState("ASC")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [machineName, setMachineName] = useState("")
  const [totalRecord, setTotalRecord] = useState(0)
  const [loader, setLoader] = useState(false)
  useEffect(() => {
    getTranscationDetail()
  }, [itemsPerPage, currentPage, startDate, endDate, sort])

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
      setWaterQualityData(
        machineResponse?.data?.transactions ? machineResponse?.data?.transactions : []
      )
      setTotalRecord(machineResponse?.data?.pagination?.totalItems)
      setMachineName(machineResponse?.data?.machine?.name)
      setLoader(false)
    } else {
      setWaterQualityData([])
      setTotalRecord(0)
      setMachineName("")
      setLoader(false)
    }
  }

  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
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
      id: "ph",
      label: "Ph"
    },
    {
      id: "tds",
      label: "Tds"
    },
    {
      id: "tss",
      label: "Tss"
    },
    {
      id: "cod",
      label: "Cod"
    },
    {
      id: "oilGress",
      label: "Oil & Grees"
    },
    {
      id: "dateTime",
      label: (
        <Box className={styles.dateColumn}>
          Date & Time
          <IconButton
            color="inherit"
            edge="start"
            className={styles.sortBox}
            sx={{ ml: "1rem" }}
            aria-label="open drawer"
            onClick={handleSort.bind(null, sort)}>
            {sort === "ASC" ? (
              <ArrowUpwardIcon color="primary" />
            ) : (
              <ArrowDownward color="primary" />
            )}
          </IconButton>
        </Box>
      )
    }
  ]

  function createData(no, sku, washType, ph, tds, tss, cod, oilGress, dateTime) {
    return {
      no,
      sku,
      washType,
      ph,
      tds,
      tss,
      cod,
      oilGress,
      dateTime
    }
  }

  const handleDownload = async () => {
    setLoader(true)
    const param = [
      `${
        params?.machineId
      }?type=${"WATER_QUALITY"}&fromDate=${startDate}&toDate=${endDate}&offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}`
    ]
    await exportMachineTranscation(param)
    setLoader(false)
  }

  const changePage = (page) => {
    setCurrentPage(page)
  }

  const changePageCount = (value) => {
    setCurrentPage(1)
    setItemsPerPage(value)
  }

  let waterData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    waterQualityData &&
    waterQualityData.length > 0 &&
    waterQualityData.map((list, i) => {
      return waterData.push(
        createData(
          i + 1,
          list?.SkuNumber,
          capitaliseString(list?.washType?.Name),
          list?.PHValue,
          list?.TDSValue,
          list?.TSSValue,
          list?.CODValue,
          list?.OilAndGreaseValue,
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  return (
    <>
      <Box>
        <MachineDetailHeader
          title={`${machineName ? machineName + " - Water Quality" : ""}`}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          downloadEnabled={true}
          handleDownload={handleDownload}
          dateFilter={true}
        />

        <Box sx={{ mt: "4rem" }}>
          <ListingTable columns={columns} tableData={waterData} />
        </Box>
        <Box sx={{ mt: "2rem" }}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            itemsPerPage={itemsPerPage}
            onPageChange={changePage}
            totalRecord={totalRecord}
            onItemsPerPageChange={changePageCount}
            title={"Washes"}
          />
        </Box>
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default WaterQuality
