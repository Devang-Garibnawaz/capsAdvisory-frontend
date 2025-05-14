import React, { useState } from 'react';
import { Box, MenuItem, Select } from '@mui/material';
import { fetchSymbolList, getSymbolDetails } from '../hooks/candleServices';
import { useSnackbar } from '../../core/contexts/SnackbarProvider';
import AdminAppBar from '../../admin/components/AdminAppBar';
import AdminToolbar from '../../admin/components/AdminToolbar';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { LoadingButton } from '@material-ui/lab';

const CandleOperations: React.FC = () => {
    const snackbar = useSnackbar();
    const [selectedSymbol, setSelectedSymbol] = useState('NIFTYSPOT');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSaveSymbolList = async () => {
        try {
            setLoading('saveSymbolList');
            const response = await fetchSymbolList();
            if(response.status){
                snackbar.success(response.message);
            }else{
                snackbar.error(response.message);
            }
        } catch (error) {
            console.error('Error saving symbol list:', error);
            snackbar.error('Failed to save symbol list');
        } finally {
            setLoading(null);
        }
    };

    const handleGetSymbolDetails = async () => {
        try {
            setLoading('getSymbolDetails');
            const response = await getSymbolDetails(selectedSymbol);
            if(response.status){
                snackbar.success(response.message);
            }else{
                snackbar.error(response.message);
            }
        } catch (error) {
            console.error('Error getting symbol details:', error);
            snackbar.error('Failed to get symbol details');
        } finally {
            setLoading(null);
        }
    }

    return (
        <React.Fragment>
            <AdminAppBar>
                <AdminToolbar title={"Candle Operations"}></AdminToolbar>
            </AdminAppBar>
            
            <Box sx={{ p: 3 }}>
                <Box>
                    <LoadingButton 
                        loading={loading === 'saveSymbolList'} 
                        size='small' 
                        variant="contained" 
                        title='Save Symbol List' 
                        color="primary" 
                        startIcon={<SaveAltIcon />} 
                        onClick={handleSaveSymbolList}
                    >
                        Save Symbol List
                    </LoadingButton>

                    <Select 
                        size='medium' 
                        sx={{ml: 2, width: 130}} 
                        value={selectedSymbol} 
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                    >
                        <MenuItem selected value="NIFTYSPOT">NIFTY SPOT</MenuItem>
                        <MenuItem value="NIFTYFUT">NIFTY FUT</MenuItem>
                        <MenuItem value="BANKNIFTYSPOT">BANKNIFTY SPOT</MenuItem>
                        <MenuItem value="BANKNIFTYFUT">BANKNIFTY FUT</MenuItem>
                    </Select>
                    <LoadingButton sx={{ ml: 2 }} loading={loading === 'getSymbolDetails'} size='small' variant="contained" title='Get Symbol Details' color="primary" startIcon={<SubdirectoryArrowLeftIcon />} onClick={handleGetSymbolDetails}>Get Symbol Details</LoadingButton>
                </Box>
            </Box>
        </React.Fragment>
    );
};

export default CandleOperations; 