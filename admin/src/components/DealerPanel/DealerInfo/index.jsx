import { Grid, Tab, Tabs, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import React, { useState } from "react"
import { useStyles } from "./DealerInfoStyles"
import { useNavigate, useParams } from "react-router-dom"
import { DealerService } from "network/dealerService"
import { useEffect } from "react"
import Toast from "components/utilities-components/Toast/Toast"
import DealerOutlet from "./ServiceCenter/DealerOutlet"
import CommonDataCard from "./ServiceCenter/DealerOutlet/CommonDataCard"
import { TabPanel } from "components/utilities-components/TabPanel"
import RoleList from "./Role"
import EmployeeList from "./Emplyoee"
import moment from "moment"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import DownloadDocument from "components/utilities-components/DownloadDocument"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteDealer from "assets/images/placeholders/deleteDealer.webp"
import { useDispatch } from "react-redux"
import { coreAppActions, dealerActions } from "redux/store"
import PopupModal from "components/PopupModal"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { useTheme } from "@mui/material"
import { useSelector } from "react-redux"

const tabArr = ["Service Centre", "Employee", "Role"]

function DealerInfo() {
  const navigate = useNavigate()
  const user = userDetail()
  const styles = useStyles()
  const params = useParams()
  const dispatch = useDispatch()
  const activeTabIndex = useSelector((state) => state.dealer.dealerTabActive)
  const [data, setData] = useState()
  const [activeTab, setActiveTab] = useState(0)
  const [loader, setLoader] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [isDisableDelete, setDisableDelete] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    getDealerDetail()
    getAllpermission()
  }, [params.dealerId])

  useEffect(() => {
    setActiveTab(activeTabIndex)
    getAllpermission()
  }, [activeTabIndex])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "dealer")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const handleRoute = () => {
    navigate(`/${user?.role}/wallet/transaction-history/${params.dealerId}`)
    dispatch(dealerActions.setDealerId(params.dealerId))
  }

  const handleChange = (_, newValue) => {
    setActiveTab(newValue)
  }

  const deleteDealer = () => {
    setDisableDelete(false)
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleDeleteDealer = async () => {
    setLoader(true)
    let userID = [data?.userId]

    const response = await DealerService.deleteDealer(userID)

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      navigate(`/${user?.role}/dealers`)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const showTextColor = (key) => {
    switch (key) {
      case true:
        return styles.active
      case false:
        return styles.inactive
      default:
        break
    }
  }

  const heading = [
    { heading: "Dealership Name", value: data?.username },
    { heading: "PAN Number", value: data?.panNo },
    { heading: "Email Id", value: data?.email },
    { heading: "Created Date", value: moment(data?.createdAt).format("DD/MM/YY") },
    { heading: "OEM", value: data?.oem?.name },
    {
      heading: "Status",
      value: (
        <Typography variant="s1" sx={showTextColor(data?.isActive)}>
          {data?.isActive ? "Active" : "Inactive"}
        </Typography>
      )
    },
    {
      heading: "Documents",
      value: <DownloadDocument document={data?.documents} />
    },
    {
      heading: "Wallet",
      value: (
        <Typography
          variant="s1"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          color="primary.main"
          onClick={() => handleRoute()}>
          View Transaction
        </Typography>
      )
    }
  ]

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  const getDealerDetail = async () => {
    setLoader(true)
    let dealerResponse = await DealerService.getDealerDetails(params.dealerId)
    if (dealerResponse.code === 200 && dealerResponse.success) {
      setData(dealerResponse?.data)
    } else {
      Toast.showErrorToast(dealerResponse?.message)
    }
    setLoader(false)
  }

  const disableDelete = (value) => {
    setDisableDelete(value)
  }

  let popupMap = {
    deleteChild: (
      <PopUpChild
        height={506}
        subHeading={`Do you want to delete ${data?.uniqueId}- ${data?.username} ?`}
        heading={`Remove this ID?`}
        handleClose={handleClose}
        src={DeleteDealer}
        handleClick={handleDeleteDealer}
      />
    )
  }

  return (
    <Grid container>
      <CommonHeader
        backBtn
        heading={data?.uniqueId == undefined ? " " : data?.uniqueId + " " + data?.username}
        isButtonVisible
        noPlusBtn
        isMobile={isMobile}
        twoBtn={[
          {
            heading: "Delete",
            btnDissable: user.role === "subadmin" ? !subAdminPermission?.deletePermission : false,
            handleClick: () => {
              deleteDealer()
            }
          },
          {
            heading: "Edit",
            btnDissable: user.role === "subadmin" ? !subAdminPermission?.updatePermission : false,
            handleClick: () => {
              navigate(`/${user.role}/dealers/edit-dealer/${data?.userId}`)
            }
          }
        ]}
      />
      <Grid item container sx={styles.dealerInfoBox}>
        <Grid sx={styles.dealerOuter} item container>
          {heading?.map((item, index) => {
            return (
              <Grid item xs={isMobile ? 12 : 4} key={index}>
                <CommonDataCard value1={item?.heading} value2={item?.value} />
              </Grid>
            )
          })}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} sx={styles.dealerOutletInfoBox}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth"
            style={{ backgroundColor: "#F5F6F8" }}>
            {tabArr.map((item, index) => {
              return (
                <Tab
                  key={index}
                  label={item}
                  sx={activeTab == index && styles.activeTab}
                  {...a11yProps(index)}
                />
              )
            })}
          </Tabs>

          <TabPanel padding={0} value={activeTab} index={0}>
            {data?.outlets?.map((item, index) => {
              return <DealerOutlet item={item} key={index} />
            })}
          </TabPanel>
          <TabPanel padding={0} value={activeTab} index={1}>
            <EmployeeList
              isDisableDelete={isDisableDelete}
              disableDelete={(value) => disableDelete(value)}
              dealerId={params.dealerId}
            />
          </TabPanel>
          <TabPanel padding={0} value={activeTab} index={2}>
            <RoleList
              isDisableDelete={isDisableDelete}
              disableDelete={(value) => disableDelete(value)}
              dealerId={params.dealerId}
            />
          </TabPanel>
        </Grid>
      </Grid>
      {loader && <AppLoader />}
      {!isDisableDelete && (
        <PopupModal handleClose={handleClose}>{popupMap["deleteChild"]}</PopupModal>
      )}
    </Grid>
  )
}

export default DealerInfo
