import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from "@mui/material";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "../../../FireBase/FireBase";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import PersonIcon from "@mui/icons-material/Person";
import GradeIcon from "@mui/icons-material/Grade";

const ReportesPanel = () => {
  
  const [reportesGenerados, setReportesGenerados] = useState([]);
  const [dialogoReporte, setDialogoReporte] = useState(false);
  const [datosReporte, setDatosReporte] = useState([]);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [error, setError] = useState("");
  
  
  const [configReporte, setConfigReporte] = useState({
    tipo: "",
    fechaInicio: "",
    fechaFin: "",
    formato: "tabla"
  });

  
  const abrirDialogoReporte = (tipo) => {
    setConfigReporte(prev => ({
      ...prev,
      tipo: tipo
    }));
    setDialogoReporte(true);
    setError("");
    setDatosReporte([]);
    setMostrarDatos(false);
  };

  
  const cerrarDialogoReporte = () => {
    setDialogoReporte(false);
    setConfigReporte({
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
      formato: "tabla"
    });
    setDatosReporte([]);
    setMostrarDatos(false);
    setError("");
  };

  
  const convertirFechaATimestamp = (fechaString) => {
    const fecha = new Date(fechaString);
    return Timestamp.fromDate(fecha);
  };

  
  const obtenerDatosProyectos = async (fechaInicio, fechaFin) => {
    try {
      let consulta = collection(db, "proyectos");
      
      if (fechaInicio && fechaFin) {
        const timestampInicio = convertirFechaATimestamp(fechaInicio);
        const timestampFin = convertirFechaATimestamp(fechaFin + "T23:59:59");
        
        consulta = query(
          collection(db, "proyectos"),
          where("fechaCreacion", ">=", timestampInicio),
          where("fechaCreacion", "<=", timestampFin),
          orderBy("fechaCreacion", "desc")
        );
      } else {
        consulta = query(
          collection(db, "proyectos"),
          orderBy("fechaCreacion", "desc")
        );
      }

      const snapshot = await getDocs(consulta);
      const proyectos = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        proyectos.push({
          id: doc.id,
          titulo: data.titulo || "Sin título",
          descripcion: data.descripcion || "Sin descripción",
          estado: data.estado || "Sin estado",
          categoria: data.categoria || "Sin categoría",
          fechaCreacion: data.fechaCreacion?.toDate().toLocaleDateString() || "N/A",
          autorId: data.autorId || "N/A",
          autorNombre: data.autorNombre || "N/A",
          institucion: data.institucion || "N/A"
        });
      });
      
      return proyectos;
    } catch (error) {
      console.error("Error obteniendo proyectos:", error);
      throw new Error("Error al obtener datos de proyectos: " + error.message);
    }
  };

  
  const obtenerDatosUsuarios = async (fechaInicio, fechaFin) => {
    try {
      let consulta = collection(db, "usuarios");
      
      if (fechaInicio && fechaFin) {
        const timestampInicio = convertirFechaATimestamp(fechaInicio);
        const timestampFin = convertirFechaATimestamp(fechaFin + "T23:59:59");
        
        consulta = query(
          collection(db, "usuarios"),
          where("fechaRegistro", ">=", timestampInicio),
          where("fechaRegistro", "<=", timestampFin),
          orderBy("fechaRegistro", "desc")
        );
      } else {
        consulta = query(
          collection(db, "usuarios"),
          orderBy("fechaRegistro", "desc")
        );
      }

      const snapshot = await getDocs(consulta);
      const usuarios = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        usuarios.push({
          id: doc.id,
          nombre: data.nombre || "Sin nombre",
          email: data.email || "Sin email",
          rol: data.rol || "Sin rol",
          institucion: data.institucion || "Sin institución",
          telefono: data.telefono || "N/A",
          fechaRegistro: data.fechaRegistro?.toDate().toLocaleDateString() || "N/A",
          fechaActualizacion: data.fechaActualizacion?.toDate().toLocaleDateString() || "N/A"
        });
      });
      
      return usuarios;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw new Error("Error al obtener datos de usuarios: " + error.message);
    }
  };

  
  const obtenerDatosEvaluaciones = async (fechaInicio, fechaFin) => {
    try {
      let consulta = collection(db, "evaluaciones");
      
      if (fechaInicio && fechaFin) {
        const timestampInicio = convertirFechaATimestamp(fechaInicio);
        const timestampFin = convertirFechaATimestamp(fechaFin + "T23:59:59");
        
        consulta = query(
          collection(db, "evaluaciones"),
          where("fechaEvaluacion", ">=", timestampInicio),
          where("fechaEvaluacion", "<=", timestampFin),
          orderBy("fechaEvaluacion", "desc")
        );
      } else {
        consulta = query(
          collection(db, "evaluaciones"),
          orderBy("fechaEvaluacion", "desc")
        );
      }

      const snapshot = await getDocs(consulta);
      const evaluaciones = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        evaluaciones.push({
          id: doc.id,
          proyectoId: data.proyectoId || "N/A",
          proyectoTitulo: data.proyectoTitulo || "Sin título",
          evaluadorId: data.evaluadorId || "N/A",
          evaluadorNombre: data.evaluadorNombre || "N/A",
          puntuacion: data.puntuacion || 0,
          comentarios: data.comentarios || "Sin comentarios",
          estado: data.estado || "Sin estado",
          fechaEvaluacion: data.fechaEvaluacion?.toDate().toLocaleDateString() || "N/A"
        });
      });
      
      return evaluaciones;
    } catch (error) {
      console.error("Error obteniendo evaluaciones:", error);
      throw new Error("Error al obtener datos de evaluaciones: " + error.message);
    }
  };

  
  const generarReporte = async () => {
    setCargandoReporte(true);
    setError("");
    
    try {
      let datos = [];
      
      switch (configReporte.tipo) {
        case "Proyectos":
          datos = await obtenerDatosProyectos(configReporte.fechaInicio, configReporte.fechaFin);
          break;
        case "Usuarios":
          datos = await obtenerDatosUsuarios(configReporte.fechaInicio, configReporte.fechaFin);
          break;
        case "Evaluaciones":
          datos = await obtenerDatosEvaluaciones(configReporte.fechaInicio, configReporte.fechaFin);
          break;
        default:
          throw new Error("Tipo de reporte no válido");
      }
      
      setDatosReporte(datos);
      setMostrarDatos(true);
      
      
      const nuevoReporte = {
        id: Date.now(),
        nombre: `Reporte de ${configReporte.tipo}`,
        tipo: configReporte.tipo,
        formato: configReporte.formato,
        fechaGeneracion: new Date().toLocaleDateString(),
        estado: "Completado",
        cantidad: datos.length,
        fechaInicio: configReporte.fechaInicio || "Todas",
        fechaFin: configReporte.fechaFin || "Todas"
      };
      
      setReportesGenerados(prev => [nuevoReporte, ...prev]);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setCargandoReporte(false);
    }
  };

  const exportarCSV = (datos, tipo) => {
    if (!datos || datos.length === 0) return;
    
    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join(','),
      ...datos.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfigReporte(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  const renderizarTablaReporte = () => {
    if (!datosReporte || datosReporte.length === 0) {
      return (
        <Alert severity="info">
          No se encontraron datos para el rango de fechas seleccionado.
        </Alert>
      );
    }

    switch (configReporte.tipo) {
      case "Proyectos":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Institución</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosReporte.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell>{proyecto.titulo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={proyecto.estado} 
                        size="small" 
                        color={proyecto.estado === 'Aprobado' ? 'success' : 
                               proyecto.estado === 'En Revisión' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{proyecto.categoria}</TableCell>
                    <TableCell>{proyecto.autorNombre}</TableCell>
                    <TableCell>{proyecto.institucion}</TableCell>
                    <TableCell>{proyecto.fechaCreacion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case "Usuarios":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Institución</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosReporte.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.rol} 
                        size="small" 
                        color={usuario.rol === 'coordinador' ? 'primary' : 
                               usuario.rol === 'docente' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{usuario.institucion}</TableCell>
                    <TableCell>{usuario.telefono}</TableCell>
                    <TableCell>{usuario.fechaRegistro}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case "Evaluaciones":
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Evaluador</TableCell>
                  <TableCell>Puntuación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Evaluación</TableCell>
                  <TableCell>Comentarios</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosReporte.map((evaluacion) => (
                  <TableRow key={evaluacion.id}>
                    <TableCell>{evaluacion.proyectoTitulo}</TableCell>
                    <TableCell>{evaluacion.evaluadorNombre}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${evaluacion.puntuacion}/100`} 
                        size="small" 
                        color={evaluacion.puntuacion >= 80 ? 'success' : 
                               evaluacion.puntuacion >= 60 ? 'warning' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{evaluacion.estado}</TableCell>
                    <TableCell>{evaluacion.fechaEvaluacion}</TableCell>
                    <TableCell style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evaluacion.comentarios}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box className="dashboard-header">
        <Typography variant="h4" className="dashboard-title">
          Reportes y Estadísticas
        </Typography>
        <Typography variant="body1" className="dashboard-welcome">
          Genera reportes detallados de proyectos, usuarios y evaluaciones
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Card className="stat-card">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: "#3498db", mr: 2 }} />
                <Typography variant="h6">
                  Reporte de Proyectos
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                Genera un reporte detallado de todos los proyectos registrados por fecha.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={() => abrirDialogoReporte("Proyectos")}
              >
                Generar Reporte
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card className="stat-card">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: "#2ecc71", mr: 2 }} />
                <Typography variant="h6">
                  Reporte de Usuarios
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                Visualiza información detallada de usuarios registrados por fecha.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={() => abrirDialogoReporte("Usuarios")}
              >
                Generar Reporte
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card className="stat-card">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <GradeIcon sx={{ fontSize: 40, color: "#f39c12", mr: 2 }} />
                <Typography variant="h6">
                  Reporte de Evaluaciones
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                Analiza todas las evaluaciones realizadas en un rango de fechas específico.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={() => abrirDialogoReporte("Evaluaciones")}
              >
                Generar Reporte
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      
      <Box className="projects-table-container">
        <Box className="projects-table-header">
          <Typography variant="h6">
            Reportes Generados Recientemente
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del Reporte</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Cantidad de Registros</TableCell>
                <TableCell>Rango de Fechas</TableCell>
                <TableCell>Fecha de Generación</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportesGenerados.length > 0 ? (
                reportesGenerados.map((reporte) => (
                  <TableRow key={reporte.id}>
                    <TableCell>{reporte.nombre}</TableCell>
                    <TableCell>
                      <Chip label={reporte.tipo} size="small" />
                    </TableCell>
                    <TableCell>{reporte.cantidad} registros</TableCell>
                    <TableCell>
                      {reporte.fechaInicio === "Todas" ? "Todas las fechas" : 
                       `${reporte.fechaInicio} - ${reporte.fechaFin}`}
                    </TableCell>
                    <TableCell>{reporte.fechaGeneracion}</TableCell>
                    <TableCell>
                      <Chip 
                        label={reporte.estado} 
                        size="small" 
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay reportes generados para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

     
      <Dialog 
        open={dialogoReporte} 
        onClose={cerrarDialogoReporte} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          style: {
            minHeight: '70vh',
          },
        }}
      >
        <DialogTitle>
          Reporte de {configReporte.tipo}
          {datosReporte.length > 0 && (
            <Typography variant="subtitle2" color="textSecondary">
              {datosReporte.length} registros encontrados
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          
          {!mostrarDatos && (
            <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Inicio (opcional)"
                  name="fechaInicio"
                  type="date"
                  value={configReporte.fechaInicio}
                  onChange={handleConfigChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="Deja vacío para incluir todas las fechas"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Fin (opcional)"
                  name="fechaFin"
                  type="date"
                  value={configReporte.fechaFin}
                  onChange={handleConfigChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="Deja vacío para incluir todas las fechas"
                />
              </Grid>
            </Grid>
          )}

          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          
          {cargandoReporte && (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Generando reporte...
              </Typography>
            </Box>
          )}

          
          {mostrarDatos && !cargandoReporte && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Datos del Reporte
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportarCSV(datosReporte, configReporte.tipo)}
                  disabled={datosReporte.length === 0}
                >
                  Exportar CSV
                </Button>
              </Box>
              {renderizarTablaReporte()}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cerrarDialogoReporte}>
            {mostrarDatos ? "Cerrar" : "Cancelar"}
          </Button>
          {!mostrarDatos && (
            <Button 
              onClick={generarReporte} 
              variant="contained"
              disabled={cargandoReporte}
            >
              {cargandoReporte ? "Generando..." : "Generar Reporte"}
            </Button>
          )}
          {mostrarDatos && (
            <Button 
              onClick={() => {
                setMostrarDatos(false);
                setDatosReporte([]);
              }} 
              variant="outlined"
            >
              Nuevo Reporte
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportesPanel;