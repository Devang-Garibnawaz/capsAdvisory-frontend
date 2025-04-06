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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface BrokerAccount {
  id: string;
  name: string;
}

interface CreateGroupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; members: string[] }) => void;
  brokerAccounts: BrokerAccount[];
}

const CreateGroup: React.FC<CreateGroupProps> = ({ open, onClose, onSubmit, brokerAccounts }) => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name: groupName,
      members: [], // Empty array for members as we're only asking for the group name
    });
    setGroupName('');
  };

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
          <Typography variant="h6">Create New Group</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              required
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
            sx={{ textTransform: 'none' }}
          >
            Create Group
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateGroup; 