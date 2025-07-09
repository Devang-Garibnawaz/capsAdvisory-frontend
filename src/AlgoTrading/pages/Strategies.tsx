import { Grid, Paper } from "@material-ui/core";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Theme,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { fetchOptionContracts, fetchSymbolList } from "../../candleOperations/hooks/candleServices";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddchartIcon from "@mui/icons-material/Addchart";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CreateStrategyDialog from "../Components/CreateStrategyDialog";
import StrategyWebsocketData from "../Components/StrategyWebsocketData";
import { Strategy, StrategyData } from "../types/strategy";
import {
  createStrategy,
  fetchStrategies,
  deleteStrategy,
  deployStrategy,
  stopStrategy,
  updateStrategy,
} from "../hooks/strategyService";
import postal from "postal";

// Common styles for table cells
const commonCellStyles = (theme: Theme) => ({
  color: theme.palette.text.primary,
  padding: {
    xs: "8px",
    sm: "8px 12px",
  },
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontSize: {
    xs: "0.875rem",
    sm: "1rem",
  },
});

// Common styles for action buttons
const commonButtonStyles = (theme: Theme) => ({
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.action.selected,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
});

const Strategies: React.FC = () => {
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [editStrategy, setEditStrategy] = useState<Strategy | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);
  const [showStandaloneWsData, setShowStandaloneWsData] = useState(false);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);

  const loadingRef = useRef(false);

  const loadStrategies = async () => {
    try {
      setLoading("fetchStrategies");
      const response = await fetchStrategies();
      if (response.status) {
        setStrategies(response.strategies);
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
      snackbar.error("Failed to fetch strategies");
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  useEffect(() =>{
    postal.subscribe({
      topic: 'strategy_update_inactive',
      callback: () => {
        loadStrategies();
        setShowStandaloneWsData(false);
      }
    });
  }, []);

  const handleSaveSymbolList = async () => {
    try {
      setLoading("saveSymbolList");
      const response = await fetchSymbolList();
      if (response.status) {
        snackbar.success(response.message);
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      snackbar.error("Failed to save symbol list");
    } finally {
      setLoading(null);
    }
  };

  const handleFetchOptionContracts = async () =>{
    try {
      setLoading("fetchOptionContracts");
       const response = await fetchOptionContracts();
       if(response.status){
        snackbar.success(response.message);
       }else{
        snackbar.error("Failed to fetch option contracts");
       }
      
    } catch (error) {
      snackbar.error("Failed to fetch option contracts");
    }finally{
      setLoading(null);

    }
  }

  const handleCreateStrategy = () => {
    setEditStrategy(null);
    setOpenDialog(true);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditStrategy(strategy);
    setOpenDialog(true);
  };

  const handleDelete = (strategyId: string) => {
    setStrategyToDelete(strategyId);
    setDeleteConfirmation(true);
  };

  const handleStrategySubmit = async (strategyData: StrategyData) => {
    try {
      setLoading(editStrategy ? "updateStrategy" : "createStrategy");

      let response;
      if (editStrategy) {
        response = await updateStrategy(editStrategy.id, strategyData);
      } else {
        response = await createStrategy(strategyData);
      }

      if (response.status) {
        snackbar.success(
          `Strategy ${editStrategy ? "updated" : "created"} successfully`
        );
        loadStrategies();
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      console.error(
        `Error ${editStrategy ? "updating" : "creating"} strategy:`,
        error
      );
      snackbar.error(
        `Failed to ${editStrategy ? "update" : "create"} strategy`
      );
    } finally {
      setLoading(null);
      setOpenDialog(false);
      setEditStrategy(null);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    try {
      if (!id) return;

      setLoading(`delete-${id}`);
      const response = await deleteStrategy(id);
      if (response.status) {
        snackbar.success("Strategy deleted successfully");
        loadStrategies(); // Reload the strategies list
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting strategy:", error);
      snackbar.error("Failed to delete strategy");
    } finally {
      setLoading(null);
    }
  };

  const handleDeployStrategy = async (id: string) => {
    try {
      setLoading(`deploy-${id}`);
      const response = await deployStrategy(id);
      if (response.status) {
        snackbar.success("Strategy deployed successfully");
        loadStrategies(); // Reload the strategies list
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      console.error("Error deploying strategy:", error);
      snackbar.error("Failed to deploy strategy");
    } finally {
      setLoading(null);
    }
  };

  const handleStopStrategy = async (id: string) => {
    try {
      setLoading(`stop-${id}`);
      const response = await stopStrategy(id);
      if (response.status) {
        snackbar.success("Strategy stopped successfully");
        loadStrategies(); // Reload the strategies list
        setShowStandaloneWsData(false);
        setActiveStrategyId(null);
      } else {
        snackbar.error(response.message);
      }
    } catch (error) {
      console.error("Error stopping strategy:", error);
      snackbar.error("Failed to stop strategy");
    } finally {
      setLoading(null);
    }
  };

  const openDeleteConfirmationDialog = (id: string) => {
    setDeleteConfirmation(true);
    setStrategyToDelete(id);
  };

  const closeDeleteConfirmationDialog = () => {
    setDeleteConfirmation(false);
    setStrategyToDelete(null);
  };

  const confirmDeleteStrategy = async () => {
    if (strategyToDelete) {
      await handleDeleteStrategy(strategyToDelete);
    }
    closeDeleteConfirmationDialog();
  };

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Strategies"} />
      </AdminAppBar>

      <Grid container spacing={2}>
        {/* Control Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddchartIcon />}
              onClick={handleCreateStrategy}
              sx={{
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'}}
            >
              Create Strategy
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveAltIcon />}
              onClick={handleSaveSymbolList}
              disabled={loading === "saveSymbolList"}
              sx={{
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'}}
            >
              {loading === "saveSymbolList" ? (
                <CircularProgress size={24} />
              ) : (
                "Update Symbol List"
              )}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveAltIcon />}
              onClick={handleFetchOptionContracts}
              disabled={loading === "fetchOptionContracts"}
              sx={{
                py: 0.5,
                px: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'}}
            >
              {loading === "fetchOptionContracts" ? (
                <CircularProgress size={24} />
              ) : (
                "Fetch Option Contracts"
              )}
            </Button>
          </Box>
        </Grid>

        {/* Main Table Section */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["Name", "Description", "Indicator", "Price Range", "Status", "Last Modified", "Actions"].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        color: (theme) => theme.palette.text.primary,
                        backgroundColor: (theme) => theme.palette.background.default,
                        fontWeight: 600,
                        padding: { xs: "12px 8px", sm: "16px" },
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {strategies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ color: (theme) => theme.palette.text.secondary, padding: "24px 8px" }}
                    >
                      No strategies found
                    </TableCell>
                  </TableRow>
                ) : (
                  strategies.map((strategy) => (
                    <TableRow
                      key={strategy.id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: (theme) => theme.palette.action.selected,
                        },
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.action.hover,
                        },
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      <TableCell sx={(theme) => commonCellStyles(theme)}>
                        {strategy.name}
                      </TableCell>
                      <TableCell
                        sx={(theme) => ({
                          ...commonCellStyles(theme),
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {strategy.description}
                      </TableCell>
                      <TableCell sx={(theme) => commonCellStyles(theme)}>
                        {strategy.indicator}
                      </TableCell>
                      <TableCell sx={(theme) => commonCellStyles(theme)}>
                        {strategy.parameters.minContractPrice} - {strategy.parameters.maxContractPrice}
                      </TableCell>
                      <TableCell sx={(theme) => commonCellStyles(theme)}>
                        <Box
                          sx={{
                            color: strategy.isActive ? 
                              (theme) => theme.palette.success.main :
                              (theme) => theme.palette.error.main,
                            backgroundColor: strategy.isActive ?
                              (theme) => alpha(theme.palette.success.main, 0.1) :
                              (theme) => alpha(theme.palette.error.main, 0.1),
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 500,
                          }}
                        >
                          {strategy.isActive ? "Active" : "Inactive"}
                        </Box>
                      </TableCell>
                      <TableCell sx={(theme) => commonCellStyles(theme)}>
                        {new Date(strategy.modified_time).toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={(theme) => ({
                          ...commonCellStyles(theme),
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                          flexWrap: "nowrap",
                        })}
                      >
                        {/* Actions for inactive strategy */}
                        {!strategy.isActive && (
                          <>
                            <Tooltip title="Edit Strategy">
                              <IconButton
                                size="small"
                                onClick={() => handleEditStrategy(strategy)}
                                sx={(theme) => commonButtonStyles(theme)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Strategy">
                              <IconButton
                                size="small"
                                onClick={() => openDeleteConfirmationDialog(strategy.id)}
                                disabled={loading === `delete-${strategy.id}`}
                                sx={(theme) => ({
                                  ...commonButtonStyles(theme),
                                  color: theme.palette.error.main,
                                })}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deploy Strategy">
                              <IconButton
                                size="small"
                                onClick={() => handleDeployStrategy(strategy.id)}
                                disabled={loading === `deploy-${strategy.id}`}
                                sx={(theme) => commonButtonStyles(theme)}
                              >
                                <RocketLaunchIcon fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {/* Actions for active strategy */}
                        {strategy.isActive && (
                          <>
                            <Tooltip title={activeStrategyId === strategy.id && showStandaloneWsData ? "Hide Strategy Data" : "View Strategy Data"}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (activeStrategyId === strategy.id && showStandaloneWsData) {
                                    setShowStandaloneWsData(false);
                                    setActiveStrategyId(null);
                                  } else {
                                    setActiveStrategyId(strategy.id);
                                    setShowStandaloneWsData(true);
                                  }
                                }}
                                sx={(theme) => ({
                                  ...commonButtonStyles(theme),
                                  backgroundColor: activeStrategyId === strategy.id && showStandaloneWsData
                                    ? theme.palette.primary.main
                                    : "transparent",
                                  color: activeStrategyId === strategy.id && showStandaloneWsData
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.primary,
                                  "&:hover": {
                                    backgroundColor: activeStrategyId === strategy.id && showStandaloneWsData
                                      ? theme.palette.primary.dark
                                      : theme.palette.action.hover,
                                  },
                                })}
                              >
                                {activeStrategyId === strategy.id && showStandaloneWsData ? (
                                  <VisibilityOffIcon fontSize="small" />
                                ) : (
                                  <VisibilityIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Stop Strategy">
                              <IconButton
                                size="small"
                                onClick={() => handleStopStrategy(strategy.id)}
                                disabled={loading === `stop-${strategy.id}`}
                                sx={(theme) => commonButtonStyles(theme)}
                              >
                                <CancelIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Strategy Data Section */}
        {showStandaloneWsData && activeStrategyId && (
          <Grid item xs={12}>
            <StrategyWebsocketData
              isVisible={showStandaloneWsData}
              strategyData={strategies.find((s) => s.id === activeStrategyId) || {}}
              strategyId={activeStrategyId}
            />
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Strategy Dialog */}
      <CreateStrategyDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditStrategy(null);
        }}
        onSubmit={handleStrategySubmit}
        strategyData={editStrategy!}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation}
        onClose={closeDeleteConfirmationDialog}
        PaperProps={{
          style: {
            backgroundColor: "#1E1E1E",
            color: "#FFFFFF",
          },
        }}
      >
        <DialogTitle>Delete Strategy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "inherit" }}>
            Are you sure you want to delete this strategy?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={closeDeleteConfirmationDialog}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteStrategy}
            variant="contained"
            color="primary"
            disabled={loading === `delete-${strategyToDelete}` || loadingRef.current}
          >
            {loading === `delete-${strategyToDelete}` ? (
              <CircularProgress size={24} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Strategies;
