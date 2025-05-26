import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import "./Dashboard.css";

//Importación de paneles
import DashboardPanel from "./Panels/DashboardPanel";
import MisProyectosPanel from "./Panels/MisProyectosPanel";
import CrearProyectoPanel from "./Panels/CrearProyectoPanel";
import UsuariosPanel from "./Panels/UsuariosPanel";
import ReportesPanel from "./Panels/ReportesPanel";
import ConfiguracionPanel from "./Panels/ConfiguracionPanel";

import SchoolIcon from "@mui/icons-material/School";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";

function Dashboard() {
  const { logout, currentUser, userRole } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [animated, setAnimated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [persistentMode, setPersistentMode] = useState(false);

  useEffect(() => {
    setAnimated(true);
    
   
    if (isDesktop) {
      setDrawerOpen(true);
      setPersistentMode(true);
    } else {
      setDrawerOpen(false);
      setPersistentMode(false);
    }
  }, [isDesktop]);

  
  useEffect(() => {
    if (isDesktop) {
      setPersistentMode(true);
      setDrawerOpen(true);
    } else {
      setPersistentMode(false);
    }
  }, [isDesktop, isTablet, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const capitalizeRole = (role) => {
    if (!role) return "Usuario";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getActivePanel = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "dashboard";
    if (path === "/dashboard/mis-proyectos") return "misProyectos";
    if (path === "/dashboard/crear-proyecto") return "crearProyecto";
    if (path === "/dashboard/usuarios") return "usuarios";
    if (path === "/dashboard/reportes") return "reportes";
    if (path === "/dashboard/configuracion") return "configuracion";
    return "dashboard";
  };

  const activePanel = getActivePanel();

  const handleDrawerToggle = () => {
    if (persistentMode && isDesktop) {
      
      setDrawerOpen(!drawerOpen);
    } else {
     
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMenuItemClick = (route) => {
    navigate(route);
    
    if (!persistentMode || !isDesktop) {
      setDrawerOpen(false);
    }
  };

  const handleBackdropClick = () => {
    if (!persistentMode) {
      setDrawerOpen(false);
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "DASHBOARD",
      icon: <DashboardIcon />,
      route: "/dashboard"
    },
    {
      key: "misProyectos",
      label: "MIS PROYECTOS",
      icon: <PersonIcon />,
      route: "/dashboard/mis-proyectos"
    },
    {
      key: "crearProyecto",
      label: "CREAR PROYECTO",
      icon: <AddIcon />,
      route: "/dashboard/crear-proyecto"
    },
    {
      key: "usuarios",
      label: "USUARIOS",
      icon: <PeopleIcon />,
      route: "/dashboard/usuarios"
    },
    {
      key: "reportes",
      label: "REPORTES",
      icon: <AssessmentIcon />,
      route: "/dashboard/reportes"
    },
    {
      key: "configuracion",
      label: "CONFIGURACIÓN",
      icon: <SettingsIcon />,
      route: "/dashboard/configuracion"
    }
  ];

  return (
    <Box className="dashboard-main">
      
      <Box className={`dashboard-header-bar ${drawerOpen && persistentMode ? 'drawer-open' : ''}`}>
        <Box className="header-left">
          <IconButton 
            className="menu-toggle-button"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="header-title">
            Sistema de Proyectos Escolares
          </Typography>
        </Box>
        <Box className="header-user-info">
          <Typography variant="body2">
            {currentUser ? currentUser.email : "Invitado"} ({capitalizeRole(userRole)})
          </Typography>
        </Box>
      </Box>

      
      {!persistentMode && (
        <Box 
          className={`drawer-backdrop ${drawerOpen ? 'show' : ''}`}
          onClick={handleBackdropClick}
        />
      )}

      <Box className="content-wrapper">
        
        <Box className={`dashboard-sidebar ${drawerOpen ? 'drawer-open' : ''}`}>
          <Box className="sidebar-header">
            <SchoolIcon className="sidebar-logo-icon" />
            <Typography variant="h6" className="sidebar-logo-text">
              ProyectosEdu
            </Typography>
          </Box>
          
          <Box className="sidebar-menu">
            {menuItems.map((item) => (
              <Button 
                key={item.key}
                className={`sidebar-menu-item ${activePanel === item.key ? "sidebar-menu-item-active" : ""}`} 
                startIcon={item.icon}
                onClick={() => handleMenuItemClick(item.route)}
              >
                {item.label}
              </Button>
            ))}
            
            <Button 
              className="sidebar-menu-item sidebar-logout" 
              startIcon={<LogoutIcon />} 
              onClick={handleLogout}
            >
              CERRAR SESIÓN
            </Button>
          </Box>
        </Box>
        
        
        <Box className={`dashboard-content ${drawerOpen && persistentMode ? 'drawer-open' : ''}`}>
          <Routes>
            <Route path="/" element={<DashboardPanel />} />
            <Route path="/mis-proyectos" element={<MisProyectosPanel />} />
            <Route path="/crear-proyecto" element={<CrearProyectoPanel />} />
            <Route path="/usuarios" element={<UsuariosPanel />} />
            <Route path="/reportes" element={<ReportesPanel />} />
            <Route path="/configuracion" element={<ConfiguracionPanel />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;