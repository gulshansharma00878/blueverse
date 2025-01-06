import * as React from "react"
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material"
import "./ListingTable.scss"

export default function ListingTable({
  columns,
  tableData,
  navigate = () => {},
  rowNavigate = true
}) {
  return (
    <Box className={"table_box_container"}>
      <TableContainer className="table_inner_box">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column, i) => (
                <TableCell
                  className={[
                    "table_head_cell",
                    tableData?.length && i === 0 && "stickyCell--header"
                  ]}
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    borderBottom: "none",
                    cursor: "default",
                    textWrap: "nowrap"
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
                          className={["table_cell", i === 0 && "stickyCell"]}
                          sx={rowNavigate && column.id !== "action" ? { cursor: "pointer" } : {}}
                          key={i}
                          align={column.align}
                          onClick={() => {
                            column?.id !== "action" && navigate(row)
                          }}>
                          {value || (
                            <Typography color="text.gray" variant="p5">
                              NA
                            </Typography>
                          )}
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
