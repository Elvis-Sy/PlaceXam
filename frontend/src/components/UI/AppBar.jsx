import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { useAuth } from "../../hooks/useAuth";
import placeXamLogo from '../../assets/images/placeXam.png'; // Adjust the path if necessary
import AccountMenu from './AccountMenu';


export default function MyAppBar({ menuItems, usersSubItems, accountMenuItems }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  const DrawerContent = (
    <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop"
            alt="avatar"
            sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.6)' }}
          />
          <Box>
            <Box component="div" sx={{ fontWeight: 600 }}>{user?.fullname || user?.email}</Box>
            <Box component="div" sx={{ fontSize: 12, opacity: 0.85 }}>{user?.email}</Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.12)' }} />

      <List sx={{ flex: 1 }}>
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{ '& .MuiTypography-root': { fontSize: '0.95rem' } }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        {usersSubItems && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setUsersMenuOpen(!usersMenuOpen)}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  },
                }}
              >
                <ListItemText 
                  primary="Utilisateurs"
                  sx={{ '& .MuiTypography-root': { fontSize: '0.95rem' } }}
                />
                {usersMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={usersMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {usersSubItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        pl: 4,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
      position="static" 
      sx={{ boxShadow: 2, 
      backgroundColor: 'darkblue'
      }} >
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
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <img
            src={placeXamLogo}
            alt="PlaceXam Logo"
            sx={{ mx: 'auto' }}
            style={{ height: 30 }} // Adjust height as needed
          />
        </Box>
        <AccountMenu accountMenuItems={accountMenuItems} />
        </Toolbar>
      </AppBar>
      

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 320,
            background: 'linear-gradient(180deg, white 70%, lightblue 100%)',
            boxShadow: '0 12px 30px rgba(2,12,27,0.55)',
            borderRadius: '0 12px 12px 0',
            overflow: 'hidden',
          },
        }}
      >
        {DrawerContent}
      </Drawer>
    </Box>
  );
}
