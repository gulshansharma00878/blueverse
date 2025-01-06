import { Grid, Typography } from "@mui/material"
import InputField from "components/utilities-components/InputField/InputField"
import React from "react"
import { useStyles } from "../SubscriptionSettingStyles"
export function PlanCard({ plan, isEnabled, onUpdatePlan = () => {} }) {
  const styles = useStyles()

  let bgColorMap = {
    gold: { bg: styles.goldWash, label: "Gold Wash" },
    silver: { bg: styles.silverWash, label: "Silver Wash (Default)" },
    platinum: { bg: styles.platinumWash, label: "Platinum Wash" }
  }

  return (
    <Grid sx={styles.planCardBox} container>
      <Grid
        item
        container
        justifyContent="center"
        alignItems="center"
        sx={[
          styles.topName,
          isEnabled ? bgColorMap[plan?.type?.toLowerCase()].bg : styles.disabled
        ]}>
        <Typography variant="p1">{bgColorMap[plan?.type?.toLowerCase()].label}</Typography>
      </Grid>
      <Grid sx={styles.innerPlanBox} item>
        <InputField
          size="medium"
          name="price"
          label="Per Wash Price (Dealer)*"
          disabled={!isEnabled}
          InputProps={{ disableUnderline: true }}
          value={plan?.dealerPerWashPrice}
          variant="filled"
          onChange={(e) => onUpdatePlan("dealerPerWashPrice", e)}
          type="text"
          fullWidth
          margin="normal"
        />
        <InputField
          size="medium"
          name="manpower"
          label="Manpower price per wash"
          disabled={!isEnabled}
          InputProps={{ disableUnderline: true }}
          value={plan?.manpowerPricePerWash}
          variant="filled"
          onChange={(e) => onUpdatePlan("manpowerPricePerWash", e)}
          type="text"
          fullWidth
          margin="normal"
        />
      </Grid>
    </Grid>
  )
}
