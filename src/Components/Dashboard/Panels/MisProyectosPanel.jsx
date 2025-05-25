import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  TextField, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add"; 
import UploadFileIcon from "@mui/icons-material/UploadFile"; 

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  addDoc, 
  serverTimestamp, 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { db, storage } from "../../../FireBase/FireBase"; 

const MisProyectosPanel = () => {
  const navigate = useNavigate();

 
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, proyecto: null });
  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: "",
    tipo: "success",
  });

  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proyectoEditado, setProyectoEditado] = useState({});


  const [hitosProyecto, setHitosProyecto] = useState([]);
  const [archivosProyecto, setArchivosProyecto] = useState([]);
  const [historialEstadosProyecto, setHistorialEstadosProyecto] = useState([]);
  const [milestoneText, setMilestoneText] = useState(''); //Añadir nuevo hito
  const [selectedFile, setSelectedFile] = useState(null); //Carga de archivos

  
  const [searchTerm, setSearchTerm] = useState("");

  //Cargar proyectos desde Firebase
  const cargarProyectos = async () => {
    try {
      setLoading(true);

      
      const q = query(
        collection(db, "proyectos"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const proyectosData = [];

      for (const docSnapshot of querySnapshot.docs) {
        const proyecto = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        };


        proyectosData.push(proyecto);
      }

      setProyectos(proyectosData);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al cargar los proyectos",
        tipo: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    cargarProyectos();
  }, []);

  //Crear un nuevo proyecto
  const handleNuevoProyecto = () => {
    navigate("/dashboard/crear-proyecto");
  };

  
  const handleRefresh = () => {
    cargarProyectos();
  };

  //Eliminar proyecto
  const handleDeleteProyecto = async (proyectoId) => {
    try {
      await deleteDoc(doc(db, "proyectos", proyectoId));


      setProyectos((prev) => prev.filter((p) => p.id !== proyectoId));

      
      setDeleteDialog({ open: false, proyecto: null });

      
      setNotificacion({
        open: true,
        mensaje: "Proyecto eliminado exitosamente",
        tipo: "success",
      });
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al eliminar el proyecto",
        tipo: "error",
      });
    }
  };

  
  const openDeleteDialog = (proyecto) => {
    setDeleteDialog({ open: true, proyecto });
  };

  
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, proyecto: null });
  };

 
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Activo":
        return "success";
      case "Finalizado":
        return "default";
      case "Pendiente":
        return "warning";
      case "En Evaluación":
        return "info";
      default:
        return "default";
    }
  };

  
  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    if (fecha.toDate) {
      return fecha.toDate().toLocaleDateString();
    }
    return new Date(fecha).toLocaleDateString();
  };

  
  const handleCloseNotificacion = () => {
    setNotificacion((prev) => ({ ...prev, open: false }));
  };

  //Cargar detalles del proyecto (hitos, archivos, historial)
  const cargarDetallesProyecto = async (proyectoId) => {
    try {
      const hitosQuery = query(collection(db, `proyectos/${proyectoId}/hitos`), orderBy("fecha", "asc"));
      const hitosSnapshot = await getDocs(hitosQuery);
      setHitosProyecto(hitosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const archivosQuery = query(collection(db, `proyectos/${proyectoId}/archivos`), orderBy("uploadedAt", "asc"));
      const archivosSnapshot = await getDocs(archivosQuery);
      setArchivosProyecto(archivosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const historialQuery = query(collection(db, `proyectos/${proyectoId}/historialEstados`), orderBy("fecha", "asc"));
      const historialSnapshot = await getDocs(historialQuery);
      setHistorialEstadosProyecto(historialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error al cargar detalles del proyecto:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al cargar los detalles del proyecto",
        tipo: "error",
      });
    }
  };

  
  const handleVisualizarProyecto = async (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setProyectoEditado({ ...proyecto }); 
    setDialogOpen(true);
    setTabValue(0);
    setModoEdicion(false);
    await cargarDetallesProyecto(proyecto.id);
  };

  
  const handleEditarProyecto = async (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setProyectoEditado({ ...proyecto });
    setDialogOpen(true);
    setTabValue(0);
    setModoEdicion(true);
    await cargarDetallesProyecto(proyecto.id);
  };

  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setProyectoSeleccionado(null);
    setProyectoEditado({});
    setTabValue(0);
    setModoEdicion(false);
    setHitosProyecto([]);
    setArchivosProyecto([]);
    setHistorialEstadosProyecto([]);
    setMilestoneText('');
    setSelectedFile(null);
  };

  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  //Guardar cambios de los proyectos
  const handleGuardarCambios = async () => {
    try {
      const proyectoRef = doc(db, "proyectos", proyectoSeleccionado.id);
      const oldState = proyectoSeleccionado.estado;
      const newState = proyectoEditado.estado;

      await updateDoc(proyectoRef, proyectoEditado);

      
      if (oldState !== newState) {
        await addDoc(collection(db, `proyectos/${proyectoSeleccionado.id}/historialEstados`), {
          estado: newState,
          fecha: serverTimestamp(),
          cambioPor: "Usuario" 
        });
      }

      //Actualiza la lista de proyectos
      setProyectos((prev) =>
        prev.map((p) =>
          p.id === proyectoSeleccionado.id ? { ...p, ...proyectoEditado } : p
        )
      );

      setNotificacion({
        open: true,
        mensaje: "Proyecto actualizado exitosamente",
        tipo: "success",
      });

      handleCloseDialog();
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al actualizar el proyecto",
        tipo: "error",
      });
    }
  };

  
  const handleAddMilestone = async () => {
    if (!milestoneText.trim()) {
      setNotificacion({
        open: true,
        mensaje: "La descripción del hito no puede estar vacía",
        tipo: "warning",
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, `proyectos/${proyectoSeleccionado.id}/hitos`), {
        descripcion: milestoneText,
        fecha: serverTimestamp(), 
        registradoPor: "Usuario" 
      });

      
      const newMilestone = {
        id: docRef.id,
        descripcion: milestoneText,
        fecha: { toDate: () => new Date() } 
      };

      setHitosProyecto(prev => [...prev, newMilestone]);
      setMilestoneText(''); 
      setNotificacion({
        open: true,
        mensaje: "Hito añadido exitosamente",
        tipo: "success",
      });
    } catch (error) {
      console.error("Error al añadir hito:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al añadir el hito",
        tipo: "error",
      });
    }
  };

  //Manejar la selección de archivo
  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  //Subir un archivo
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setNotificacion({
        open: true,
        mensaje: "Por favor, selecciona un archivo para subir",
        tipo: "warning",
      });
      return;
    }

    const fileRef = ref(storage, `proyectos/${proyectoSeleccionado.id}/archivos/${selectedFile.name}`);
    try {
      await uploadBytes(fileRef, selectedFile);
      const fileURL = await getDownloadURL(fileRef);

      const docRef = await addDoc(collection(db, `proyectos/${proyectoSeleccionado.id}/archivos`), {
        nombre: selectedFile.name,
        url: fileURL,
        uploadedAt: serverTimestamp(),
        uploadedBy: "Usuario" 
      });

      
      const newFile = {
        id: docRef.id,
        nombre: selectedFile.name,
        url: fileURL,
        uploadedAt: { toDate: () => new Date() } 
      };

      setArchivosProyecto(prev => [...prev, newFile]);
      setSelectedFile(null); 
      setNotificacion({
        open: true,
        mensaje: "Archivo subido exitosamente",
        tipo: "success",
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setNotificacion({
        open: true,
        mensaje: "Error al subir el archivo",
        tipo: "error",
      });
    }
  };

  //Generar reporte PDF
  const handleGenerarReporte = async (proyecto) => {
    setNotificacion({
      open: true,
      mensaje: `Generando reporte PDF para: ${proyecto.titulo}. (Funcionalidad en desarrollo)`,
      tipo: "info",
    });

    
    console.log("Generando reporte para:", proyecto);
  };

  
  const handleInputChange = (field, value) => {
    setProyectoEditado((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  
  const estadisticas = {
    total: proyectos.length,
    activos: proyectos.filter((p) => p.estado === "Activo").length,
    finalizados: proyectos.filter((p) => p.estado === "Finalizado").length,
    pendientes: proyectos.filter((p) => p.estado === "Pendiente").length,
  };

 
  const proyectosFiltrados = proyectos.filter((proyecto) => {
    const matchesTitle = proyecto.titulo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesArea = proyecto.area
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesInstitucion = proyecto.institucion
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTitle || matchesArea || matchesInstitucion;
  });


  
  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <>
      <Box className="dashboard-header">
        <Typography variant="h4" className="dashboard-title">
          Mis Proyectos
        </Typography>
        <Typography variant="body1" className="dashboard-welcome">
          Gestiona tus proyectos escolares activos
        </Typography>
      </Box>

      
      <Box className="dashboard-cards">
        <Box className="stat-card">
          <Typography variant="h6">Total de Proyectos</Typography>
          <Typography
            variant="h3"
            sx={{ mt: 2, fontWeight: "bold", color: "#3498db" }}
          >
            {loading ? <CircularProgress size={24} /> : estadisticas.total}
          </Typography>
        </Box>

        <Box className="stat-card">
          <Typography variant="h6">Proyectos Activos</Typography>
          <Typography
            variant="h3"
            sx={{ mt: 2, fontWeight: "bold", color: "#2ecc71" }}
          >
            {loading ? <CircularProgress size={24} /> : estadisticas.activos}
          </Typography>
        </Box>

        <Box className="stat-card">
          <Typography variant="h6">Proyectos Finalizados</Typography>
          <Typography
            variant="h3"
            sx={{ mt: 2, fontWeight: "bold", color: "#95a5a6" }}
          >
            {loading ? <CircularProgress size={24} /> : estadisticas.finalizados}
          </Typography>
        </Box>

        <Box className="stat-card">
          <Typography variant="h6">Proyectos Pendientes</Typography>
          <Typography
            variant="h3"
            sx={{ mt: 2, fontWeight: "bold", color: "#f39c12" }}
          >
            {loading ? <CircularProgress size={24} /> : estadisticas.pendientes}
          </Typography>
        </Box>
      </Box>

      <Box className="projects-table-container">
        <Box className="projects-table-header">
          <Typography variant="h6">Todos mis Proyectos</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              ACTUALIZAR
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleNuevoProyecto}
            >
              NUEVO PROYECTO
            </Button>
          </Box>
        </Box>

        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Buscar Proyecto por Título, Área o Institución"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Nivel Educativo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de inicio</TableCell>
                <TableCell>Fecha de finalización</TableCell>
                <TableCell>Institución</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : proyectosFiltrados.length > 0 ? (
                proyectosFiltrados.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {proyecto.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>{proyecto.area}</TableCell>
                    <TableCell>{proyecto.nivelEducativo}</TableCell>
                    <TableCell>
                      <Chip
                        label={proyecto.estado || "Pendiente"}
                        color={getEstadoColor(proyecto.estado || "Pendiente")}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {proyecto.fechaInicio || "No especificada"}
                    </TableCell>
                    <TableCell>
                      {proyecto.fechaFinalizacion || "No especificada"}
                    </TableCell>
                    <TableCell>{proyecto.institucion}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        title="Ver detalles"
                        onClick={() => handleVisualizarProyecto(proyecto)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        title="Editar proyecto"
                        onClick={() => handleEditarProyecto(proyecto)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Eliminar proyecto"
                        onClick={() => openDeleteDialog(proyecto)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        title="Generar reporte PDF"
                        onClick={() => handleGenerarReporte(proyecto)}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No hay proyectos para mostrar con los criterios de búsqueda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {modoEdicion ? `Editar: ${proyectoSeleccionado?.titulo}` : proyectoSeleccionado?.titulo}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
                <Tab label="Información General" />
                <Tab label="Avances/Hitos" />
                <Tab label="Archivos" />
                <Tab label="Historial del Estado" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {modoEdicion ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título del Proyecto"
                      value={proyectoEditado.titulo || ""}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Área</InputLabel>
                      <Select
                        value={proyectoEditado.area || ""}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        label="Área"
                      >
                        <MenuItem value="Ciencias">Ciencias</MenuItem>
                        <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                        <MenuItem value="Tecnología">Tecnología</MenuItem>
                        <MenuItem value="Arte">Arte</MenuItem>
                        <MenuItem value="Literatura">Literatura</MenuItem>
                        <MenuItem value="Historia">Historia</MenuItem>
                        <MenuItem value="Educación Física">Educación Física</MenuItem>
                        <MenuItem value="Idiomas">Idiomas</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Nivel Educativo</InputLabel>
                      <Select
                        value={proyectoEditado.nivelEducativo || ""}
                        onChange={(e) => handleInputChange("nivelEducativo", e.target.value)}
                        label="Nivel Educativo"
                      >
                        <MenuItem value="Preescolar">Preescolar</MenuItem>
                        <MenuItem value="Primaria">Primaria</MenuItem>
                        <MenuItem value="Secundaria">Secundaria</MenuItem>
                        <MenuItem value="Preparatoria">Preparatoria</MenuItem>
                        <MenuItem value="Universidad">Universidad</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Institución"
                      value={proyectoEditado.institucion || ""}
                      onChange={(e) => handleInputChange("institucion", e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={proyectoEditado.estado || ""}
                        onChange={(e) => handleInputChange("estado", e.target.value)}
                        label="Estado"
                      >
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="En Evaluación">En Evaluación</MenuItem>
                        <MenuItem value="Activo">Activo</MenuItem>
                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Inicio"
                      type="date"
                      value={proyectoEditado.fechaInicio || ""}
                      onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Finalización"
                      type="date"
                      value={proyectoEditado.fechaFinalizacion || ""}
                      onChange={(e) => handleInputChange("fechaFinalizacion", e.target.value)}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      multiline
                      rows={4}
                      value={proyectoEditado.descripcion || ""}
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Área:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.area || "No especificada"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nivel Educativo:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.nivelEducativo || "No especificado"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Institución:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.institucion || "No especificada"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado:
                    </Typography>
                    <Chip
                      label={proyectoSeleccionado?.estado || "Pendiente"}
                      color={getEstadoColor(proyectoSeleccionado?.estado || "Pendiente")}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Inicio:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.fechaInicio || "No especificada"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Finalización:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.fechaFinalizacion || "No especificada"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descripción:
                    </Typography>
                    <Typography variant="body1">
                      {proyectoSeleccionado?.descripcion || "Sin descripción"}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Avances y Hitos</Typography>
                {modoEdicion && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Descripción del Hito"
                      variant="outlined"
                      size="small"
                      value={milestoneText}
                      onChange={(e) => setMilestoneText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddMilestone();
                      }}
                    />
                    <Button variant="contained" size="small" onClick={handleAddMilestone} startIcon={<AddIcon />}>
                      Añadir Hito
                    </Button>
                  </Box>
                )}
              </Box>
              <List>
                {proyectoSeleccionado?.createdAt && (
                  <ListItem>
                    <ListItemText
                      primary="Hito inicial"
                      secondary={`Proyecto creado - ${formatearFecha(proyectoSeleccionado?.createdAt)}`}
                    />
                  </ListItem>
                )}
                {hitosProyecto.length > 0 ? (
                  hitosProyecto.map((hito) => (
                    <React.Fragment key={hito.id}>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText
                          primary={hito.descripcion}
                          secondary={`Registrado el ${formatearFecha(hito.fecha)}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                ) : (
                  !proyectoSeleccionado?.createdAt && ( 
                    <ListItem>
                      <ListItemText
                        primary="No hay más hitos registrados"
                        secondary="Usa el botón 'Añadir Hito' para agregar nuevos avances"
                      />
                    </ListItem>
                  )
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Archivos del Proyecto</Typography>
                {modoEdicion && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <InputLabel htmlFor="upload-file-button" sx={{ cursor: 'pointer' }}>
                      <input
                        id="upload-file-button"
                        type="file"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <Button variant="outlined" component="span" size="small" startIcon={<UploadFileIcon />}>
                        Seleccionar Archivo
                      </Button>
                    </InputLabel>
                    {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
                    <Button variant="contained" size="small" onClick={handleUploadFile} disabled={!selectedFile}>
                      Subir Archivo
                    </Button>
                  </Box>
                )}
              </Box>
              <List>
                {archivosProyecto.length > 0 ? (
                  archivosProyecto.map((archivo) => (
                    <React.Fragment key={archivo.id}>
                      <Divider component="li" />
                      <ListItem
                        secondaryAction={
                          <Button href={archivo.url} target="_blank" rel="noopener noreferrer" size="small">
                            Ver
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={archivo.nombre}
                          secondary={`Subido el ${formatearFecha(archivo.uploadedAt)}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay archivos adjuntos para este proyecto.
                  </Typography>
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>Historial del Estado</Typography>
              <List>
                {proyectoSeleccionado?.createdAt && (
                  <ListItem>
                    <ListItemText
                      primary="Proyecto creado"
                      secondary={formatearFecha(proyectoSeleccionado?.createdAt) + ` - Estado inicial: ${proyectoSeleccionado?.estadoInicial || 'Pendiente'}`}
                    />
                  </ListItem>
                )}
                {historialEstadosProyecto.length > 0 ? (
                  historialEstadosProyecto.map((estadoLog) => (
                    <React.Fragment key={estadoLog.id}>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText
                          primary={`Estado: ${estadoLog.estado}`}
                          secondary={`Fecha: ${formatearFecha(estadoLog.fecha)}${estadoLog.cambioPor ? ` - Por: ${estadoLog.cambioPor}` : ''}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                ) : (
                  
                  <ListItem>
                    <ListItemText
                      primary="No hay un historial de cambios de estado detallado."
                      secondary="Los cambios futuros se registrarán aquí."
                    />
                  </ListItem>
                )}
              </List>
            </TabPanel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{modoEdicion ? "Cancelar" : "Cerrar"}</Button>
          {modoEdicion && (
            <Button onClick={handleGuardarCambios} variant="contained">
              Guardar Cambios
            </Button>
          )}
        </DialogActions>
      </Dialog>

    
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Confirmar eliminación?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar el proyecto "
            {deleteDialog.proyecto?.titulo}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDeleteProyecto(deleteDialog.proyecto?.id)}
            color="error"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      
      <Snackbar
        open={notificacion.open}
        autoHideDuration={6000}
        onClose={handleCloseNotificacion}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotificacion}
          severity={notificacion.tipo}
          sx={{ width: "100%" }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MisProyectosPanel;