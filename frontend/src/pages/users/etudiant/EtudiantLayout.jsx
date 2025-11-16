import React from "react";
import { Outlet } from "react-router-dom";
import MyAppBar from '../../../components/UI/AppBar';
import AccountMenu from '../../../components/UI/AccountMenu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export default function EtudiantLayout() {
  const menuItems = [
    { label: "Dashboard", path: "/etudiant/dashboard", icon: <DashboardIcon /> },
    { label: "Mes Affectations", path: "/etudiant/affectations", icon: <AssignmentIcon /> },
    { label: "Calendrier", path: "/etudiant/calendrier", icon: <CalendarMonthIcon /> },
  ];

  const accountMenuItems = [
    { label: "Profile", path: "/etudiant/profile", icon: <AccountCircleIcon /> }, 
    { label: "Settings", path: "/etudiant/settings", icon: <SettingsIcon /> },
    { label: "Logout", path: "/logout", icon: <LogoutIcon /> },
  ];

  return (
    <div>
      <MyAppBar menuItems={menuItems} accountMenuItems={accountMenuItems} />
      <div style={{ padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  );
}