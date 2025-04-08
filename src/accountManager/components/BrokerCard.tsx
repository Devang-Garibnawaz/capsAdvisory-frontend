import React from 'react';
import {
  Box,
  Card,
  Typography,
  Switch,
  IconButton,
  Stack,
  Grid,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface StatBoxProps {
  label: string;
  value: number;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="body2" sx={{ color: '#6B7280' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ color: 'white', mt: 1 }}>
      {value}
    </Typography>
  </Box>
);

interface BrokerCardProps {
  name: string;
  margin: number;
  isTrading: boolean;
  stats: {
    inGroup?: number;
    pnl?: number;
    margin?: number;
    position?: any;
    orders?: {
      orders?: any;
      total?: number;
      cancelled?: number;
      complete?: number;
      pending?: number;
      rejected?: number;
    };
    pending?: number;
    complete?: number;
    reject?: number;
    cancel?: number;
  };
  onToggleTrading: () => void;
  onRefresh: () => void;
  onDelete: () => void;
  onView: () => void;
  isToggling?: boolean;
}

const BrokerCard: React.FC<BrokerCardProps> = ({
  name,
  margin,
  isTrading,
  stats,
  onToggleTrading,
  onRefresh,
  onDelete,
  onView,
  isToggling = false,
}) => {
  return (
    <Card
      sx={{
        backgroundColor: '#1A1C1E',
        borderRadius: 1,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isTrading ? '#22C55E' : '#DC2626',
              mr: 2,
            }}
          />
          <Typography variant="subtitle1" sx={{ color: '#9CA3AF', flex: 1 }}>
            {name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white', ml: 1 }}>
            Margin {stats.margin}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ color: '#6B7280', mr: 1 }}>Trading</Typography>
        {isToggling ? (
          <CircularProgress size={24} sx={{ color: isTrading ? '#22C55E' : '#DC2626' }} />
        ) : (
          <Switch
            checked={isTrading}
            onChange={onToggleTrading}
            sx={{
              '& .MuiSwitch-track': {
                backgroundColor: '#374151',
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: isTrading ? '#22C55E' : '#DC2626',
              },
            }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            sx={{ 
              backgroundColor: '#DC2626',
              '&:hover': { backgroundColor: '#B91C1C' }
            }}
            onClick={onDelete}
          >
            <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ 
              backgroundColor: '#F59E0B',
              '&:hover': { backgroundColor: '#D97706' }
            }}
            onClick={onRefresh}
          >
            <RefreshIcon fontSize="small" sx={{ color: 'white' }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ 
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' }
            }}
            onClick={onView}
          >
            <VisibilityIcon fontSize="small" sx={{ color: 'white' }} />
          </IconButton>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={3}>
          <StatBox label="In Group" value={stats.inGroup || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="P&L" value={stats.pnl || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="POS" value={stats?.position?.length || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="Orders" value={stats?.orders?.total || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="Pending" value={stats?.orders?.pending || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="Complete" value={stats?.orders?.complete || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="Reject" value={stats?.orders?.rejected || 0} />
        </Grid>
        <Grid item xs={3}>
          <StatBox label="Cancel" value={stats?.orders?.cancelled || 0} />
        </Grid>
      </Grid>
    </Card>
  );
};

export default BrokerCard; 