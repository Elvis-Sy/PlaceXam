import React from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { IconButton, Tooltip } from "@mui/material";

/**
 * columns: [
 *  { field: "fullname", headerName: "Name", width: 220, align: "left", renderCell: (row) => ... }
 * ]
 * rows: [{ id, ... }]
 */
export default function DataTable({
  columns,
  rows,
  initialPageSize = 3,
  rowsPerPageOptions = [3, 5, 10, 25],
  onRowClick,
  dense = false,
}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  // Slice rows for page
  const visibleRows = rows?.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

  return (
    <Paper elevation={1}>
      <TableContainer>
        <Table size={dense ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align ?? "left"}
                  style={{ width: col.width ?? "auto", fontWeight: 600 }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {!visibleRows.length ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  No data
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align ?? "left"}>
                      {col.renderCell ? col.renderCell(row) : row[col.field] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" alignItems="center" px={2} py={1}>
        <TablePagination
          component="div"
          count={rows?.length ?? 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Rows per page"
        />
      </Box>
    </Paper>
  );
}

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  initialPageSize: PropTypes.number,
  rowsPerPageOptions: PropTypes.array,
  onRowClick: PropTypes.func,
  dense: PropTypes.bool,
};