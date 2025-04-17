import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
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
  DialogActions
} from "@mui/material";
import CreateGroup from "../components/CreateGroup";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { getGroups, createGroup, deleteGroup, Group, toggleMaster, toggleTrading, addChildToGroup, getGroupChildren, GroupChild, removeChildFromGroup, squareOffAllByGroup } from "../hooks/groupManagementService";
import { getDematAccounts, updateDematAccountTradeToggle, cancelAllOrders } from "../hooks/accountManagementService";
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [placeRejected, setPlaceRejected] = useState(false);
  const [groupChildren, setGroupChildren] = useState<GroupChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [togglingAccountId, setTogglingAccountId] = useState<string | null>(null);
  const snackbar = useSnackbar();
  const navigate = useNavigate();

  const fetchGroupChildren = async () => {
    try {
      setIsLoadingChildren(true);
      const response = await getGroupChildren(group._id);
      
      if (response.status) {
        // Transform the demat accounts into the format expected by BrokerCard
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
      } else {
        snackbar.error(response.message || 'Failed to fetch group children');
      }
    } catch (error: any) {
      snackbar.error('Error fetching group children: ' + error.message);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // Fetch group children when group changes
  useEffect(() => {
    fetchGroupChildren();
  }, [group._id]);

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

  const handleRefresh = (accountId: string) => {
    // TODO: Implement refresh for child account
    console.log('Refresh account:', accountId);
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

  const handleCancelAllOrders = async (groupId='', dematAccountId='') => {
    try {
      const response = await cancelAllOrders(groupId,dematAccountId);
      
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

  return (
    <Box>
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
            onClick={onBack}
            sx={{ 
              backgroundColor: '#0EA5E9',
              '&:hover': { backgroundColor: '#0284C7' }
            }}
          >
            <ArrowBackIcon sx={{ color: 'white' }} />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {group.name}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setRefreshFunction(fetchGroupChildren);
              onAddChild();
            }}
            size="medium"
            sx={{ 
              backgroundColor: '#0EA5E9',
              '&:hover': { backgroundColor: '#0284C7' },
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
          >
            + Add Child
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={onToggleMaster}
            disabled={isTogglingMaster}
            size="medium"
            sx={{ 
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
            startIcon={isTogglingMaster ? <CircularProgress size={20} /> : undefined}
          >
            Disconnect Master
          </Button>
          <Typography sx={{ color: 'grey.500' }}>
            Place Rejected
          </Typography>
          <Switch
            checked={placeRejected}
            onChange={(e) => setPlaceRejected(e.target.checked)}
            size="medium"
          />
          <Typography sx={{ color: 'grey.500' }}>
            Trading
          </Typography>
          <Switch
            checked={group.isTradeEnabled}
            onChange={onToggleTrading}
            disabled={isTogglingTrading}
            size="medium"
          />
          <Typography variant="h6" sx={{ color: 'white', ml: 2 }}>
            0/2
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="medium"
            sx={{ 
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
          >
            Place Order
          </Button>
          <IconButton 
            onClick={fetchGroupChildren}
            size="medium"
            sx={{ 
              backgroundColor: '#8B5CF6',
              '&:hover': { backgroundColor: '#7C3AED' }
            }}
          >
            <SyncIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        gap: 2
      }}>
        

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={() => handleSquareOffAll(group._id)}
            sx={{ 
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
          >
            Square Off All
          </Button>
          <Button
            variant="contained"
            color="success"
            size="medium"
            sx={{ 
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
          >
            Convert To Market All
          </Button>
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={() => handleCancelAllOrders(group._id, '')}
            sx={{ 
              py: 0.7,
              px: 2,
              textTransform: 'none'
            }}
          >
            Cancel All
          </Button>
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
            {groupChildren.map((child) => (
              <BrokerCard
                key={child._id}
                name={child.name}
                margin={0}
                isTrading={child.status === 'active'}
                stats={child.stats}
                onToggleTrading={() => handleToggleTrading(child.accountId)}
                onRefresh={() => handleRefresh(child.accountId)}
                onDelete={() => handleDelete(child.accountId)}
                onView={() => handleView(child.accountId)}
                isToggling={togglingAccountId === child.accountId}
              />
            ))}
          </Box>
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

  // Function to fetch broker accounts
  const fetchBrokerAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await getDematAccounts();
      
      if (response.status) {
        // Transform the demat accounts into the format expected by CreateGroup
        const transformedAccounts = response.dematAccounts.map((account: any) => ({
          id: account._id,
          name: `${account.fullName}-angelone-${account.clientId}`,
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

  // Function to fetch groups
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await getGroups();
      
      if (response.status) {
        setGroups(response.groups);
      } else {
        snackbar.error(response.message || 'Failed to fetch groups');
      }
    } catch (error: any) {
      snackbar.error('Error fetching groups: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerAccounts();
    fetchGroups();
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
        fetchGroups(); // Refresh the groups list
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
        fetchGroups(); // Refresh the groups list
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
        fetchGroups(); // Refresh the groups list
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
        fetchGroups(); // Refresh the groups list
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
                          backgroundColor: '#1A1C1E',
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        {/* Group Name and View Button */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: 'white', flex: 1 }}>
                            {group.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ 
                                backgroundColor: '#3B82F6',
                                '&:hover': { backgroundColor: '#2563EB' }
                              }}
                              onClick={() => handleViewGroup(group._id)}
                            >
                              <VisibilityIcon fontSize="small" sx={{ color: 'white' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ 
                                backgroundColor: '#EF4444',
                                '&:hover': { backgroundColor: '#DC2626' }
                              }}
                              onClick={() => handleDeleteGroup(group._id)}
                            >
                              <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Master Account Selection */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                            Master Account
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {group.masterAccountId ? (
                              // Show connected master name
                              <Typography
                                sx={{
                                  flex: 1,
                                  color: 'white',
                                  backgroundColor: '#2D2D2D',
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
                                    backgroundColor: '#2D2D2D',
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(255, 255, 255, 0.23)',
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
                                backgroundColor: group.masterAccountId ? '#EF4444' : (group.selectedAccountId ? '#22C55E' : '#2D2D2D'),
                                '&:hover': { 
                                  backgroundColor: group.masterAccountId ? '#DC2626' : (group.selectedAccountId ? '#16A34A' : '#1F2937')
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: '#2D2D2D',
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
                          <Typography variant="body2" sx={{ color: '#6B7280', mr: 1 }}>
                            Trading
                          </Typography>
                          <Switch
                            checked={group.isTradeEnabled}
                            onChange={() => handleToggleTrading(group._id)}
                            disabled={isTogglingTrading === group._id}
                          />
                        </Box>

                        {/* Stats Display */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              Orders {group.stats?.orders || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              Qty {group.stats?.qty || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                              Child {group.stats?.child || 0}/{group.stats?.totalChild || 2}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Status Indicators */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          pt: 2
                        }}>
                          <Tooltip title="Pending">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#FCD34D' }}>P</Typography>
                              <Typography variant="body2" sx={{ color: '#FCD34D' }}>{group.stats?.pending || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Completed">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#34D399' }}>C</Typography>
                              <Typography variant="body2" sx={{ color: '#34D399' }}>{group.stats?.completed || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Rejected">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>R</Typography>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>{group.stats?.rejected || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Cancelled">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>C</Typography>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>{group.stats?.cancelled || 0}</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Failed">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>F</Typography>
                              <Typography variant="body2" sx={{ color: '#EF4444' }}>{group.stats?.failed || 0}</Typography>
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