import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Alert,
    Snackbar,
    List,
    ListItem,
    ListItemText,
    InputAdornment,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../FireBase/FireBase"; 

const CrearProyectoPanel = () => {
    const navigate = useNavigate();
    
    
    const [proyecto, setProyecto] = useState({
        titulo: "",
        area: "",
        objetivos: "",
        fechaInicio: "",
        fechaFinalizacion: "",
        presupuesto: "",
        institucion: "",
        integrantes: [],
        observaciones: "",
    });

    
    const [nuevoIntegrante, setNuevoIntegrante] = useState({
        nombres: "",
        apellidos: "",
        identificacion: "",
        gradoEscolar: "",
    });

    
    const [pasoActual, setPasoActual] = useState(0);
   
    const [notificacion, setNotificacion] = useState({
        open: false,
        mensaje: "",
        tipo: "success",
    });
    
    const [errores, setErrores] = useState({});
    
    const [guardando, setGuardando] = useState(false);

   
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        
        if (name === 'presupuesto') {
            const regex = /^[0-9.,]*$/;
            if (regex.test(value) || value === '') {
                setProyecto((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        } else {
            setProyecto((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        
        
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: "" }));
        }
    };

   
    const handleIntegranteChange = (e) => {
        const { name, value } = e.target;
        setNuevoIntegrante((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    //Añadir un integrante
    const agregarIntegrante = () => {
        if (nuevoIntegrante.nombres.trim() && nuevoIntegrante.apellidos.trim()) {
            setProyecto((prev) => ({
                ...prev,
                integrantes: [...prev.integrantes, { ...nuevoIntegrante }],
            }));
            setNuevoIntegrante({
                nombres: "",
                apellidos: "",
                identificacion: "",
                gradoEscolar: "",
            });
        }
    };

    //Eliminar un integrante
    const eliminarIntegrante = (index) => {
        setProyecto((prev) => ({
            ...prev,
            integrantes: prev.integrantes.filter((_, i) => i !== index),
        }));
    };

    
    const validarPaso1 = () => {
        let tempErrors = {};
        if (!proyecto.titulo.trim()) tempErrors.titulo = "El título es requerido.";
        if (!proyecto.area) tempErrors.area = "El área es requerida.";
        if (!proyecto.objetivos.trim()) tempErrors.objetivos = "Los objetivos son requeridos.";
        setErrores(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validarPaso2 = () => {
        let tempErrors = {};
         if (!proyecto.fechaInicio) tempErrors.fechaInicio = "La fecha de inicio es requerida.";
        if (proyecto.fechaFinalizacion && proyecto.fechaInicio && proyecto.fechaFinalizacion < proyecto.fechaInicio) {
            tempErrors.fechaFinalizacion = "La fecha de finalización no puede ser anterior a la fecha de inicio.";
        }
        if (!proyecto.institucion.trim()) tempErrors.institucion = "La institución es requerida.";
        
        
        if (proyecto.presupuesto && isNaN(parseFloat(proyecto.presupuesto.replace(/,/g, '')))) {
            tempErrors.presupuesto = "El presupuesto debe ser un número válido.";
        }
        
        setErrores(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    
    const formatearPresupuesto = (valor) => {
        if (!valor) return "";
        const numero = parseFloat(valor.replace(/,/g, ''));
        if (isNaN(numero)) return valor;
        return numero.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    
    const siguientePaso = () => {
        let isValid = false;
        if (pasoActual === 0) {
            isValid = validarPaso1();
        } else if (pasoActual === 1) {
            isValid = validarPaso2();
        }

        if (isValid) {
            setPasoActual((prev) => prev + 1);
        } else {
            setNotificacion({
                open: true,
                mensaje: "Por favor, complete todos los campos requeridos.",
                tipo: "error",
            });
        }
    };

    
    const pasoAnterior = () => {
        setPasoActual((prev) => prev - 1);
    };

    //Enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (pasoActual === pasos.length - 1) {
            setGuardando(true);
            
            try {
                
                const presupuestoNumerico = proyecto.presupuesto 
                    ? parseFloat(proyecto.presupuesto.replace(/,/g, '')) 
                    : null;

               
                const proyectoData = {
                    titulo: proyecto.titulo.trim(),
                    area: proyecto.area,
                    objetivos: proyecto.objetivos.trim(),
                    fechaInicio: proyecto.fechaInicio,
                    fechaFinalizacion: proyecto.fechaFinalizacion || null,
                    presupuesto: presupuestoNumerico,
                    institucion: proyecto.institucion.trim(),
                    integrantes: proyecto.integrantes,
                    observaciones: proyecto.observaciones.trim(),
                    estado: "Pendiente",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                //Guardar en Firebase
                const docRef = await addDoc(collection(db, "proyectos"), proyectoData);
                console.log("Proyecto creado con ID:", docRef.id);

                //Mostrar notificación de éxito
                setNotificacion({
                    open: true,
                    mensaje: "¡Proyecto creado exitosamente! Redirigiendo...",
                    tipo: "success",
                });

                
                setProyecto({
                    titulo: "",
                    area: "",
                    objetivos: "",
                    fechaInicio: "",
                    fechaFinalizacion: "",
                    presupuesto: "",
                    institucion: "",
                    integrantes: [],
                    observaciones: "",
                });

                setPasoActual(0);
                setErrores({});

                
                setTimeout(() => {
                    navigate("/dashboard/mis-proyectos");
                }, 2000);

            } catch (error) {
                console.error("Error al guardar el proyecto:", error);
                setNotificacion({
                    open: true,
                    mensaje: "Error al crear el proyecto. Por favor, inténtelo de nuevo.",
                    tipo: "error",
                });
            } finally {
                setGuardando(false);
            }
        }
    };

   
    const handleCloseNotificacion = () => {
        setNotificacion((prev) => ({
            ...prev,
            open: false,
        }));
    };

   
    const pasos = ["Información General", "Detalles y Equipo", "Revisión y Confirmación"];

    return (
        <>
            <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title">
                    Crear Nuevo Proyecto
                </Typography>
                <Typography variant="body1" className="dashboard-welcome">
                    Complete el formulario para registrar un nuevo proyecto escolar
                </Typography>
            </Box>

            
            <Box sx={{ mb: 4 }}>
                <Stepper activeStep={pasoActual} alternativeLabel>
                    {pasos.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

           
            <Card className="form-container">
                <CardContent>
                    <form onSubmit={handleSubmit}>
                       
                        {pasoActual === 0 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Información General del Proyecto
                                </Typography>

                                <Grid container spacing={3}>
                                    
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            fullWidth
                                            required
                                            label=""
                                            name="titulo"
                                            value={proyecto.titulo}
                                            onChange={handleChange}
                                            variant="outlined"
                                            error={!!errores.titulo}
                                            helperText={errores.titulo}
                                            placeholder="Título del Proyecto *"
                                            size="medium"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth required error={!!errores.area}>
                                            <InputLabel id="area-label" shrink>Área *</InputLabel>
                                            <Select
                                                labelId="area-label"
                                                id="area"
                                                name="area"
                                                value={proyecto.area}
                                                onChange={handleChange}
                                                label="Área *"
                                                displayEmpty
                                                size="medium"
                                            >
                                                <MenuItem value="">Seleccione un área</MenuItem>
                                                <MenuItem value="Ciencias">Ciencias</MenuItem>
                                                <MenuItem value="Tecnología">Tecnología</MenuItem>
                                                <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                                                <MenuItem value="Artes">Artes</MenuItem>
                                                <MenuItem value="Humanidades">Humanidades</MenuItem>
                                                <MenuItem value="Educación Física">Educación Física</MenuItem>
                                                <MenuItem value="Idiomas">Idiomas</MenuItem>
                                                <MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
                                                <MenuItem value="Otro">Otro</MenuItem>
                                            </Select>
                                            {errores.area && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                                    {errores.area}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label=""
                                            name="institucion"
                                            value={proyecto.institucion}
                                            onChange={handleChange}
                                            variant="outlined"
                                            error={!!errores.institucion}
                                            helperText={errores.institucion}
                                            placeholder="Institución *"
                                            size="medium"
                                        />
                                    </Grid>

                                    
                                    <Grid item xs={12} md={6}></Grid>

                                    
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            multiline
                                            rows={1}
                                            label=""
                                            name="objetivos"
                                            value={proyecto.objetivos}
                                            onChange={handleChange}
                                            variant="outlined"
                                            error={!!errores.objetivos}
                                            helperText={errores.objetivos}
                                            placeholder="Objetivos del proyecto *"
                                            size="medium"
                                        />
                                    </Grid>

                                    
                                    <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={siguientePaso}
                                            sx={{
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                minWidth: '120px',
                                                height: '40px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            Siguiente
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        
                        {pasoActual === 1 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Detalles y Equipo de Trabajo
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Fecha de Inicio"
                                            name="fechaInicio"
                                            type="date"
                                            value={proyecto.fechaInicio}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            error={!!errores.fechaInicio}
                                            helperText={errores.fechaInicio}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Fecha de Finalización (estimada)"
                                            name="fechaFinalizacion"
                                            type="date"
                                            value={proyecto.fechaFinalizacion}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            error={!!errores.fechaFinalizacion}
                                            helperText={errores.fechaFinalizacion}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Presupuesto"
                                            name="presupuesto"
                                            value={proyecto.presupuesto}
                                            onChange={handleChange}
                                            variant="outlined"
                                            error={!!errores.presupuesto}
                                            helperText={errores.presupuesto || "Ingrese el presupuesto estimado (opcional)"}
                                            placeholder="0.00"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            onBlur={(e) => {
                                                const valorFormateado = formatearPresupuesto(e.target.value);
                                                setProyecto(prev => ({
                                                    ...prev,
                                                    presupuesto: valorFormateado
                                                }));
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}></Grid>

                                   
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                            Integrantes del Equipo
                                        </Typography>
                                        
                                        
                                        <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                                Añadir Integrante
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Nombres"
                                                        name="nombres"
                                                        value={nuevoIntegrante.nombres}
                                                        onChange={handleIntegranteChange}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Apellidos"
                                                        name="apellidos"
                                                        value={nuevoIntegrante.apellidos}
                                                        onChange={handleIntegranteChange}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="Identificación"
                                                        name="identificacion"
                                                        value={nuevoIntegrante.identificacion}
                                                        onChange={handleIntegranteChange}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="Grado Escolar"
                                                        name="gradoEscolar"
                                                        value={nuevoIntegrante.gradoEscolar}
                                                        onChange={handleIntegranteChange}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={agregarIntegrante}
                                                        startIcon={<AddIcon />}
                                                        size="small"
                                                        sx={{ height: '40px' }}
                                                    >
                                                        Añadir
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        
                                        {proyecto.integrantes.length > 0 && (
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                            <TableCell><strong>Nombres</strong></TableCell>
                                                            <TableCell><strong>Apellidos</strong></TableCell>
                                                            <TableCell><strong>Identificación</strong></TableCell>
                                                            <TableCell><strong>Grado Escolar</strong></TableCell>
                                                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {proyecto.integrantes.map((integrante, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{integrante.nombres}</TableCell>
                                                                <TableCell>{integrante.apellidos}</TableCell>
                                                                <TableCell>{integrante.identificacion}</TableCell>
                                                                <TableCell>{integrante.gradoEscolar}</TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => eliminarIntegrante(index)}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Observaciones Adicionales"
                                            name="observaciones"
                                            value={proyecto.observaciones}
                                            onChange={handleChange}
                                            variant="outlined"
                                            placeholder="Información adicional relevante para el proyecto (opcional)"
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={pasoAnterior}
                                            sx={{ textTransform: 'uppercase', fontWeight: 'bold', px: 4 }}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={siguientePaso}
                                            sx={{ textTransform: 'uppercase', fontWeight: 'bold', px: 4 }}
                                        >
                                            Siguiente
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        
                        {pasoActual === 2 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Revisión y Confirmación
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <CardContent>
                                                <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                    {proyecto.titulo || "Título del Proyecto"}
                                                </Typography>
                                                
                                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Área:</strong> {proyecto.area || "No especificada"}
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Institución:</strong> {proyecto.institucion || "No especificada"}
                                                        </Typography>
                                                        {proyecto.presupuesto && (
                                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                                <strong>Presupuesto:</strong> ${proyecto.presupuesto}
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Estado:</strong> Pendiente
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Integrantes:</strong> {proyecto.integrantes.length}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                
                                                <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                    Objetivos:
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                    {proyecto.objetivos || "No especificados"}
                                                </Typography>

                                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Fecha de Inicio:</strong> {proyecto.fechaInicio || "No especificada"}
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Fecha de Finalización:</strong> {proyecto.fechaFinalizacion || "No especificada"}
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                            <strong>Estado:</strong> Pendiente
                                                        </Typography>
                                                
                                                {proyecto.integrantes.length > 0 && (
                                                    <>
                                                        <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                            Integrantes del Equipo:
                                                        </Typography>
                                                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                                        <TableCell><strong>Nombres</strong></TableCell>
                                                                        <TableCell><strong>Apellidos</strong></TableCell>
                                                                        <TableCell><strong>Identificación</strong></TableCell>
                                                                        <TableCell><strong>Grado Escolar</strong></TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {proyecto.integrantes.map((integrante, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell>{integrante.nombres}</TableCell>
                                                                            <TableCell>{integrante.apellidos}</TableCell>
                                                                            <TableCell>{integrante.identificacion}</TableCell>
                                                                            <TableCell>{integrante.gradoEscolar}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </>
                                                )}

                                                {proyecto.observaciones && (
                                                    <>
                                                        <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                            Observaciones Adicionales:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                            {proyecto.observaciones}
                                                        </Typography>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={pasoAnterior}
                                            sx={{ textTransform: 'uppercase', fontWeight: 'bold', px: 4 }}
                                            disabled={guardando}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            sx={{ textTransform: 'uppercase', fontWeight: 'bold', px: 4 }}
                                            disabled={guardando}
                                        >
                                            {guardando ? "Creando..." : "Crear Proyecto"}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </form>
                </CardContent>
            </Card>

            
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

export default CrearProyectoPanel;