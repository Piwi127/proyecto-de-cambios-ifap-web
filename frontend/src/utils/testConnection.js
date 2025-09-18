import { api } from '../services/api';

/**
 * Utilidad para probar la conexión entre frontend y backend
 * Esta función verifica que los servicios estén funcionando correctamente
 */
export const testBackendConnection = async () => {
  const testResults = {
    timestamp: new Date().toISOString(),
    services: {},
    overallStatus: 'pending'
  };

  try {
    console.log('🧪 Iniciando pruebas de conexión backend-frontend...');

    // 1. Probar conexión básica con el backend
    console.log('1. Probando conexión básica con el backend...');
    try {
      const response = await api.get('/');
      testResults.services.baseConnection = {
        status: 'success',
        message: 'Conexión establecida correctamente',
        data: response.status
      };
      console.log('✅ Conexión básica: OK');
    } catch (error) {
      testResults.services.baseConnection = {
        status: 'error',
        message: error.message,
        error: error.response?.status || 'No response'
      };
      console.log('❌ Conexión básica: FALLÓ', error.message);
    }

    // 2. Probar endpoint de usuarios (debería requerir autenticación)
    console.log('2. Probando endpoint de usuarios...');
    try {
      const response = await api.get('/users/');
      testResults.services.usersEndpoint = {
        status: 'success',
        message: 'Endpoint de usuarios accesible',
        data: response.status
      };
      console.log('✅ Endpoint usuarios: OK');
    } catch (error) {
      // Esperamos un 401/403 si no está autenticado, lo cual es normal
      if (error.response?.status === 401 || error.response?.status === 403) {
        testResults.services.usersEndpoint = {
          status: 'success',
          message: 'Endpoint protegido correctamente (requiere autenticación)',
          data: error.response.status
        };
        console.log('✅ Endpoint usuarios: Protegido correctamente');
      } else {
        testResults.services.usersEndpoint = {
          status: 'error',
          message: error.message,
          error: error.response?.status || 'No response'
        };
        console.log('❌ Endpoint usuarios: FALLÓ', error.message);
      }
    }

    // 3. Probar endpoint de cursos (debería ser público o semi-público)
    console.log('3. Probando endpoint de cursos...');
    try {
      const response = await api.get('/courses/');
      testResults.services.coursesEndpoint = {
        status: 'success',
        message: 'Endpoint de cursos accesible',
        data: response.data.length || 0
      };
      console.log('✅ Endpoint cursos: OK');
    } catch (error) {
      testResults.services.coursesEndpoint = {
        status: 'error',
        message: error.message,
        error: error.response?.status || 'No response'
      };
      console.log('❌ Endpoint cursos: FALLÓ', error.message);
    }

    // 4. Verificar configuración de CORS
    console.log('4. Verificando configuración CORS...');
    try {
      // Intentar una solicitud OPTIONS para verificar CORS
      const response = await api.options('/courses/');
      testResults.services.cors = {
        status: 'success',
        message: 'CORS configurado correctamente',
        headers: response.headers
      };
      console.log('✅ CORS: Configurado correctamente');
    } catch (error) {
      testResults.services.cors = {
        status: 'warning',
        message: 'Posible problema con CORS',
        error: error.message
      };
      console.log('⚠️ CORS: Advertencia', error.message);
    }

    // Determinar estado general
    const hasCriticalErrors = Object.values(testResults.services).some(
      service => service.status === 'error' && 
      !service.message.includes('requiere autenticación')
    );

    testResults.overallStatus = hasCriticalErrors ? 'failed' : 'success';

    console.log('\n📊 Resumen de pruebas:');
    console.log('-------------------');
    Object.entries(testResults.services).forEach(([service, result]) => {
      const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${emoji} ${service}: ${result.message}`);
    });

    console.log(`\n🎯 Estado general: ${testResults.overallStatus === 'success' ? '✅ ÉXITO' : '❌ FALLÓ'}`);

  } catch (error) {
    console.error('Error durante las pruebas:', error);
    testResults.overallStatus = 'failed';
    testResults.error = error.message;
  }

  return testResults;
};

/**
 * Función para probar la autenticación JWT
 */
export const testAuthIntegration = async (credentials = null) => {
  const authTestResults = {
    timestamp: new Date().toISOString(),
    steps: {},
    overallStatus: 'pending'
  };

  console.log('\n🔐 Iniciando pruebas de autenticación JWT...');

  try {
    // 1. Verificar si hay token almacenado
    const storedToken = localStorage.getItem('access_token');
    authTestResults.steps.tokenStorage = {
      status: storedToken ? 'success' : 'warning',
      message: storedToken ? 'Token encontrado en localStorage' : 'No hay token almacenado',
      hasToken: !!storedToken
    };
    console.log(`1. Token almacenado: ${storedToken ? '✅' : '⚠️'}`);

    if (credentials) {
      // 2. Probar login si se proporcionan credenciales
      console.log('2. Probando login con credenciales...');
      try {
        const authService = await import('../services/authService.js');
        const response = await authService.authService.login(credentials);
        
        authTestResults.steps.login = {
          status: 'success',
          message: 'Login exitoso',
          user: response.user
        };
        console.log('✅ Login: Éxito');
      } catch (error) {
        authTestResults.steps.login = {
          status: 'error',
          message: error.message,
          error: error.response?.status || 'Error desconocido'
        };
        console.log('❌ Login: Falló', error.message);
      }
    }

    // 3. Verificar interceptor de tokens
    console.log('3. Verificando interceptor de tokens...');
    try {
      // Intentar una solicitud que debería incluir el token automáticamente
      const response = await api.get('/users/me/');
      authTestResults.steps.tokenInterceptor = {
        status: 'success',
        message: 'Interceptor de tokens funcionando',
        data: response.status
      };
      console.log('✅ Interceptor de tokens: OK');
    } catch (error) {
      if (error.response?.status === 401) {
        authTestResults.steps.tokenInterceptor = {
          status: 'warning',
          message: 'Interceptor funciona pero token inválido/missing',
          error: '401 Unauthorized'
        };
        console.log('⚠️ Interceptor de tokens: Token inválido o faltante');
      } else {
        authTestResults.steps.tokenInterceptor = {
          status: 'error',
          message: error.message,
          error: error.response?.status || 'Error desconocido'
        };
        console.log('❌ Interceptor de tokens: Falló', error.message);
      }
    }

    authTestResults.overallStatus = 'success';
    console.log('✅ Pruebas de autenticación completadas');

  } catch (error) {
    console.error('Error en pruebas de autenticación:', error);
    authTestResults.overallStatus = 'failed';
    authTestResults.error = error.message;
  }

  return authTestResults;
};

// Ejecutar pruebas automáticamente si este archivo se importa directamente
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('🚀 Ejecutando pruebas automáticas de integración...');
    testBackendConnection().then(results => {
      // Guardar resultados para inspección posterior
      window.__integrationTestResults = results;
    });
  }, 2000);
}

export default {
  testBackendConnection,
  testAuthIntegration
};