import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    SelectChangeEvent,
    FormControlLabel
} from '@mui/material';
import { IndicatorsResponse, StrategyData } from '../types/strategy';
import { fetchIndicators } from '../hooks/strategyService';
import { useSnackbar } from '../../core/contexts/SnackbarProvider';
import { set } from 'date-fns';
import Checkbox from '@mui/material/Checkbox';

interface CreateStrategyDialogProps {
    open: boolean;
    strategyData?: StrategyData;
    onClose: () => void;
    onSubmit: (strategyData: StrategyData) => void;
}

export default function CreateStrategyDialog({ open, onClose, onSubmit, strategyData }: CreateStrategyDialogProps) {
    const snackbar = useSnackbar();
    const intervalOptions = [
        { value: 'ONE_MINUTE', label: '1 Minute' },
        { value: 'FIVE_MINUTE', label: '5 Minutes' },
        { value: 'FIFTEEN_MINUTE', label: '15 Minutes' },
        { value: 'ONE_HOUR', label: '1 Hour' },
        { value: 'ONE_DAY', label: '1 Day' }
    ];

    const indexOptions = [
        { value: 'NIFTY 50', label: 'NIFTY' },
        { value: 'BANKNIFTY', label: 'Bank Nifty' },
        { value: 'FINNIFTY', label: 'Fin Nifty' }
    ];
    const [loading, setLoading] = useState(false);
    const [indicators, setIndicators] = useState<IndicatorsResponse['indicators']>({});
    const [selectedIndicator, setSelectedIndicator] = useState<string>('');
    const [strategyName, setStrategyName] = useState('');
    const [strategyDescription, setStrategyDescription] = useState('');
    const [parameters, setParameters] = useState<Record<string, any>>({
        minContractPrice: 150,
        maxContractPrice: 200
    });
    const [useStopLoss, setUseStopLoss] = useState(false);
    const isEditMode = !!strategyData;

    useEffect(() => {
        const loadIndicators = async () => {
            try {
                setLoading(true);
                const response = await fetchIndicators();
                if (!response.status) {
                    snackbar.error (response.message);
                }
                setIndicators(response.indicators);
            } catch (error) {
                console.error('Error loading indicators:', error);
                snackbar.error('Failed to load indicators');
            } finally {
                setLoading(false);
            }
        };
        if (open) {
            loadIndicators();
        }
        if (isEditMode && strategyData) {
            setStrategyName(strategyData.name);
            setStrategyDescription(strategyData.description);
            setSelectedIndicator(strategyData.indicator);
            setParameters(strategyData.parameters || {
                minContractPrice: 150,
                maxContractPrice: 200
            });
        } else {
            resetForm();
        }
    }, [open, snackbar, strategyData]);

    const handleIndicatorChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setSelectedIndicator(value);
        
        // Reset parameters when indicator changes but preserve price range
        const { minContractPrice, maxContractPrice, interval, index, useStopLoss, stopLossPoints, targetPoints } = parameters;
        const defaultParams: Record<string, number | null> = {
            minContractPrice,
            maxContractPrice,
            interval,
            index,
            useStopLoss,
            stopLossPoints,
            targetPoints
        };
        // If an indicator is selected, load its default parameters
        if (value && indicators[value]) {
            indicators[value].parameters.forEach(param => {
                defaultParams[param.name] = param.default;
            });
        }
        setParameters(defaultParams);
    };

    const handleParameterChange = (paramName: string, value: any) => {
        setParameters(prev => ({
            ...prev,
            [paramName]: isNaN(value) ? value : Number(value)
        }));
    };

    const handleSubmit = () => {
        
        if(useStopLoss){
            const { stopLossPoints, targetPoints } = parameters;
            if (stopLossPoints == null || targetPoints == null || stopLossPoints < 0 || targetPoints < 0) {
                snackbar.error("Please enter valid stop loss and target points.");
                return;
            }
        }
        parameters.useStopLoss = useStopLoss;
        const strategyData: StrategyData = {
            name: strategyName,
            description: strategyDescription,
            indicator: selectedIndicator,
            parameters: parameters
        };
        onSubmit(strategyData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setStrategyName('');
        setStrategyDescription('');
        setSelectedIndicator('');
        setParameters({
            minContractPrice: 150,
            maxContractPrice: 200,
            useStopLoss: false,
            stopLossPoints: null,
            targetPoints: null,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'Edit Strategy' : 'Create New Strategy'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Strategy Name"
                        fullWidth
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        required
                    />
                    
                    <TextField
                        label="Strategy Description"
                        sx={{ mt: 2 }}
                        fullWidth
                        multiline
                        rows={3}
                        value={strategyDescription}
                        onChange={(e) => setStrategyDescription(e.target.value)}
                        required
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Min Contract Price"
                            type="number"
                            value={parameters.minContractPrice ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleParameterChange('minContractPrice', Number(value));
                            }}
                            fullWidth
                            required
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Max Contract Price"
                            type="number"
                            value={parameters.maxContractPrice ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleParameterChange('maxContractPrice', Number(value));
                            }}
                            fullWidth
                            required
                            inputProps={{ min: parameters.minContractPrice || 0 }}
                            error={parameters.maxContractPrice != null && parameters.minContractPrice != null && parameters.maxContractPrice <= parameters.minContractPrice}
                            helperText={parameters.maxContractPrice != null && parameters.minContractPrice != null && parameters.maxContractPrice <= parameters.minContractPrice 
                                ? "Max price must be greater than min price" 
                                : ""}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={parameters.useStopLoss}
                                    onChange={(e:any) => handleParameterChange('useStopLoss',e.target.checked)}
                                />
                            }
                            label="Use Stop Loss"
                        />
                    </Box>
                    {parameters.useStopLoss && <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Stop Loss Points"
                            type="number"
                            value={parameters.stopLossPoints ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleParameterChange('stopLossPoints', Number(value));
                            }}
                            fullWidth
                            required
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Target Points"
                            type="number"
                            value={parameters.targetPoints ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleParameterChange('targetPoints', Number(value));
                            }}
                            fullWidth
                            required
                            inputProps={{ min: parameters.stopLossPoints || 0 }}
                            error={parameters.targetPoints != null && parameters.stopLossPoints != null && parameters.targetPoints < parameters.stopLossPoints}
                            helperText={parameters.targetPoints != null && parameters.stopLossPoints != null && parameters.targetPoints < parameters.stopLossPoints
                                ? "Target points must be greater than stop loss points"
                                : ""}
                        />
                    </Box>}

                    <FormControl sx={{ mt: 2 }} fullWidth required>
                        <InputLabel>Select Interval</InputLabel>
                        <Select
                            value={parameters?.interval}
                            onChange={(e: SelectChangeEvent) => {
                                const value = e.target.value;
                                handleParameterChange('interval', value);
                            }}
                            label="Select Interval"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {intervalOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ mt: 2 }} fullWidth required>
                        <InputLabel>Select Index</InputLabel>
                        <Select
                            value={parameters?.index || ''}
                            onChange={(e: SelectChangeEvent) => {
                                const value = e.target.value;
                                handleParameterChange('index', value);
                            }}
                            label="Select Index"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                           {indexOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ mt: 2 }} fullWidth required>
                        <InputLabel>Select Indicator</InputLabel>
                        <Select
                            value={selectedIndicator}
                            onChange={handleIndicatorChange}
                            label="Select Indicator"
                        >
                            {Object.entries(indicators).map(([key, indicator]) => (
                                <MenuItem key={key} value={key}>
                                    {indicator.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedIndicator && indicators[selectedIndicator] && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Indicator Parameters
                            </Typography>
                            {indicators[selectedIndicator].parameters.map((param) => (
                                <TextField
                                    key={param.name}
                                    label={param.label}
                                    type="number"
                                    fullWidth
                                    value={parameters[param.name] ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? null : Number(e.target.value);
                                        handleParameterChange(param.name, value);
                                    }}
                                    inputProps={{
                                        min: param.min,
                                        max: param.max,
                                        step: param.step || 1
                                    }}
                                    helperText={param.description}
                                    sx={{ mt: 2 }}
                                    required
                                />
                            ))}
                        </Box>
                    )}

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    resetForm();
                    onClose();
                }}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained" 
                    color="primary"
                    disabled={!strategyName || !selectedIndicator || loading}
                >
                    {isEditMode ? 'Update Strategy' : 'Create Strategy'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
