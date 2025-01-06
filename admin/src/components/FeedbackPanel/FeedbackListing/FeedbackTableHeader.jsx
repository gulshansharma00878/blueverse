import { IconButton, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import React from "react"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { useStyles } from "../feedbackStyles"
import { ArrowDownward } from "@mui/icons-material"

const FeedbackTableHeader = ({ hideAction, sort, handleSort = () => {}, showResponseCount }) => {
  const styles = useStyles()
  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <Typography sx={styles?.tableInformationText}> Sr no.</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>Form Name</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>Questions</Typography>
        </TableCell>
        {showResponseCount && (
          <TableCell>
            <Typography sx={styles?.tableInformationText}>Responses Received</Typography>
          </TableCell>
        )}

        <TableCell>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography sx={styles?.tableInformationText}> Created On</Typography>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className="filtericonBox"
              sx={[styles?.marginLeft, styles?.IconButton]}
              onClick={handleSort.bind(null, sort)}>
              {sort === "NEW" ? (
                <ArrowUpwardIcon color="primary" sx={styles?.IconButton} />
              ) : (
                <ArrowDownward color="primary" sx={styles?.IconButton} />
              )}{" "}
            </IconButton>
          </div>{" "}
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>Region</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>State</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>City</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>OEM</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>Dealership</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={styles?.tableInformationText}>Machine</Typography>
        </TableCell>
        {!hideAction && (
          <TableCell>
            <Typography sx={styles?.tableInformationText}>Action</Typography>
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  )
}

export default FeedbackTableHeader
