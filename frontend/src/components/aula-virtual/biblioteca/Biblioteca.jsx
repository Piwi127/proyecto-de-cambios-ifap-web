import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  TextField, 
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { bibliotecaAPI } from '../../../services/bibliotecaService';

const Biblioteca = () => {
  const { user } = useAuth();
  const [archivos, setArchivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    is_public: true
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar datos del backend
      try {
        const [archivosRes, categoriasRes, favoritosRes] = await Promise.all([
          bibliotecaAPI.getFiles(),
          bibliotecaAPI.getCategories(),
          bibliotecaAPI.getFavorites()
        ]);
        
        setArchivos(archivosRes.data);
        setCategorias(categoriasRes.data);
        setFavoritos(favoritosRes.data.map(fav => fav.file));
      } catch (error) {
        console.error('Error al cargar datos del backend:', error);
        
        // Datos de ejemplo para mostrar mientras se resuelve el problema
        const categoriasEjemplo = [
          { id: 1, name: 'Archivística', description: 'Documentos sobre archivística' },
          { id: 2, name: 'General', description: 'Documentos generales' }
        ];
        
        const archivosEjemplo = [
          {
            id: 1,
            title: 'Manual de Archivística',
            description: 'Manual básico de archivística para estudiantes',
            file_type: 'pdf',
            file_size: 1024 * 1024, // 1MB
            download_count: 15,
            category: 1,
            uploaded_by_name: 'Administrador',
            uploaded_at: new Date().toISOString(),
            visibility: 'public',
            file: '#'
          },
          {
            id: 2,
            title: 'Guía de Preservación Digital',
            description: 'Guía completa sobre preservación digital de archivos históricos',
            file_type: 'pdf',
            file_size: 2 * 1024 * 1024, // 2MB
            download_count: 8,
            category: 1,
            uploaded_by_name: 'Administrador',
            uploaded_at: new Date().toISOString(),
            visibility: 'public',
            file: '#'
          },
          {
            id: 3,
            title: 'Técnicas de Catalogación',
            description: 'Documento sobre técnicas modernas de catalogación',
            file_type: 'pdf',
            file_size: 1.5 * 1024 * 1024, // 1.5MB
            download_count: 12,
            category: 2,
            uploaded_by_name: 'Administrador',
            uploaded_at: new Date().toISOString(),
            visibility: 'public',
            file: '#'
          }
        ];
        
        setArchivos(archivosEjemplo);
        setCategorias(categoriasEjemplo);
        setFavoritos([]);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos de la biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <PdfIcon color="error" />;
    if (fileType.includes('image')) return <ImageIcon color="primary" />;
    if (fileType.includes('video')) return <VideoIcon color="secondary" />;
    if (fileType.includes('audio')) return <AudioIcon color="info" />;
    if (fileType.includes('text') || fileType.includes('document')) return <DescriptionIcon color="warning" />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (archivo) => {
    try {
      await bibliotecaAPI.downloadFile(archivo.id);
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = archivo.file;
      link.download = archivo.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      setError('Error al descargar el archivo');
    }
  };

  const handleToggleFavorite = async (archivoId) => {
    try {
      const isFavorite = favoritos.includes(archivoId);
      
      if (isFavorite) {
        await bibliotecaAPI.removeFavorite(archivoId);
        setFavoritos(favoritos.filter(id => id !== archivoId));
      } else {
        await bibliotecaAPI.addFavorite(archivoId);
        setFavoritos([...favoritos, archivoId]);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      setError('Error al actualizar favorito');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadData({
        ...uploadData,
        title: file.name.split('.')[0]
      });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadData.title || !uploadData.category) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('is_public', uploadData.is_public);

      await bibliotecaAPI.uploadFile(formData);
      
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadData({
        title: '',
        description: '',
        category: '',
        is_public: true
      });
      
      cargarDatos();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setError('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const archivosFiltrados = archivos.filter(archivo => {
    const matchesSearch = archivo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archivo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || archivo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Biblioteca</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Biblioteca Digital
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar archivos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Categoría"
          >
            <MenuItem value="">Todas las categorías</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={categoria.id}>
                {categoria.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista de archivos */}
      <Grid container spacing={3}>
        {archivosFiltrados.map((archivo) => (
          <Grid item xs={12} sm={6} md={4} key={archivo.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getFileIcon(archivo.file_type)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {archivo.title}
                  </Typography>
                  <IconButton
                    onClick={() => handleToggleFavorite(archivo.id)}
                    color={favoritos.includes(archivo.id) ? 'error' : 'default'}
                  >
                    {favoritos.includes(archivo.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {archivo.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={categorias.find(c => c.id === archivo.category)?.name || 'Sin categoría'} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={formatFileSize(archivo.file_size)} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${archivo.download_count} descargas`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Subido por: {archivo.uploaded_by_name} • {new Date(archivo.uploaded_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(archivo)}
                  variant="contained"
                  fullWidth
                >
                  Descargar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {archivosFiltrados.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron archivos
          </Typography>
        </Box>
      )}

      {/* Botón flotante para subir archivos */}
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <Fab
          color="primary"
          aria-label="subir archivo"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setUploadDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialog para subir archivos */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Archivo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {uploadFile ? uploadFile.name : 'Seleccionar archivo'}
              </Button>
            </label>

            <TextField
              fullWidth
              label="Título"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Descripción"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                label="Categoría"
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Visibilidad</InputLabel>
              <Select
                value={uploadData.is_public}
                onChange={(e) => setUploadData({ ...uploadData, is_public: e.target.value })}
                label="Visibilidad"
              >
                <MenuItem value={true}>Público</MenuItem>
                <MenuItem value={false}>Privado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUploadSubmit} 
            variant="contained"
            disabled={uploading || !uploadFile}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Biblioteca;