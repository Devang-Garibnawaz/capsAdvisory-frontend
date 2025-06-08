import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SelectChangeEvent } from '@mui/material/Select';
import { getAvailableBrokersList, addDematAccount } from '../hooks/accountManagementService';
import { useSnackbar } from '../../core/contexts/SnackbarProvider';

interface ConnectionInfo {
  show: boolean;
  placeholder: string | null;
}

interface BrokerConnectionInfo {
  username: ConnectionInfo;
  password: ConnectionInfo;
  two_fa: ConnectionInfo;
  api_key: ConnectionInfo;
  secret_key: ConnectionInfo;
  totp_key: ConnectionInfo;
  app_id: ConnectionInfo;
}

interface Broker {
  id: string;
  brokerName: string;
  connection_info: BrokerConnectionInfo;
}

interface BrokerDetails {
  broker: string;
  nickname: string;
  mobileNo: string;
  email: string;
  quantity: string;
  [key: string]: string; // Allow dynamic fields based on connection_info
}

interface ConnectBrokerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BrokerDetails) => void;
}

const ConnectBroker: React.FC<ConnectBrokerProps> = ({ open, onClose, onSubmit }) => {
  const [brokersList, setBrokersList] = useState<Broker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const snackbar = useSnackbar();

  const [formData, setFormData] = useState<BrokerDetails>({
    broker: '',
    nickname: '',
    mobileNo: '',
    email: '',
    quantity: '',
  });

  const fetchBrokersList = async () => {
    try {
      const brokersList = await getAvailableBrokersList();
      if(brokersList?.status) {
        setBrokersList(brokersList.brokersList);
      }else{
        snackbar.error(brokersList.message);
        setBrokersList([]);
        onClose();
      }
    } catch (error:any) {
      snackbar.error('Error fetching brokers list:'+ error.message);
    }
  };

  useEffect(() =>{
    fetchBrokersList();
  },[]);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const brokerName = event.target.value as string;
    const broker = brokersList.find(b => b.brokerName === brokerName);
    
    setSelectedBroker(broker || null);
    
    // Reset form data but keep the broker name
    const newFormData: BrokerDetails = {
      broker: brokerName,
      nickname: '',
      mobileNo: '',
      email: '',
      quantity: ''
    };
    
    // Initialize fields based on connection_info
    if (broker) {
      Object.entries(broker.connection_info).forEach(([key, info]) => {
        if (info.show) {
          newFormData[key] = '';
        }
      });
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Call the API to add the demat account
      const response = await addDematAccount(formData);
      
      if (response.status) {
        snackbar.success('Demat account added successfully');
        onSubmit(formData);
        onClose();
      } else {
        snackbar.error(response.message || 'Failed to add demat account');
      }
    } catch (error: any) {
      snackbar.error('Error adding demat account: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render dynamic form fields based on connection_info
  const renderDynamicFields = () => {
    if (!selectedBroker) return null;
    
    return Object.entries(selectedBroker.connection_info).map(([key, info]) => {
      if (!info.show) return null;
      
      const isPassword = key === 'password';
      
      return (
        <TextField
          key={key}
          label={info.placeholder || key}
          type={isPassword ? "password" : "text"}
          value={formData[key] || ''}
          onChange={handleInputChange(key)}
          fullWidth
          required
          inputProps={key === 'password' ? { maxLength: 4 } : undefined}
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
      );
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
          <Typography variant="h6">Add Demat Account</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="broker-label" sx={{ color: 'grey.500' }}>Broker</InputLabel>
              <Select
                labelId="broker-label"
                value={formData.broker}
                onChange={handleSelectChange}
                label="Broker"
                sx={{
                  backgroundColor: '#2D2D2D',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                }}
              >
                <MenuItem value="">Select Broker</MenuItem>
                {brokersList?.map((broker) => (
                  <MenuItem key={broker.id} value={broker.brokerName}>
                    {broker.brokerName.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nickname"
              value={formData.nickname}
              onChange={handleInputChange('nickname')}
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

            <TextField
              label="Mobile No."
              value={formData.mobileNo}
              onChange={handleInputChange('mobileNo')}
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

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
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

            <TextField
              label="Quantity."
              value={formData.quantity === '' ? 0 : formData.quantity}
              onChange={handleInputChange('quantity')}
              fullWidth
              required
              type="number"
              inputProps={{ min: "0", step: "1" }}
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

            {/* Render dynamic fields based on connection_info */}
            {renderDynamicFields()}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3 }}>
          <Button 
            onClick={onClose}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ConnectBroker;
