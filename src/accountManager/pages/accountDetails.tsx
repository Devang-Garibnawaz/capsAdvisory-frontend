import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncIcon from "@mui/icons-material/Sync";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import {
  cancelAllOrdersByGroup,
  cancelAllOrdersByUser,
  cancelOrderByOrderId,
  getDematAccounts,
  squareOffByUser,
} from "../hooks/accountManagementService";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { ExitAllPostions } from "../../nfo/hooks/niftyServices";
import CancelIcon from "@mui/icons-material/Cancel";
import { LoadingButton } from "@material-ui/lab";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  type TabType = "positions" | "orders" | "trades";
  const [activeTab, setActiveTab] = useState<TabType>("positions");
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [accountName, setAccountName] = useState("");
  const [margin, setMargin] = useState<number>(0.0);
  const [pnl, setPnl] = useState<number>(0.0);
  type SortDirection = "asc" | "desc";
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const response = await getDematAccounts();
      if (response.status) {
        const account = response.dematAccounts.find(
          (acc: any) => acc.id === accountId
        );
        if (account) {
          setAccountDetails(account);
          setMargin(Number(Number(account?.stats?.margin || 0).toFixed(2)));

          // Calculate total PNL from positions
          const positions = Object.values(account?.stats?.position || {});
          const totalPnl = positions.reduce((sum: number, position: any) => {
            return sum + Number(position.pnl || 0);
          }, 0);

          setPnl(Number(totalPnl.toFixed(2)));
          setAccountName(`${account.fullName}-angelone-${account.clientId}`);
          snackbar.success("Account details fetched successfully");
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching account details:", error);
      snackbar.error("Error fetching account details");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (
    data: Record<string, any>[],
    property: string
  ): Record<string, any>[] => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];

      if (order === "desc") {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
  };

  const filterData = (
    data: Record<string, any>[],
    query: string
  ): Record<string, any>[] => {
    if (!query) return data;
    const lowercaseQuery = query.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getTableData = () => {
    if (activeTab === "positions" && accountDetails?.stats?.position) {
      const data = Object.values(accountDetails.stats.position || {}) as Record<
        string,
        any
      >[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    if (activeTab === "orders" && accountDetails?.stats?.orders?.orders) {
      const data = Object.values(
        accountDetails.stats.orders.orders || {}
      ) as Record<string, any>[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    if (activeTab === "trades" && accountDetails?.stats?.trades) {
      const data = Object.values(accountDetails.stats.trades || {}) as Record<
        string,
        any
      >[];
      return sortData(filterData(data, searchQuery), orderBy);
    }
    return [];
  };

  const handleExportToExcel = () => {
    const data = getTableData();
    if (data.length === 0) return;

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]?.toString() || "";
            return value.includes(",") ? `"${value}"` : value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${activeTab}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSquareOffAll = async () => {
    try {
      const result = await ExitAllPostions();
      if (result.status) {
        snackbar.success(result.message);
        fetchAccountDetails(); // Refresh the positions data
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      console.error("Error squaring off positions:", error);
      snackbar.error("Failed to square off positions");
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    order: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async () => {
    try {
      // TODO: Implement cancel order functionality
      const result = await cancelOrderByOrderId(selectedOrder.orderid);
      if (result.status) {
        snackbar.success(result.message);
        handleMenuClose();
        fetchAccountDetails(); // Refresh the orders data
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      snackbar.error("Failed to cancel order");
    }
  };

  const handleSquareOffById = async (position: any) => {
    try {
      const result = await squareOffByUser(position);
      if (result.status) {
        snackbar.success(result.message);
        fetchAccountDetails(); // Refresh the positions data
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      snackbar.error("Failed to square off position");
    }
  };
  const handleCancelAllOrders = async () => {
    try {
      const result = await cancelAllOrdersByUser(accountId);
      if (result.status) {
        snackbar.success(result.message);
        fetchAccountDetails(); // Refresh the orders data
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling all orders:", error);
      snackbar.error("Failed to cancel all orders");
    }
  };

  const renderSortLabel = (label: string, property: string) => (
    <TableCell
      sx={{
        color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
        padding: '12px 8px',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(26, 28, 30, 0.95)'
          : 'rgba(248, 250, 252, 0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        borderBottom: theme => theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem',
        fontWeight: 700,
        cursor: 'pointer'
      }}
      onClick={() => handleSort(property)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {label}
    <TableSortLabel
      active={orderBy === property}
          direction={orderBy === property ? order : 'asc'}
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

  const renderPositionsTableHeader = () => (
    <TableHead>
      <TableRow>
        {[
          { id: 'id', label: 'Id' },
          { id: 'tradingsymbol', label: 'Symbol' },
          { id: 'producttype', label: 'Product' },
          { id: 'action', label: 'Action' },
          { id: 'buyqty', label: 'Quantity' },
          { id: 'pnl', label: 'Pnl' },
          { id: 'ltp', label: 'Ltp' },
          { id: 'avgnetprice', label: 'Avgprice' },
          { id: 'squareoff', label: 'Square Off' }
        ].map(column => (
          <TableCell
            key={column.id}
            sx={{
              color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B',
              backgroundColor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(26, 28, 30, 0.95)'
                : 'rgba(248, 250, 252, 0.95)',
              fontWeight: 600,
              padding: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            {column.id === 'id' ? column.label : renderSortLabel(column.label, column.id)}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderPositionsContent = () => {
    const positions = getTableData();
    const allPositionsClosed = !positions.some(pos => Number(pos.netqty) !== 0);

    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{
                backgroundColor: "#0EA5E9",
                "&:hover": { backgroundColor: "#0284C7" },
                textTransform: "none",
                py: 0.5,
                px: 2,
              }}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<CloseIcon />}
              disabled={allPositionsClosed || positions.length === 0}
              onClick={handleSquareOffAll}
              sx={{
                textTransform: "none",
                py: 0.5,
                px: 2,
              }}
            >
              Square Off All
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: "transparent",
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? "rgba(26, 28, 30, 0.7)"
                  : "rgba(248, 250, 252, 0.95)",
                color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                "& fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                }
              },
              "& .MuiInputBase-input": {
                "&::placeholder": {
                  color: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                  opacity: 1
                }
              }
            }}
          />
        </Box>

        <TableContainer
          component={Paper}
            sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(26, 28, 30, 0.7)'
              : 'rgba(255, 255, 255, 0.95)',
            maxHeight: 'calc(100vh - 300px)',
            position: 'relative',
            overflow: 'auto',
            borderRadius: '12px',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: '0',
            }
          }}
        >
          <Table stickyHeader size="small">
            {renderPositionsTableHeader()}
            <TableBody>
              {positions.map((position: any, index: number) => (
                <TableRow
                  key={position.tradingsymbol}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)'
                    },
                    '&:last-child td': {
                      borderBottom: 0
                    },
                    wordBreak:'break-word'
                  }}
                >
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
                    {index + 1}
                  </TableCell>
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
                    {position.tradingsymbol}
                  </TableCell>
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
                    {position.producttype || "CARRYFORWARD"}
                  </TableCell>
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
                    <Box
                      sx={{
                        color:
                          position.producttype === "CARRYFORWARD" 
                            ? (position.cfbuyqty === position.cfsellqty
                            ? "#fc424a"
                            : position.cfbuyqty > 0
                            ? "#00d25b"
                                : "#fc424a")
                            : (position.buyqty === position.sellqty
                          ? "#fc424a"
                          : position.buyqty > 0
                          ? "#00d25b"
                                : "#fc424a"),
                        backgroundColor:
                          position.producttype === "CARRYFORWARD" 
                            ? (position.cfbuyqty === position.cfsellqty
                            ? "rgba(252, 66, 74, 0.2)"
                            : position.cfbuyqty > 0
                            ? "rgba(0, 210, 91, 0.2)"
                                : "rgba(252, 66, 74, 0.2)")
                            : (position.buyqty === position.sellqty
                          ? "rgba(252, 66, 74, 0.2)"
                          : position.buyqty > 0
                          ? "rgba(0, 210, 91, 0.2)"
                                : "rgba(252, 66, 74, 0.2)"),
                        display: "inline-block",
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        textShadow:
                          position.producttype === "CARRYFORWARD" 
                            ? (position.cfbuyqty === position.cfsellqty
                            ? "0 0 10px rgba(252, 66, 74, 0.5)"
                            : position.cfbuyqty > 0
                            ? "0 0 10px rgba(0, 210, 91, 0.5)"
                                : "0 0 10px rgba(252, 66, 74, 0.5)")
                            : (position.buyqty === position.sellqty
                          ? "0 0 10px rgba(252, 66, 74, 0.5)"
                          : position.buyqty > 0
                          ? "0 0 10px rgba(0, 210, 91, 0.5)"
                                : "0 0 10px rgba(252, 66, 74, 0.5)"),
                        fontWeight: 500,
                      }}
                    >
                      {position.producttype === "CARRYFORWARD" ?
                      position.cfbuyqty === position.cfsellqty
                        ? "CLOSED"
                        : position.cfbuyqty > 0
                        ? "BUY"
                        : "SELL"
                      : position.buyqty === position.sellqty
                      ? "CLOSED"
                      : position.buyqty > 0
                      ? "BUY"
                      : "SELL"}
                    </Box>
                  </TableCell>
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
                    {position.producttype === "CARRYFORWARD" ?
                    position.cfbuyqty
                    : position.buyqty}
                  </TableCell>
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
                    {Number(position.pnl).toFixed(2)}{" "}
                    {Number(position.pnl) < 0 ? "↓" : "↑"}
                  </TableCell>
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
                    {Number(position.ltp).toFixed(2)}
                  </TableCell>
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
                    {Number(position.avgnetprice).toFixed(2)}
                  </TableCell>
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
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      disabled={Number(position.netqty) === 0}
                      onClick={() => handleSquareOffById(position)}
                      sx={{
                        textTransform: 'none',
                        minWidth: '100px',
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#DC2626' : '#EF4444',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#B91C1C' : '#DC2626',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)',
                          color: theme => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(0, 0, 0, 0.3)',
                        }
                      }}
                    >
                      Square Off
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {positions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{
                      color: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                      padding: '24px 8px'
                    }}
                  >
                    {searchQuery
                      ? "No matching positions found"
                      : "No positions found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderOrdersTableHeader = () => (
    <TableHead>
      <TableRow>
        {[
          { id: 'tradingsymbol', label: 'Symbol', width: '12%' },
          { id: 'producttype', label: 'Product', width: '8%' },
          { id: 'transactiontype', label: 'B/S', width: '6%' },
          { id: 'quantity', label: 'Quantity', width: '6%' },
          { id: 'ordertype', label: 'Order Type', width: '6%' },
          { id: 'price', label: 'Price', width: '6%' },
          { id: 'orderid', label: 'Order Id', width: '15%' },
          { id: 'status', label: 'Status', width: '6%' },
          { id: 'exchtime', label: 'Create Time', width: '12%' },
          { id: 'actions', label: 'Actions', width: '5%' }
        ].map(column => (
          <TableCell
            key={column.id}
            sx={{
              color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B',
              backgroundColor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(26, 28, 30, 0.95)'
                : 'rgba(248, 250, 252, 0.95)',
              fontWeight: 600,
              padding: '12px 8px',
              whiteSpace: 'nowrap',
              width: column.width,
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}
          >
            {column.id === 'actions' ? column.label : renderSortLabel(column.label, column.id)}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderOrdersContent = () => {
    const orders = getTableData();
    const hasActiveOrders = orders.some(
      (order) =>
        !["complete", "cancelled", "rejected"].includes(
          order.status.toLowerCase()
        )
    );

    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{
                backgroundColor: "#0EA5E9",
                "&:hover": { backgroundColor: "#0284C7" },
                textTransform: "none",
                py: 0.5,
                px: 2,
              }}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelAllOrders}
              disabled={!hasActiveOrders}
              sx={{
                textTransform: "none",
                py: 0.5,
                px: 2,
              }}
            >
              Cancel All
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: "transparent",
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? "rgba(26, 28, 30, 0.7)"
                  : "rgba(248, 250, 252, 0.95)",
                color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                "& fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                }
              },
              "& .MuiInputBase-input": {
                "&::placeholder": {
                  color: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                  opacity: 1
                }
              }
            }}
          />
        </Box>

        <Box sx={{ 
          width: '100%',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: theme => theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '20px',
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(to top, rgba(26, 28, 30, 1) 0%, rgba(26, 28, 30, 0) 100%)'
              : 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)',
            pointerEvents: 'none',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            zIndex: 2
          }
        }}>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(26, 28, 30, 0.7)'
                : 'rgba(255, 255, 255, 0.95)',
              maxHeight: 'calc(100vh - 300px)',
              width: '100%',
              overflowX: 'auto',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.3)'
                }
              },
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: '0',
                width: '100%',
                tableLayout: 'fixed'
              },
              '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                borderBottom: 'none'
              }
            }}
          >
            <Table stickyHeader size="small">
              {renderOrdersTableHeader()}
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow
                    key={order.orderid}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)'
                      },
                      '&:hover': {
                        backgroundColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.07) !important'
                          : 'rgba(0, 0, 0, 0.04) !important'
                      },
                      '&:last-child td': {
                        borderBottom: 0
                      }
                    }}
                  >
                    <TableCell sx={{ width: '13%', padding: '8px 12px' }}>
                      {order.tradingsymbol}
                    </TableCell>
                    <TableCell sx={{ width: '11%', padding: '8px 12px' }}>
                      {order.producttype || "CARRYFORWARD"}
                    </TableCell>
                    <TableCell sx={{ width: '9%', padding: '8px 12px' }}>
                      <Box
                        sx={{
                          color:
                            order.transactiontype === "BUY"
                              ? "#00d25b"
                              : "#fc424a",
                          backgroundColor:
                            order.transactiontype === "BUY"
                              ? "rgba(0, 210, 91, 0.2)"
                              : "rgba(252, 66, 74, 0.2)",
                          display: "inline-block",
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          textShadow:
                            order.transactiontype === "BUY"
                              ? "0 0 10px rgba(0, 210, 91, 0.5)"
                              : "0 0 10px rgba(252, 66, 74, 0.5)",
                          fontWeight: 500,
                        }}
                      >
                        {order.transactiontype}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '11%', padding: '8px 12px' }}>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        <Typography sx={{ color: "#00d25b" }}>
                          {order.filledshares}
                        </Typography>
                        <Typography sx={{ color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B' }}>
                          /{order.quantity}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '11%', padding: '8px 12px' }}>
                      {order.ordertype}
                    </TableCell>
                    <TableCell sx={{ width: '9%', padding: '8px 12px' }}>
                      {Number(order.price).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ width: '15%', padding: '8px 12px' }}>
                      {order.orderid}
                    </TableCell>
                    <TableCell sx={{ width: '9%', padding: '8px 12px' }}>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell sx={{ width: '12%', padding: '8px 12px' }}>
                      {order.updatetime}
                    </TableCell>
                    <TableCell sx={{ width: '5%', padding: '8px 12px' }}>
                      <IconButton
                        size="small"
                        disabled={["complete", "cancelled", "rejected"].includes(
                          order.status.toLowerCase()
                        )}
                        onClick={(e) => handleMenuClick(e, order)}
                        sx={{
                          color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#4B5563' : '#E5E7EB',
                          '&:hover': { 
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#374151' : '#D1D5DB'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#1F2937' : '#F3F4F6',
                            color: theme => theme.palette.mode === 'dark' ? '#6B7280' : '#9CA3AF',
                          },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      align="center"
                      sx={{
                        color: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.7)'
                          : 'rgba(0, 0, 0, 0.7)',
                        padding: '24px 8px'
                      }}
                    >
                      {searchQuery
                        ? "No matching orders found"
                        : "No orders found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#FFFFFF',
              color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
              '& .MuiMenuItem-root': {
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleCancelOrder}>
            <ListItemIcon>
              <CancelIcon sx={{ color: "#EF4444" }} />
            </ListItemIcon>
            Cancel Order
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  const renderTradesTableHeader = () => (
    <TableHead>
      <TableRow>
        {[
          { id: 'id', label: 'Id' },
          { id: 'tradingsymbol', label: 'Symbol' },
          { id: 'producttype', label: 'Product' },
          { id: 'fillsize', label: 'Quantity' },
          { id: 'transactiontype', label: 'B/S' },
          { id: 'fillprice', label: 'Price' },
          { id: 'orderid', label: 'Order Id' },
          { id: 'filltime', label: 'Create Time' }
        ].map(column => (
          <TableCell
            key={column.id}
            sx={{
              color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B',
              backgroundColor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(26, 28, 30, 0.95)'
                : 'rgba(248, 250, 252, 0.95)',
              fontWeight: 600,
              padding: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            {column.id === 'id' ? column.label : renderSortLabel(column.label, column.id)}
        </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderTradesContent = () => {
    const trades = getTableData();

    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{
                backgroundColor: "#0EA5E9",
                "&:hover": { backgroundColor: "#0284C7" },
                textTransform: "none",
                py: 0.5,
                px: 2,
              }}
            >
              Export to CSV
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 300,
              backgroundColor: "transparent",
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? "rgba(26, 28, 30, 0.7)"
                  : "rgba(248, 250, 252, 0.95)",
                color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
                "& fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                }
              },
              "& .MuiInputBase-input": {
                "&::placeholder": {
                  color: theme => theme.palette.mode === 'dark'
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                  opacity: 1
                }
              }
            }}
          />
        </Box>

        <TableContainer
          component={Paper}
            sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(26, 28, 30, 0.7)'
              : 'rgba(255, 255, 255, 0.95)',
            maxHeight: 'calc(100vh - 300px)',
            position: 'relative',
            overflow: 'auto',
            borderRadius: '12px',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: '0',
            }
          }}
        >
          <Table stickyHeader size="small">
            {renderTradesTableHeader()}
            <TableBody>
              {trades.map((trade: any, index: number) => (
                <TableRow
                  key={trade.fillid}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)'
                    },
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.07) !important'
                        : 'rgba(0, 0, 0, 0.04) !important'
                    },
                    '&:last-child td': {
                      borderBottom: 0
                    }
                  }}
                >
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
                    {index + 1}
                  </TableCell>
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
                    {trade.tradingsymbol}
                  </TableCell>
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
                    {trade.producttype}
                  </TableCell>
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
                    {trade.fillsize}
                  </TableCell>
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
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 500,
                        color:
                          trade.transactiontype === "BUY"
                            ? "#00d25b"
                            : "#fc424a",
                        backgroundColor:
                          trade.transactiontype === "BUY"
                            ? "rgba(0, 210, 91, 0.2)"
                            : "rgba(252, 66, 74, 0.2)",
                        textShadow:
                          trade.transactiontype === "BUY"
                            ? "0 0 10px rgba(0, 210, 91, 0.5)"
                            : "0 0 10px rgba(252, 66, 74, 0.5)",
                      }}
                    >
                      {trade.transactiontype}
                    </Box>
                  </TableCell>
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
                    {Number(trade.fillprice).toFixed(2)}
                  </TableCell>
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
                    {trade.orderid}
                  </TableCell>
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
                    {trade.filltime}
                  </TableCell>
                </TableRow>
              ))}
              {trades.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      color: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                      padding: '24px 8px'
                    }}
                  >
                    {searchQuery
                      ? "No matching trades found"
                      : "No trades found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getStatusBadge = (status: string) => (
    <Box
      sx={{
        color: status.toLowerCase() === 'complete' ? '#22C55E'
          : status.toLowerCase() === 'cancelled' ? '#EF4444'
          : status.toLowerCase() === 'rejected' ? '#EF4444'
          : status.toLowerCase() === 'pending' ? '#F59E0B'
          : '#22C55E',
        backgroundColor: status.toLowerCase() === 'complete' ? 'rgba(34, 197, 94, 0.2)'
          : status.toLowerCase() === 'cancelled' ? 'rgba(239, 68, 68, 0.2)'
          : status.toLowerCase() === 'rejected' ? 'rgba(239, 68, 68, 0.2)'
          : status.toLowerCase() === 'pending' ? 'rgba(245, 158, 11, 0.2)'
          : 'rgba(34, 197, 94, 0.2)',
        display: 'inline-block',
        px: 1,
        py: 0.25,
        borderRadius: 1,
        textShadow: theme => theme.palette.mode === 'dark'
          ? `0 0 10px ${
            status.toLowerCase() === 'complete' ? 'rgba(34, 197, 94, 0.5)'
            : status.toLowerCase() === 'cancelled' ? 'rgba(239, 68, 68, 0.5)'
            : status.toLowerCase() === 'rejected' ? 'rgba(239, 68, 68, 0.5)'
            : status.toLowerCase() === 'pending' ? 'rgba(245, 158, 11, 0.5)'
            : 'rgba(34, 197, 94, 0.5)'
          }`
          : 'none',
        fontWeight: 500,
        fontSize: '0.75rem'
      }}
    >
      {status.toUpperCase()}
    </Box>
  );

  const getTransactionBadge = (type: string) => (
    <Box
      sx={{
        color: type.toLowerCase() === 'buy' 
          ? theme => theme.palette.mode === 'dark' ? '#22C55E' : '#059669'
          : theme => theme.palette.mode === 'dark' ? '#EF4444' : '#DC2626',
        backgroundColor: type.toLowerCase() === 'buy'
          ? theme => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(5, 150, 105, 0.1)'
          : theme => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)',
        display: 'inline-block',
        px: 2,
        py: 0.5,
        borderRadius: 1,
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}
    >
      {type}
    </Box>
  );

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Account Details"}></AdminToolbar>
      </AdminAppBar>

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#FFFFFF',
            p: 2,
            borderRadius: 1,
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                backgroundColor: '#0EA5E9',
                '&:hover': { backgroundColor: '#0284C7' },
                padding: '8px'
              }}
            >
              <ArrowBackIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
            </IconButton>
            <Typography variant="h6" sx={{ 
              color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B',
              fontWeight: 600 
            }}>
              Account Details
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              color: theme => theme.palette.mode === 'dark' ? '#94A3B8' : '#64748B'
            }}>
              {accountName}
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: theme => theme.palette.mode === 'dark' ? 'white' : '#1E293B'
            }}>
              Margin: {margin}
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: pnl >= 0 ? '#22C55E' : '#EF4444',
              fontWeight: 600
            }}>
              PnL: {pnl}
            </Typography>
            <IconButton
              onClick={fetchAccountDetails}
              size="small"
              sx={{
                backgroundColor: '#8B5CF6',
                '&:hover': { backgroundColor: '#7C3AED' },
                padding: '8px'
              }}
            >
              <SyncIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            display: "flex",
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A1C1E' : '#F8FAFC',
            borderRadius: 1,
            mb: 3,
            overflow: "hidden",
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button
            variant={activeTab === "positions" ? "contained" : "text"}
            onClick={() => setActiveTab("positions")}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: theme => {
                if (activeTab === "positions") {
                  return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                }
                return 'transparent';
              },
              color: theme => {
                if (activeTab === "positions") {
                  return 'white';
                }
                return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
              },
              '&:hover': {
                backgroundColor: theme => {
                  if (activeTab === "positions") {
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
            variant={activeTab === "orders" ? "contained" : "text"}
            onClick={() => setActiveTab("orders")}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: theme => {
                if (activeTab === "orders") {
                  return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                }
                return 'transparent';
              },
              color: theme => {
                if (activeTab === "orders") {
                  return 'white';
                }
                return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
              },
              '&:hover': {
                backgroundColor: theme => {
                  if (activeTab === "orders") {
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
            variant={activeTab === "trades" ? "contained" : "text"}
            onClick={() => setActiveTab("trades")}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              backgroundColor: theme => {
                if (activeTab === "trades") {
                  return theme.palette.mode === 'dark' ? '#000' : '#3b82f6';
                }
                return 'transparent';
              },
              color: theme => {
                if (activeTab === "trades") {
                  return 'white';
                }
                return theme.palette.mode === 'dark' ? 'grey.500' : '#64748B';
              },
              '&:hover': {
                backgroundColor: theme => {
                  if (activeTab === "trades") {
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

        {/* Content Area */}
        <Box
          sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? '#1A1C1E'
              : '#FFFFFF',
            borderRadius: 1,
            p: 2,
          }}
        >
          {activeTab === "positions" && renderPositionsContent()}
          {activeTab === "orders" && renderOrdersContent()}
          {activeTab === "trades" && renderTradesContent()}
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default AccountDetails;
