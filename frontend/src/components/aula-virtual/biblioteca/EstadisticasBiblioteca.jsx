import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { bibliotecaAPI } from '../../../services/bibliotecaService';

const EstadisticasBiblioteca = () => {
  const [stats, setStats] = useState(null);
  const [topFiles, setTopFiles] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const [statsRes, topFilesRes, downloadsRes] = await Promise.all([
        bibliotecaAPI.getStats(),
        bibliotecaAPI.getTopFiles(),
        bibliotecaAPI.getRecentDownloads()
      ]);
      
      setStats(statsRes.data);
      setTopFiles(topFilesRes.data);
      setRecentDownloads(downloadsRes.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Estadísticas de Biblioteca</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Estadísticas de Biblioteca</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Estadísticas de Biblioteca
      </Typography>

      {/* Tarjetas de estadísticas generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FileIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_files || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total de Archivos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_categories || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Categorías
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DownloadIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_downloads || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Descargas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.active_users || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Usuarios Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Archivos más descargados */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Archivos Más Descargados
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Archivo</TableCell>
                      <TableCell align="center">Descargas</TableCell>
                      <TableCell align="center">Tamaño</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topFiles.map((file, index) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {file.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.category_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={file.download_count} 
                            size="small" 
                            color={index < 3 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {formatFileSize(file.file_size)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {topFiles.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay datos de descargas disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Descargas recientes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DownloadIcon sx={{ mr: 1 }} />
                Descargas Recientes
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Archivo</TableCell>
                      <TableCell align="center">Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentDownloads.map((download) => (
                      <TableRow key={download.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {download.user_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {download.file_title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {new Date(download.downloaded_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {recentDownloads.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay descargas recientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estadísticas por categoría */}
      {stats?.category_stats && stats.category_stats.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estadísticas por Categoría
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="center">Archivos</TableCell>
                    <TableCell align="center">Descargas</TableCell>
                    <TableCell align="center">Tamaño Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.category_stats.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                          {category.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={category.file_count} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={category.download_count} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatFileSize(category.total_size)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EstadisticasBiblioteca;