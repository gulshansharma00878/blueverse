import { Grid, Paper } from "@mui/material"
import TermsAndPolicyHeader from "components/TermsAndPolicy/TermsAndPolicyHeader"
import React, { useState, useEffect } from "react"
import { useStyles } from "./Styles"
import TermsAndPolicyPageHeader from "components/TermsAndPolicy/TermsAndPolicyPageHeader"
import { AuthService } from "network/authService"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
const Terms = () => {
  const styles = useStyles()
  useEffect(() => {
    getPrivacyPolicy()
  }, [])
  const [terms, setTerms] = useState("")
  const [loading, setLoading] = useState(false)
  const getPrivacyPolicy = async () => {
    setLoading(true)
    const response = await AuthService.getTerms()
    if (response?.success && response?.code === 200) {
      setTerms(response?.data?.termsOfUse)
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
          <TermsAndPolicyHeader title={"Terms of Use"} />
          {loading && <AppLoader />}
          <Grid item xs={12}>
            <div dangerouslySetInnerHTML={{ __html: terms }} />
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  )
}

export default Terms
