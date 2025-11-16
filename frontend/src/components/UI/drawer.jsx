import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from "../../hooks/useAuth";

export default function MyDrawer({ menuItems }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  // Drawer content (kept simple — adjust as needed)
  const DrawerList = (
    <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column'}}>
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
    <div>
      <IconButton aria-label="open drawer" onClick={toggleDrawer(true)} sx={{ color: 'inherit' }}>
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        // SlideProps ensures the drawer is translated (not collapsed) when opening/closing
        SlideProps={{
          direction: 'right',
          timeout: 360,
        }}
        // PaperProps lets us style the drawer panel itself
        PaperProps={{
          sx: {
            width: 320,
            // Gradient: top area mostly white (70%) then lightblue — tweak stops as needed
            background: 'linear-gradient(180deg, white 70%, lightblue 100%)',
            // keep a fixed width so the drawer only translates (no collapsing)
            boxShadow: '0 12px 30px rgba(2,12,27,0.55)',
            borderRadius: '0 12px 12px 0',
            overflow: 'hidden',
            // A smooth transform transition when MUI changes transform inline
            transition: 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            // Allow content color tuning if you want darker text on the gradient
            color: '#222',
          },
        }}
        // BackdropProps to control the overlay appearance (optional)
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
