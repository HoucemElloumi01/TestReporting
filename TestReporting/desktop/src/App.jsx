import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Checkbox,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider as ListDivider,
  Menu,
  MenuItem,
  Paper,
  Pagination,
  PaginationItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  Tab,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
  Alert,
  AlertTitle,
  CircularProgress,
  AvatarGroup,
} from '@mui/material';
import {
  AnalyticsOutlined,
  ArticleOutlined,
  BugReportOutlined,
  ChatOutlined,
  CheckCircleOutlined,
  ChevronLeft,
  ChevronRight,
  CloudUploadOutlined,
  DownloadOutlined,
  ExpandLess,
  ExpandMore,
  FilterAltOutlined,
  PauseCircleOutline,
  Search,
  SendOutlined,
  Add,
  Delete,
  Edit,
  Visibility,
  FolderOutlined,
  DescriptionOutlined,
  AssignmentOutlined,
  FolderOpenOutlined,
  InfoOutlined,
  PersonOutlined,
  DateRangeOutlined,
  SaveOutlined,
  LinkOutlined,
  LockOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AssessmentOutlined,
  VerifiedOutlined,
  PendingOutlined,
  CancelOutlined,
  FileDownloadOutlined,
  SettingsOutlined,
  HelpOutlined,
  PersonAddOutlined,
  GavelOutlined,
  HistoryOutlined,
  WarningOutlined,
  MenuOutlined,
  ChevronRightOutlined,
  ExpandMoreOutlined,
  SearchOutlined,
  ExpandLessOutlined,
  ChevronLeftOutlined,
  PersonOutline,
  KeyOutlined,
} from '@mui/icons-material';
import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './contexts/AuthContext.jsx';

const drawerWidth = 260;
const headerHeight = 56;
const API_BASE = '/api/reports';

const analysisStatuses = [
  'Not Started',
  'In Progress',
  'Analyzed',
  'Issue Confirmed',
  'False Alarm',
  'Closed',
];

