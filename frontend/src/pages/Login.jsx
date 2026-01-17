import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password2: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si debe mostrar el formulario de registro
  useEffect(() => {
    if (location.state?.showRegister) {
      setShowRegister(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') || credentials.username || '').toString().trim();
    const password = (formData.get('password') || credentials.password || '').toString();
    if (!username || !password) {
      setLoginError('Ingresa tu usuario y contraseña.');
      return;
    }
    try {
      await login({ username, password });
      // Redirigir al aula virtual después del login exitoso
      navigate('/aula-virtual');
    } catch (error) {
      console.error('Error en login:', error);
      setLoginError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setLoginError('');
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (registerData.password !== registerData.password2) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    setRegisterLoading(true);
    try {
      await register({
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        perfil: 'alumno'
      });
      setRegisterSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setShowRegister(false);
      // Limpiar el formulario
      setRegisterData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        password2: ''
      });
    } catch (err) {
      setRegisterError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">IFAP</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Aula Virtual IFAP
          </h2>
          <p className="text-gray-600">
            Accede a tu plataforma de formación archivística
          </p>
        </div>

        {/* Formulario de login o registro */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {!showRegister ? (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario o Correo Electrónico
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={credentials.username}
                    onChange={handleChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Ingresa tu usuario o email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Recordarme
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Iniciando sesión...
                      </span>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </div>
              </form>
              {/* Botón para mostrar el registro */}
              {/* Mostrar error de login si existe */}
              {loginError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {loginError}
                </div>
              )}
              <div className="mt-6 text-center">
                <button
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                  onClick={toggleRegister}
                  type="button"
                >
                  Regístrate aquí
                </button>
              </div>
            </>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                    <input type="text" name="first_name" required value={registerData.first_name} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Nombres" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input type="text" name="last_name" required value={registerData.last_name} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Apellidos" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input type="email" name="email" required value={registerData.email} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Correo electrónico" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input type="text" name="username" required value={registerData.username} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Usuario" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input type="password" name="password" required value={registerData.password} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Contraseña" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repetir contraseña</label>
                    <input type="password" name="password2" required value={registerData.password2} onChange={handleRegisterChange} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Repetir contraseña" />
                  </div>
                </div>
                {registerError && <div className="text-red-600 text-sm">{registerError}</div>}
                {registerSuccess && <div className="text-green-600 text-sm">{registerSuccess}</div>}
                <div className="flex items-center justify-between">
                  <button type="submit" disabled={registerLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {registerLoading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>
                <div className="text-center mt-4">
                  <button type="button" className="text-blue-600 hover:text-blue-800 underline" onClick={toggleRegister}>
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Instituto de Formación Archivística del Perú © 2025
          </p>
          <p className="mt-1">
            Formando profesionales en archivística desde 2010
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
