import { Grid, LinearProgress, Typography, styled, linearProgressClasses } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useStyles } from "./MachineHealthStyles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { ManageMachinesServices } from "network/manageMachinesServices"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import EmptyHealth from "assets/images/placeholders/emptyHealth.webp"
import EmptyState from "components/utilities-components/EmptyState"
import { useParams } from "react-router-dom"
function MachineHealth({ machineId }) {
  const styles = useStyles()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const [faultStatus, setFaultStatus] = useState()
  const [totalRecord, setTotalRecord] = useState()
  const params = useParams()
  useEffect(() => {
    getMachineHealth()
  }, [params?.machineId])

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800]
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor:
        (faultStatus / totalRecord) * 100 <= 99 && (faultStatus / totalRecord) * 100 >= 90
          ? theme?.palette?.background?.yellow2
          : (faultStatus / totalRecord) * 100 < 90
          ? theme?.palette?.text?.red3
          : theme?.palette?.background?.green
    }
  }))

  const getMachineHealth = async () => {
    setLoading(true)

    const response = await ManageMachinesServices.machinesHealth([machineId])
    if (response.success && response.code === 200) {
      setData(response?.data)
      setTotalRecord(response?.data?.length)
      let totalCount = 0
      response?.data?.map((item) => {
        if (item?.Status == true) {
          totalCount++
        }
      })

      setFaultStatus(totalCount)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoading(false)
  }

  return (
    <Grid container>
      {data != undefined && data?.length != 0 ? (
        <>
          {loading && <AppLoader />}
          <Grid
            item
            xs={12}
            container
            sx={faultStatus != totalRecord ? styles.allCheckFalse : styles.allCheckTrue}>
            <Grid sx={styles.systemBox} alignItems="center" container item xs={12} md={3}>
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                sx={styles.systemCheck}
                item
                xs={4}
                md={8}>
                <Grid item sx={{ paddingRight: "1.2rem" }}>
                  {faultStatus != totalRecord ? (
                    <ErrorIcon sx={styles.machineError} fontSize="large" />
                  ) : (
                    <CheckCircleIcon color="success" fontSize="large" />
                  )}
                </Grid>
                <Typography variant="s1">
                  {faultStatus != totalRecord ? "System Error" : "All Systems Operational"}
                </Typography>
              </Grid>
              {faultStatus != totalRecord ? (
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  sx={styles.numberError}
                  item
                  xs={2}
                  md={4}>
                  <Typography variant="s1" sx={styles.alarmStatus} color="text.red4">
                    {totalRecord - faultStatus}
                  </Typography>
                  <Typography variant="p3" color="text.red4" style={{ paddingLeft: "0.6rem" }}>
                    Error
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
            <Grid
              container
              sx={styles.numberError1}
              alignItems="center"
              justifyContent="center"
              item
              xs={12}
              md={6}>
              <Typography variant="p4" color="text.main">
                Machine Health
              </Typography>
              <Typography
                style={{ padding: "0rem 1rem" }}
                variant="p2"
                color={
                  (faultStatus / totalRecord) * 100 < 99 && (faultStatus / totalRecord) * 100 >= 50
                    ? "background.yellow2"
                    : (faultStatus / totalRecord) * 100 < 50
                    ? "text.red3"
                    : "background.green"
                }>
                {((faultStatus / totalRecord) * 100).toFixed(2) != "NaN"
                  ? ((faultStatus / totalRecord) * 100).toFixed(2)
                  : 0}
                %
              </Typography>
              <BorderLinearProgress
                variant="determinate"
                value={((faultStatus / totalRecord) * 100).toFixed(2)}
                sx={styles.progressBar}
              />
            </Grid>
            <Grid
              container
              sx={styles.alarmWorking}
              alignItems="center"
              justifyContent="center"
              item
              xs={12}
              md={2}>
              <Typography sx={styles.alarmStatus} color="text.main">
                {faultStatus}
              </Typography>
              <Typography variant="p5" color="text.main">
                /{totalRecord}
              </Typography>
              <Typography variant="p3" color="text.main" style={{ paddingLeft: "0.6rem" }}>
                Alarms Working
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={styles.alarmList}>
            <Typography variant="s1" color="text.main">
              Alarms
            </Typography>
            <Grid container spacing={3} style={{ marginTop: "1px" }}>
              {data?.map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Grid
                    item
                    sx={item?.Status == false ? styles.errorBox : styles.alertBox}
                    container>
                    <Grid xs={1} item>
                      <Typography sx={item?.Status == false ? styles.errorText : styles.boxIndex}>
                        {index + 1}
                      </Typography>
                    </Grid>
                    <Grid xs={9} item container alignItems="center" justifyContent="center">
                      <Typography color="text.main" variant="p3">
                        {item?.HealthMatrix?.Alarm}
                      </Typography>
                    </Grid>
                    <Grid item justifyContent="flex-end" alignItems="center" xs={1} container>
                      {item?.Status == false ? (
                        <ErrorIcon color="error" fontSize="large" />
                      ) : (
                        <CheckCircleIcon sx={styles.successColor} fontSize="large" />
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </>
      ) : data == undefined ? (
        <Grid>
          <AppLoader />
        </Grid>
      ) : (
        <Grid item xs={12}>
          <EmptyState titleText="" imgSrc={EmptyHealth} />
        </Grid>
      )}
    </Grid>
  )
}

export default MachineHealth
