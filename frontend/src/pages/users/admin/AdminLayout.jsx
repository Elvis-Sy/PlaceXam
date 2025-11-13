import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Utilisateurs", path: "/admin/users" },
    { label: "Salles", path: "/admin/salles" },
    { label: "Examens", path: "/admin/exams" },
    { label: "Matières", path: "/admin/matieres" },
    { label: "Calendrier", path: "/admin/calendrier" },
    { label: "Affectations", path: "/admin/affectation" },
    { label: "Supervision", path: "/admin/supervision" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  const DrawerContent = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          PlaceXam — Admin
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user?.fullname || user?.email}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                },
              }}
            >
              <ListItemText 
                primary={item.label}
                sx={{ '& .MuiTypography-root': { fontSize: '0.95rem' } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ boxShadow: 2 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <IconButton edge="start" color="inherit" aria-label="logo" sx={{ mr: 2 }}>
            <img src="../../../assets/images/transparent-logo.png" alt="PlaceXam" />
          </IconButton>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {user?.fullname || user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {DrawerContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}