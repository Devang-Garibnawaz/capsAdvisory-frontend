import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Card, 
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  InputAdornment
} from "@mui/material";
import CreateGroup from "../components/CreateGroup";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { getGroups, createGroup, deleteGroup, Group, toggleMaster, toggleTrading, addChildToGroup, getGroupChildren, GroupChild, removeChildFromGroup, squareOffAllByGroup } from "../hooks/groupManagementService";
import { getDematAccounts, updateDematAccountTradeToggle, cancelOrderByOrderId, cancelAllOrdersByGroup, squareOffByUser } from "../hooks/accountManagementService";
import { BrokerAccount, GroupStats } from '../types';
import AddChildAccount from '../components/AddChildAccount';
import BrokerCard from '../components/BrokerCard';

// Extended interface for local use
interface ExtendedGroup extends Group {
  selectedAccountId?: string;
}

interface GroupDetailsViewProps {
  group: ExtendedGroup;
  onBack: () => void;
  onAddChild: () => void;
  onToggleMaster: () => void;
  onToggleTrading: () => void;
  isTogglingMaster: boolean;
  isTogglingTrading: boolean;
  masterAccountName?: string;
  setRefreshFunction: (fn: () => Promise<void>) => void;
  brokerAccounts: BrokerAccount[];
  setBrokerAccounts: (accounts: BrokerAccount[]) => void;
}

