import React, { useEffect, useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LoginIcon from '@mui/icons-material/Login';
import { Box, Button, Grid, CircularProgress, Typography } from "@mui/material";
import ConnectBroker from "../components/ConnectBroker";
import BrokerCard from "../components/BrokerCard";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { getDematAccounts, updateDematAccountTradeToggle, deleteDematAccount, autoLoginUsers } from "../hooks/accountManagementService";
import { useNavigate } from 'react-router-dom';

interface DematAccount {
  _id: string;
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
          id: account._id,
          name: `${account.fullName}-${account.broker}-${account.clientId}`,
          isTrading: account.isTradeEnable,
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

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Account Manager"}></AdminToolbar>
      </AdminAppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button 
            component="label" 
            role={undefined} 
            variant="contained" 
            tabIndex={-1} 
            startIcon={<PersonAddAltIcon />}
            onClick={handleOpenConnectBroker}
            disabled={isLoading}
          > 
            Connect Broker
          </Button>

          <Button 
            component="label" 
            role={undefined} 
            variant="contained" 
            tabIndex={-1} 
            startIcon={<LoginIcon />}
            onClick={handleAutoLoginAll}
            disabled={isLoading}
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
    </React.Fragment>
  );
};

export default AccountManager;
