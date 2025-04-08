import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import { getDematAccounts } from '../hooks/accountManagementService';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from '../../core/contexts/SnackbarProvider';
import { ExitAllPostions } from '../../nfo/hooks/niftyServices';

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  type TabType = 'positions' | 'orders' | 'trades';
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [accountName, setAccountName] = useState('');
  const [margin, setMargin] = useState<number>(0.00);
  const [pnl, setPnl] = useState<number>(0.00);
  type SortDirection = 'asc' | 'desc';
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const snackbar = useSnackbar();
  
  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      const response = await getDematAccounts();
      if (response.status) {
        const account = response.dematAccounts.find((acc: any) => acc._id === accountId);
        if (account) {
          setAccountDetails(account);
          setMargin(Number(Number(account?.stats?.margin || 0).toFixed(2)));
          
          // Calculate total PNL from positions
          const positions = Object.values(account?.stats?.position || {});
          const totalPnl = positions.reduce((sum: number, position: any) => {
            return sum + Number(position.pnl || 0);
          }, 0);
          
          setPnl(Number(totalPnl.toFixed(2)));
          setAccountName(`${account.fullName}-angelone-${account.clientId}`);
          snackbar.success('Account details fetched successfully');
        }
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      snackbar.error('Error fetching account details');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data: Record<string, any>[], property: string): Record<string, any>[] => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
  };

  const filterData = (data: Record<string, any>[], query: string): Record<string, any>[] => {
    if (!query) return data;
    const lowercaseQuery = query.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getTableData = () => {
    if (activeTab === 'positions' && accountDetails?.stats?.position) {
      const data = Object.values(accountDetails.stats.position || {}) as Record<string, any>[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    if (activeTab === 'orders' && accountDetails?.stats?.orders?.orders) {
      const data = Object.values(accountDetails.stats.orders.orders || {}) as Record<string, any>[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    if (activeTab === 'trades' && accountDetails?.stats?.trades) {
      const data = Object.values(accountDetails.stats.trades || {}) as Record<string, any>[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    return [];
  };

  const handleExportToExcel = () => {
    const data = getTableData();
    if (data.length === 0) return;

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSquareOffAll = async () => {
    try {
      const result = await ExitAllPostions();
      if (result.status) {
        snackbar.success(result.message);
        fetchAccountDetails(); // Refresh the positions data
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      console.error('Error squaring off positions:', error);
      snackbar.error('Failed to square off positions');
    }
  };

  const renderSortLabel = (label: string, property: string) => (
    <TableSortLabel
      active={orderBy === property}
      direction={orderBy === property ? order : 'asc'}
      onClick={() => handleSort(property)}
      sx={{
        color: 'white !important',
        '& .MuiTableSortLabel-icon': {
          color: 'white !important',
        },
      }}
    >
      {label}
    </TableSortLabel>
  );

  const renderPositionsContent = () => {
    const positions = getTableData();
    const allPositionsClosed = positions.length > 0 && positions.every(position => position.buyqty === position.sellqty);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{ 
                backgroundColor: '#0EA5E9', 
                '&:hover': { backgroundColor: '#0284C7' },
                textTransform: 'none',
                py: 0.5,
                px: 2
              }}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<CloseIcon />}
              disabled={allPositionsClosed || positions.length === 0}
              onClick={handleSquareOffAll}
              sx={{ 
                textTransform: 'none',
                py: 0.5,
                px: 2
              }}
            >
              Square Off All
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: '#1E1E1E',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
          <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            {renderPositionsTableHeader()}
            <TableBody>
              {positions.map((position: any, index: number) => (
                <TableRow key={position.tradingsymbol}>
                  <TableCell sx={{ color: 'white' }}>{index + 1}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{position.tradingsymbol}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{position.producttype || 'CARRYFORWARD'}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      color: position.buyqty === position.sellqty ? '#fc424a' :
                             position.buyqty > 0 ? '#00d25b' : '#fc424a',
                      backgroundColor: position.buyqty === position.sellqty ? 'rgba(252, 66, 74, 0.2)' :
                                     position.buyqty > 0 ? 'rgba(0, 210, 91, 0.2)' : 'rgba(252, 66, 74, 0.2)',
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      textShadow: position.buyqty === position.sellqty ? '0 0 10px rgba(252, 66, 74, 0.5)' :
                                 position.buyqty > 0 ? '0 0 10px rgba(0, 210, 91, 0.5)' : '0 0 10px rgba(252, 66, 74, 0.5)',
                      fontWeight: 500
                    }}>
                      {position.buyqty === position.sellqty ? 'CLOSED' :
                       position.buyqty > 0 ? 'BUY' : 'SELL'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{position.buyqty}</TableCell>
                  <TableCell sx={{ color: Number(position.pnl) >= 0 ? '#22C55E' : '#EF4444' }}>
                    {Number(position.pnl).toFixed(2)} {Number(position.pnl) < 0 ? '↓' : '↑'}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{Number(position.ltp).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{Number(position.avgnetprice).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      disabled={position.buyqty === position.sellqty}
                    >
                      Square Off
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {positions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: 'white' }}>
                    {searchQuery ? 'No matching positions found' : 'No positions found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderOrdersTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: 'white' }}>Id</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Symbol', 'tradingsymbol')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Product', 'producttype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('B/S', 'transactiontype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Quantity', 'quantity')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Order Type', 'ordertype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Price', 'price')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Order Id', 'orderid')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Status', 'status')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Create Time', 'exchtime')}</TableCell>
        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
      </TableRow>
    </TableHead>
  );

  const renderOrdersContent = () => {
    const orders = getTableData();

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{ 
                backgroundColor: '#0EA5E9', 
                '&:hover': { backgroundColor: '#0284C7' },
                textTransform: 'none',
                py: 0.5,
                px: 2
              }}
            >
              Export to CSV
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: '#1E1E1E',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
          <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            {renderOrdersTableHeader()}
            <TableBody>
              {orders.map((order: any, index: number) => (
                <TableRow key={order.orderid}>
                  <TableCell sx={{ color: 'white' }}>{index + 1}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{order.tradingsymbol}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{order.producttype || 'CARRYFORWARD'}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      color: order.transactiontype === 'BUY' ? '#00d25b' : '#fc424a',
                      backgroundColor: order.transactiontype === 'BUY' ? 'rgba(0, 210, 91, 0.2)' : 'rgba(252, 66, 74, 0.2)',
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      textShadow: order.transactiontype === 'BUY' ? '0 0 10px rgba(0, 210, 91, 0.5)' : '0 0 10px rgba(252, 66, 74, 0.5)',
                      fontWeight: 500
                    }}>
                      {order.transactiontype}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Typography sx={{ color: '#00d25b' }}>{order.filledshares}</Typography>
                      <Typography sx={{ color: 'white' }}>/{order.quantity}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{order.ordertype}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{Number(order.price).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{order.orderid}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      color: order.status === 'complete' ? '#00d25b' : 
                             order.status === 'rejected' || order.status === 'cancelled' ? '#fc424a' : 
                             order.status === 'pending' ? '#F59E0B' : '#6B7280',
                      backgroundColor: order.status === 'complete' ? 'rgba(0, 210, 91, 0.2)' : 
                                     order.status === 'rejected' || order.status === 'cancelled' ? 'rgba(252, 66, 74, 0.2)' : 
                                     order.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      textShadow: order.status === 'complete' ? '0 0 10px rgba(0, 210, 91, 0.5)' :
                                 order.status === 'rejected' || order.status === 'cancelled' ? '0 0 10px rgba(252, 66, 74, 0.5)' :
                                 order.status === 'pending' ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
                      fontWeight: 500
                    }}>
                      {order.status === 'complete' ? 'COMPLETE' : 
                       order.status === 'rejected' ? 'REJECTED' : 
                       order.status === 'pending' ? 'PENDING' : 
                       order.status === 'cancelled' ? 'CANCELLED' : order.status.toUpperCase()}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{order.updatetime}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      disabled={['complete', 'cancelled', 'rejected'].includes(order.status.toLowerCase())}
                      sx={{ 
                        color: 'white',
                        backgroundColor: '#4B5563',
                        '&:hover': { backgroundColor: '#374151' },
                        '&.Mui-disabled': {
                          backgroundColor: '#1F2937',
                          color: '#6B7280'
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ color: 'white' }}>
                    {searchQuery ? 'No matching orders found' : 'No orders found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderTradesTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: 'white' }}>Id</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Symbol', 'tradingsymbol')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Product', 'producttype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Quantity', 'fillsize')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('B/S', 'transactiontype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Price', 'fillprice')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Order Id', 'orderid')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Create Time', 'filltime')}</TableCell>
      </TableRow>
    </TableHead>
  );

  const renderTradesContent = () => {
    const trades = getTableData();

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{ 
                backgroundColor: '#0EA5E9', 
                '&:hover': { backgroundColor: '#0284C7' },
                textTransform: 'none',
                py: 0.5,
                px: 2
              }}
            >
              Export to CSV
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: '#1E1E1E',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              },
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
          <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            {renderTradesTableHeader()}
            <TableBody>
              {trades.map((trade: any, index: number) => (
                <TableRow key={trade.fillid}>
                  <TableCell sx={{ color: 'white' }}>{index + 1}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trade.tradingsymbol}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trade.producttype}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trade.fillsize}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      color: trade.transactiontype === 'BUY' ? '#00d25b' : '#fc424a',
                      backgroundColor: trade.transactiontype === 'BUY' ? 'rgba(0, 210, 91, 0.2)' : 'rgba(252, 66, 74, 0.2)',
                      textShadow: trade.transactiontype === 'BUY' ? '0 0 10px rgba(0, 210, 91, 0.5)' : '0 0 10px rgba(252, 66, 74, 0.5)'
                    }}>
                      {trade.transactiontype}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{Number(trade.fillprice).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trade.orderid}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{trade.filltime}</TableCell>
                </TableRow>
              ))}
              {trades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'white' }}>
                    {searchQuery ? 'No matching trades found' : 'No trades found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderPositionsTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: 'white' }}>Id</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Symbol', 'tradingsymbol')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Product', 'producttype')}</TableCell>
        <TableCell sx={{ color: 'white' }}>Action</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Quantity', 'buyqty')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Pnl', 'pnl')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Ltp', 'ltp')}</TableCell>
        <TableCell sx={{ color: 'white' }}>{renderSortLabel('Avgprice', 'avgnetprice')}</TableCell>
        <TableCell sx={{ color: 'white' }}>Square Off</TableCell>
      </TableRow>
    </TableHead>
  );

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Account Details"}></AdminToolbar>
      </AdminAppBar>
      
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          backgroundColor: '#1A1C1E',
          p: 2,
          borderRadius: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleBack}
              sx={{ 
                backgroundColor: '#0EA5E9',
                '&:hover': { backgroundColor: '#0284C7' }
              }}
            >
              <ArrowBackIcon sx={{ color: 'white' }} />
            </IconButton>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {accountName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: 'grey.500' }}>
              Margin
            </Typography>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {margin.toFixed(2)}
            </Typography>
            <Typography sx={{ color: 'grey.500' }}>
              PnL
            </Typography>
            <Typography variant="h6" sx={{ color: pnl >= 0 ? '#22C55E' : '#EF4444' }}>
              {pnl.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#0EA5E9',
                '&:hover': { backgroundColor: '#0284C7' }
              }}
            >
              Place Order
            </Button>
            <IconButton 
              onClick={() => fetchAccountDetails()}
            sx={{ 
              backgroundColor: '#8B5CF6',
              '&:hover': { backgroundColor: '#7C3AED' }
            }}>
              <SyncIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ 
          display: 'flex',
          backgroundColor: '#1A1C1E',
          borderRadius: 1,
          mb: 2,
          overflow: 'hidden'
        }}>
          <Button
            variant={activeTab === 'positions' ? 'contained' : 'text'}
            onClick={() => setActiveTab('positions')}
            sx={{ 
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: activeTab === 'positions' ? '#000' : 'transparent',
              color: activeTab === 'positions' ? 'white' : 'grey.500',
              '&:hover': {
                backgroundColor: activeTab === 'positions' ? '#000' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Positions
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'contained' : 'text'}
            onClick={() => setActiveTab('orders')}
            sx={{ 
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: activeTab === 'orders' ? '#000' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'grey.500',
              '&:hover': {
                backgroundColor: activeTab === 'orders' ? '#000' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Orders
          </Button>
          <Button
            variant={activeTab === 'trades' ? 'contained' : 'text'}
            onClick={() => setActiveTab('trades')}
            sx={{ 
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: activeTab === 'trades' ? '#000' : 'transparent',
              color: activeTab === 'trades' ? 'white' : 'grey.500',
              '&:hover': {
                backgroundColor: activeTab === 'trades' ? '#000' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Trades
          </Button>
        </Box>

        {/* Content Area */}
        <Box sx={{ 
          backgroundColor: '#1A1C1E',
          borderRadius: 1,
          p: 2
        }}>
          {activeTab === 'positions' && renderPositionsContent()}
          {activeTab === 'orders' && renderOrdersContent()}
          {activeTab === 'trades' && renderTradesContent()}
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default AccountDetails; 