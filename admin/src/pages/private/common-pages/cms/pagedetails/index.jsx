import React, { useEffect, useState } from "react"
import { Box, IconButton } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import { useNavigate } from "react-router-dom"
import { CmsService } from "network/cmsService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { useDispatch } from "react-redux"
import { cmsActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import EditIcon from "assets/images/icons/edit.svg"
import IconWrapper from "components/utilities-components/IconWrapper"

const columns = [
  {
    id: "title",
    label: "Title"
    // minWidth: 200
  },
  {
    id: "user",
    label: "User"
    // minWidth: 200
  },
  {
    id: "lastUpdate",
    label: "Last Update"
    // minWidth: 200
  },
  {
    id: "status",
    label: "Status"
    // minWidth: 200
  },
  {
    id: "action",
    label: "Action",
    align: "right"
    // minWidth: 200
  }
]
function PageDetails({ subAdminPermission = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [pageTabelData, setPageTableData] = useState([])
  const [loader, setLoader] = useState(false)
  const user = userDetail()

  useEffect(() => {
    getPage()
  }, [])

  const getPage = async () => {
    setLoader(true)
    let pageResponse = await CmsService.getPageList()
    if (pageResponse.code === 200 && pageResponse.success) {
      setPageTableData(pageResponse?.data)
      setLoader(false)
    } else {
      setPageTableData([])
      setLoader(false)
    }
  }

  const handleNavigate = (id, route, data) => {
    navigate(`${route}${id}`)
    dispatch(cmsActions.setPageData(data))
  }

  let pageData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    pageTabelData &&
    pageTabelData.length > 0 &&
    pageTabelData.map((list) => {
      return pageData.push(
        createData(
          <Box
            sx={{ cursor: "pointer" }}
            onClick={() => handleNavigate(list?.policyId, `/${user.role}/cms/view-page/`, list)}>
            {list?.privacyPolicy}
          </Box>,
          list?.type,
          dateMonthFormat(list?.updatedAt, "MMM DD, YYYY"),
          list?.isActive === true ? "ACTIVE" : "INACTIVE",
          <IconButton
            sx={{ padding: "0px" }}
            onClick={() => handleNavigate(list?.policyId, `/${user.role}/cms/edit-page/`, list)}
            disabled={user.role === "subadmin" && !subAdminPermission?.updatePermission}>
            <IconWrapper
              imgSrc={EditIcon}
              disable={user.role === "subadmin" && !subAdminPermission?.updatePermission}
            />
          </IconButton>
        )
      )
    })
  function createData(title, user, lastUpdate, status, action) {
    return {
      title,
      user,
      lastUpdate,
      status,
      action
    }
  }

  return (
    <>
      <Box sx={{ mt: "20px" }}>
        {loader ? <AppLoader /> : <ListingTable columns={columns} tableData={pageData} />}
      </Box>
    </>
  )
}

export default PageDetails