const GroupDetailsView: React.FC<GroupDetailsViewProps> = ({
  group,
  onBack,
  onAddChild,
  onToggleMaster,
  onToggleTrading,
  isTogglingMaster,
  isTogglingTrading,
  masterAccountName,
  setRefreshFunction,
  brokerAccounts,
  setBrokerAccounts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [placeRejected, setPlaceRejected] = useState(false);
  const [groupChildren, setGroupChildren] = useState<GroupChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [togglingAccountId, setTogglingAccountId] = useState<string | null>(null);
  const [tableState, setTableState] = useState<TableState>({
    activeTab: 'positions',
    searchQuery: '',
    orderBy: '',
    order: 'asc'
  });
  const [tableData, setTableData] = useState<TableData>({
    positions: [],
    orders: [],
    trades: []
  });
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const ws = useRef<WebSocket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchGroupChildren = async () => {
    try {
      setIsLoadingChildren(true);
      const response = await getGroupChildren(group._id);
      
      if (response.status) {
        const transformedAccounts = response.dematAccounts.map((account: any) => ({
          _id: account._id,
          name: `${account.fullName}-angelone-${account.clientId}`,
          accountId: account._id,
          status: account.isTradeEnable ? 'active' : 'inactive',
          multiplier: account.multiplier || 1,
          fixLot: account.fixLot || false,
          stats: account.stats
        }));
        setGroupChildren(transformedAccounts);
      }
    } catch (error: any) {
      console.error('Error fetching group children:', error.message);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // Fetch group children when group changes
  useEffect(() => {
    fetchGroupChildren();
  }, [group._id]);

  // Update table data when group children change
  useEffect(() => {
    const positions: any[] = [];
    const orders: any[] = [];
    const trades: any[] = [];

    groupChildren.forEach(child => {
      if (child.stats?.position) {
        positions.push(...Object.values(child.stats.position));
      }
      if (child.stats?.orders?.orders) {
        orders.push(...Object.values(child.stats.orders.orders));
      }
      if (child.stats?.trades) {
        trades.push(...Object.values(child.stats.trades));
      }
    });

    setTableData({ positions, orders, trades });
  }, [groupChildren]);


  useEffect(() => {
    const token = localStorage.getItem('authkey');
    if (ws.current) {
      ws.current.close();
    }
    
    ws.current = new WebSocket(`ws://localhost:8080/ws/demat?token=${token}&group=${group._id}`) as WebSocket;

    if (ws.current) {
      (ws.current as WebSocket).onopen = () => console.log('Connected');
      (ws.current as WebSocket).onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'demat_accounts') {
          const transformedAccounts = data?.data?.dematAccounts.map((account: any) => ({
            _id: account._id,
            name: `${account.fullName}-angelone-${account.clientId}`,
            accountId: account._id,
            status: account.isTradeEnable ? 'active' : 'inactive',
            multiplier: account.multiplier || 1,
            fixLot: account.fixLot || false,
            stats: account.stats
          }));
          setGroupChildren(transformedAccounts);
        }
      };
      (ws.current as WebSocket).onclose = () => console.log('Disconnected');
    }

    return () => {
      if (ws.current) {
        (ws.current as WebSocket).close();
      }
    };
  }, []);

  const handleRefresh = async () => {
    await fetchGroupChildren();
  };

  const handleToggleTrading = async (accountId: string) => {
    try {
      setTogglingAccountId(accountId);
      // TODO: Implement toggle trading for child account using updateDematAccountTradeToggle
      const account = groupChildren.find(child => child.accountId === accountId);
      if (!account) return;

      const response = await updateDematAccountTradeToggle(accountId, account.status !== 'active');
      
      if (response.status) {
        // Update the local state to reflect the change
        setGroupChildren(children =>
          children.map(child =>
            child.accountId === accountId
              ? { ...child, status: child.status === 'active' ? 'inactive' : 'active' }
              : child
          )
        );
        
        snackbar.success(`Trading ${account.status !== 'active' ? 'enabled' : 'disabled'} successfully`);
      } else {
        snackbar.error(response.message || 'Failed to update trading status');
      }
    } catch (error: any) {
      snackbar.error('Error toggling trading status: ' + error.message);
    } finally {
      setTogglingAccountId(null);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      const response = await removeChildFromGroup(group._id, accountId);
      
      if (response.status) {
        // Update the local state to remove the child
        setGroupChildren(children =>
          children.filter(child => child.accountId !== accountId)
        );
        snackbar.success('Child account removed from group successfully');
      } else {
        snackbar.error(response.message || 'Failed to remove child from group');
      }
    } catch (error: any) {
      snackbar.error('Error removing child from group: ' + error.message);
    }
  };

  const handleView = (accountId: string) => {
    navigate(`/admin/account/${accountId}`);
  };

  const handleCancelAllOrders = async (groupId='') => {
    try {
      const orderids = tableData.orders
        .filter((order: any) => !["complete", "rejected", "cancelled"].includes(order.status?.toLowerCase()))
        .map((order: any) => order.orderid);

      const response = await cancelAllOrdersByGroup(groupId,orderids);
      
      if (response.status) {
        snackbar.success(response.message);
        fetchGroupChildren();
      } else {
        snackbar.error(response.message || 'Failed to cancel orders');
      }
    } catch (error: any) {
      snackbar.error('Error cancelling orders: ' + error.message);
    }
  };

  const handleSquareOffAll = async (groupId: string) => {
    try {
      const response = await squareOffAllByGroup(groupId);
      if (response.status) {
        snackbar.success(response.message);
        fetchGroupChildren();
      } else {
        snackbar.error(response.message || 'Failed to square off all');
      }
    } catch (error: any) {
      snackbar.error('Error square off all: ' + error.message);
    }
  };

  const handleSquareOff = async (row: any) => {
    try {
      const response = await squareOffByUser(row);
      if (response.status) {
        snackbar.success(response.message);
      } else {
        snackbar.error(response.message || 'Failed to square off');
      }
    } catch (error: any) {
      snackbar.error('Error square off: ' + error.message);
    }
  };

  const handleSort = (property: string) => {
    const isAsc = tableState.orderBy === property && tableState.order === 'asc';
    setTableState({
      ...tableState,
      order: isAsc ? 'desc' : 'asc',
      orderBy: property
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTableState({
      ...tableState,
      searchQuery: event.target.value
    });
  };

  const handleTabChange = (tab: 'positions' | 'orders' | 'trades') => {
    setTableState({
      ...tableState,
      activeTab: tab
    });
  };

  const getTableData = () => {
    const { activeTab, searchQuery, orderBy, order } = tableState;
    let data = tableData[activeTab];

    // Filter data
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      data = data.filter((item: any) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    // For positions, ensure netqty is treated as a number
    if (activeTab === 'positions') {
      data = data.map(row => ({
        ...row,
        netqty: Number(row.netqty) || 0,
        avgnetprice: parseFloat(row.avgnetprice) || 0
      }));
    }

    // Sort data
    if (orderBy) {
      data = [...data].sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];

        // Convert numeric strings to numbers for proper sorting
        if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        // Handle dates
        if (orderBy === 'exchtime' || orderBy === 'filltime') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (order === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        }
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      });
    } else {
      // Default sorting
      if (activeTab === 'positions') {
        // Sort by open/closed status first, then by netqty
      data = [...data].sort((a, b) => {
          const aIsOpen = Number(a.netqty) !== 0;
          const bIsOpen = Number(b.netqty) !== 0;
          if (aIsOpen && !bIsOpen) return -1;
          if (!aIsOpen && bIsOpen) return 1;
          return Math.abs(Number(b.netqty) || 0) - Math.abs(Number(a.netqty) || 0);
        });
      } else if (activeTab === 'orders' || activeTab === 'trades') {
        // Default sort by time in descending order
        data = [...data].sort((a, b) => {
          const aTime = new Date(activeTab === 'orders' ? a.exchtime : a.filltime).getTime();
          const bTime = new Date(activeTab === 'orders' ? b.exchtime : b.filltime).getTime();
          return bTime - aTime;
        });
      }
    }

    return data;
  };

  // Helper function to create sortable column header
  const SortableTableCell = ({ label, field }: { label: string; field: string }) => (
    <TableCell 
      sx={{ 
        color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
        padding: '8px',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? '#1A1C1E'
          : '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        borderBottom: theme => theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        cursor: 'pointer'
      }}
      onClick={() => handleSort(field)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {label}
        <TableSortLabel
          active={tableState.orderBy === field}
          direction={tableState.orderBy === field ? tableState.order : 'asc'}
          sx={{
            '& .MuiTableSortLabel-icon': {
              color: theme => theme.palette.mode === 'dark' ? 'white !important' : '#1E293B !important',
            },
            '&.Mui-active': {
              color: theme => theme.palette.mode === 'dark' ? 'white !important' : '#1E293B !important',
            },
            color: theme => theme.palette.mode === 'dark' ? 'white !important' : '#1E293B !important',
          }}
        />
      </Box>
    </TableCell>
  );

  const handleCancelOrder = async (orderid: string) => {
    try {
      // TODO: Implement cancel order functionality
      const result = await cancelOrderByOrderId(orderid);
      if (result.status) {
        snackbar.success(result.message);
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      snackbar.error("Failed to cancel order");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1.5,
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#ffffff',
        p: 1.5,
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton 
            onClick={onBack}
            size="small"
            sx={{ 
              backgroundColor: '#0EA5E9',
              '&:hover': { backgroundColor: '#0284C7' },
              padding: '6px'
            }}
          >
            <ArrowBackIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ 
            color: theme => theme.palette.mode === 'dark' ? 'white' : 'text.primary',
            fontWeight: 500
          }}>
            {group.name}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setRefreshFunction(fetchGroupChildren);
              onAddChild();
            }}
            size="small"
            sx={{ 
              backgroundColor: '#0EA5E9',
              '&:hover': { backgroundColor: '#0284C7' },
              py: 0.5,
              px: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem'
            }}
          >
            + Add Child
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {masterAccountName && (
              <Typography variant="body2" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? 'white' : 'text.primary'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#0EA5E9' }}>Master Account:</span> {masterAccountName}
              </Typography>
            )}
          <Button
            variant="contained"
            color="error"
            onClick={onToggleMaster}
            disabled={isTogglingMaster}
              size="small"
            sx={{ 
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
              startIcon={isTogglingMaster ? <CircularProgress size={16} /> : undefined}
          >
            Disconnect Master
          </Button>
          </Box>
          <Typography variant="body2" sx={{ 
            color: theme => theme.palette.mode === 'dark' ? 'grey.500' : 'text.secondary'
          }}>
            Trading
          </Typography>
          <Switch
            checked={group.isTradeEnabled}
            onChange={onToggleTrading}
            disabled={isTogglingTrading}
            size="small"
            sx={{
              '& .MuiSwitch-thumb': {
                  backgroundColor: !group.isTradeEnabled ? '#DC2626 !important' : '#22C55E !important'
              },
              '& .MuiSwitch-track': {
                backgroundColor: !group.isTradeEnabled ? '#DC2626 !important' : '#22C55E !important'
              }
            }}
          />
          <Typography variant="subtitle2" sx={{ 
            color: tableData.positions.reduce((sum, pos) => sum + (Number(pos.pnl) || 0), 0) >= 0 ? '#22C55E' : '#EF4444',
            ml: 1.5
          }}>
            PNL: {tableData.positions.reduce((sum, pos) => sum + (Number(pos.pnl) || 0), 0).toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ 
              py: 0.5,
              px: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem'
            }}
          >
            Place Order
          </Button>
          <IconButton 
            onClick={fetchGroupChildren}
            size="small"
            sx={{ 
              backgroundColor: '#8B5CF6',
              '&:hover': { backgroundColor: '#7C3AED' },
              padding: '6px'
            }}
          >
            <SyncIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        mt: 2
      }}>
        {isLoadingChildren ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : groupChildren.length > 0 ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              cursor: 'pointer',
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#FFFFFF',
              padding: '12px 16px',
              borderRadius: '8px',
              border: theme => theme.palette.mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#262626' : '#F8FAFC',
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
              }
            }} onClick={() => setIsExpanded(!isExpanded)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isExpanded ? (
                  <ExpandLessIcon sx={{ 
                    fontSize: '1.5rem',
                    color: theme => theme.palette.mode === 'dark' ? '#60A5FA' : '#2563EB'
                  }} />
                ) : (
                  <ExpandMoreIcon sx={{ 
                    fontSize: '1.5rem',
                    color: theme => theme.palette.mode === 'dark' ? '#60A5FA' : '#2563EB'
                  }} />
                )}
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 500,
                  color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                  fontSize: '0.95rem'
                }}>
                  {isExpanded ? 'Collapse' : 'Expand'} Broker Cards
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#94A3B8' : '#64748B',
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#27272A' : '#F1F5F9',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                {groupChildren.length} {groupChildren.length === 1 ? 'Card' : 'Cards'}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                display: isExpanded ? 'grid' : 'none',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
                animation: isExpanded ? 'fadeIn 0.3s ease-in-out' : 'none',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              {groupChildren.map((child) => (
                <BrokerCard
                  key={child._id}
                  name={child.name}
                  margin={0}
                  isTrading={child.status === 'active'}
                  stats={child.stats}
                  onToggleTrading={() => handleToggleTrading(child.accountId)}
                  onRefresh={() => handleRefresh()}
                  onDelete={() => handleDelete(child.accountId)}
                  onView={() => handleView(child.accountId)}
                  isToggling={togglingAccountId === child.accountId}
                />
              ))}
            </Box>

            {/* Search and Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              mb: 2,
              gap: 2
            }}>
              <TextField
                placeholder="Search..."
                value={tableState.searchQuery}
                onChange={handleSearch}
                size="small"
                sx={{ 
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#F8FAFC',
                  borderRadius: 1,
                  minWidth: '240px',
                  '& .MuiOutlinedInput-root': {
                    color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                    '& fieldset': {
                      borderColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.23)'
                        : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ 
                        color: theme => theme.palette.mode === 'dark' ? 'white' : '#64748B'
                      }} />
                    </InputAdornment>
                  ),
                }}
              />

              {tableState.activeTab === 'positions' && (
                <Button
                  variant="contained"
                  color="error"
                  size="medium"
                  onClick={() => handleSquareOffAll(group._id)}
                  disabled={!tableData.positions.some(pos => Number(pos.netqty) !== 0)}
                  sx={{ 
                    py: 0.7,
                    px: 2,
                    textTransform: 'none',
                    minWidth: '100px',
                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#DC2626' : '#EF4444',
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#B91C1C' : '#DC2626',
                    },
                  }}
                >
                  Exit All
                </Button>
              )}
              {tableState.activeTab === 'orders' && (
                <Button
                  variant="contained"
                  color="error"
                  size="medium"
                  onClick={() => handleCancelAllOrders(group._id)}
                  disabled={!tableData.orders.some(order => !["complete", "cancelled", "rejected"].includes(order.status.toLowerCase()))}
                  sx={{ 
                    py: 0.7,
                    px: 2,
                    textTransform: 'none',
                    minWidth: '100px',
                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#DC2626' : '#EF4444',
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#B91C1C' : '#DC2626',
                    },
                  }}
                >
                  Cancel All
                </Button>
              )}
            </Box>


            {/* Tabs */}
            <Box
              sx={{
                display: 'flex',
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#F8FAFC',
                borderRadius: 1,
                mb: 1,
                overflow: 'hidden',
                border: theme => theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Button
                variant={tableState.activeTab === 'positions' ? 'contained' : 'text'}
                onClick={() => handleTabChange('positions')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 0,
                  backgroundColor: theme => {
                    if (tableState.activeTab === 'positions') {
                      return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                    }
                    return 'transparent';
                  },
                  color: theme => {
                    if (tableState.activeTab === 'positions') {
                      return 'white';
                    }
                    return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
                  },
                  '&:hover': {
                    backgroundColor: theme => {
                      if (tableState.activeTab === 'positions') {
                        return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                      }
                      return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    },
                  },
                }}
              >
                Positions
              </Button>
              <Button
                variant={tableState.activeTab === 'orders' ? 'contained' : 'text'}
                onClick={() => handleTabChange('orders')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 0,
                  backgroundColor: theme => {
                    if (tableState.activeTab === 'orders') {
                      return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                    }
                    return 'transparent';
                  },
                  color: theme => {
                    if (tableState.activeTab === 'orders') {
                      return 'white';
                    }
                    return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
                  },
                  '&:hover': {
                    backgroundColor: theme => {
                      if (tableState.activeTab === 'orders') {
                        return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                      }
                      return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    },
                  },
                }}
              >
                Orders
              </Button>
              <Button
                variant={tableState.activeTab === 'trades' ? 'contained' : 'text'}
                onClick={() => handleTabChange('trades')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 0,
                  backgroundColor: theme => {
                    if (tableState.activeTab === 'trades') {
                      return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                    }
                    return 'transparent';
                  },
                  color: theme => {
                    if (tableState.activeTab === 'trades') {
                      return 'white';
                    }
                    return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
                  },
                  '&:hover': {
                    backgroundColor: theme => {
                      if (tableState.activeTab === 'trades') {
                        return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                      }
                      return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    },
                  },
                }}
              >
                Trades
              </Button>
            </Box>

            {/* Table */}
            <TableContainer 
              component={Paper} 
              sx={{ 
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(26, 28, 30, 0.5)'
                  : 'rgba(255, 255, 255, 0.9)',
                maxHeight: '600px',
                position: 'relative',
                overflow: 'auto',
                margin: '16px 0',
                borderRadius: '8px',
                '& .MuiTableRow-root:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05) !important'
                    : 'rgba(0, 0, 0, 0.04) !important'
                },
                border: theme => theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow>
                    {(tableState.activeTab === 'positions' || tableState.activeTab === 'orders') && (
                    <TableCell 
                      sx={{ 
                          color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                          padding: '12px 8px',
                          backgroundColor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 28, 30, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                          borderBottom: theme => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          fontSize: '0.875rem',
                          fontWeight: 700
                        }}
                      >
                        {tableState.activeTab === 'positions'?'Exit':tableState.activeTab === 'orders'?'Cancel':''}
                    </TableCell>
                    )}
                        <TableCell 
                          sx={{ 
                        color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                        padding: '12px 8px',
                        backgroundColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(26, 28, 30, 0.95)'
                          : 'rgba(255, 255, 255, 0.95)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        borderBottom: theme => theme.palette.mode === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                        fontSize: '0.875rem',
                        fontWeight: 700
                      }}
                    >
                      Client ID
                        </TableCell>
                    {tableState.activeTab === 'positions' && (
                      <>
                        <SortableTableCell label="Symbol" field="tradingsymbol" />
                        <SortableTableCell label="Product" field="producttype" />
                        <SortableTableCell label="Action" field="action" />
                        <SortableTableCell label="Net Qty" field="netqty" />
                        <SortableTableCell label="P&L" field="pnl" />
                        <SortableTableCell label="LTP" field="ltp" />
                        <SortableTableCell label="Avg Price" field="avgnetprice" />
                      </>
                    )}
                    {tableState.activeTab === 'orders' && (
                      <>
                        <SortableTableCell label="Symbol" field="tradingsymbol" />
                        <SortableTableCell label="Type" field="transactiontype" />
                        <SortableTableCell label="Status" field="status" />
                        <SortableTableCell label="Quantity" field="quantity" />
                        <SortableTableCell label="Price" field="price" />
                        <SortableTableCell label="Time" field="exchtime" />
                      </>
                    )}
                    {tableState.activeTab === 'trades' && (
                      <>
                        <SortableTableCell label="Symbol" field="tradingsymbol" />
                        <SortableTableCell label="Type" field="transactiontype" />
                        <SortableTableCell label="Quantity" field="fillsize" />
                        <SortableTableCell label="Price" field="fillprice" />
                        <SortableTableCell label="Order ID" field="orderid" />
                        <SortableTableCell label="Time" field="filltime" />
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTableData().map((row: any, index: number) => (
                    <TableRow 
                      key={index} 
                      hover
                          sx={{ 
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'rgba(0, 0, 0, 0.02)'
                        },
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                    >
                      {(tableState.activeTab === 'positions' || tableState.activeTab === 'orders') && (
                        <TableCell sx={{ padding: '8px 12px' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {tableState.activeTab === 'positions' && (
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={Number(row.netqty) === 0}
                                onClick={() => handleSquareOff(row)}
                          sx={{ 
                                  minWidth: '60px',
                                  padding: '2px 8px',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Exit
                              </Button>
                            )}
                            {tableState.activeTab === 'orders' && (
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleCancelOrder(row.orderid)}
                                disabled={["complete", "cancelled", "rejected"].includes(row.status.toLowerCase())}
                          sx={{ 
                                  minWidth: '60px',
                                  padding: '2px 8px',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      )}
                        <TableCell 
                          sx={{ 
                          color: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(0, 0, 0, 0.9)',
                          padding: '8px 12px',
                          borderBottom: theme => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.05)'
                            : '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {row.clientId || '-'}
                        </TableCell>
                      {tableState.activeTab === 'positions' && (
                        <>
                          <TableCell sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                            padding: '8px' 
                          }}>
                            {row.tradingsymbol}
                          </TableCell>
                          <TableCell sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                            padding: '8px' 
                          }}>
                            {row.producttype}
                          </TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Box
                              sx={{
                                color: Number(row.netqty) === 0
                                  ? '#fc424a'
                                  : Number(row.netqty) > 0
                                  ? '#00d25b'
                                  : '#fc424a',
                                backgroundColor: Number(row.netqty) === 0
                                  ? 'rgba(252, 66, 74, 0.2)'
                                  : Number(row.netqty) > 0
                                  ? 'rgba(0, 210, 91, 0.2)'
                                  : 'rgba(252, 66, 74, 0.2)',
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                textShadow: theme => theme.palette.mode === 'dark'
                                  ? Number(row.netqty) === 0
                                  ? '0 0 10px rgba(252, 66, 74, 0.5)'
                                  : Number(row.netqty) > 0
                                  ? '0 0 10px rgba(0, 210, 91, 0.5)'
                                    : '0 0 10px rgba(252, 66, 74, 0.5)'
                                  : 'none',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              {Number(row.netqty) === 0 ? 'CLOSED' : Number(row.netqty) > 0 ? 'BUY' : 'SELL'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                            padding: '8px' 
                          }}>
                            {Math.abs(Number(row.netqty) || 0)}
                            {Number(row.cfbuyqty) > 0 && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.7rem',
                                  color: theme => theme.palette.mode === 'dark' ? '#9CA3AF' : '#64748B',
                                  ml: 1
                                }}
                              >
                                (CF: {row.cfbuyqty})
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: Number(row.pnl) >= 0 ? '#22C55E' : '#EF4444', padding: '8px' }}>
                            {Number(row.pnl).toFixed(2)} {Number(row.pnl) < 0 ? '↓' : '↑'}
                            {Number(row.unrealisedpnl || 0) !== 0 && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.7rem',
                                  color: Number(row.unrealisedpnl) >= 0 ? '#22C55E' : '#EF4444',
                                  ml: 1
                                }}
                              >
                                (Unr: {Number(row.unrealisedpnl).toFixed(2)})
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{Number(row.ltp).toFixed(2)}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>
                            {row.avgnetprice.toFixed(2)}
                          </TableCell>
                        </>
                      )}
                      {tableState.activeTab === 'orders' && (
                        <>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.tradingsymbol}</TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Box
                              sx={{ 
                                color: row.transactiontype?.toLowerCase() === 'buy' ? '#00d25b' : '#fc424a',
                                backgroundColor: row.transactiontype?.toLowerCase() === 'buy' 
                                  ? 'rgba(0, 210, 91, 0.2)'
                                  : 'rgba(252, 66, 74, 0.2)',
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                textShadow: row.transactiontype?.toLowerCase() === 'buy'
                                  ? '0 0 10px rgba(0, 210, 91, 0.5)'
                                  : '0 0 10px rgba(252, 66, 74, 0.5)',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              {row.transactiontype?.toUpperCase()}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Box
                              sx={{ 
                                color: row.status?.toLowerCase() === 'complete' ? '#00d25b' 
                                  : row.status?.toLowerCase() === 'cancelled' ? '#fc424a'
                                  : row.status?.toLowerCase() === 'rejected' ? '#fc424a'
                                  : row.status?.toLowerCase() === 'pending' ? '#fcd34d'
                                  : '#00d25b',
                                backgroundColor: row.status?.toLowerCase() === 'complete' ? 'rgba(0, 210, 91, 0.2)'
                                  : row.status?.toLowerCase() === 'cancelled' ? 'rgba(252, 66, 74, 0.2)'
                                  : row.status?.toLowerCase() === 'rejected' ? 'rgba(252, 66, 74, 0.2)'
                                  : row.status?.toLowerCase() === 'pending' ? 'rgba(252, 211, 77, 0.2)'
                                  : 'rgba(0, 210, 91, 0.2)',
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                textShadow: row.status?.toLowerCase() === 'complete' ? '0 0 10px rgba(0, 210, 91, 0.5)'
                                  : row.status?.toLowerCase() === 'cancelled' ? '0 0 10px rgba(252, 66, 74, 0.5)'
                                  : row.status?.toLowerCase() === 'rejected' ? '0 0 10px rgba(252, 66, 74, 0.5)'
                                  : row.status?.toLowerCase() === 'pending' ? '0 0 10px rgba(252, 211, 77, 0.5)'
                                  : '0 0 10px rgba(0, 210, 91, 0.5)',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              {row.status?.toUpperCase()}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.quantity}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.price}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.exchtime}</TableCell>
                        </>
                      )}
                      {tableState.activeTab === 'trades' && (
                        <>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.tradingsymbol}</TableCell>
                          <TableCell sx={{ padding: '8px' }}>
                            <Box
                              sx={{
                                color: row.transactiontype?.toLowerCase() === 'buy' ? '#00d25b' : '#fc424a',
                                backgroundColor: row.transactiontype?.toLowerCase() === 'buy' 
                                  ? 'rgba(0, 210, 91, 0.2)'
                                  : 'rgba(252, 66, 74, 0.2)',
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                textShadow: row.transactiontype?.toLowerCase() === 'buy'
                                  ? '0 0 10px rgba(0, 210, 91, 0.5)'
                                  : '0 0 10px rgba(252, 66, 74, 0.5)',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              {row.transactiontype?.toUpperCase()}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.fillsize}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.fillprice}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.orderid}</TableCell>
                          <TableCell sx={{ color: 'white', padding: '8px' }}>{row.filltime}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  {getTableData().length === 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={tableState.activeTab === 'trades' ? 6 : 9} 
                        align="center" 
                        sx={{ 
                          color: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.7)'
                            : 'rgba(0, 0, 0, 0.7)',
                          padding: '24px 8px'
                        }}
                      >
                        {tableState.searchQuery ? 'No matching records found' : 'No records found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px'
          }}>
            <Typography color="text.secondary">
              No child accounts connected yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Add new interfaces for table data
interface TableData {
  positions: any[];
  orders: any[];
  trades: any[];
}

interface TableState {
  activeTab: 'positions' | 'orders' | 'trades';
  searchQuery: string;
  orderBy: string;
  order: 'asc' | 'desc';
}

const GroupManager = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groups, setGroups] = useState<ExtendedGroup[]>([]);
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupStats, setGroupStats] = useState<Record<string, GroupStats>>({});
  const [isTogglingMaster, setIsTogglingMaster] = useState<string | null>(null);
  const [isTogglingTrading, setIsTogglingTrading] = useState<string | null>(null);
  const [confirmMasterDialog, setConfirmMasterDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [selectedMasterData, setSelectedMasterData] = useState<{
    groupId: string;
    accountId: string;
    action: 'connect' | 'disconnect';
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{id: string; name: string; masterAccountId?: string} | null>(null);
  const [isGroupDetailsView, setIsGroupDetailsView] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [selectedGroupForRefresh, setSelectedGroupForRefresh] = useState<() => Promise<void>>();
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  
  const snackbar = useSnackbar();

  // Function to fetch broker accounts and groups
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dematResponse, groupsResponse] = await Promise.all([
        getDematAccounts(),
        getGroups()
      ]);
      
      if (dematResponse.status) {
        const transformedAccounts = dematResponse.dematAccounts.map((account: any) => ({
          id: account._id,
          name: `${account.fullName}-angelone-${account.clientId}`,
        }));
        setBrokerAccounts(transformedAccounts);
      }

      if (groupsResponse.status) {
        setGroups(groupsResponse.groups);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateGroup = () => {
    setIsCreateGroupOpen(true);
  };

  const handleCloseCreateGroup = () => {
    setIsCreateGroupOpen(false);
  };

  const handleCreateGroup = async (data: { name: string; members: string[] }) => {
    try {
      setIsSubmitting(true);
      const response = await createGroup({
        name: data.name,
        members: [] // Empty array for members as we're only asking for the group name
      });
      
      if (response.status) {
        snackbar.success('Group created successfully');
        fetchData(); // Refresh the groups list
        handleCloseCreateGroup();
      } else {
        snackbar.error(response.message || 'Failed to create group');
      }
    } catch (error: any) {
      snackbar.error('Error creating group: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setGroupToDelete(groupId);
    setConfirmDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      setIsSubmitting(true);
      const response = await deleteGroup(groupToDelete);
      
      if (response.status) {
        snackbar.success('Group deleted successfully');
        fetchData(); // Refresh the groups list
      } else {
        snackbar.error(response.message || 'Failed to delete group');
      }
    } catch (error: any) {
      snackbar.error('Error deleting group: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setConfirmDeleteDialog(false);
      setGroupToDelete(null);
    }
  };

  const handleEditGroup = (groupId: string) => {
    // TODO: Implement edit group functionality
    console.log('Edit group:', groupId);
  };

  const handleViewGroup = (groupId: string) => {
    const group = groups.find(g => g._id === groupId);
    if (group) {
      setSelectedGroup({
        id: groupId,
        name: group.name,
        masterAccountId: group.masterAccountId
      });
      setIsGroupDetailsView(true);
    }
  };

  const handleBackToList = () => {
    setIsGroupDetailsView(false);
    setSelectedGroup(null);
  };

  const handleMasterChange = (groupId: string, accountId: string) => {
    // Just update the selected account without showing confirmation
    const group = groups.find(g => g._id === groupId);
    if (group) {
      group.selectedAccountId = accountId; // Temporarily store selected account
      setGroups([...groups]); // Force update
    }
  };

  const handleToggleMaster = async (groupId: string) => {
    const group = groups.find(g => g._id === groupId);
    if (!group) return;

    const accountId = group.selectedAccountId || group.masterAccountId;
    if (!accountId) return;

    if (group.masterAccountId === accountId) {
      // If clicking on the current master, we're disconnecting
      setSelectedMasterData({
        groupId,
        accountId,
        action: 'disconnect'
      });
    } else {
      // If clicking to connect a new master
      setSelectedMasterData({
        groupId,
        accountId,
        action: 'connect'
      });
    }
    setConfirmMasterDialog(true);
  };

  const handleConfirmMasterToggle = async () => {
    if (!selectedMasterData) return;

    try {
      setIsTogglingMaster(selectedMasterData.accountId);
      const response = await toggleMaster({ 
        groupId: selectedMasterData.groupId, 
        accountId: selectedMasterData.action === 'connect' ? selectedMasterData.accountId : ''
      });
      
      if (response.status) {
        snackbar.success(
          selectedMasterData.action === 'connect' 
            ? 'Master account connected successfully' 
            : 'Master account disconnected successfully'
        );
        fetchData(); // Refresh the groups list
      } else {
        snackbar.error(response.message || 'Failed to update master account');
      }
    } catch (error: any) {
      snackbar.error('Error updating master account: ' + error.message);
    } finally {
      setIsTogglingMaster(null);
      setConfirmMasterDialog(false);
      setSelectedMasterData(null);
    }
  };

  const handleToggleTrading = async (groupId: string) => {
    try {
      setIsTogglingTrading(groupId);
      const group = groups.find(g => g._id === groupId);
      if (!group) return;

      const response = await toggleTrading({ 
        groupId, 
        isTrading: !group.isTradeEnabled 
      });
      
      if (response.status) {
        snackbar.success(`Trading ${!group.isTradeEnabled ? 'enabled' : 'disabled'} successfully`);
        fetchData(); // Refresh the groups list
      } else {
        snackbar.error(response.message || 'Failed to update trading status');
      }
    } catch (error: any) {
      snackbar.error('Error updating trading status: ' + error.message);
    } finally {
      setIsTogglingTrading(null);
    }
  };

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Group Manager"}></AdminToolbar>
      </AdminAppBar>
      <Box sx={{ p: 3 }}>
        {isGroupDetailsView && selectedGroup ? (
          <GroupDetailsView
            group={groups.find(g => g._id === selectedGroup.id)!}
            onBack={handleBackToList}
            onAddChild={() => setIsAddChildOpen(true)}
            onToggleMaster={() => handleToggleMaster(selectedGroup.id)}
            onToggleTrading={() => handleToggleTrading(selectedGroup.id)}
            isTogglingMaster={isTogglingMaster === selectedGroup.id}
            isTogglingTrading={isTogglingTrading === selectedGroup.id}
            masterAccountName={brokerAccounts.find(acc => acc.id === selectedGroup.masterAccountId)?.name}
            setRefreshFunction={fn => setSelectedGroupForRefresh(() => fn)}
            brokerAccounts={brokerAccounts}
            setBrokerAccounts={setBrokerAccounts}
          />
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <Button 
                component="label" 
                role={undefined} 
                variant="contained" 
                tabIndex={-1} 
                startIcon={<GroupAddIcon />}
                onClick={handleOpenCreateGroup}
                disabled={isLoading || isSubmitting}
              > 
                Create Group
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
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {groups.length > 0 ? (
                  groups.map((group) => {
                    const stats = groupStats[group._id] || {
                      orders: 0,
                      qty: 0,
                      child: 0,
                      totalChild: 2, // Example value
                      pending: 0,
                      completed: 0,
                      rejected: 0,
                      cancelled: 0,
                      failed: 0,
                    };

                    return (
                      <Card
                        key={group._id}
                        sx={{
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#FFFFFF',
                          borderRadius: 1,
                          p: 2,
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: theme => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {/* Group Name and View Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                            flex: 1 
                          }}>
                            {group.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ 
                                backgroundColor: theme => theme.palette.mode === 'dark' ? '#3B82F6' : '#2563EB',
                                '&:hover': { 
                                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#2563EB' : '#1D4ED8'
                                }
                              }}
                              onClick={() => handleViewGroup(group._id)}
                            >
                              <VisibilityIcon fontSize="small" sx={{ color: 'white' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ 
                                backgroundColor: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626',
                                '&:hover': { 
                                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#DC2626' : '#B91C1C'
                                }
                              }}
                              onClick={() => handleDeleteGroup(group._id)}
                            >
                              <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Master Account Selection */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? '#6B7280' : '#64748B',
                            mb: 1 
                          }}>
                            Master Account
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {group.masterAccountId ? (
                              // Show connected master name
                              <Typography
                                sx={{
                                  flex: 1,
                                  color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#F1F5F9',
                                  padding: '8.5px 14px',
                                  borderRadius: 1,
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {brokerAccounts.find(acc => acc.id === group.masterAccountId)?.name || 'Connected User'}
                              </Typography>
                            ) : (
                              // Show select dropdown when no master is connected
                              <FormControl fullWidth size="small">
                                <Select
                                  value={group.selectedAccountId || ''}
                                  onChange={(e) => handleMasterChange(group._id, e.target.value)}
                                  displayEmpty
                                  sx={{
                                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#F1F5F9',
                                    color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: theme => theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.23)'
                                        : 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: theme => theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.4)'
                                        : 'rgba(0, 0, 0, 0.4)',
                                    },
                                  }}
                                >
                                  <MenuItem value="" disabled>Select Master</MenuItem>
                                  {brokerAccounts.map((account) => (
                                    <MenuItem key={account.id} value={account.id}>
                                      {account.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleToggleMaster(group._id)}
                              disabled={isTogglingMaster === group._id || (!group.masterAccountId && !group.selectedAccountId)}
                              sx={{ 
                                backgroundColor: group.masterAccountId 
                                  ? theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                                  : group.selectedAccountId 
                                    ? theme => theme.palette.mode === 'dark' ? '#22C55E' : '#16A34A'
                                    : theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#E2E8F0',
                                '&:hover': { 
                                  backgroundColor: group.masterAccountId 
                                    ? theme => theme.palette.mode === 'dark' ? '#DC2626' : '#B91C1C'
                                    : group.selectedAccountId 
                                      ? theme => theme.palette.mode === 'dark' ? '#16A34A' : '#15803D'
                                      : theme => theme.palette.mode === 'dark' ? '#1F2937' : '#CBD5E1'
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#E2E8F0',
                                }
                              }}
                            >
                              {isTogglingMaster === group._id ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                              ) : group.masterAccountId ? (
                                <LinkIcon sx={{ color: 'white' }} />
                              ) : (
                                <LinkOffIcon sx={{ color: 'white' }} />
                              )}
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Trading Toggle */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                          <Typography variant="body2" sx={{ 
                            color: theme => theme.palette.mode === 'dark' ? '#6B7280' : '#64748B',
                            mr: 1 
                          }}>
                            Trading
                          </Typography>
                          <Switch
                            checked={group.isTradeEnabled}
                            onChange={() => handleToggleTrading(group._id)}
                            disabled={isTogglingTrading === group._id}
                            sx={{
                              '& .MuiSwitch-track': {
                                backgroundColor: theme => theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.1)'
                              },
                              '& .Mui-checked + .MuiSwitch-track': {
                                backgroundColor: theme => theme.palette.mode === 'dark' 
                                  ? '#22C55E !important' 
                                  : '#16A34A !important'
                              },
                              '.MuiSwitch-thumb': {
                                '& .Mui-checked': {
                                  backgroundColor: theme => theme.palette.mode === 'dark' 
                                  ? '#4ADE80 !important' 
                                  : '#22C55E !important'
                                },
                                backgroundColor: !group.isTradeEnabled ? '#DC2626 !important' : '#22C55E !important'
                                
                              }
                            }}
                          />
                        </Box>

                        {/* Stats Display */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ 
                              color: theme => theme.palette.mode === 'dark' ? '#6B7280' : '#64748B'
                            }}>
                              Orders {group.stats?.orders || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme => theme.palette.mode === 'dark' ? '#6B7280' : '#64748B'
                            }}>
                              Qty {group.stats?.qty || 0}
                            </Typography>
                            
                          </Box>
                        </Box>

                        {/* Status Indicators */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          borderTop: theme => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          pt: 2
                        }}>
                          <Tooltip title="Pending">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#FCD34D' : '#D97706'
                              }}>P</Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#FCD34D' : '#D97706'
                              }}>{group.stats?.pending || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Completed">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#34D399' : '#059669'
                              }}>C</Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#34D399' : '#059669'
                              }}>{group.stats?.completed || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Rejected">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>R</Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>{group.stats?.rejected || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Cancelled">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>C</Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>{group.stats?.cancelled || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Failed">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>F</Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626'
                              }}>{group.stats?.failed || 0}</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Card>
                    );
                  })
                ) : (
                  <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No groups found. Create a group to get started.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      <CreateGroup
        open={isCreateGroupOpen}
        onClose={handleCloseCreateGroup}
        onSubmit={handleCreateGroup}
        brokerAccounts={brokerAccounts}
      />

      <AddChildAccount
        open={isAddChildOpen}
        onClose={() => {
          setIsAddChildOpen(false);
          setSelectedGroupForRefresh(undefined);
        }}
        onSubmit={async (data) => {
          try {
            if (!selectedGroup) return;
            
            const response = await addChildToGroup(selectedGroup.id, data);
            
            if (response.status) {
              snackbar.success('Child account added successfully');
              // Refresh the group children using the provided refresh function
              if (selectedGroupForRefresh) {
                await selectedGroupForRefresh();
              }
            } else {
              snackbar.error(response.message || 'Failed to add child account');
            }
          } catch (error: any) {
            snackbar.error('Error adding child account: ' + error.message);
          } finally {
            setIsAddChildOpen(false);
            setSelectedGroupForRefresh(undefined);
          }
        }}
        brokerAccounts={brokerAccounts}
        excludeAccountIds={[selectedGroup?.masterAccountId || '']}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmMasterDialog}
        onClose={() => {
          setConfirmMasterDialog(false);
          setSelectedMasterData(null);
        }}
        PaperProps={{
          style: {
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
          },
        }}
      >
        <DialogTitle>
          {selectedMasterData?.action === 'connect' 
            ? "Connect Master Account" 
            : "Disconnect Master Account"
          }
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedMasterData?.action === 'connect'
              ? "Are you sure you want to make this user as master user?"
              : "Are you sure you want to disconnect this master user?"
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={() => {
              setConfirmMasterDialog(false);
              setSelectedMasterData(null);
            }}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmMasterToggle}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => {
          setConfirmDeleteDialog(false);
          setGroupToDelete(null);
        }}
        PaperProps={{
          style: {
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
          },
        }}
      >
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this group?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={() => {
              setConfirmDeleteDialog(false);
              setGroupToDelete(null);
            }}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default GroupManager; 