import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from "@mui/material";

function Login() {
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

 
  const { login } = useAuth();
  const navigate = useNavigate();
  
  
  useEffect(() => {
    setAnimated(true);
  }, []);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      
      const result = await login(email, password);
      
      if (result.success) {
        
        navigate("/dashboard");
      } else {
        setError(result.message || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error al iniciar sesión: " + error.message);
    }

    setLoading(false);
  };

  //Animacion ir a registro
  const goToRegister = (e) => {
    e.preventDefault();
    setExitAnimation(true);
    setTimeout(() => {
      navigate("/register");
    }, 400); 
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        className={`login-paper ${animated ? 'animate__animated animate__bounceInLeft' : ''} 
                  ${exitAnimation ? 'animate__animated animate__bounceOutLeft' : ''}`}
      >
        <Box className="login-container">
          <Typography component="h1" variant="h5" className="login-title">
            Sistema de Proyectos Escolares
          </Typography>
          <Box component="form" onSubmit={handleLogin} className="login-form">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="login-button"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Iniciar Sesión"}
            </Button>
            
            <Divider className="login-divider">
              <Typography variant="body2" color="textSecondary">
                ¿No tienes una cuenta?
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              className="register-link-button animate__animated animate__bounceInRight"
              onClick={goToRegister}
            >
              Registrarse
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;