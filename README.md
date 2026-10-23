# Frontend IDI - Gestión y Calidad de la Investigación (UNT)

Aplicación web desarrollada para la gestión, seguimiento y control de calidad de la producción científica, desarrollo e innovación (I+D+i) en la Universidad Nacional de Trujillo (UNT).

## 🚀 Tecnologías Principales

- **React 19**
- **Vite** como entorno de desarrollo y empaquetador
- **Tailwind CSS** para estilos y diseño responsivo
- **React Router Dom (v7)** para enrutamiento SPA
- **Axios** para consumo de APIs REST con interceptores JWT
- **Recharts** para gráficos estadísticos y visualización de datos
- **Lucide React** para iconografía moderna
- **Vitest & React Testing Library** para pruebas unitarias y de integración

## 📋 Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **npm** o **pnpm**
- Backend [backend_IDI](https://github.com/Roberth1982Trujillo/backend_IDI.git) ejecutándose en `http://localhost:8088`

## ⚙️ Instalación y Configuración

1. Instalar las dependencias:
   ```bash
   npm install
   ```

2. Configuración del proxy de desarrollo:
   En `vite.config.js`, las peticiones `/api` se redirigen automáticamente a `http://localhost:8088`:
   ```javascript
   server: {
     port: 3000,
     proxy: {
       '/api': {
         target: 'http://localhost:8088',
         changeOrigin: true,
       }
     }
   }
   ```

## 🛠️ Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo en `http://localhost:3000`.
- **`npm run build`**: Genera el bundle optimizado para producción en la carpeta `dist`.
- **`npm run test`**: Ejecuta la suite de pruebas unitarias con Vitest.
- **`npm run preview`**: Previsualiza la compilación de producción localmente.
- **`npm run lint`**: Ejecuta el análisis de código estático con Oxlint.

## 👥 Módulos por Rol

- **Portal de Acceso / Login:** Autenticación unificada basada en JWT y redirección automática según rol.
- **Módulo Docente:**
  - Identificación y perfil docente.
  - Registro de producciones (artículos, ponencias, libros, patentes, proyectos).
  - Carga y visualización de archivos de evidencias (PDF).
  - Listado y seguimiento de producciones registradas.
- **Módulo Directivo:**
  - Tablero de control de indicadores I+D+i.
  - Matriz cruzada de evaluación por facultades y líneas de investigación.
  - Exportación de reportes en formatos Excel y PDF.
- **Módulo Administrador:**
  - Administración de catálogo docente y usuarios.
  - Mantenimiento de catálogos institucionales (Facultades, Escuelas, ODS, Líneas UNT, Áreas Concytec).
