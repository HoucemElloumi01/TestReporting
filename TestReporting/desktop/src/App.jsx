import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useEffect, useMemo, useRef, useState } from 'react';

const drawerWidth = 340;
const API_BASE = 'http://127.0.0.1:8000/api/reports';

const analysisStatuses = [
  'Not Started',
  'In Progress',
  'Analyzed',
  'Issue Confirmed',
  'False Alarm',
  'Closed',
];

const statusFilterValues = ['All', 'Passed', 'Failed', 'Skipped', 'Not Executed'];

const tableColumns = [
  { id: 'testcaseId', label: 'Testcase ID', sortable: true, width: 130 },
  { id: 'testcaseName', label: 'Testcase Name', sortable: true, width: 260 },
  { id: 'parameters', label: 'Parameters', sortable: false, width: 260 },
  { id: 'status', label: 'Result', sortable: true, width: 120 },
  { id: 'description', label: 'Description', sortable: false, width: 300 },
  { id: 'testerConclusion', label: 'Tester Conclusion', sortable: false, width: 240 },
  { id: 'analysisStatus', label: 'Analysis Status', sortable: true, width: 170 },
];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f62fe',
      dark: '#0043ce',
    },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#172033',
      secondary: '#667085',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.07)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#475467',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e4e7ec',
        },
        body: {
          borderBottom: '1px solid #edf2f7',
          fontSize: 13,
          verticalAlign: 'top',
        },
      },
    },
  },
});

function statusStyles(status) {
  const styles = {
    Passed: { color: '#027a48', backgroundColor: '#ecfdf3', borderColor: '#abefc6' },
    Failed: { color: '#b42318', backgroundColor: '#fef3f2', borderColor: '#fecdca' },
    Skipped: { color: '#b54708', backgroundColor: '#fffaeb', borderColor: '#fedf89' },
    'Not Executed': { color: '#475467', backgroundColor: '#f2f4f7', borderColor: '#d0d5dd' },
  };

  return styles[status] || styles['Not Executed'];
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

function compareValues(leftValue, rightValue, direction) {
  const left = String(leftValue || '').toLowerCase();
  const right = String(rightValue || '').toLowerCase();

  if (left < right) {
    return direction === 'asc' ? -1 : 1;
  }

  if (left > right) {
    return direction === 'asc' ? 1 : -1;
  }

  return 0;
}

function StatusBadge({ status }) {
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        ...statusStyles(status),
        border: '1px solid',
        fontWeight: 800,
        minWidth: 96,
      }}
    />
  );
}

