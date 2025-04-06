import React, { useState } from 'react';
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      accountId: selectedAccount,
      multiplier: parseFloat(multiplier),
      fixLot,
    });
    // Reset form
    setSelectedAccount('');
    setMultiplier('1');
    setFixLot(false);
  };

  const availableAccounts = brokerAccounts.filter(
    account => !excludeAccountIds.includes(account.id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Add Child Account</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="select-child-label" sx={{ color: 'grey.500' }}>
                Select Child
              </InputLabel>
              <Select
                labelId="select-child-label"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                required
                sx={{
                  color: 'white',
                  backgroundColor: '#2D2D2D',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
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
                input: { color: 'white' },
                label: { color: 'grey.500' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2D2D2D',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                },
              }}
            />

            <Button
              variant="contained"
              color={fixLot ? "primary" : "inherit"}
              onClick={() => setFixLot(!fixLot)}
              sx={{
                backgroundColor: fixLot ? undefined : '#2D2D2D',
                color: 'white',
              }}
            >
              Fix Lot
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3 }}>
          <Button 
            onClick={onClose}
            variant="contained"
            color="error"
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
    </Dialog>
  );
};

export default AddChildAccount; 