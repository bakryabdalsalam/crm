import { 
  AppBar, 
  Drawer, 
  SwipeableDrawer,
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
  Button
} from '@mui/material';
import { 
  Dashboard, 
  People, 
  Business, 
  AttachMoney, 
  SupervisorAccount,
  AssignmentInd,
  AccountCircle,
  Menu as MenuIcon,
  ChevronLeft,
  Notifications,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsEl, setNotificationsEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getMenuItems = () => {
    const items = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/' },
      { text: 'Customers', icon: <Business />, path: '/customers' },
      { text: 'Contacts', icon: <People />, path: '/contacts' },
      { text: 'Deals', icon: <AttachMoney />, path: '/deals' },
    ];

    if (user?.role === 'admin') {
      items.push(
        { text: 'Users', icon: <SupervisorAccount />, path: '/users' },
        { text: 'Task Assignment', icon: <AssignmentInd />, path: '/task-assignment' }
      );
    } else if (user?.role === 'manager') {
      items.push(
        { text: 'Task Assignment', icon: <AssignmentInd />, path: '/task-assignment' }
      );
    }

    return items;
  };

  const drawer = (
    <>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: [1, 2],
          py: 1
        }}
      >
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          CRM System
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1 }}>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <Typography variant="h6" noWrap component="div" sx={{ 
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' }
              }}>
                CRM System
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotifications}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationsEl}
              open={Boolean(notificationsEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: { 
                  width: 320,
                  maxHeight: 400
                }
              }}
            >
              <MenuItem>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">New customer added</Typography>
                  <Typography variant="body2" color="text.secondary">
                    A new customer was added to the system
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">Deal updated</Typography>
                  <Typography variant="body2" color="text.secondary">
                    The deal status was updated to "Won"
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Button fullWidth>View All Notifications</Button>
              </MenuItem>
            </Menu>

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                flexDirection: 'column',
                alignItems: 'flex-end'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {user?.role}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: { 
                  minWidth: 200
                }
              }}
            >
              <MenuItem sx={{ display: { sm: 'none' } }}>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.default
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navigation;