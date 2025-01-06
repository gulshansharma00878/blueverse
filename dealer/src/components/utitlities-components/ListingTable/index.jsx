import * as React from "react"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import "./ListingTable.scss"

export default function ListingTable({
  columns,
  tableData,
  navigationHandler = () => {},
  cursor = "default",
  notSticky = false
}) {
  return (
    <Box className={"table_box_container"}>
      <TableContainer className="table_inner_box">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns?.map((column, i) => (
                <TableCell
                  className={[
                    "table_head_cell",
                    !notSticky && tableData?.length && i === 0 && "stickyCell--header"
                  ]}
                  key={column?.id}
                  align={column?.align}
                  style={{
                    minWidth: column.minWidth,
                    borderBottom: "none",
                    cursor: "default",
                    textWrap: "nowrap"
                  }}>
                  {column?.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ maxHeight: "60vh", overflow: "scroll" }}>
            {tableData.length ? (
              tableData?.map((row, index) => {
                return (
                  <TableRow className={"table_row"} hover role="checkbox" tabIndex={-1} key={index}>
                    {columns?.map((column, i) => {
                      const value = row[column?.id]
                      return (
                        <TableCell
                          className={["table_cell", !notSticky && i === 0 && "stickyCell"]}
                          sx={
                            column?.id === "name" ||
                            column?.id === "View Memo" ||
                            column?.id === "Pay Now"
                              ? { cursor: "pointer" }
                              : cursor
                              ? { cursor }
                              : undefined
                          }
                          key={i}
                          onClick={() => {
                            column?.id !== "action" && navigationHandler(row)
                          }}
                          align={column?.align}>
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
