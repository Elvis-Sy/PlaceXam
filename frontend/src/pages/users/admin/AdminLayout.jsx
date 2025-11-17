import React from "react";
import { Outlet } from "react-router-dom";
import MyAppBar from '../../../components/UI/AppBar';
import AccountMenu from '../../../components/UI/AccountMenu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export default function AdminLayout() {
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Salles", path: "/admin/salles", icon: <MeetingRoomIcon /> },
    { label: "Examens", path: "/admin/exams", icon: <AssignmentIcon /> },
    { label: "Matières", path: "/admin/matieres", icon: <BookIcon /> },
    { label: "Calendrier", path: "/admin/calendrier", icon: <CalendarMonthIcon /> },
    { label: "Affectations", path: "/admin/affectation", icon: <AssignmentIcon /> },
    { label: "Supervision", path: "/admin/supervision", icon: <SupervisorAccountIcon /> },
  ];

  const usersSubItems = [
    { label: "Étudiants", path: "/admin/etudiants", icon: <PeopleIcon /> },
    { label: "Surveillants", path: "/admin/surveillants", icon: <PersonIcon /> },
  ];

  const accountMenuItems = [
    { label: "Profile", path: "/admin/profile", icon: <PersonIcon /> },  
  ];

  return (
    <div>
      <MyAppBar menuItems={menuItems} usersSubItems={usersSubItems} accountMenuItems={accountMenuItems}/>
      <div style={{ padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  );
}