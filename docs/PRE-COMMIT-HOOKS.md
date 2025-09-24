# Pre-commit Hooks - Proyecto IFAP

Este proyecto utiliza pre-commit hooks para mantener la calidad del código automáticamente antes de cada commit.

## 🚀 Instalación Rápida

```bash
# Ejecutar el script de configuración automática
./setup-precommit.sh
```

## 📋 Hooks Configurados

### Hooks Generales
- **trailing-whitespace**: Elimina espacios en blanco al final de las líneas
- **end-of-file-fixer**: Asegura que los archivos terminen con una nueva línea
- **check-yaml**: Valida sintaxis de archivos YAML
- **check-json**: Valida sintaxis de archivos JSON
- **check-merge-conflict**: Detecta marcadores de conflictos de merge
- **check-added-large-files**: Previene commits de archivos grandes (>1MB)

### Frontend (JavaScript/React)
- **ESLint**: Análisis de código JavaScript/JSX
- **Prettier**: Formateo automático de código

### Backend (Python/Django)
- **Black**: Formateo automático de código Python
- **isort**: Ordenamiento automático de imports
- **flake8**: Análisis de código Python (PEP 8)

## 🛠️ Comandos Útiles

```bash
# Ejecutar todos los hooks manualmente
pre-commit run --all-files

# Ejecutar un hook específico
pre-commit run eslint
pre-commit run black
pre-commit run flake8

# Actualizar versiones de hooks
pre-commit autoupdate

# Omitir hooks en un commit específico (NO RECOMENDADO)
git commit -m "mensaje" --no-verify
```

## 🔧 Configuración Manual

Si prefieres instalar manualmente:

1. **Instalar pre-commit**:
   ```bash
   pip install pre-commit
   ```

2. **Instalar hooks**:
   ```bash
   pre-commit install
   ```

3. **Instalar dependencias adicionales**:
   ```bash
   # Para Python
   pip install black isort flake8
   
   # Para Node.js (en directorio frontend)
   cd frontend && npm install
   ```

## 📝 Flujo de Trabajo

1. **Desarrollo normal**: Escribe código como siempre
2. **Commit**: Al hacer `git commit`, los hooks se ejecutan automáticamente
3. **Corrección automática**: Algunos hooks corrigen problemas automáticamente
4. **Revisión manual**: Si hay errores que requieren atención manual, el commit se cancela
5. **Re-commit**: Después de corregir los problemas, vuelve a hacer commit

## ⚠️ Solución de Problemas

### Error: "pre-commit command not found"
```bash
pip install pre-commit
pre-commit install
```

### Error: "npm command not found" en hooks de frontend
```bash
cd frontend
npm install
```

### Error: "black/isort/flake8 command not found"
```bash
pip install black isort flake8
```

### Omitir hooks temporalmente (solo en emergencias)
```bash
git commit -m "mensaje urgente" --no-verify
```

## 🎯 Beneficios

- ✅ **Calidad consistente**: Código formateado y sin errores básicos
- ✅ **Menos revisiones**: Problemas detectados antes del push
- ✅ **Automatización**: Sin intervención manual necesaria
- ✅ **Estándares**: Cumplimiento automático de convenciones
- ✅ **Colaboración**: Código uniforme entre desarrolladores

## 📚 Más Información

- [Documentación oficial de pre-commit](https://pre-commit.com/)
- [Guía de ESLint](https://eslint.org/docs/user-guide/)
- [Documentación de Black](https://black.readthedocs.io/)
- [Guía de flake8](https://flake8.pycqa.org/)