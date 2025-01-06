import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import EditIcon from "assets/images/icons/edit.svg"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { cmsActions } from "redux/store"
import { CmsService } from "network/cmsService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import IconWrapper from "components/utilities-components/IconWrapper"

const columns = [
  {
    id: "no",
    label: "Sr No"
  },
  {
    id: "oem",
    label: "OEM",
    align: "center"
  },
  {
    id: "lastUpdate",
    label: "Last Update",
    align: "center"
  },
  {
    id: "status",
    label: "Status",
    align: "center"
  },
  {
    id: "action",
    label: "Action",
    align: "right"
  }
]

function OemDetails({ subAdminPermission = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [oemTabelData, setOemTableData] = useState([])
  const [loader, setLoader] = useState(false)
  const user = userDetail()

  useEffect(() => {
    getOem()
  }, [])

  const getOem = async () => {
    setLoader(true)
    let oemResponse = await CmsService.getOemList()
    if (oemResponse.code === 200 && oemResponse.success) {
      setOemTableData(oemResponse?.data)
      setLoader(false)
    } else {
      setOemTableData([])
      setLoader(false)
    }
  }
  const handleNavigate = (id, data) => {
    navigate(`/${user.role}/cms/edit-oem/${id}`)
    dispatch(cmsActions.setOemData(data))
  }

  function createData(no, oem, lastUpdate, status, action) {
    return {
      no,
      oem,
      lastUpdate,
      status,
      action
    }
  }

  let oemData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    oemTabelData &&
    oemTabelData.length > 0 &&
    oemTabelData.map((list, i) => {
      return oemData.push(
        createData(
          i + 1,
          list?.name,
          dateMonthFormat(list?.updatedAt, "MMM DD, YYYY"),
          list?.status === 1 ? "ACTIVE" : "INACTIVE",
          <Box>
            <IconButton
              onClick={() => handleNavigate(list?.oemId, list)}
              sx={{ padding: "0px" }}
              disabled={user.role === "subadmin" && !subAdminPermission?.updatePermission}>
              <IconWrapper
                disable={user.role === "subadmin" && !subAdminPermission?.updatePermission}
                imgSrc={EditIcon}
              />
            </IconButton>
          </Box>
        )
      )
    })

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        {loader ? <AppLoader /> : <ListingTable columns={columns} tableData={oemData} />}
      </Box>
    </>
  )
}

export default OemDetails
