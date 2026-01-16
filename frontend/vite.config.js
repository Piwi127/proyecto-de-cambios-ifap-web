/**
 * CONFIGURACIÓN PRINCIPAL DE VITE
 *
 * Este archivo configura el entorno de desarrollo y construcción de la aplicación React.
 * Vite es un build tool moderno que proporciona desarrollo rápido y optimizaciones avanzadas.
 *
 * @see https://vite.dev/config/
 */

// ========================================
// IMPORTACIONES DE DEPENDENCIAS
// ========================================
import { defineConfig } from 'vite'               // Función principal para definir configuración de Vite
import react from '@vitejs/plugin-react'          // Plugin oficial de Vite para React con Fast Refresh
import compression from 'vite-plugin-compression' // Plugin para compresión de assets en producción

export default defineConfig({
  // ========================================
  // CONFIGURACIÓN DE PLUGINS
  // ========================================
  plugins: [
    // Plugin de React: Proporciona soporte completo para React con Fast Refresh
    // - Habilita el recargado en caliente durante el desarrollo
    // - Optimiza el proceso de construcción para componentes React
    // - Proporciona mejor experiencia de desarrollo con actualizaciones instantáneas
    react(),

    // Plugin de compresión: Optimiza los archivos para producción
    // - Comprime automáticamente los assets con Gzip
    // - Reduce significativamente el tamaño de los archivos JavaScript/CSS
    // - Mejora los tiempos de carga en producción
    // - Solo se activa en modo build, no afecta el desarrollo
    compression({
      algorithm: 'gzip',    // Algoritmo de compresión (gzip es ampliamente soportado)
      ext: '.gz',          // Extensión que se añade a los archivos comprimidos
    }),
  ],
  // ========================================
  // CONFIGURACIÓN DEL SERVIDOR DE DESARROLLO
  // ========================================
  server: {
    // Configuración de red del servidor de desarrollo
    host: '0.0.0.0',        // Permite conexiones desde cualquier interfaz de red
                            // - '0.0.0.0' permite acceso externo (necesario para Docker/containers)
                            // - 'localhost' solo permitiría conexiones locales

    port: 5174,             // Puerto donde se ejecuta el servidor de desarrollo
                            // - Puerto no estándar para evitar conflictos con otras aplicaciones
                            // - Debe coincidir con la configuración del backend/API

    strictPort: true,       // Falla si el puerto está ocupado en lugar de usar uno alternativo
                            // - Garantiza consistencia en entornos de desarrollo
                            // - Evita problemas de configuración inesperados

    // Configuración de Hot Module Replacement (HMR)
    hmr: {
      port: 5174,           // Puerto específico para WebSocket de HMR
                            // - Separado del puerto principal para mejor rendimiento
                            // - Permite actualizaciones en tiempo real del código
    },

    // Hosts permitidos para conexiones HMR (seguridad)
    allowedHosts: [
      'localhost',          // Dominio local estándar
      '127.0.0.1',          // Dirección IP local (IPv4)
      'www.ifap-edu.uk',    // Dominio de producción principal
      'api.ifap-edu.uk'     // Dominio de la API en producción
    ],
    // IMPORTANTE: Estos hosts deben incluir todos los dominios donde se desplegará la app
    // para evitar errores de conexión HMR en entornos de staging/producción
  },
  // ========================================
  // CONFIGURACIÓN DE CONSTRUCCIÓN (BUILD)
  // ========================================
  build: {
    // Configuración del minificador de JavaScript
    minify: 'esbuild',      // Minificación más rápida para builds consistentes
                            // - Mantiene buena compresión y reduce tiempos de build

    // Opciones de minificación con esbuild
    esbuild: {
      drop: ['console', 'debugger'], // Remueve logs y debuggers en producción
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          jitsi: ['@jitsi/react-sdk'],
        },
      },
    },

    // CONSIDERACIONES IMPORTANTES PARA DESARROLLADORES:
    // 1. La configuración actual está optimizada para producción
    // 2. En desarrollo, los console.logs se mantienen para debugging
    // 3. El puerto 5174 debe estar abierto y disponible
    // 4. Los allowedHosts deben incluir todos los dominios de despliegue
    // 5. La compresión gzip reduce el tamaño de archivos hasta en un 70%
  },
})
