import { Grid, Typography } from "@mui/material"
import React, { useEffect, useState } from "react" //  { useState }
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useStyles } from "../AccountStyles"
import InputField from "components/utitlities-components/InputField/InputField"
import { userDetail } from "hooks/state"
import UpdatePassword from "components/UpdatePassword"
import { SettingService } from "network/settingsService"
import { useSelector } from "react-redux"
import moment from "moment"
import AppLoader from "components/Loader/AppLoader"
import { getPermissionJson } from "helpers/Functions/roleFunction"

function AccountProfile() {
  const styles = useStyles()
  const user = userDetail()
  const userID = useSelector((state) => state?.app?.user?.userId)
  const parentUserID = useSelector((state) => state?.app?.user?.parentUserId)

  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState()
  const [employeePermission, setEmployeePermission] = useState()

  useEffect(() => {
    getDetails()
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "account setting")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  const getDetails = async () => {
    setLoading(true)
    const response = await SettingService.getSubscriptions(parentUserID ? parentUserID : userID)
    if (response?.success && response?.code === 200) {
      setVerified(
        user?.role == "employee"
          ? response?.data?.username
          : moment(response?.data?.kycDoneAt).format("DD MMM, YYYY")
      )
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  return (
    <>
      <Grid sx={styles.inputBoxContainer} container>
        {loading && <AppLoader />}
        <Grid xs={12}>
          <Typography variant="h7">KYC</Typography>
        </Grid>
        <Grid sx={styles.profileBox} item xs={12} container justifyContent="space-between">
          <Grid item xs alignItems="center" container>
            <Grid item>
              <CheckCircleIcon sx={{ height: "4.4rem", width: "4.4rem" }} color="success" />
            </Grid>
            <Grid sx={{ pl: 1 }} item>
              <Typography variant="p1">KYC Verified!</Typography>
              <Typography sx={styles.kyc}>Your account is KYC approved</Typography>
            </Grid>
          </Grid>
          <Grid sx={{ display: "flex", alignItems: "center" }} item>
            <Typography sx={styles.date} variant="p2">
              {user?.role == "employee" ? `Dealer Name: ${verified}` : `Verified On: ${verified}`}
            </Typography>
          </Grid>
        </Grid>
        <Grid style={{ margin: "3.4rem 0rem 2.4rem 0rem" }} xs={12}>
          <Typography variant="h7">Profile</Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InputField
              size="medium"
              name="name"
              label="Name"
              inputProps={{ style: { height: 25 } }}
              InputLabelProps={{
                style: { marginLeft: 4, marginBottom: 8 }
              }}
              disabled
              sx={styles.inputBox}
              InputProps={{ disableUnderline: true }}
              value={user?.name}
              variant="filled"
              type="text"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputField
              size="medium"
              sx={styles.inputBox}
              name="name"
              label="Email"
              inputProps={{ style: { height: 25 } }}
              InputLabelProps={{
                style: { marginLeft: 4, marginBottom: 8 }
              }}
              disabled
              value={user?.email}
              InputProps={{ disableUnderline: true, classes: { root: styles.inputBox } }}
              variant="filled"
              type="text"
              fullWidth
              margin="normal"
            />
          </Grid>
          {user?.phoneNumber !== null ? (
            <Grid item xs={12} sm={6}>
              <InputField
                size="medium"
                sx={styles.inputBox}
                name="name"
                label="Phone Number"
                inputProps={{ style: { height: 25 } }}
                InputLabelProps={{
                  style: { marginLeft: 4, marginBottom: 8 }
                }}
                disabled
                value={`${user?.phoneNumber}`}
                InputProps={{
                  disableUnderline: true,
                  classes: { root: styles.inputBox },
                  startAdornment: (
                    <div style={styles?.adornment}>
                      <Typography style={styles?.marginRight}>{`+91-`}</Typography>
                    </div>
                  )
                }}
                variant="filled"
                type="text"
                fullWidth
                margin="normal"
              />{" "}
            </Grid>
          ) : null}
        </Grid>
        {/* TODO : to be implmented when we have contact us page */}
        {/* <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
          <Typography variant="p2" sx={styles.contactUs}>
            Corrections ? <a href="contact-us">Contact Us</a>
          </Typography>
        </Grid> */}
      </Grid>
      {user?.role == "employee" ? (
        employeePermission?.updatePermission ? (
          <UpdatePassword />
        ) : null
      ) : (
        <UpdatePassword />
      )}
    </>
  )
}

export default AccountProfile
