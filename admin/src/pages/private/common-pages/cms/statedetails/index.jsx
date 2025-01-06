import React, { useEffect, useState } from "react"
import { Box, IconButton } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
// import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { CmsService } from "network/cmsService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { cmsActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import EditIcon from "assets/images/icons/edit.svg"
import IconWrapper from "components/utilities-components/IconWrapper"
const columns = [
  {
    id: "no",
    label: "Sr No",
    align: "left"
  },
  {
    id: "states",
    label: "States",
    align: "left"
  },
  {
    id: "region",
    label: "Region",
    align: "center"
  },
  {
    id: "gst",
    label: "Gst No",
    align: "center"
  },
  {
    id: "address",
    label: "Blueverse Address",
    align: "center"
  },
  {
    id: "lastUpdate",
    label: "Last Update",
    align: "center"
  },
  {
    id: "action",
    label: "Action",
    align: "right"
  }
]

function StateDetails({ subAdminPermission = {} }) {
  // const [isShowModal, setShowModal] = useState(false)
  const [stateTabelData, setStateTableData] = useState([])
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()

  useEffect(() => {
    getState()
  }, [])

  const getState = async () => {
    setLoader(true)
    let stateResponse = await CmsService.getStateList()
    if (stateResponse.code === 200 && stateResponse.success) {
      setLoader(false)
      setStateTableData(stateResponse?.data)
    } else {
      setLoader(false)
      setStateTableData([])
    }
  }
  const handleNavigate = (id, data) => {
    dispatch(cmsActions.setStateData(data))
    navigate(`/${user.role}/cms/edit-state/${id}`)
  }
  function createData(no, states, region, gst, address, lastUpdate, action) {
    return {
      no,
      states,
      region,
      gst,
      address,
      lastUpdate,
      action
    }
  }

  let stateData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    stateTabelData &&
    stateTabelData.length > 0 &&
    stateTabelData.map((list, i) => {
      return stateData.push(
        createData(
          i + 1,
          list?.name,
          list?.region?.name,
          list?.stateGstNo,
          list?.blueverseAddress,
          dateMonthFormat(list?.updatedAt, "MMM DD, YYYY"),
          <Box>
            <IconButton
              sx={{ padding: "0px" }}
              onClick={() => handleNavigate(list?.stateId, list)}
              disabled={user.role === "subadmin" && !subAdminPermission?.updatePermission}>
              <IconWrapper
                imgSrc={EditIcon}
                disable={user.role === "subadmin" && !subAdminPermission?.updatePermission}
              />
            </IconButton>
          </Box>
        )
      )
    })

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        {loader ? <AppLoader /> : <ListingTable columns={columns} tableData={stateData} />}
      </Box>
    </>
  )
}

export default StateDetails