function SummaryCard({ title, value, icon, accent }) {
  return (
    <Card className="summary-card">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" fontSize={12} fontWeight={800} textTransform="uppercase">
              {title}
            </Typography>
            <Typography variant="h4" mt={1}>
              {value}
            </Typography>
          </Box>
          <Box className="summary-icon" sx={{ color: accent, backgroundColor: `${accent}14` }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, value }) {
  return (
    <Box>
      <Typography color="text.secondary" fontSize={12} fontWeight={800} textTransform="uppercase">
        {label}
      </Typography>
      <Typography className="detail-text" mt={0.75}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function TestCaseRow({ row, onUpdate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover className="testcase-row">
        <TableCell padding="checkbox">
          <Tooltip title={open ? 'Hide test steps' : 'Show test steps'}>
            <IconButton size="small" onClick={() => setOpen((value) => !value)}>
              {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Typography fontWeight={800}>{row.testcaseId}</Typography>
          <Typography color="text.secondary" fontSize={12}>
            {row.sourceFilename}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontWeight={700}>{row.testcaseName}</Typography>
          <Typography color="text.secondary" fontSize={12} mt={0.5}>
            {row.message || row.testStepDescription || 'No execution message'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography className="mono-snippet">{row.parameters || '—'}</Typography>
        </TableCell>
        <TableCell>
          <StatusBadge status={row.status} />
        </TableCell>
        <TableCell>
          <Typography className="clamped-text">{row.description || '—'}</Typography>
        </TableCell>
        <TableCell>
          <TextField
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            size="small"
            placeholder="Add tester conclusion..."
            value={row.testerConclusion}
            onChange={(event) => onUpdate(row.id, { testerConclusion: event.target.value })}
          />
        </TableCell>
        <TableCell>
          <FormControl fullWidth size="small">
            <Select
              value={row.analysisStatus}
              onChange={(event) => onUpdate(row.id, { analysisStatus: event.target.value })}
            >
              {analysisStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="expanded-cell" colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="expanded-panel">
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
                <DetailBlock label="Test Step Description" value={row.testStepDescription} />
                <DetailBlock label="Test Step Status" value={<StatusBadge status={row.testStepStatus} />} />
                <DetailBlock label="Expected Result" value={row.expectedResult} />
                <DetailBlock label="Actual Result" value={row.actualResult} />
              </Stack>
              <Typography variant="subtitle2" fontWeight={800} mb={1.5}>
                Execution Steps
              </Typography>
              <Table size="small" className="steps-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Step</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description / Message</TableCell>
                    <TableCell>Expected Result</TableCell>
                    <TableCell>Actual Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.steps.length ? (
                    row.steps.map((step, index) => (
                      <TableRow key={`${row.id}-step-${index}`}>
                        <TableCell>
                          <Typography fontWeight={800}>{step.name}</Typography>
                          <Typography color="text.secondary" fontSize={12}>
                            {step.group} · {step.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={step.status} />
                        </TableCell>
                        <TableCell>{step.message || '—'}</TableCell>
                        <TableCell>{step.expectedResult || '—'}</TableCell>
                        <TableCell>{step.actualResult || '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No step details were found in this testcase.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function App() {
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('testcaseId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_BASE}/testcases/`)
      .then((data) => {
        setRows(data.rows || []);
        setLoadedFiles((data.loadedFiles || []).map((name) => ({ name })));
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const summary = useMemo(
    () => ({
      total: rows.length,
      passed: rows.filter((row) => row.status === 'Passed').length,
      failed: rows.filter((row) => row.status === 'Failed').length,
      skipped: rows.filter((row) => row.status === 'Skipped').length,
      files: loadedFiles.length,
    }),
    [rows, loadedFiles],
  );

  const visibleRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesSearch =
          !query ||
          row.testcaseId.toLowerCase().includes(query) ||
          row.testcaseName.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((leftRow, rightRow) => compareValues(leftRow[sortBy], rightRow[sortBy], sortDirection));
  }, [rows, searchText, statusFilter, sortBy, sortDirection]);

  const paginatedRows = visibleRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const updateRow = (id, patch) => {
    // Update the UI immediately, then persist to the backend so the conclusion is not lost on reload.
    setRows((currentRows) => currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

    fetchJson(`${API_BASE}/testcases/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch((error) => setLoadError(`Could not save your changes: ${error.message}`));
  };

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(columnId);
    setSortDirection('asc');
  };

  const handleFileLoad = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const data = await fetchJson(`${API_BASE}/parse-json/`, { method: 'POST', body: formData });

      setRows((currentRows) => [...currentRows, ...data.rows]);
      setLoadedFiles((currentFiles) => [...currentFiles, ...data.loadedFiles]);
      setLoadError('');
      setPage(0);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to parse selected JSON files.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE}/export/`, '_blank');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-shell">
        <Box className="main-content" sx={{ mr: assistantOpen ? `${drawerWidth}px` : 0 }}>
          <Paper className="page-header">
            <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography color="primary" fontWeight={800} fontSize={13} textTransform="uppercase">
                  Test Reporting & Execution Management
                </Typography>
                <Typography variant="h4">Execution Reporting</Typography>
                <Typography color="text.secondary" mt={0.75}>
                  Load one or more JsonReport.json files, review execution evidence, and capture tester analysis.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Badge badgeContent={summary.files} color="primary">
                  <Chip icon={<ArticleOutlinedIcon />} label={`${summary.files} loaded files`} variant="outlined" />
                </Badge>
                <Tooltip title={assistantOpen ? 'Collapse AI panel' : 'Open AI panel'}>
                  <IconButton className="assistant-toggle" onClick={() => setAssistantOpen((value) => !value)}>
                    {assistantOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          <Box className="summary-grid">
            <SummaryCard title="Total Testcases" value={summary.total} accent="#0f62fe" icon={<AnalyticsOutlinedIcon />} />
            <SummaryCard title="Passed" value={summary.passed} accent="#039855" icon={<CheckCircleOutlinedIcon />} />
            <SummaryCard title="Failed" value={summary.failed} accent="#d92d20" icon={<BugReportOutlinedIcon />} />
            <SummaryCard title="Skipped" value={summary.skipped} accent="#dc6803" icon={<PauseCircleOutlineIcon />} />
            <SummaryCard title="Loaded JSON Files" value={summary.files} accent="#475467" icon={<ArticleOutlinedIcon />} />
          </Box>

          <Paper className="toolbar-card">
            <Toolbar disableGutters className="report-toolbar">
              <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.5} width="100%" alignItems={{ xl: 'center' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    multiple
                    hidden
                    onChange={handleFileLoad}
                  />
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadOutlinedIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Load JSON Files
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    disabled={!rows.length}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </Stack>

                <TextField
                  className="search-field"
                  size="small"
                  placeholder="Search by testcase id or testcase name"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" className="status-filter">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={statusFilter}
                    startAdornment={<FilterAltOutlinedIcon fontSize="small" className="select-icon" />}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(0);
                    }}
                  >
                    {statusFilterValues.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Toolbar>
            {loadError ? (
              <Typography className="load-error" role="alert">
                {loadError}
              </Typography>
            ) : null}
          </Paper>

          <Paper className="table-card">
            <TableContainer className="table-container">
              <Table stickyHeader size="small" aria-label="Execution reporting table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    {tableColumns.map((column) => (
                      <TableCell key={column.id} sx={{ minWidth: column.width }}>
                        {column.sortable ? (
                          <TableSortLabel
                            active={sortBy === column.id}
                            direction={sortBy === column.id ? sortDirection : 'asc'}
                            onClick={() => handleSort(column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box className="empty-state">
                          <Typography color="text.secondary">Loading saved execution results…</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : paginatedRows.length ? (
                    paginatedRows.map((row) => <TestCaseRow key={row.id} row={row} onUpdate={updateRow} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box className="empty-state">
                          <ArticleOutlinedIcon color="primary" />
                          <Typography variant="h6">No execution results loaded</Typography>
                          <Typography color="text.secondary">
                            Select one or more JsonReport.json files to populate the reporting table.
                          </Typography>
                          <Button variant="contained" startIcon={<CloudUploadOutlinedIcon />} onClick={() => fileInputRef.current?.click()}>
                            Load JSON Files
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={visibleRows.length}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
            />
          </Paper>
        </Box>

        <Drawer
          anchor="right"
          variant="persistent"
          open={assistantOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderLeft: '1px solid #e4e7ec',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Box className="assistant-panel">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box className="assistant-avatar">
                  <ChatOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6">AI Assistant</Typography>
                  <Typography color="text.secondary" fontSize={12}>
                    Future analysis companion
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setAssistantOpen(false)}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <Box className="assistant-placeholder">
              <Typography fontWeight={800}>Ask questions about the execution results...</Typography>
              <Typography color="text.secondary" mt={1}>
                The chat UI is ready for a future Django REST API or AI service integration.
              </Typography>
            </Box>
            <Box flex={1} />
            <Stack direction="row" spacing={1}>
              <TextField fullWidth size="small" placeholder="Type a question..." disabled />
              <Button variant="contained" disabled endIcon={<SendOutlinedIcon />}>
                Send
              </Button>
            </Stack>
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
