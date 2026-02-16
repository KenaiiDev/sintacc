# Verificador de Productos para Celíacos

Una aplicación web Next.js que permite verificar si productos alimenticios son aptos para personas celíacas, consultando el Listado Integrado de Alimentos Libres de Gluten (ALG) de ANMAT.

## Características

- Búsqueda en tiempo real con debounce (500ms)
- Búsqueda multi-campo: combina marca y nombre (ej: "arcor durazno")
- Interfaz dinámica con transiciones de color orgánicas tipo "blob"
  - Verde pastel para productos APTO
  - Rojo claro para productos NO APTO
  - Azul neutro para estado inicial/búsqueda
- Búsqueda por marca, nombre de fantasía o RNPA
- Búsqueda insensible a acentos (ej: "basilico" encuentra "BASÍLICO")
- Optimización de resultados (solo campos visibles en búsquedas parciales)
- Base de datos Redis (Upstash) para búsquedas instantáneas
- Scraper automatizado con Puppeteer
- Actualización automática de datos mediante GitHub Actions

## Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Puppeteer
- **Base de datos**: Upstash Redis
- **Fuente de datos**: [ANMAT - Listado Integrado ALG](https://listadoalg.anmat.gob.ar/Home)

## Requisitos Previos

- Node.js 18+ o superior
- pnpm (gestor de paquetes)
- Cuenta en [Upstash](https://upstash.com/) para Redis

## Instalación

1. **Clonar el repositorio** (o navegar al directorio del proyecto)

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**:
   
   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Luego edita `.env` y agrega tus credenciales de Upstash Redis:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
   ```

   Para obtener estas credenciales:
   - Ve a [Upstash Console](https://console.upstash.com/)
   - Crea una nueva base de datos Redis
   - Copia la REST URL y el REST TOKEN

## Cargar Datos de ANMAT

Antes de usar la aplicación, necesitas cargar los datos de ANMAT en Redis:

```bash
pnpm scrape
```

Este proceso puede tomar varios minutos ya que descarga todos los productos del listado de ANMAT.

**Nota**: El scraper usa Puppeteer, que descargará Chrome automáticamente en la primera ejecución.

## Uso

1. **Iniciar el servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

2. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

3. **Buscar productos**:
   - Escribe el nombre del producto, marca, o número RNPA
   - La búsqueda es automática con debounce de 500ms
   - El fondo cambia de color según el resultado:
     - Verde: Producto APTO para celíacos
     - Rojo: Producto NO encontrado en el listado
     - Azul: Estado neutral (sin búsqueda)
   - Vaciar el campo de búsqueda restaura el estado neutral
   - La búsqueda ignora acentos automáticamente

## Estructura del Proyecto

```
sintacc/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts      # Endpoint para búsqueda
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página principal
├── components/
│   ├── SearchBox.tsx         # Componente de búsqueda
│   └── ResultDisplay.tsx     # Componente de resultados
├── lib/
│   ├── constants.ts          # Constantes de la aplicación
│   ├── redis.ts              # Cliente Redis y funciones helper
│   ├── scraper.ts            # Scraper de ANMAT
│   └── types.ts              # Tipos TypeScript
├── scripts/
│   └── scrape.ts             # Script de scraping
└── package.json
```

## Actualizar Datos

Para actualizar los datos de ANMAT (recomendado hacerlo periódicamente):

```bash
pnpm scrape
```

El proyecto incluye un workflow de GitHub Actions que actualiza automáticamente los datos los días 10 y 25 de cada mes.

## Despliegue

### Vercel (Recomendado)

1. Sube el proyecto a GitHub
2. Importa en [Vercel](https://vercel.com)
3. Agrega las variables de entorno en la configuración del proyecto:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Despliega

**Importante**: Después del despliegue, ejecuta el scraper una vez desde tu máquina local:
```bash
pnpm scrape
```

### GitHub Actions

El proyecto incluye un workflow configurado para actualizar automáticamente los datos:
- Frecuencia: Días 10 y 25 de cada mes
- Hora: 3:00 AM UTC

Para activarlo, configura los secrets en GitHub:
1. Ve a Settings → Secrets and variables → Actions
2. Agrega `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

## Consideraciones

- **Puppeteer en producción**: El scraping se ejecuta desde GitHub Actions, no desde Vercel
- **Tiempo de scraping**: El proceso completo puede tomar 5-10 minutos dependiendo de la cantidad de productos
- **Rate limiting**: El scraper respeta los tiempos de carga de la página de ANMAT

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Créditos

- Datos proporcionados por [ANMAT](https://www.argentina.gob.ar/anmat)
- Listado oficial: [Listado Integrado ALG](https://listadoalg.anmat.gob.ar/Home)

---

**Nota**: Esta aplicación es una herramienta de consulta. Siempre verifica el símbolo oficial de "Libre de Gluten" en el empaque del producto.
