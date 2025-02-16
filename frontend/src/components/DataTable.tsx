import { ReactNode, ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useState } from 'react';

export interface Column<T = any> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => string | ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  getRowActions?: (row: T) => ReactElement;
  searchPlaceholder?: string;
}

const DataTable = <T extends Record<string, any>>({ 
  columns, 
  rows,
  onRowClick,
  getRowActions,
  searchPlaceholder = 'Search...'
}: DataTableProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredRows = rows.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const visibleColumns = columns.filter(col => !isMobile || !col.hideOnMobile);

  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id.toString()}
                  align={column.align}
                  style={{ 
                    minWidth: column.minWidth,
                    backgroundColor: theme.palette.background.paper,
                    fontWeight: 600
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {getRowActions && (
                <TableCell
                  align="right"
                  style={{ 
                    backgroundColor: theme.palette.background.paper,
                    width: 120
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  hover
                  role="row"
                  tabIndex={-1}
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  {visibleColumns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id.toString()} align={column.align}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {getRowActions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {getRowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (getRowActions ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
};

export default DataTable;