const statusFilterValues = ['All', 'Passed', 'Failed', 'Skipped', 'Not Executed'];

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f62fe',
      dark: '#0043ce',
      light: '#e8f0fe',
    },
    secondary: {
      main: '#394867',
    },
    success: {
      main: '#039855',
    },
    warning: {
      main: '#dc6803',
    },
    error: {
      main: '#d92d20',
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
    h4: { fontWeight: 700, letterSpacing: '-0.03em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { 'html, body, #root': { height: '100%', overflow: 'hidden' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(15, 23, 42, 0.06)', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)', borderRadius: 10 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', borderRadius: 10 } } },
    MuiTableCell: { styleOverrides: { head: { color: '#475467', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#f9fafb', borderBottom: '1px solid #e4e7ec', padding: '10px 16px' }, body: { borderBottom: '1px solid #f0f2f5', fontSize: 13, padding: '10px 16px', verticalAlign: 'middle' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }, contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 2px 8px rgba(15, 98, 254, 0.25)' } } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 600, fontSize: 13, textTransform: 'none', minWidth: 120 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: '1px solid #e4e7ec' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTablePagination: { styleOverrides: { root: { borderTop: '1px solid #f0f2f5' } } },
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

function approvalStatusStyles(status) {
  const styles = {
    Draft: { color: '#475467', backgroundColor: '#f2f4f7' },
    'Pending Approval': { color: '#dc6803', backgroundColor: '#fffaeb' },
    Approved: { color: '#027a48', backgroundColor: '#ecfdf3' },
    Rejected: { color: '#b42318', backgroundColor: '#fef3f2' },
  };
  return styles[status] || styles.Draft;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
  return data;
}

function StatusBadge({ status }) {
  return <Chip label={status} size="small" sx={{ ...statusStyles(status), border: '1px solid', fontWeight: 700, minWidth: 88 }} />;
}

function ApprovalStatusBadge({ status }) {
  return <Chip label={status} size="small" color="default" sx={{ ...approvalStatusStyles(status), border: '1px solid', fontWeight: 700, minWidth: 100 }} />;
}

function CommentDialog({ open, title, placeholder, confirmText, confirmColor, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  useEffect(() => { if (open) setValue(''); }, [open]);
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth multiline rows={3} placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color={confirmColor || 'primary'} onClick={() => onConfirm(value)}>{confirmText || 'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function SummaryCard({ title, value, icon, accent, subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" fontSize={11} fontWeight={700} textTransform="uppercase" letterSpacing="0.04em">{title}</Typography>
            <Typography variant="h4" sx={{ mt: 0.5, lineHeight: 1.2 }}>{value}</Typography>
            {subtitle && <Typography color="text.secondary" fontSize={12} sx={{ mt: 0.5 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{ color: accent, bgcolor: `${accent}10`, width: 44, height: 44, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, value }) {
  return (
    <Box>
      <Typography color="text.secondary" fontSize={11} fontWeight={800} textTransform="uppercase">{label}</Typography>
      <Typography className="detail-text" mt={0.5}>{value || '—'}</Typography>
    </Box>
  );
}

// ===== Test Steps Table =====
function TestStepsTable({ steps }) {
  if (!steps || steps.length === 0) {
    return <Box className="empty-state" sx={{ minHeight: 100, py: 3 }}><Typography color="text.secondary">No test steps found.</Typography></Box>;
  }
  return (
    <Table size="small" className="steps-table">
      <TableHead><TableRow>
        <TableCell sx={{ width: 60, textAlign: 'center' }}>Step #</TableCell>
        <TableCell>Step Name</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Expected Result</TableCell>
        <TableCell>Actual Result</TableCell>
      </TableRow></TableHead>
      <TableBody>
        {steps.map((step, index) => (
          <TableRow key={`${step.name || index}-${index}`}>
            <TableCell sx={{ textAlign: 'center', fontWeight: 800 }}>{index + 1}</TableCell>
            <TableCell><Typography fontWeight={800}>{step.name || `Step ${index + 1}`}</Typography><Typography color="text.secondary" fontSize={11}>{step.group} · {step.type}</Typography></TableCell>
            <TableCell>{step.message || '—'}</TableCell>
            <TableCell><StatusBadge status={step.status} /></TableCell>
            <TableCell>{step.expectedResult || '—'}</TableCell>
            <TableCell>{step.actualResult || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ===== Test Cases Table =====
function TestCasesTable({ testcases, onUpdateTestcase }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <Table size="small" sx={{ width: '100%' }}>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>Testcase ID</TableCell>
          <TableCell>Testcase Name</TableCell>
          <TableCell>Parameters</TableCell>
          <TableCell>Result</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Tester Conclusion</TableCell>
          <TableCell>Analysis Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {testcases.map((tc) => (
          <>
            <TableRow key={tc.id} hover className="testcase-row">
              <TableCell padding="checkbox">
                <IconButton size="small" onClick={() => toggle(tc.id)}>
                  {expanded[tc.id] ? <ExpandLess size="small" /> : <ExpandMore size="small" />}
                </IconButton>
              </TableCell>
              <TableCell><Typography fontWeight={800} fontSize={13}>{tc.testcaseId}</Typography><Typography color="text.secondary" fontSize={11}>{tc.sourceFilename}</Typography></TableCell>
              <TableCell><Typography fontWeight={700} fontSize={13}>{tc.testcaseName}</Typography><Typography color="text.secondary" fontSize={11} mt={0.5}>{tc.message || tc.testStepDescription || 'No message'}</Typography></TableCell>
              <TableCell><Typography className="mono-snippet" fontSize={12}>{tc.parameters || '—'}</Typography></TableCell>
              <TableCell><StatusBadge status={tc.status} /></TableCell>
              <TableCell><Typography className="clamped-text" fontSize={12}>{tc.description || '—'}</Typography></TableCell>
              <TableCell><TextField multiline minRows={2} maxRows={4} fullWidth size="small" placeholder="Add conclusion..." value={tc.testerConclusion} onChange={e => onUpdateTestcase(tc.id, { testerConclusion: e.target.value })} /></TableCell>
              <TableCell>
                <FormControl fullWidth size="small"><Select value={tc.analysisStatus} onChange={e => onUpdateTestcase(tc.id, { analysisStatus: e.target.value })}>{analysisStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="expanded-cell" colSpan={8}>
                <Collapse in={expanded[tc.id]} timeout="auto" unmountOnExit>
                  <Box className="expanded-panel">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
                      <DetailBlock label="Test Step Description" value={tc.testStepDescription} />
                      <DetailBlock label="Test Step Status" value={<StatusBadge status={tc.testStepStatus} />} />
                      <DetailBlock label="Expected Result" value={tc.expectedResult} />
                      <DetailBlock label="Actual Result" value={tc.actualResult} />
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={800} mb={1.5}>Test Steps</Typography>
                    <TestStepsTable steps={tc.steps} />
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </>
        ))}
      </TableBody>
    </Table>
  );
}

// ===== Execution Row =====
function ExecutionRow({ execution, onToggle, isExpanded, onUpdateTestcase }) {
  const counts = { passed: 0, failed: 0, skipped: 0, notExecuted: 0 };
  execution.testcases.forEach(tc => {
    if (tc.status === 'Passed') counts.passed++;
    else if (tc.status === 'Failed') counts.failed++;
    else if (tc.status === 'Skipped') counts.skipped++;
    else counts.notExecuted++;
  });

  return (
    <>
      <TableRow hover className="execution-row">
        <TableCell padding="checkbox"><IconButton size="small" onClick={onToggle}>{isExpanded ? <ExpandLess size="small" /> : <ExpandMore size="small" />}</IconButton></TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOutlined color="primary" fontSize="small" />
            <Box>
              <Typography fontWeight={700} fontSize={13}>{execution.fileName}</Typography>
              <Typography color="text.secondary" fontSize={11}>{execution.description || 'No description'}</Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell><Typography fontWeight={600} fontSize={12} fontFamily="monospace">#{execution.id}</Typography></TableCell>
        <TableCell><Typography fontSize={12}>{new Date(execution.uploadedAt).toLocaleDateString()}</Typography><Typography color="text.secondary" fontSize={11}>{new Date(execution.uploadedAt).toLocaleTimeString()}</Typography></TableCell>
        <TableCell>{execution.ticketKey ? <Chip label={execution.ticketKey} size="small" color="primary" variant="outlined" /> : <Typography color="text.secondary" fontSize={11} fontStyle="italic">Not linked</Typography>}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {counts.passed > 0 && <Chip label={`✓ ${counts.passed}`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
            {counts.failed > 0 && <Chip label={`✗ ${counts.failed}`} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
            {counts.skipped > 0 && <Chip label={`○ ${counts.skipped}`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
            {counts.notExecuted > 0 && <Chip label={`- ${counts.notExecuted}`} size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
          </Stack>
        </TableCell>
        <TableCell><Typography color="text.secondary" fontSize={12}>{execution.testCaseCount} testcases</Typography></TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="expanded-cell" colSpan={8}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box className="expanded-panel" sx={{ p: 0 }}>
              <TestCasesTable testcases={execution.testcases} onUpdateTestcase={onUpdateTestcase} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ===== Login Page =====
function LoginPage() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => { setUsername(''); setPassword(''); setEmail(''); setFullName(''); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(username, password); navigate('/dashboard'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      window.location.reload();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const switchTab = (tab) => { resetForm(); setActiveTab(tab); };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f7fb' }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: 5 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, bgcolor: 'primary.main', color: 'white', mb: 2 }}><AnalyticsOutlined sx={{ fontSize: 32 }} /></Box>
          <Typography variant="h4" fontWeight={800}>Test Reporting</Typography>
        </Box>

        <Tabs value={activeTab} onChange={(_, v) => switchTab(v)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Sign In" value="login" sx={{ fontWeight: 700 }} />
          <Tab label="Sign Up" value="register" sx={{ fontWeight: 700 }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} margin="normal" required autoComplete="username" InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined color="action" /></InputAdornment> }} />
            <TextField fullWidth type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} margin="normal" required autoComplete="current-password" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment> }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 3, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField fullWidth label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined color="action" /></InputAdornment> }} />
            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} margin="normal" required autoComplete="username" InputProps={{ startAdornment: <InputAdornment position="start"><PersonAddOutlined color="action" /></InputAdornment> }} />
            <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" autoComplete="email" />
            <TextField fullWidth type="password" label="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} margin="normal" required autoComplete="new-password" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment> }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 3, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}

// ===== Protected Route =====
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// ===== Layout Components =====
function Header({ user, onMenuClick, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #e4e7ec', zIndex: 1100, height: headerHeight }}>
      <Toolbar sx={{ minHeight: `${headerHeight}px !important`, px: { xs: 2, sm: 3 } }}>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2, color: 'text.primary' }}><MenuOutlined /></IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>Test Reporting</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip label={user?.role} size="small" color={user?.role === 'Manager' ? 'warning' : 'info'} variant="outlined" sx={{ fontWeight: 700, fontSize: 11, height: 26 }} />
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            <PersonOutline sx={{ color: '#fff', fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} slotProps={{ paper: { sx: { mt: 1, minWidth: 180 } } }}>
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f2f5' }}>
              <Typography fontWeight={700} fontSize={13}>{user?.fullName || user?.username}</Typography>
              <Typography color="text.secondary" fontSize={12}>{user?.email}</Typography>
            </Box>
            <MenuItem onClick={() => { setAnchorEl(null); onLogout?.(); }} sx={{ gap: 1.5, color: 'error.main' }}>
              <LogoutOutlined fontSize="small" />
              <Typography fontWeight={600} fontSize={13}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function Sidebar({ user, selectedTab, onTabChange, open, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, roles: ['Tester', 'Manager'] },
    { id: 'execution-reporting', label: 'Execution Reporting', icon: <ArticleOutlined />, roles: ['Tester', 'Manager'] },
    { id: 'ticket-management', label: 'Ticket Management', icon: <AssignmentOutlined />, roles: ['Tester', 'Manager'] },
    { id: 'approved-reports', label: 'Approved Reports', icon: <VerifiedOutlined />, roles: ['Tester', 'Manager'] },
    { id: 'approvals', label: 'Approval Requests', icon: <GavelOutlined />, roles: ['Manager'] },
    { id: 'testbench-booking', label: 'TestBench Booking', icon: <DateRangeOutlined />, roles: ['Tester', 'Manager'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <ChatOutlined />, roles: ['Tester', 'Manager'] },
  ];

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <Drawer variant="permanent" open={open} sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e4e7ec', bgcolor: 'background.paper', overflow: 'hidden' } }}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e4e7ec', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnalyticsOutlined sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>Test Reporting</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1.5, px: 1.5 }}>
        {filtered.map(item => (
          <ListItem
            button
            key={item.id}
            selected={selectedTab === item.id}
            onClick={() => onTabChange(item.id)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              minHeight: 40,
              px: 1.5,
              py: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selectedTab === item.id ? 700 : 500, fontSize: 13, lineHeight: 1.2 }} />
          </ListItem>
        ))}
      </Box>
      <Box sx={{ borderTop: '1px solid #e4e7ec', p: 1.5 }}>
        <ListItem button disabled sx={{ borderRadius: 2, minHeight: 40, px: 1.5, py: 0.5, opacity: 0.6 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><SettingsOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }} />
        </ListItem>
      </Box>
    </Drawer>
  );
}

// ===== Pages =====
function DashboardPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJson(`${API_BASE}/tickets/flat/`),
      fetchJson(`${API_BASE}/executions/`),
      fetchJson(`${API_BASE}/approvals/`),
      fetchJson(`${API_BASE}/approved-reports/`),
    ]).then(([t, e, a, r]) => {
      setTickets(t.tickets || []);
      setExecutions(e.executions || []);
      setApprovals(a.approvals || []);
      setReports(r.reports || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><CircularProgress /></Box>;

  const allTestcases = executions.flatMap(e => e.testcases || []);
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Open').length,
    closedTickets: tickets.filter(t => t.status === 'Closed').length,
    pendingApproval: approvals.filter(a => a.status === 'Pending').length,
    approvedReports: reports.length,
    totalExecutions: executions.length,
    totalTestcases: allTestcases.length,
    passed: allTestcases.filter(tc => tc.status === 'Passed').length,
    failed: allTestcases.filter(tc => tc.status === 'Failed').length,
    skipped: allTestcases.filter(tc => tc.status === 'Skipped').length,
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography color="text.secondary" fontSize={14} sx={{ mb: 3 }}>Welcome back, {user?.fullName || user?.username} ({user?.role})</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Tickets', value: stats.totalTickets, icon: <AssignmentOutlined />, accent: '#0f62fe', subtitle: `${stats.openTickets} open · ${stats.closedTickets} closed` },
          { title: 'Pending Approval', value: stats.pendingApproval, icon: <PendingOutlined />, accent: '#dc6803', subtitle: 'Requires review' },
          { title: 'Approved Reports', value: stats.approvedReports, icon: <VerifiedOutlined />, accent: '#039855', subtitle: 'Archived in Section 3' },
          { title: 'Total Executions', value: stats.totalExecutions, icon: <FolderOpenOutlined />, accent: '#475467' },
          { title: 'Total Testcases', value: stats.totalTestcases, icon: <AnalyticsOutlined />, accent: '#0f62fe' },
          { title: 'Passed', value: stats.passed, icon: <CheckCircleOutlined />, accent: '#039855' },
          { title: 'Failed', value: stats.failed, icon: <BugReportOutlined />, accent: '#d92d20' },
          { title: 'Skipped', value: stats.skipped, icon: <PauseCircleOutline />, accent: '#dc6803' },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Approvals</Typography>
            {approvals.length === 0 ? <Typography color="text.secondary" fontSize={13}>No recent approvals</Typography> : (
              <List dense disablePadding>{approvals.slice(0, 5).map(a => (
                <ListItem key={a.id} sx={{ px: 0, py: 1, borderBottom: '1px solid #f0f2f5', '&:last-child': { borderBottom: 'none' } }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><Chip label={a.status} size="small" color={a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'error' : 'warning'} variant="outlined" sx={{ fontSize: 11, height: 22 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontWeight={600} fontSize={13}>{a.ticket?.key}</Typography>} secondary={<Typography color="text.secondary" fontSize={12}>{a.ticket?.title} · {a.requestedBy}</Typography>} />
                </ListItem>
              ))}</List>
            )}
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Approved Reports</Typography>
            {reports.length === 0 ? <Typography color="text.secondary" fontSize={13}>No approved reports yet</Typography> : (
              <List dense disablePadding>{reports.slice(0, 5).map(r => (
                <ListItem key={r.reportId} sx={{ px: 0, py: 1, borderBottom: '1px solid #f0f2f5', '&:last-child': { borderBottom: 'none' } }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><VerifiedOutlined color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary={<Typography fontWeight={600} fontSize={13}>{r.reportId}</Typography>} secondary={<Typography color="text.secondary" fontSize={12}>{r.ticket?.key} · {r.totalTestcases} testcases · {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : ''}</Typography>} />
                </ListItem>
              ))}</List>
            )}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function ExecutionReportingPage({ user }) {
  const [executions, setExecutions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = useCallback(() => {
    Promise.all([fetchJson(`${API_BASE}/executions/`), fetchJson(`${API_BASE}/tickets/flat/`)])
      .then(([e, t]) => { setExecutions(e.executions || []); setTickets(t.tickets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData, user]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const updateTestcase = (id, patch) => {
    setExecutions(prev => prev.map(e => ({ ...e, testcases: e.testcases.map(tc => tc.id === id ? { ...tc, ...patch } : tc) })));
    fetchJson(`${API_BASE}/testcases/${id}/`, { method: 'PATCH', body: JSON.stringify(patch) }).catch(console.error);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      const response = await fetch(`${API_BASE}/parse-json/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      await loadData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE}/export/`, '_blank');
  };

  const filtered = useMemo(() => {
    let list = executions;
    if (selectedTicketId) list = list.filter(e => e.ticketKey === selectedTicketId);
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(e => e.fileName.toLowerCase().includes(q) || e.testcases.some(tc => tc.testcaseId.toLowerCase().includes(q) || tc.testcaseName.toLowerCase().includes(q)));
    }
    if (statusFilter !== 'All') list = list.filter(e => e.testcases.some(tc => tc.status === statusFilter));
    return list;
  }, [executions, selectedTicketId, searchText, statusFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Execution Reporting</Typography>
        <Typography color="text.secondary" fontSize={14}>Review execution results, link to tickets, and manage test conclusions.</Typography>
      </Box>

      <Paper sx={{ mb: 2, p: 1.5 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} width="100%" alignItems={{ lg: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <input ref={fileInputRef} type="file" accept=".json" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              <Button variant="contained" size="small" startIcon={<CloudUploadOutlined />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Load JSON Files'}
              </Button>
              <Button variant="outlined" size="small" startIcon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ flex: 1, minWidth: 320 }}>
              <TextField size="small" placeholder="Search testcases..." value={searchText} onChange={e => { setSearchText(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} sx={{ minWidth: 240, flex: 1 }} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                  {statusFilterValues.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Ticket</InputLabel>
                <Select value={selectedTicketId || ''} label="Ticket" onChange={e => { setSelectedTicketId(e.target.value || null); setPage(0); }}>
                  <MenuItem value="">All Tickets</MenuItem>
                  {tickets.map(t => <MenuItem key={t.id} value={t.key}>{t.key} — {t.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
      </Paper>

      <Paper>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>
              <TableCell padding="checkbox" />
              <TableCell sx={{ minWidth: 260 }}>Execution</TableCell>
              <TableCell sx={{ minWidth: 90 }}>ID</TableCell>
              <TableCell sx={{ minWidth: 130 }}>Date</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Ticket</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Status Summary</TableCell>
              <TableCell sx={{ minWidth: 90 }}>Testcases</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7}><Box className="empty-state" sx={{ minHeight: 240 }}><FolderOpenOutlined color="primary" sx={{ fontSize: 44, mb: 1 }} /><Typography variant="subtitle1" fontWeight={600}>No executions</Typography><Typography color="text.secondary" fontSize={13}>Select a ticket or load JSON files to begin.</Typography></Box></TableCell></TableRow>
              ) : (
                paginated.map(e => <ExecutionRow key={e.id} execution={e} isExpanded={expanded[e.id]} onToggle={() => toggle(e.id)} onUpdateTestcase={updateTestcase} />)
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5,10,25,50]} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} />
      </Paper>
    </Box>
  );
}

function TicketManagementPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: '', title: '', url: '', description: '', status: 'Open', assigned_user_id: '' });
  const [loading, setLoading] = useState(true);
  const [commentDialog, setCommentDialog] = useState({ open: false, title: '', placeholder: '', ticketId: null, action: '' });

  const isManager = user?.role === 'Manager';
  const isTester = user?.role === 'Tester';

  const loadData = useCallback(() => {
    Promise.all([fetchJson(`${API_BASE}/tickets/`), fetchJson(`${API_BASE}/users/`)])
      .then(([t, u]) => { setTickets(t.tickets || []); setUsers(u.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const data = await fetchJson(`${API_BASE}/tickets/${editing.id}/`, { method: 'PATCH', body: JSON.stringify(form) });
        setTickets(prev => prev.map(t => t.id === editing.id ? { ...t, ...data } : t));
      } else {
        const data = await fetchJson(`${API_BASE}/tickets/create/`, { method: 'POST', body: JSON.stringify(form) });
        setTickets(prev => [...prev, { ...data, executionCount: 0, executions: [] }]);
      }
      setShowDialog(false); setForm({ key: '', title: '', url: '', description: '', status: 'Open', assigned_user_id: '' }); setEditing(null);
    } catch (err) { alert(err.message); }
  };

  const openCreate = () => { setForm({ key: '', title: '', url: '', description: '', status: 'Open', assigned_user_id: '' }); setEditing(null); setShowDialog(true); };
  const openEdit = (t) => { setEditing(t); setForm({ key: t.key, title: t.title, url: t.url || '', description: t.description || '', status: t.status, assigned_user_id: t.assignedUserId || '' }); setShowDialog(true); };
  const handleDelete = async (id) => { if (confirm('Delete ticket?')) { await fetchJson(`${API_BASE}/tickets/${id}/`, { method: 'DELETE' }); setTickets(prev => prev.filter(t => t.id !== id)); } };

  const handleRequestApproval = async (ticketId) => {
    try {
      await fetchJson(`${API_BASE}/tickets/${ticketId}/submit-approval/`, { method: 'POST', body: JSON.stringify({}) });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, approvalStatus: 'Pending Approval' } : t));
    } catch (err) { alert('Failed to submit for approval: ' + err.message); }
  };

  const openReviewDialog = (ticketId, action) => {
    setCommentDialog({
      open: true,
      title: action === 'approve' ? 'Approve Ticket' : 'Reject Ticket',
      placeholder: action === 'approve' ? 'Add an optional comment...' : 'Enter the rejection reason...',
      ticketId,
      action,
    });
  };

  const confirmReview = async (comments) => {
    const { ticketId, action } = commentDialog;
    setCommentDialog(prev => ({ ...prev, open: false }));
    try {
      const approvalsData = await fetchJson(`${API_BASE}/approvals/`);
      const found = (approvalsData.approvals || []).find(a => a.ticket?.id === ticketId && a.status === 'Pending');
      if (!found) { alert('No pending approval found for this ticket.'); return; }
      await fetchJson(`${API_BASE}/approvals/${found.id}/review/`, { method: 'POST', body: JSON.stringify({ action, comments: comments || '' }) });
      loadData();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const handleSaveReport = async (ticketId) => {
    try {
      await fetchJson(`${API_BASE}/approved-reports/create/`, { method: 'POST', body: JSON.stringify({ ticket_id: ticketId }) });
      alert('Report saved successfully!');
    } catch (err) { alert('Failed to save report: ' + err.message); }
  };

  const getFilteredTickets = () => {
    if (isTester) {
      return tickets.filter(t => t.createdById === user?.id || t.createdBy === (user?.fullName || user?.username));
    }
    return tickets;
  };

  const filteredTickets = getFilteredTickets();

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Ticket Management</Typography>
          <Typography color="text.secondary" fontSize={14}>
            {isManager ? 'Review and manage approval requests from Testers.' : 'Create, edit, and manage test execution tickets.'}
          </Typography>
        </Box>
        {isTester && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Ticket</Button>}
      </Box>

      <Paper>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 260px)' }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>
              <TableCell sx={{ minWidth: 90 }}>Ticket ID</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Title</TableCell>
              {isManager && <TableCell sx={{ minWidth: 120 }}>Tester</TableCell>}
              {isTester && <TableCell sx={{ minWidth: 110 }}>Created By</TableCell>}
              <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Approval</TableCell>
              <TableCell sx={{ minWidth: 220 }}>Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredTickets.map(t => (
                <TableRow key={t.id} hover>
                  <TableCell><Typography fontWeight={800} color="primary" fontSize={13}>{t.key}</Typography></TableCell>
                  <TableCell><Typography fontSize={13}>{t.title}</Typography></TableCell>
                  {isManager && <TableCell><Typography fontSize={13}>{t.createdBy || '—'}</Typography></TableCell>}
                  {isTester && <TableCell><Typography fontSize={13}>{t.createdBy || '—'}</Typography></TableCell>}
                  <TableCell><Typography fontSize={12} color="text.secondary">{new Date(t.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell><Chip label={t.status} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} /></TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={t.approvalStatus} />
                    {(t.approvalStatus === 'Rejected' && t.rejectionReason) && <Typography fontSize={11} color="error" sx={{ mt: 0.5 }}>Reason: {t.rejectionReason}</Typography>}
                    {(t.approvalStatus === 'Approved' && t.managerComment) && <Typography fontSize={11} color="success.main" sx={{ mt: 0.5 }}>Manager: {t.managerComment}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                      {isTester && t.approvalStatus === 'Draft' && (
                        <Button size="small" variant="outlined" color="warning" onClick={() => handleRequestApproval(t.id)} startIcon={<PendingOutlined />}>Request Approval</Button>
                      )}
                      {isTester && t.approvalStatus === 'Pending Approval' && (
                        <Chip label="Waiting for Manager" size="small" color="info" variant="outlined" icon={<PendingOutlined />} />
                      )}
                      {isTester && t.approvalStatus === 'Rejected' && (
                        <Button size="small" variant="outlined" color="warning" onClick={() => handleRequestApproval(t.id)} startIcon={<PendingOutlined />}>Re-submit</Button>
                      )}
                      {isTester && t.approvalStatus === 'Approved' && (
                        <Button size="small" variant="outlined" color="success" onClick={() => handleSaveReport(t.id)} startIcon={<SaveOutlined />}>Save Report</Button>
                      )}
                      {isManager && t.approvalStatus === 'Pending Approval' && (
                        <ButtonGroup size="small">
                          <Button variant="outlined" color="success" onClick={() => openReviewDialog(t.id, 'approve')}>Approve</Button>
                          <Button variant="outlined" color="error" onClick={() => openReviewDialog(t.id, 'reject')}>Reject</Button>
                        </ButtonGroup>
                      )}
                      {isManager && t.approvalStatus !== 'Pending Approval' && (
                        <IconButton size="small" onClick={() => openEdit(t)} title="View"><Visibility fontSize="small" /></IconButton>
                      )}
                      {isTester && (t.approvalStatus === 'Draft' || t.approvalStatus === 'Rejected') && (
                        <>
                          <IconButton size="small" onClick={() => openEdit(t)} title="Edit"><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(t.id)} title="Delete"><Delete fontSize="small" /></IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{isManager ? 'No tickets to review.' : 'No tickets yet. Create one to get started.'}</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Ticket' : 'Create Ticket'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Stack spacing={2.5}>
              <TextField fullWidth size="small" label="Ticket Key" value={form.key} onChange={e => setForm({...form, key: e.target.value.toUpperCase()})} disabled={editing} required />
              <TextField fullWidth size="small" label="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <TextField fullWidth size="small" label="URL (optional)" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
              <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={form.status} label="Status" onChange={e => setForm({...form, status: e.target.value})}><MenuItem value="Open">Open</MenuItem><MenuItem value="In Progress">In Progress</MenuItem><MenuItem value="Resolved">Resolved</MenuItem><MenuItem value="Closed">Closed</MenuItem></Select></FormControl>
              <FormControl fullWidth size="small"><InputLabel>Assigned User</InputLabel><Select value={form.assigned_user_id} label="Assigned User" onChange={e => setForm({...form, assigned_user_id: e.target.value || ''})}><MenuItem value="">Unassigned</MenuItem>{users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}</Select></FormControl>
              <TextField fullWidth size="small" label="Description" multiline rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => { setShowDialog(false); setForm({ key: '', title: '', url: '', description: '', status: 'Open', assigned_user_id: '' }); setEditing(null); }}>Cancel</Button><Button type="submit" variant="contained">{editing ? 'Save Changes' : 'Create Ticket'}</Button></DialogActions>
        </form>
      </Dialog>
      <CommentDialog
        open={commentDialog.open}
        title={commentDialog.title}
        placeholder={commentDialog.placeholder}
        confirmText={commentDialog.action === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={commentDialog.action === 'approve' ? 'success' : 'error'}
        onConfirm={confirmReview}
        onCancel={() => setCommentDialog(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

function ApprovedReportsPage({ user }) {
  const [reports, setReports] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [ticketDetails, setTicketDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchJson(`${API_BASE}/approved-reports/`).then(r => { setReports(r.reports || []); setLoading(false); }).catch(() => setLoading(false)); }, [user]);

  const toggle = async (reportId, ticketId) => {
    const wasExpanded = expanded[reportId];
    setExpanded(prev => ({ ...prev, [reportId]: !wasExpanded }));
    if (!wasExpanded && ticketId && !ticketDetails[reportId]) {
      setLoadingDetails(prev => ({ ...prev, [reportId]: true }));
      try {
        const detail = await fetchJson(`${API_BASE}/tickets/${ticketId}/detail/`);
        setTicketDetails(prev => ({ ...prev, [reportId]: detail }));
      } catch (err) { console.error('Failed to load ticket detail', err); }
      setLoadingDetails(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const filtered = useMemo(() => reports.filter(r => r.reportId.toLowerCase().includes(search.toLowerCase()) || r.ticket?.key.toLowerCase().includes(search.toLowerCase())), [reports, search]);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const statusColor = (s) => s === 'Passed' ? 'success' : s === 'Failed' ? 'error' : s === 'Skipped' ? 'warning' : 'default';

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Approved Reports (Section 3)</Typography>
          <Typography color="text.secondary" fontSize={14}>Browse and download approved test reports.</Typography>
        </Box>
        <TextField size="small" placeholder="Search reports..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} sx={{ minWidth: 260 }} />
      </Box>

<Paper>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>
            <TableCell padding="checkbox" />
            <TableCell sx={{ minWidth: 140 }}>Report ID</TableCell><TableCell sx={{ minWidth: 100 }}>Ticket</TableCell><TableCell sx={{ minWidth: 160 }}>Title</TableCell>
            <TableCell sx={{ minWidth: 90 }}>Executions</TableCell><TableCell sx={{ minWidth: 90 }}>Testcases</TableCell>
            <TableCell sx={{ minWidth: 160 }}>Status Summary</TableCell><TableCell sx={{ minWidth: 100 }}>Approved By</TableCell><TableCell sx={{ minWidth: 90 }}>Date</TableCell><TableCell sx={{ minWidth: 60 }}>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {paginated.map(r => {
              const detail = ticketDetails[r.reportId];
              return [
                <TableRow key={`row-${r.reportId}`} hover>
                  <TableCell padding="checkbox"><IconButton size="small" onClick={() => toggle(r.reportId, r.ticket?.id)}>{expanded[r.reportId] ? <ExpandLess size="small" /> : <ExpandMore size="small" />}</IconButton></TableCell>
                  <TableCell><Typography fontWeight={800} fontFamily="monospace">{r.reportId}</Typography></TableCell>
                  <TableCell><Typography fontWeight={700}>{r.ticket?.key}</Typography><Typography color="text.secondary" fontSize={11}>{r.ticket?.title}</Typography></TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell><Typography fontWeight={600}>{r.totalExecutions}</Typography></TableCell>
                  <TableCell><Typography fontWeight={600}>{r.totalTestcases}</Typography></TableCell>
                  <TableCell><Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {Object.entries(r.statusSummary).map(([s, c]) => c > 0 && <Chip key={s} label={`${s} ${c}`} size="small" variant="outlined" color={statusColor(s)} sx={{ height: 20, fontSize: 10 }} />)}
                  </Stack></TableCell>
                  <TableCell>{r.approvedBy}</TableCell>
                  <TableCell>{new Date(r.approvedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => window.open(`${API_BASE}/approved-reports/${r.reportId}/download/`, '_blank')}><FileDownloadOutlined size="small" /></IconButton>
                  </TableCell>
                </TableRow>,
                <TableRow key={`expand-${r.reportId}`}>
                  <TableCell sx={{ py: 0 }} colSpan={10}>
                    <Collapse in={expanded[r.reportId]} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 3, bgcolor: '#fafbfc', borderRadius: 1, my: 1 }}>
                        {loadingDetails[r.reportId] ? (
                          <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
                        ) : detail ? (
                          <>
                            <Typography variant="h6" sx={{ mb: 2 }}>{detail.key} — Executions ({detail.executions?.length || 0})</Typography>
                            {(detail.executions || []).map((ex, exIdx) => (
                              <Paper key={ex.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography fontWeight={700}>Execution #{exIdx + 1}: {ex.fileName}</Typography>
                                  <Chip label={`${ex.testCaseCount} testcases`} size="small" variant="outlined" />
                                </Box>
                                <Table size="small">
                                  <TableHead><TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Testcase ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Test Step</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Step Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Expected</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Actual</TableCell>
                                  </TableRow></TableHead>
                                  <TableBody>
                                    {(ex.testcases || []).map(tc => (
                                      <TableRow key={tc.id}>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{tc.testcaseId}</TableCell>
                                        <TableCell sx={{ fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.testcaseName}</TableCell>
                                        <TableCell><Chip label={tc.status} size="small" color={statusColor(tc.status)} sx={{ height: 18, fontSize: 10 }} /></TableCell>
                                        <TableCell sx={{ fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.testStepDescription || '—'}</TableCell>
                                        <TableCell>{tc.testStepStatus ? <Chip label={tc.testStepStatus} size="small" color={statusColor(tc.testStepStatus)} sx={{ height: 18, fontSize: 10 }} /> : '—'}</TableCell>
                                        <TableCell sx={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.expectedResult || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.actualResult || '—'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Paper>
                            ))}
                          </>
                        ) : (
                          <Typography color="text.secondary">No details available.</Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              ];
            })}
          </TableBody>
        </Table>
      </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5,10,25,50]} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} />
      </Paper>
    </Box>
  );
}

function ApprovalsPage({ user }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentDialog, setCommentDialog] = useState({ open: false, title: '', placeholder: '', approvalId: null, action: '' });

  const loadApprovals = useCallback(() => {
    fetchJson(`${API_BASE}/approvals/`)
      .then(r => { setApprovals(r.approvals || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadApprovals(); }, [loadApprovals, user]);

  const openReviewDialog = (id, action) => {
    setCommentDialog({
      open: true,
      title: action === 'approve' ? 'Approve Ticket' : 'Reject Ticket',
      placeholder: action === 'approve' ? 'Add an optional comment...' : 'Enter the rejection reason...',
      approvalId: id,
      action,
    });
  };

  const confirmReview = async (comments) => {
    const { approvalId, action } = commentDialog;
    setCommentDialog(prev => ({ ...prev, open: false }));
    try {
      await fetchJson(`${API_BASE}/approvals/${approvalId}/review/`, { method: 'POST', body: JSON.stringify({ action, comments: comments || '' }) });
      loadApprovals();
    } catch (err) { alert('Failed to review: ' + err.message); }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const reviewedApprovals = approvals.filter(a => a.status !== 'Pending');

  if (user?.role !== 'Manager') {
    return (
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Approval Requests</Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Only Managers can access approval requests.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Approval Requests</Typography>
      <Typography color="text.secondary" fontSize={14} sx={{ mb: 3 }}>
        {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''} awaiting your review.
      </Typography>

      {pendingApprovals.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 700, fontSize: 14 }}>
            Pending Approvals ({pendingApprovals.length})
          </Box>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead><TableRow>
                <TableCell sx={{ minWidth: 100 }}>Ticket</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Title</TableCell>
                <TableCell sx={{ minWidth: 110 }}>Requested By</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Requested At</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {pendingApprovals.map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell><Typography fontWeight={800} color="primary">{a.ticket?.key}</Typography></TableCell>
                    <TableCell><Typography fontSize={13}>{a.ticket?.title}</Typography></TableCell>
                    <TableCell><Typography fontSize={13}>{a.requestedBy}</Typography></TableCell>
                    <TableCell><Typography fontSize={12} color="text.secondary">{new Date(a.requestedAt).toLocaleString()}</Typography></TableCell>
                    <TableCell>
                      <ButtonGroup size="small">
                        <Button variant="contained" color="success" onClick={() => openReviewDialog(a.id, 'approve')}>Approve</Button>
                        <Button variant="contained" color="error" onClick={() => openReviewDialog(a.id, 'reject')}>Reject</Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {reviewedApprovals.length > 0 && (
        <Paper>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.100', fontWeight: 700, fontSize: 14 }}>
            Review History ({reviewedApprovals.length})
          </Box>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
            <Table stickyHeader size="small">
              <TableHead><TableRow>
                <TableCell sx={{ minWidth: 100 }}>Ticket</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Title</TableCell>
                <TableCell sx={{ minWidth: 110 }}>Requested By</TableCell>
                <TableCell sx={{ minWidth: 90 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Comment</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Reviewed</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {reviewedApprovals.map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell><Typography fontWeight={800} color="primary">{a.ticket?.key}</Typography></TableCell>
                    <TableCell><Typography fontSize={13}>{a.ticket?.title}</Typography></TableCell>
                    <TableCell><Typography fontSize={13}>{a.requestedBy}</Typography></TableCell>
                    <TableCell><Chip label={a.status} size="small" color={a.status === 'Approved' ? 'success' : 'error'} variant="outlined" /></TableCell>
                    <TableCell>
                      {a.status === 'Rejected' && a.rejectionReason ? (
                        <Typography fontSize={12} color="error">{a.rejectionReason}</Typography>
                      ) : a.status === 'Approved' && a.managerComment ? (
                        <Typography fontSize={12} color="success.main">{a.managerComment}</Typography>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {a.reviewedBy} {a.reviewedAt ? `at ${new Date(a.reviewedAt).toLocaleString()}` : ''}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {approvals.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No approval requests found.</Typography>
        </Paper>
      )}

      <CommentDialog
        open={commentDialog.open}
        title={commentDialog.title}
        placeholder={commentDialog.placeholder}
        confirmText={commentDialog.action === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={commentDialog.action === 'approve' ? 'success' : 'error'}
        onConfirm={confirmReview}
        onCancel={() => setCommentDialog(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

// ===== Main App =====
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute allowedRoles={['Tester', 'Manager']}>
            <MainLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </ThemeProvider>
);
  }
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'execution-reporting', label: 'Execution Reporting', icon: <ArticleOutlined /> },
    { id: 'ticket-management', label: 'Ticket Management', icon: <AssignmentOutlined /> },
    { id: 'approved-reports', label: 'Approved Reports', icon: <VerifiedOutlined /> },
    { id: 'approvals', label: 'Approvals', icon: <PendingOutlined /> },
    { id: 'testbench-booking', label: 'TestBench Booking', icon: <DateRangeOutlined /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <ChatOutlined /> },
  ];

  const tabMap = {
    'dashboard': <DashboardPage user={user} />,
    'execution-reporting': <ExecutionReportingPage user={user} />,
    'ticket-management': <TicketManagementPage user={user} />,
    'approved-reports': <ApprovedReportsPage user={user} />,
    'approvals': <ApprovalsPage user={user} />,
    'testbench-booking': <Box sx={{ p: 4 }}><Typography variant="h3">TestBench Booking</Typography><Typography color="text.secondary">Coming soon...</Typography></Box>,
    'ai-assistant': <Box sx={{ p: 4 }}><Typography variant="h3">AI Assistant</Typography><Typography color="text.secondary">Future integration</Typography></Box>,
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar user={user} selectedTab={selectedTab} onTabChange={setSelectedTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#f4f7fb', pt: `${headerHeight}px` }}>
          {tabMap[selectedTab]}
        </Box>
      </Box>
    </Box>
  );
}

export default App;


















