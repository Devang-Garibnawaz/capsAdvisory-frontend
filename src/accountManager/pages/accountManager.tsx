import React, { useEffect, useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LoginIcon from '@mui/icons-material/Login';
import { Box, Button, Grid, CircularProgress, Typography, Dialog, IconButton, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import ConnectBroker from "../components/ConnectBroker";
import BrokerCard from "../components/BrokerCard";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { getDematAccounts, updateDematAccountTradeToggle, deleteDematAccount, autoLoginUsers, updateQuantity } from "../hooks/accountManagementService";
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
interface DematAccount {
  id: string;
  referenceUserId: string;
  email: string;
  fullName: string;
  broker: string;
  clientId: string;
  pinNumber: string;
  totpSecret: string;
  apiKey: string;
  isMaster: boolean;
  isTradeEnable: boolean;
  createdAt: string;
  updatedAt: string;
  quantityToTrade: number
  stats: {
    inGroup: number;
    pnl: number;
    margin: number;
    position?: any;
    orders?: {
      orders?: any;
      total?: number;
      cancelled?: number;
      complete?: number;
      pending?: number;
      rejected?: number;
    };
    pending: number;
    complete: number;
    reject: number;
    cancel: number;
  };
}

interface BrokerAccount {
  id: string;
  name: string;
  margin: number;
  isTrading: boolean;
  stats: {
    inGroup: number;
    pnl: number;
    margin: number;
    position?: any;
    orders?: {
      orders?: any;
      total?: number;
      cancelled?: number;
      complete?: number;
      pending?: number;
      rejected?: number;
    };
    pending: number;
    complete: number;
    reject: number;
    cancel: number;
  };
}

const AccountManager = () => {
  const [isConnectBrokerOpen, setIsConnectBrokerOpen] = useState(false);
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingAccountId, setTogglingAccountId] = useState<string | null>(null);
  const [openEditQty, setOpenEditQty] = useState<boolean>(false);
  const [editAccountData, setEditAccountData] = useState<any>(null);
  const [updatedQty, setUpdatedQty] = useState<Number>(0);
  const snackbar = useSnackbar();
  const navigate = useNavigate();

  // Function to fetch broker accounts
  const fetchBrokerAccounts = async () => {
    try {
      setIsLoading(true);
      
      const response = await getDematAccounts();
      
      if (response.status) {
        // Transform the demat accounts into the format expected by BrokerCard
        const transformedAccounts = response.dematAccounts.map((account: DematAccount) => ({
          id: account.id,
          name: `${account.fullName}-${account.broker}-${account.clientId}`,
          isTrading: account.isTradeEnable,
          quantityToTrade: account.quantityToTrade,
          stats: {
            inGroup: account.stats.inGroup || 0,
            pnl: account.stats.pnl || 0,
            margin: account.stats.margin || 0,
            position: account.stats.position || 0,
            orders: account.stats.orders || 0,
            
          },
        }));
        
        setBrokerAccounts(transformedAccounts);
      } else {
        snackbar.error(response.message || 'Failed to fetch demat accounts');
      }
    } catch (error: any) {
      snackbar.error('Error fetching broker accounts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerAccounts();
  }, []);

  const handleOpenConnectBroker = () => {
    setIsConnectBrokerOpen(true);
  };

  const handleAutoLoginAll = async () => {
    try {
      setIsLoading(true);
      const response = await autoLoginUsers();
      
      if (response.status) {
        snackbar.success('Auto login initiated for all users');
      } else {
        snackbar.error(response.message || 'Failed to initiate auto login');
      }
    } catch (error: any) {
      snackbar.error('Error initiating auto login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConnectBroker = () => {
    setIsConnectBrokerOpen(false);
  };

  const handleSubmitBrokerDetails = (data: any) => {
    // The actual API call is now handled in the ConnectBroker component
    // We just need to refresh the list of broker accounts
    fetchBrokerAccounts();
  };

  const handleToggleTrading = async (accountId: string) => {
    try {
      setTogglingAccountId(accountId);
      
      // Find the current account to get its current trading status
      const account = brokerAccounts.find(acc => acc.id === accountId);
      if (!account) return;
      
      // Call the API to toggle the trading status
      const response = await updateDematAccountTradeToggle(accountId, !account.isTrading);
      
      if (response.status) {
        // Update the local state to reflect the change
        setBrokerAccounts(accounts =>
          accounts.map(acc =>
            acc.id === accountId
              ? { ...acc, isTrading: !acc.isTrading }
              : acc
          )
        );
        
        snackbar.success(`Trading ${!account.isTrading ? 'enabled' : 'disabled'} successfully`);
      } else {
        snackbar.error(response.message || 'Failed to update trading status');
      }
    } catch (error: any) {
      snackbar.error('Error updating trading status: ' + error.message);
    } finally {
      setTogglingAccountId(null);
    }
  };

  const handleRefresh = () => {
    fetchBrokerAccounts();
  };

  const handleDelete = async (accountId: string) => {
    try {
      const response = await deleteDematAccount(accountId);
      
      if (response.status) {
        setBrokerAccounts(accounts =>
          accounts.filter(account => account.id !== accountId)
        );
        snackbar.success('Demat account deleted successfully');
      } else {
        snackbar.error(response.message || 'Failed to delete demat account');
      }
    } catch (error: any) {
      snackbar.error('Error deleting demat account: ' + error.message);
    }
  };

  const handleView = (accountId: string) => {
    navigate(`/admin/account/${accountId}`);
  };

  const handleUpdateQty = (account:any) =>{
    setOpenEditQty(true);
    setEditAccountData(account);
    setUpdatedQty(account?.quantityToTrade || 1)
  }

  const handleSubmitQtyUpdate = async () =>{
    const data = {
      ...editAccountData,
      quantityToTrade: updatedQty
    }
    const response = await updateQuantity(data);
    if (response.status) {
        snackbar.success('Quantity is updated!');
        setOpenEditQty(false);
        setBrokerAccounts((prev) =>
          prev.map((x) =>
            x.id === data.id
              ? { ...x, quantityToTrade: data.quantityToTrade } // update quantity
              : x
          )
        );
    } else {
        snackbar.error(response.message || 'Failed to update quantity');
    }
  }

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Account Manager"}></AdminToolbar>
      </AdminAppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button 
            component="label"  
            variant="contained" 
            tabIndex={-1} 
            startIcon={<PersonAddAltIcon />}
            onClick={handleOpenConnectBroker}
            disabled={isLoading}
            sx={{
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'}}
          > 
            Connect Broker
          </Button>

          <Button 
            component="label"
            variant="contained" 
            tabIndex={-1} 
            startIcon={<LoginIcon />}
            onClick={handleAutoLoginAll}
            disabled={isLoading}
            sx={{
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'}}
          > 
            Auto Login All
          </Button>
        </Box>
        
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',                    // 1 card per row on mobile
                sm: 'repeat(2, 1fr)',         // 2 cards per row on small screens
                md: 'repeat(3, 1fr)',         // 3 cards per row on medium and larger screens
              },
              gap: 3,
            }}
          >
            {brokerAccounts.length > 0 ? (
              brokerAccounts.map((account) => (
                <BrokerCard
                  key={account.id}
                  name={account.name}
                  margin={account.margin}
                  isTrading={account.isTrading}
                  stats={account.stats}
                  onToggleTrading={() => handleToggleTrading(account.id)}
                  onRefresh={() => handleRefresh()}
                  onDelete={() => handleDelete(account.id)}
                  onView={() => handleView(account.id)}
                  onUpdateQuantity={() => handleUpdateQty(account)}
                  isToggling={togglingAccountId === account.id}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No demat accounts found. Connect a broker to get started.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <ConnectBroker
        open={isConnectBrokerOpen}
        onClose={handleCloseConnectBroker}
        onSubmit={handleSubmitBrokerDetails}
      />

        <Dialog open={openEditQty} 
          onClose={() => setOpenEditQty(!openEditQty)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
              color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B',
            },
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B'
              }}>
                Edit Quantity
              </Typography>
              <IconButton 
                onClick={() => setOpenEditQty(!openEditQty)} 
                size="small" 
                sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? 'white' : '#64748B'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={updatedQty || 1}
                  onChange={(e) => setUpdatedQty(Number(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ min: "0", step: "1" }}
                  sx={{
                    mt:2,
                    input: { 
                      color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B'
                    },
                    label: { 
                      color: theme => theme.palette.mode === 'dark' ? 'grey.500' : '#64748B'
                    },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#F8FAFC',
                      '& fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.23)'
                          : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.4)'
                          : 'rgba(0, 0, 0, 0.4)',
                      },
                    },
                  }}
                />
              </Box>
          </DialogContent>
          <DialogActions sx={{ padding: 3 }}>
                  <Button 
                    onClick={() => setOpenEditQty(!openEditQty)}
                    variant="contained"
                    color="error"
                    type="button"
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={updatedQty === 0}
                    onClick={handleSubmitQtyUpdate}
                    sx={{ textTransform: 'none' }}
                  >
                    Update
                </Button>
          </DialogActions>
        </Dialog>
    </React.Fragment>
  );
};

export default AccountManager;
