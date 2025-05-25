import { useAuth } from "../../AuthContext/AuthContext";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./header.css";

function Header() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar className="header-toolbar">
        <Typography variant="h6" component="div" className="header-title">
          Sistema de Proyectos Escolares
        </Typography>
        
        {currentUser && (
          <Box className="header-actions">
            <Typography variant="body1" className="header-username">
              {currentUser.email} ({userRole})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;