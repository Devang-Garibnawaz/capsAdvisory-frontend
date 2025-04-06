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
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncIcon from '@mui/icons-material/Sync';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import { getDematAccounts } from '../hooks/accountManagementService';

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('positions');
  const [accountName, setAccountName] = useState('');
  const [margin] = useState(0.00);
  const [pnl] = useState(-232.5);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await getDematAccounts();
        if (response.status) {
          const account = response.dematAccounts.find((acc: any) => acc._id === accountId);
          if (account) {
            setAccountName(`${account.fullName}-angelone-${account.clientId}`);
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };

    fetchAccountDetails();
  }, [accountId]);

  const handleBack = () => {
    navigate(-1);
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: 'grey.500' }}>Id</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Symbol ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Product ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Action ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Quantity ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Pnl ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Ltp ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Avgprice ↓</TableCell>
        <TableCell sx={{ color: 'grey.500' }}>Square Off</TableCell>
      </TableRow>
    </TableHead>
  );

  const renderPositionsContent = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{ 
              backgroundColor: '#0EA5E9', 
              '&:hover': { backgroundColor: '#0284C7' },
              textTransform: 'none',
              py: 0.5,
              px: 2
            }}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<CloseIcon />}
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
          {renderTableHeader()}
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>1</TableCell>
              <TableCell sx={{ color: 'white' }}>NIFTY09APR2523000PE</TableCell>
              <TableCell sx={{ color: 'white' }}>CARRYFORWARD</TableCell>
              <TableCell>
                <Box sx={{ 
                  color: 'white',
                  backgroundColor: '#059669',
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1
                }}>
                  Buy
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white' }}>75</TableCell>
              <TableCell sx={{ color: '#EF4444' }}>-232.5 ↓</TableCell>
              <TableCell sx={{ color: 'white' }}>186.05</TableCell>
              <TableCell sx={{ color: 'white' }}>189.15</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                >
                  Square Off
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
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
            <IconButton sx={{ 
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
          {activeTab === 'orders' && (
            <Typography color="text.secondary">Orders content will go here</Typography>
          )}
          {activeTab === 'trades' && (
            <Typography color="text.secondary">Trades content will go here</Typography>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default AccountDetails; 