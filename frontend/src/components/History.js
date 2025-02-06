import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import axios from 'axios';

export default function History() {
  const [history, setHistory] = useState([]);
  const [showIp, setShowIp] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Aktivitätsverlauf
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showIp}
              onChange={(e) => setShowIp(e.target.checked)}
              color="primary"
            />
          }
          label="IP-Adressen anzeigen"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zeitstempel</TableCell>
              <TableCell>Aktion</TableCell>
              <TableCell>Details</TableCell>
              {showIp && <TableCell>IP-Adresse</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {history
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(entry.timestamp)}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>{entry.details}</TableCell>
                  {showIp && <TableCell>{entry.ip_address}</TableCell>}
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}
