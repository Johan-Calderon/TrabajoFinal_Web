import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import { Box, Typography, Button } from "@mui/material";
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

function Dashboard() {
  const { logout, currentUser, userRole } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [animated, setAnimated] = useState(false);

  
  useEffect(() => {
    setAnimated(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

 
  const capitalizeRole = (role) => {
    if (!role) return "Usuario";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  //Paneles activo "ruta"
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

  
  const navigateToPanel = (panel, route) => {
    navigate(`/dashboard/${route}`);
  };

  return (
    <Box className="dashboard-main">
      <Box className="dashboard-header-bar">
        <Typography variant="h6" className="header-title">
          Sistema de Proyectos Escolares
        </Typography>
        <Box className="header-user-info">
          <Typography variant="body2">
            {currentUser ? currentUser.email : "Invitado"} ({capitalizeRole(userRole)})
          </Typography>
        </Box>
      </Box>

      <Box className="content-wrapper">
        
        <Box className="dashboard-sidebar">
          <Box className="sidebar-header">
            <SchoolIcon className="sidebar-logo-icon" />
            <Typography variant="h6" className="sidebar-logo-text">
              ProyectosEdu
            </Typography>
          </Box>
          
          <Box className="sidebar-menu">
            <Button 
              className={`sidebar-menu-item ${activePanel === "dashboard" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<DashboardIcon />}
              onClick={() => navigate("/dashboard")}
            >
              DASHBOARD
            </Button>
            <Button 
              className={`sidebar-menu-item ${activePanel === "misProyectos" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<PersonIcon />}
              onClick={() => navigate("/dashboard/mis-proyectos")}
            >
              MIS PROYECTOS
            </Button>
            <Button 
              className={`sidebar-menu-item ${activePanel === "crearProyecto" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<PlayCircleIcon />}
              onClick={() => navigate("/dashboard/crear-proyecto")}
            >
              CREAR PROYECTO
            </Button>
            <Button 
              className={`sidebar-menu-item ${activePanel === "usuarios" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<PersonIcon />}
              onClick={() => navigate("/dashboard/usuarios")}
            >
              USUARIOS
            </Button>
            <Button 
              className={`sidebar-menu-item ${activePanel === "reportes" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<AssessmentIcon />}
              onClick={() => navigate("/dashboard/reportes")}
            >
              REPORTES
            </Button>
            <Button 
              className={`sidebar-menu-item ${activePanel === "configuracion" ? "sidebar-menu-item-active" : ""}`} 
              startIcon={<SettingsIcon />}
              onClick={() => navigate("/dashboard/configuracion")}
            >
              CONFIGURACIÓN
            </Button>
            <Button 
              className="sidebar-menu-item sidebar-logout" 
              startIcon={<LogoutIcon />} 
              onClick={handleLogout}
            >
              CERRAR SESIÓN
            </Button>
          </Box>
        </Box>
        
        
        <Box className="dashboard-content">
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