import React from "react";
import { Outlet } from "react-router-dom";
import MyAppBar from "../../../components/UI/AppBar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

export default function SurveillantLayout() {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/surveillant/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Mes calendriers",
      path: "/surveillant/calendriers",
      icon: <CalendarMonthIcon />,
    },
    {
      label: "Mes salles",
      path: "/surveillant/salles",
      icon: <MeetingRoomIcon />,
    },
  ];

  const accountMenuItems = [
    { label: "Profil", path: "/surveillant/profile", icon: <PersonIcon /> },
    {
      label: "Paramètres",
      path: "/surveillant/settings",
      icon: <SettingsIcon />,
    },
    { label: "Se déconnecter", path: "/logout", icon: <LogoutIcon /> },
  ];

  return (
    <div>
      <MyAppBar menuItems={menuItems} accountMenuItems={accountMenuItems} />
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
