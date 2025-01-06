import * as React from "react"
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material"
import { useStyles } from "./MemoTableStyle"

export default function ListingTable({ columns, tableData }) {
  const styles = useStyles()
  const theme = useTheme()
  return (
    <Box sx={styles.table_box_container1}>
      <TableContainer
        sx={{ maxHeight: "100vh", overflow: "scroll", maxWidth: "calc(100vw - 10rem)" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  sx={styles.table_head_cell1}
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    borderBottom: "none",
                    cursor: "default",
                    ...(index == 0
                      ? { borderLeft: `4px solid ${theme.palette.primary.main}` }
                      : null)
                  }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ maxHeight: "60vh", overflow: "scroll" }}>
            {tableData?.length ? (
              tableData?.map((row, index) => {
                return (
                  <TableRow className={"table_row"} hover role="checkbox" tabIndex={-1} key={index}>
                    {columns.map((column, i) => {
                      const value = row[column.id]
                      return (
                        <TableCell
                          style={{
                            ...(i == 1 ? { fontWeight: theme.typography.h1.fontWeight } : null)
                          }}
                          sx={styles.table_cell}
                          key={i}
                          align={column.align}>
                          {value || <Typography color="text.gray">No Data</Typography>}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns?.length} align="center">
                  <Typography variant="p3">No Records Found !</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
