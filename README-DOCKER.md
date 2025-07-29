# Despliegue con Docker - PageSpeed Analyzer

Este documento explica cómo desplegar la aplicación PageSpeed Analyzer usando Docker en tu entorno local.

## Requisitos Previos

- Docker instalado en tu sistema
- Docker Compose instalado en tu sistema
- Al menos 2GB de RAM disponible

## Configuración Rápida

### 1. Construir y ejecutar con Docker Compose (Recomendado)

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener todos los servicios
docker-compose down
```

### 2. Acceder a la aplicación

Una vez que los contenedores estén ejecutándose:
- Aplicación web: http://localhost:5000
- Base de datos PostgreSQL: localhost:5432

### 3. Verificar el estado

```bash
# Ver contenedores ejecutándose
docker ps

# Ver logs de la aplicación
docker-compose logs app

# Ver logs de la base de datos
docker-compose logs postgres
```

## Construcción Manual

Si prefieres construir y ejecutar los contenedores manualmente:

### 1. Construir la imagen de la aplicación

```bash
docker build -t pagespeed-analyzer .
```

### 2. Ejecutar PostgreSQL

```bash
docker run -d \
  --name pagespeed_postgres \
  -e POSTGRES_USER=pagespeed_user \
  -e POSTGRES_PASSWORD=pagespeed_pass \
  -e POSTGRES_DB=pagespeed_db \
  -p 5432:5432 \
  postgres:15-alpine
```

### 3. Ejecutar la aplicación

```bash
docker run -d \
  --name pagespeed_app \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://pagespeed_user:pagespeed_pass@host.docker.internal:5432/pagespeed_db \
  --link pagespeed_postgres:postgres \
  pagespeed-analyzer
```

## Variables de Entorno

La aplicación utiliza las siguientes variables de entorno:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://pagespeed_user:pagespeed_pass@postgres:5432/pagespeed_db` |
| `PGHOST` | Host de PostgreSQL | `postgres` |
| `PGPORT` | Puerto de PostgreSQL | `5432` |
| `PGUSER` | Usuario de PostgreSQL | `pagespeed_user` |
| `PGPASSWORD` | Contraseña de PostgreSQL | `pagespeed_pass` |
| `PGDATABASE` | Nombre de la base de datos | `pagespeed_db` |

## Estructura de los Contenedores

### Contenedor de la aplicación (`app`)
- **Base**: Node.js 20 Alpine
- **Puerto**: 5000
- **Características**:
  - Ruby instalado para el agente de análisis backend
  - Aplicación compilada y optimizada para producción
  - Usuario no-root para seguridad

### Contenedor de la base de datos (`postgres`)
- **Base**: PostgreSQL 15 Alpine
- **Puerto**: 5432
- **Características**:
  - Datos persistentes en volumen Docker
  - Script de inicialización incluido
  - Health check configurado

## Resolución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar conectividad a la base de datos
docker-compose exec app ping postgres
```

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps postgres

# Verificar logs de PostgreSQL
docker-compose logs postgres

# Reiniciar servicios
docker-compose restart
```

### Puerto ya en uso
```bash
# Verificar qué proceso usa el puerto 5000
lsof -i :5000

# Cambiar el puerto en docker-compose.yml si es necesario
# ports:
#   - "3000:5000"  # Usar puerto 3000 en el host
```

### Limpiar datos y reiniciar
```bash
# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Limpiar imágenes no utilizadas
docker system prune -f

# Reconstruir desde cero
docker-compose up --build
```

## Comandos Útiles

```bash
# Conectarse al contenedor de la aplicación
docker-compose exec app sh

# Conectarse a PostgreSQL
docker-compose exec postgres psql -U pagespeed_user -d pagespeed_db

# Ver uso de recursos
docker stats

# Hacer backup de la base de datos
docker-compose exec postgres pg_dump -U pagespeed_user pagespeed_db > backup.sql

# Restaurar backup
cat backup.sql | docker-compose exec -T postgres psql -U pagespeed_user -d pagespeed_db
```

## Configuración de Producción

Para un entorno de producción, considera:

1. **Usar un registro de imágenes**:
   ```bash
   docker tag pagespeed-analyzer your-registry/pagespeed-analyzer:latest
   docker push your-registry/pagespeed-analyzer:latest
   ```

2. **Configurar variables de entorno seguras**:
   - Crear archivo `.env` con credenciales seguras
   - Usar Docker secrets en Docker Swarm

3. **Configurar reverse proxy** (Nginx, Traefik):
   ```bash
   # Ejemplo con Nginx
   location / {
       proxy_pass http://localhost:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

4. **Configurar monitoreo y logs**:
   - Usar drivers de logging de Docker
   - Configurar health checks
   - Implementar métricas con Prometheus

## Notas Importantes

- El agente Ruby está incluido y funcionará automáticamente
- La base de datos se inicializa automáticamente en el primer arranque
- Los datos de PostgreSQL se persisten en un volumen Docker
- La aplicación está configurada para ejecutarse en modo producción
- Todos los componentes están optimizados para un consumo mínimo de recursos