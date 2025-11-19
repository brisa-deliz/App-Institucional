# Seguimiento Académico - Demo monolítico

Pequeña aplicación demo para gestionar estudiantes, materias y calificaciones,
con análisis simple para detectar estudiantes en riesgo.

## Requisitos
- Node.js >= 16
- npm

## Instalación y ejecución
1. Clona el repositorio o pega los archivos.
2. `npm install`
3. `npm start`
4. Abre `http://localhost:3000` en tu navegador.

La aplicación usa SQLite (archivo `data.db`) creado automáticamente.

## Extensiones sugeridas
- Agregar autenticación (JWT / sesiones).
- Exportar reportes en PDF.
- Migrar a Postgres si la base de datos crece.
- Desacoplar módulo de análisis en microservicio Python para ML.
