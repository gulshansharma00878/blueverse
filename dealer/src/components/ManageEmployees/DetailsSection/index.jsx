// INFO : This section will render profile details for individual employee inside EmployeeDetails.jsx page.
import React from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import styles from "./detailsSection.module.scss"
import { dateMonthFormat } from "helpers/app-dates/dates"

const DetailsSection = ({ data }) => {
  const { username, email, createdAt, phone, subRole } = data

  const DetailItem = ({ label, value }) => {
    return (
      <Stack spacing={2}>
        <Typography variant="p1" component="p" fontWeight="500" color="text.gray">
          {label}
        </Typography>
        <Typography variant="s1" component="p" color="text.main">
          {value}
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack className={styles["outerContainer"]}>
      <Box className={styles["detailsRow"]}>
        <DetailItem label="Name" value={username || "NA"} />
        <DetailItem label="Email Id" value={email || "NA"} />
        <DetailItem label="Phone Number" value={phone || "NA"} />
      </Box>
      <Box className={styles["detailsRow"]}>
        <DetailItem label="Created Date" value={dateMonthFormat(createdAt) || "NA"} />
        <DetailItem label="Role Type" value={subRole?.name || "NA"} />
      </Box>
    </Stack>
  )
}

export default DetailsSection
