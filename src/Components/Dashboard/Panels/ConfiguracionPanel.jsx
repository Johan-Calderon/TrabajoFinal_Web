import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  TextField,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Paper,
  CircularProgress
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";

import { useAuth } from "../../../AuthContext/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../FireBase/FireBase";

//Información Personal
const PanelInformacionPersonal = () => {
  const { currentUser, updateUserData, errorTraducido } = useAuth();
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    correo: "",
    institucion: "",
    biografia: "",
    telefono: "",
    cargo: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserInfo({
              nombre: data.nombre || "",
              correo: data.email || currentUser.email,
              institucion: data.institucion || "",
              biografia: data.biografia || "",
              telefono: data.telefono || "",
              cargo: data.rol || "",
            });
          } else {
            setUserInfo((prev) => ({ 
              ...prev, 
              correo: currentUser.email, 
              cargo: prev.cargo || "No definido" 
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setNotification({ 
            open: true, 
            message: "Error al cargar los datos del usuario.", 
            type: "error" 
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    setNotification({ open: false, message: "", type: "success" });
    try {
      const result = await updateUserData(currentUser.uid, {
        nombre: userInfo.nombre,
        institucion: userInfo.institucion,
        biografia: userInfo.biografia,
        telefono: userInfo.telefono,
      });
      if (result.success) {
        setNotification({ 
          open: true, 
          message: "Información actualizada exitosamente.", 
          type: "success" 
        });
        setIsEditing(false);
      } else {
        setNotification({ 
          open: true, 
          message: result.message, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      setNotification({ 
        open: true, 
        message: "Error al guardar la información.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading && !userInfo.correo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando información...</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Información Personal</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
          {userInfo.nombre ? userInfo.nombre.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: 60 }} />}
        </Avatar>
        <IconButton color="primary" component="label">
          <PhotoCameraIcon />
          <input type="file" hidden />
        </IconButton>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {userInfo.nombre || "Nombre de Usuario"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {userInfo.cargo}
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="nombre"
            value={userInfo.nombre}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="correo"
            value={userInfo.correo}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Institución"
            name="institucion"
            value={userInfo.institucion}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={userInfo.telefono}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Biografía / Acerca de mí"
            name="biografia"
            value={userInfo.biografia}
            onChange={handleInputChange}
            multiline
            rows={3}
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        {!isEditing ? (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </Button>
        ) : (
          <>
            <Button 
              variant="outlined" 
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};


const PanelSeguridad = () => {
  const { currentUser, updateUserPassword, errorTraducido } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = async () => {
    
    if (!currentPassword.trim()) {
      setNotification({ 
        open: true, 
        message: "Por favor, ingrese su contraseña actual.", 
        type: "error" 
      });
      return;
    }

    if (!newPassword.trim()) {
      setNotification({ 
        open: true, 
        message: "Por favor, ingrese su nueva contraseña.", 
        type: "error" 
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setNotification({ 
        open: true, 
        message: "Las nuevas contraseñas no coinciden.", 
        type: "error" 
      });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({ 
        open: true, 
        message: "La nueva contraseña debe tener al menos 6 caracteres.", 
        type: "error" 
      });
      return;
    }

    if (currentPassword === newPassword) {
      setNotification({ 
        open: true, 
        message: "La nueva contraseña debe ser diferente a la actual.", 
        type: "error" 
      });
      return;
    }

    setLoading(true);
    setNotification({ open: false, message: "", type: "success" });

    try {
      //Cambio de contraseña
      const result = await updateUserPassword(currentPassword, newPassword);

      if (result.success) {
        setNotification({ 
          open: true, 
          message: "¡Contraseña actualizada exitosamente! Ya puede usar su nueva contraseña para iniciar sesión.", 
          type: "success" 
        });
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setNotification({ 
          open: true, 
          message: result.message, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setNotification({ 
        open: true, 
        message: "Error inesperado al cambiar la contraseña. Intente nuevamente.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Seguridad</Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Para cambiar su contraseña, necesita ingresar su contraseña actual por seguridad.
        </Alert>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Cambiar Contraseña
          </Typography>
          
          <TextField
            fullWidth
            label="Contraseña Actual"
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            required
            helperText="Ingrese su contraseña actual para verificar su identidad"
          />
          
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            required
            helperText="Mínimo 6 caracteres"
          />
          
          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            type={showPasswords ? "text" : "password"}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            required
            helperText="Repita la nueva contraseña"
          />

          <FormControlLabel
            control={
              <Switch
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                disabled={loading}
              />
            }
            label="Mostrar contraseñas"
            sx={{ mt: 1, mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} 
              onClick={handleChangePassword} 
              disabled={loading || !currentPassword || !newPassword || !confirmNewPassword}
              size="large"
            >
              {loading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setNotification({ open: false, message: "", type: "success" });
              }}
              disabled={loading}
              size="large"
            >
              Limpiar Campos
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};


const PanelNotificaciones = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotificaciones: true,
    notificacionesPush: false,
    alertasActividad: true,
    boletinesInformativos: false
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({ ...notificationSettings, [name]: checked });
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    
    setTimeout(() => {
      setNotification({ 
        open: true, 
        message: "Preferencias de notificación guardadas.", 
        type: "success" 
      });
      setLoading(false);
    }, 1500);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Notificaciones</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.emailNotificaciones}
                onChange={handleToggleChange}
                name="emailNotificaciones"
              />
            }
            label="Notificaciones por Correo Electrónico"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.notificacionesPush}
                onChange={handleToggleChange}
                name="notificacionesPush"
              />
            }
            label="Notificaciones Push en el Navegador"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.alertasActividad}
                onChange={handleToggleChange}
                name="alertasActividad"
              />
            }
            label="Alertas de Actividad en Proyectos"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.boletinesInformativos}
                onChange={handleToggleChange}
                name="boletinesInformativos"
              />
            }
            label="Recibir Boletines Informativos"
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} 
          onClick={handleSaveNotifications}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

const ConfiguracionPanel = () => {
  
  const [pestanaActiva, setPestanaActiva] = useState(0);
  
  const handleCambioPestana = (event, newValue) => {
    setPestanaActiva(newValue);
  };
  
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Configuración del Sistema
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Paper sx={{ mb: 2 }}>
          <Tabs 
            value={pestanaActiva} 
            onChange={handleCambioPestana}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Perfil" 
              iconPosition="start"
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Seguridad" 
              iconPosition="start"
            />
            <Tab 
              icon={<NotificationsIcon />} 
              label="Notificaciones" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {pestanaActiva === 0 && <PanelInformacionPersonal />}
          {pestanaActiva === 1 && <PanelSeguridad />}
          {pestanaActiva === 2 && <PanelNotificaciones />}
        </Box>
      </Box>
    </>
  );
};

export default ConfiguracionPanel;