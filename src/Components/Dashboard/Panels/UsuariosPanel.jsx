import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from '@mui/icons-material/Search';


import { db, auth } from '../../../FireBase/FireBase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  setDoc,
  query,
  where
} from 'firebase/firestore';


import { 
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider 
} from "firebase/auth";

import { useAuth } from "../../../AuthContext/AuthContext"; 

const UsuariosPanel = () => {
  const { currentUser, userRole, errorTraducido, deleteUserAndData } = useAuth(); 
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState({
    id: "",
    nombre: "",
    email: "",
    rol: "",
    password: "",
    institucion: "",
    estado: "Activo"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [guardando, setGuardando] = useState(false); 
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: "", tipo: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  
  const getUsuarios = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "usuarios"));
      const querySnapshot = await getDocs(q);
      const usuariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      setNotificacion({ open: true, mensaje: "Error al cargar los usuarios.", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "Coordinador") {
      getUsuarios();
    } else {
      setLoading(false); 
    }
  }, [userRole]);

  
  const abrirDialogo = (modo, usuario = null) => {
    setModoEdicion(modo === "editar");
    if (modo === "editar" && usuario) {
      setDatosUsuario({
        id: usuario.id,
        nombre: usuario.nombre || "",
        email: usuario.email,
        rol: usuario.rol,
        password: "", 
        institucion: usuario.institucion || "",
        estado: usuario.estado || "Activo"
      });
    } else {
      setDatosUsuario({
        id: "",
        nombre: "",
        email: "",
        rol: "",
        password: "",
        institucion: "",
        estado: "Activo"
      });
    }
    setDialogOpen(true);
  };

  
  const cerrarDialogo = () => {
    setDialogOpen(false);
    setDatosUsuario({
      id: "",
      nombre: "",
      email: "",
      rol: "",
      password: "",
      institucion: "",
      estado: "Activo"
    });
    setShowPassword(false);
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosUsuario({ ...datosUsuario, [name]: value });
  };

  
  const validarFormulario = () => {
    const { nombre, email, rol, password, institucion } = datosUsuario;
    if (modoEdicion) {
      return nombre && email && rol && institucion;
    }
    return nombre && email && rol && password && institucion && password.length >= 6;
  };

  // Guardar/Actualizar usuario
  const guardarUsuario = async () => {
    if (!validarFormulario()) {
      setNotificacion({ open: true, mensaje: "Por favor, completa todos los campos requeridos.", tipo: "error" });
      return;
    }

    setGuardando(true);
    setNotificacion({ open: false, mensaje: "", tipo: "success" }); 

    try {
      if (modoEdicion) {
        //Actualizar datos en Firestore
        const userRef = doc(db, "usuarios", datosUsuario.id);
        await updateDoc(userRef, {
          nombre: datosUsuario.nombre,
          email: datosUsuario.email,
          rol: datosUsuario.rol,
          institucion: datosUsuario.institucion,
          estado: datosUsuario.estado,
          fechaActualizacion: serverTimestamp()
        });

        //Actualizar la contraseña si se proporcionó una nueva
        if (datosUsuario.password) {
          try {
            setNotificacion({ open: true, mensaje: "No se puede cambiar la contraseña de otros usuarios directamente desde el cliente por seguridad. Usa la consola de Firebase o Cloud Functions para ello.", tipo: "warning" });
          } catch (passError) {
            console.warn("Error al intentar actualizar la contraseña del usuario:", passError);
            
          }
        }

        setNotificacion({ open: true, mensaje: "Usuario actualizado exitosamente.", tipo: "success" });
      } else {
        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, datosUsuario.email, datosUsuario.password);
        const user = userCredential.user;

        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
          nombre: datosUsuario.nombre,
          email: datosUsuario.email,
          rol: datosUsuario.rol,
          institucion: datosUsuario.institucion,
          estado: datosUsuario.estado,
          fechaCreacion: serverTimestamp()
        });

        setNotificacion({ open: true, mensaje: "Usuario creado exitosamente (Auth + DB).", tipo: "success" });
      }
      cerrarDialogo();
      getUsuarios(); 
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setNotificacion({ open: true, mensaje: errorTraducido(error.code), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUsuario = async (userId) => {
    setLoading(true);
    setNotificacion({ open: false, mensaje: "", tipo: "success" });

    try {
      const result = await deleteUserAndData(userId);
      if (result.success) {
        setNotificacion({ open: true, mensaje: "Usuario eliminado exitosamente.", tipo: "success" });
        getUsuarios(); 
      } else {
        setNotificacion({ open: true, mensaje: result.message, tipo: "error" });
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setNotificacion({ open: true, mensaje: `Error al eliminar usuario: ${error.message}`, tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotificacion({ ...notificacion, open: false });
  };

  //Filtrar usuarios
  const filteredUsers = usuarios.filter(user => {
    const matchesSearchTerm = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.institucion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "Todos" || user.rol === roleFilter;
    const matchesStatus = statusFilter === "Todos" || user.estado === statusFilter;
    return matchesSearchTerm && matchesRole && matchesStatus;
  });


  if (userRole !== "Coordinador") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Acceso denegado. Solo los Coordinadores pueden gestionar usuarios.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Gestión de Usuarios
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Buscar por email, nombre o institución"
          variant="outlined"
          sx={{ flexGrow: 1, minWidth: '250px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Rol"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Coordinador">Coordinador</MenuItem>
            <MenuItem value="Docente">Docente</MenuItem>
            <MenuItem value="Estudiante">Estudiante</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Estado"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => abrirDialogo("crear")}
          sx={{ height: '56px' }}
        >
          Añadir Usuario
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando usuarios...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Institución</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((usuario) => (
                  <TableRow
                    key={usuario.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {usuario.nombre}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.rol}
                        color={
                          usuario.rol === "Coordinador"
                            ? "primary"
                            : usuario.rol === "Docente"
                              ? "secondary"
                              : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{usuario.institucion}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.estado}
                        color={usuario.estado === "Activo" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => abrirDialogo("editar", usuario)}>
                        <EditIcon color="info" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUsuario(usuario.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay usuarios que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={cerrarDialogo}>
        <DialogTitle>{modoEdicion ? "Editar Usuario" : "Añadir Nuevo Usuario"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="nombre"
                label="Nombre Completo"
                type="text"
                fullWidth
                variant="outlined"
                value={datosUsuario.nombre}
                onChange={handleChange}
                required
                disabled={guardando}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Correo Electrónico"
                type="email"
                fullWidth
                variant="outlined"
                value={datosUsuario.email}
                onChange={handleChange}
                required
                disabled={modoEdicion || guardando} 
              />
            </Grid>
            {!modoEdicion && ( 
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  value={datosUsuario.password}
                  onChange={handleChange}
                  required
                  disabled={guardando}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={datosUsuario.rol}
                  onChange={handleChange}
                  label="Rol"
                  required
                  disabled={guardando}
                >
                  <MenuItem value="Coordinador">Coordinador</MenuItem>
                  <MenuItem value="Docente">Docente</MenuItem>
                  <MenuItem value="Estudiante">Estudiante</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="institucion"
                label="Institución"
                type="text"
                fullWidth
                onChange={handleChange}
                value={datosUsuario.institucion}
                variant="outlined"
                required
                disabled={guardando}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={datosUsuario.estado}
                  onChange={handleChange}
                  label="Estado"
                  disabled={guardando}
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo} disabled={guardando}>
            Cancelar
          </Button>
          <Button 
            onClick={guardarUsuario} 
            variant="contained"
            disabled={!validarFormulario() || guardando}
            startIcon={guardando ? <CircularProgress size={20} /> : null}
          >
            {guardando ? 
              (modoEdicion ? 'Actualizando...' : 'Creando en Auth + DB...') : 
              (modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario Completo')
            }
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificacion.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notificacion.tipo}
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UsuariosPanel;