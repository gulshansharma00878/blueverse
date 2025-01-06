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

function WaterUsed() {
  const params = useParams()
  const [waterWashData, setWaterWashData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [machineName, setMachineName] = useState("")
  const [totalRecord, setTotalRecord] = useState(0)
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"))
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"))
  const [loader, setLoader] = useState(false)
  const [sort, setSort] = useState("ASC")

  useEffect(() => {
    getTranscationDetail()
  }, [itemsPerPage, currentPage, startDate, endDate, sort])

  const getTranscationDetail = async () => {
    setLoader(true)
    let param = [
      `${params?.machineId}?fromDate=${convertToISO(startDate)}&toDate=${convertToISO(
        endDate,
        true
      )}&offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}`
    ]
    const machineResponse = await ManageMachinesServices.machineTransaction(param)
    if (machineResponse.success && machineResponse.code === 200) {
      setWaterWashData(
        machineResponse?.data?.transactions ? machineResponse?.data?.transactions : []
      )
      setTotalRecord(machineResponse?.data?.pagination?.totalItems)
      setMachineName(machineResponse?.data?.machine?.name)
      setLoader(false)
    } else {
      setWaterWashData([])
      setTotalRecord(0)
      setMachineName("")
      setLoader(false)
    }
  }

  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  const handleDownload = async () => {
    setLoader(true)
    const param = [
      `${
        params?.machineId
      }?type=${"WASHES"}&fromDate=${startDate}&toDate=${endDate}&offset=${currentPage}&limit=${itemsPerPage}&sort=${sort}`
    ]
    await exportMachineTranscation(param)
    setLoader(false)
  }

  function createData(no, sku, washType, baseAmount, cgst, sgst, price, dateTime) {
    return {
      no,
      sku,
      washType,
      baseAmount,
      cgst,
      sgst,
      price,
      dateTime
    }
  }

  const changePageCount = (value) => {
    setCurrentPage(1)
    setItemsPerPage(value)
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
      id: "baseAmount",
      label: "Base Amount(INR)"
    },
    {
      id: "cgst",
      label: "Cgst(INR) 9%"
    },
    {
      id: "sgst",
      label: "Sgst(INR) 9%"
    },
    {
      id: "price",
      label: "Price(INR) Incl. GST"
    },
    {
      id: "dateTime",
      label: (
        <Box className={styles.dateColumn}>
          Date & Time
          <IconButton
            edge="start"
            color="inherit"
            sx={{ ml: "1rem" }}
            aria-label="open drawer"
            className={styles.sortBox}
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

  let waterUsedData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    waterWashData &&
    waterWashData.length > 0 &&
    waterWashData.map((list, i) => {
      return waterUsedData.push(
        createData(
          i + 1,
          list?.SkuNumber,
          capitaliseString(list?.washType?.Name),
          list?.machineWallet?.baseAmount,
          list?.machineWallet?.cgst,
          list?.machineWallet?.sgst,
          list?.machineWallet?.totalAmount,
          dateMonthFormat(list?.AddDate, "DD/MM/YYYY hh:mm A")
        )
      )
    })

  return (
    <>
      <Box>
        <MachineDetailHeader
          title={`${machineName ? machineName + " - Washes" : ""}`}
          dateFilter={true}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          downloadEnabled={true}
          handleDownload={handleDownload}
        />

        <Box sx={{ mt: "4rem" }}>
          <ListingTable columns={columns} tableData={waterUsedData} />
        </Box>
        <Box sx={{ mt: "2rem" }}>
          <PaginationComponent
            currentPage={currentPage}
            onPageChange={changePage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onItemsPerPageChange={changePageCount}
            title={"Washes"}
            totalRecord={totalRecord}
            itemsPerPage={itemsPerPage}
          />
        </Box>
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default WaterUsed
