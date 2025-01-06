import { Typography } from "@mui/material"
import React from "react"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"

const ContentBoxInfo = ({
  item,
  firstColAlign = "right",
  secondColAlign = "right",
  rowGap = "0.8rem",
  variant = "p2",
  firstColWeight = "600",
  secondColWeight = "400",
  tableWidth = "fit-content"
}) => {
  return (
    <TableContainer component={Paper} sx={{ backgroundColor: "inherit", width: tableWidth }}>
      <Table aria-label="simple table">
        <TableBody>
          {item?.map((content, index) => (
            <TableRow key={index}>
              <TableCell
                sx={{
                  borderBottom: 0,
                  padding: 0,
                  paddingRight: "2.4rem",
                  paddingBottom: rowGap
                }}
                align={firstColAlign}>
                <Typography variant={variant} fontWeight={firstColWeight}>
                  {content?.item}
                </Typography>
              </TableCell>
              <TableCell
                align={secondColAlign}
                sx={{ borderBottom: 0, padding: 0, paddingBottom: rowGap }}>
                <Typography variant={variant} fontWeight={secondColWeight}>
                  {content?.value}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ContentBoxInfo
