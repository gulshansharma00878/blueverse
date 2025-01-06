import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import IconWrapper from "components/utilities-components/IconWrapper"
import EditIcon from "assets/images/icons/edit.svg"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { CmsService } from "network/cmsService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { cmsActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"

const columns = [
  {
    id: "no",
    label: "Sr No",
    align: "left"
  },
  {
    id: "cities",
    label: "Cities",
    align: "left"
  },
  {
    id: "states",
    label: "States",
    align: "center"
  },
  {
    id: "region",
    label: "Region",
    align: "center"
  },
  {
    id: "lastUpdate",
    label: "Last Update",
    minWidth: 100,
    align: "right"
  },
  {
    id: "action",
    label: "Action",
    minWidth: 100,
    align: "right"
  }
]

function CitiesDetails({ subAdminPermission = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()
  const [citiesTabelData, setCitiesTableData] = useState([])
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getCities()
  }, [])

  const getCities = async () => {
    setLoader(true)
    let citiesResponse = await CmsService.getCityList()
    if (citiesResponse.code === 200 && citiesResponse.success) {
      setCitiesTableData(citiesResponse?.data)
      setLoader(false)
    } else {
      setCitiesTableData([])
      setLoader(false)
    }
  }

  const handleNavigate = (id, data) => {
    navigate(`/${user.role}/cms/edit-cities/${id}`)
    dispatch(cmsActions.setCityData(data))
  }

  function createData(no, cities, states, region, lastUpdate, action) {
    return {
      no,
      cities,
      states,
      region,
      lastUpdate,
      action
    }
  }

  let citiesData = []

  // eslint-disable-next-line no-unused-vars
  let creatRow =
    citiesTabelData &&
    citiesTabelData.length > 0 &&
    citiesTabelData.map((list, i) => {
      return citiesData.push(
        createData(
          i + 1,
          list?.name,
          list?.state?.name,
          list?.state?.region?.name,
          dateMonthFormat(list?.updatedAt, "MMM DD, YYYY"),
          <Box>
            <IconButton
              onClick={() => handleNavigate(list?.cityId, list)}
              disabled={user.role === "subadmin" && !subAdminPermission?.updatePermission}
              sx={{ padding: "0px" }}>
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
        {loader ? <AppLoader /> : <ListingTable columns={columns} tableData={citiesData} />}
      </Box>
    </>
  )
}

export default CitiesDetails
