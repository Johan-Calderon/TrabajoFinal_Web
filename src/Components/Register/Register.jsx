import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Register.css";


import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

function Register() {
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

 
  const { register } = useAuth();
  const navigate = useNavigate();

 
  useEffect(() => {
    setAnimated(true);
  }, []);

  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
   
    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }
    
    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }
    
    if (!role) {
      return setError("Debes seleccionar un rol");
    }

    setLoading(true);

    try {
      
      const userData = {
        rol: role,
        email: email
      };
      
      const result = await register(email, password, userData);
      
      if (result.success) {
        setSuccess(true);
       
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("");
        
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(result.message || "Error al registrar usuario");
      }
    } catch (error) {
      setError("Error al registrar: " + error.message);
    }

    setLoading(false);
  };

  const handleBackToLogin = () => {
    //Animacion de salida
    setExitAnimation(true);
    setTimeout(() => {
      navigate("/");
    }, 400);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        className={`register-paper ${animated ? 'animate__animated animate__bounceInRight' : ''} 
                  ${exitAnimation ? 'animate__animated animate__bounceOutRight' : ''}`}
      >
        <Box className="register-container">
          <Typography component="h1" variant="h5" className="register-title">
            Registro de Usuario
          </Typography>
          {success ? (
            <Box className="success-message">
              <Alert severity="success">
                Usuario registrado correctamente. Redirigiendo al panel de control...
              </Alert>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBackToLogin}
                className="back-button animate__animated animate__bounceInLeft"
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister} className="register-form">
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Rol"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="Coordinador">Coordinador</MenuItem>
                  <MenuItem value="Docente">Docente</MenuItem>
                  <MenuItem value="Estudiante">Estudiante</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className="register-button"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Registrar"}
              </Button>
              <Button
                fullWidth
                variant="text"
                color="primary"
                onClick={handleBackToLogin}
                className="back-button animate__animated animate__bounceInLeft"
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;