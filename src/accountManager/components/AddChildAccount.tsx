import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BrokerAccount } from '../types';

interface AddChildAccountProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { accountId: string; multiplier: number; fixLot: boolean }) => void;
  brokerAccounts: BrokerAccount[];
  excludeAccountIds?: string[];
}

const AddChildAccount: React.FC<AddChildAccountProps> = ({
  open,
  onClose,
  onSubmit,
  brokerAccounts,
  excludeAccountIds = [],
}) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [multiplier, setMultiplier] = useState('1');
  const [fixLot, setFixLot] = useState(false);

  // Reset form values when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedAccount('');
      setMultiplier('1');
      setFixLot(false);
    }
  }, [open]);

  const handleClose = () => {
    setSelectedAccount('');
    setMultiplier('1');
    setFixLot(false);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      accountId: selectedAccount,
      multiplier: parseFloat(multiplier),
      fixLot,
    });
    handleClose();
  };

  const availableAccounts = brokerAccounts.filter(
    account => !excludeAccountIds.includes(account.id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
            Add Child Account
          </Typography>
          <IconButton 
            onClick={handleClose} 
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
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="select-child-label" sx={{ 
                color: theme => theme.palette.mode === 'dark' ? 'grey.500' : '#64748B'
              }}>
                Select Child
              </InputLabel>
              <Select
                labelId="select-child-label"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                required
                sx={{
                  color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#2D2D2D' : '#F8FAFC',
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
                  '& .MuiSelect-icon': {
                    color: theme => theme.palette.mode === 'dark' ? 'white' : '#64748B',
                  },
                }}
              >
                {availableAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Multiplier"
              type="number"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              fullWidth
              required
              inputProps={{ min: "0.1", step: "0.1" }}
              sx={{
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

            <Button
              variant="contained"
              color={fixLot ? "primary" : "inherit"}
              onClick={() => setFixLot(!fixLot)}
              type="button"
              sx={{
                backgroundColor: theme => {
                  if (fixLot) return undefined;
                  return theme.palette.mode === 'dark' ? '#2D2D2D' : '#F1F5F9';
                },
                color: theme => {
                  if (fixLot) return 'white';
                  return theme.palette.mode === 'dark' ? 'white' : '#1E293B';
                },
                '&:hover': {
                  backgroundColor: theme => {
                    if (fixLot) return undefined;
                    return theme.palette.mode === 'dark' ? '#374151' : '#E2E8F0';
                  },
                },
              }}
            >
              Fix Lot
            </Button>
          </Box>
          <DialogActions sx={{ padding: 3 }}>
            <Button 
              onClick={handleClose}
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
              disabled={!selectedAccount}
              sx={{ textTransform: 'none' }}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildAccount; 