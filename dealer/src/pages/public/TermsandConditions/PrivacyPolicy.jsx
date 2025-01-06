import { Grid, Paper } from "@mui/material"
import TermsAndPolicyHeader from "components/TermsAndPolicy/TermsAndPolicyHeader"
import React, { useState, useEffect } from "react"
import { useStyles } from "./Styles"
import TermsAndPolicyPageHeader from "components/TermsAndPolicy/TermsAndPolicyPageHeader"
import { AuthService } from "network/authService"
import Toast from "components/utitlities-components/Toast/Toast"
import AppLoader from "components/Loader/AppLoader"
const PrivacyPolicy = () => {
  const styles = useStyles()
  useEffect(() => {
    getPrivacyPolicy()
  }, [])
  const [privacyPolicy, setPrivacyPolicy] = useState("")
  const [loading, setLoading] = useState(false)
  const getPrivacyPolicy = async () => {
    setLoading(true)
    const response = await AuthService.getTerms()
    if (response?.success && response?.code === 200) {
      setPrivacyPolicy(response?.data?.privacyPolicy)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  return (
    <Paper sx={styles.main}>
      <TermsAndPolicyPageHeader />
      <Paper sx={styles.wrapper}>
        <Grid container>
          <TermsAndPolicyHeader title={"Privacy Policy"} />
          <Grid item xs={12}>
            {loading ? <AppLoader /> : <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />}
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  )
}

export default PrivacyPolicy
