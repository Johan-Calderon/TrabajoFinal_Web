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
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../FireBase/FireBase"; 

const DashboardPanel = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        evaluacion: 0,
        instituciones: 0
    });

   
    const [dialogOpen, setDialogOpen] = useState(false);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    
    const [hitosProyecto, setHitosProyecto] = useState([]);
    const [archivosProyecto, setArchivosProyecto] = useState([]);
    const [historialEstadosProyecto, setHistorialEstadosProyecto] = useState([]);


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
            const institucionesUnicas = new Set();

            for (const docSnapshot of querySnapshot.docs) {
                const proyecto = {
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                };
                proyectosData.push(proyecto);
                if (proyecto.institucion) {
                    institucionesUnicas.add(proyecto.institucion);
                }
            }

            setProyectos(proyectosData);

            
            const stats = {
                total: proyectosData.length,
                activos: proyectosData.filter(p => p.estado === "Activo").length,
                evaluacion: proyectosData.filter(p => p.estado === "Pendiente" || p.estado === "En Evaluación").length,
                instituciones: institucionesUnicas.size
            };

            setEstadisticas(stats);

        } catch (error) {
            console.error("Error al cargar proyectos:", error);
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        cargarProyectos();
    }, []);

    
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

    //Cargar detalles del proyecto (hitos, archivos, historial)
    const cargarDetallesProyectoParaVisualizacion = async (proyectoId) => {
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
            console.error("Error al cargar detalles del proyecto para visualización:", error);
           
        }
    };

    
    const handleVisualizarProyecto = async (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setDialogOpen(true);
        setTabValue(0);
        await cargarDetallesProyectoParaVisualizacion(proyecto.id);
    };

    
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setProyectoSeleccionado(null);
        setTabValue(0);
        setHitosProyecto([]);
        setArchivosProyecto([]);
        setHistorialEstadosProyecto([]);
    };

    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    
    const TabPanel = ({ children, value, index, ...other }) => {
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    };

    return (
        <>
            <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title">
                    Dashboard
                </Typography>
                <Typography variant="body1" className="dashboard-welcome">
                    Bienvenido al Sistema de Gestión de Proyectos Escolares
                </Typography>
            </Box>

           
            <Box className="dashboard-cards">
                <Box className="stat-card">
                    <Typography variant="h6">
                        Proyectos Totales
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "#3498db" }}>
                        {loading ? <CircularProgress size={24} /> : estadisticas.total}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7f8c8d", mt: 1 }}>
                        Proyectos registrados
                    </Typography>
                </Box>

                <Box className="stat-card">
                    <Typography variant="h6">
                        Proyectos Activos
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "#2ecc71" }}>
                        {loading ? <CircularProgress size={24} /> : estadisticas.activos}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7f8c8d", mt: 1 }}>
                        En desarrollo
                    </Typography>
                </Box>

                <Box className="stat-card">
                    <Typography variant="h6">
                        En Evaluación
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "#f39c12" }}>
                        {loading ? <CircularProgress size={24} /> : estadisticas.evaluacion}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7f8c8d", mt: 1 }}>
                        Pendientes de revisión
                    </Typography>
                </Box>

                <Box className="stat-card">
                    <Typography variant="h6">
                        Instituciones
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "#9b59b6" }}>
                        {loading ? <CircularProgress size={24} /> : estadisticas.instituciones}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7f8c8d", mt: 1 }}>
                        Participantes
                    </Typography>
                </Box>
            </Box>

            
            <Box className="projects-table-container">
                <Box className="projects-table-header">
                    <Typography variant="h6">
                        Proyectos Recientes
                    </Typography>
                    <Button
                        variant="text"
                        color="primary"
                        className="view-all-button"
                        onClick={() => window.location.href = '/dashboard/mis-proyectos'}
                    >
                        VER TODOS
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Título</TableCell>
                                <TableCell>Área</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Institución</TableCell>
                                <TableCell>Fecha de Creación</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : proyectos.length > 0 ? (
                                proyectos.slice(0, 5).map((proyecto) => (
                                    <TableRow key={proyecto.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {proyecto.titulo}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{proyecto.area}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={proyecto.estado || "Pendiente"}
                                                color={getEstadoColor(proyecto.estado || "Pendiente")}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{proyecto.institucion}</TableCell>
                                        <TableCell>{formatearFecha(proyecto.createdAt)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                title="Ver detalles"
                                                onClick={() => handleVisualizarProyecto(proyecto)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay proyectos recientes para mostrar
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

           
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {proyectoSeleccionado?.titulo}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                                <Tab label="Información General" />
                                <Tab label="Avances/Hitos" />
                                <Tab label="Archivos" />
                                <Tab label="Historial del Estado" />
                            </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index={0}>
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
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Descripción:
                                    </Typography>
                                    <Typography variant="body1">
                                        {proyectoSeleccionado?.descripcion || "Sin descripción"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Avances y Hitos</Typography>
                                
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
                                                secondary="No hay avances adicionales para este proyecto."
                                            />
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Archivos del Proyecto</Typography>
                               
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
                    <Button onClick={handleCloseDialog}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DashboardPanel;