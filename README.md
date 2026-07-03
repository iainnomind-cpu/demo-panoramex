# Panoramex CRM - Sistema Modular de Gestión

Un ecosistema de software modular diseñado para **Panoramex**, una operadora turística. Este sistema gestiona prospectos, tours, reservaciones, campañas y ofrece analíticas detalladas.

## 🚀 Tech Stack (Pila Tecnológica)

El proyecto está construido con herramientas modernas de desarrollo web para garantizar rendimiento, escalabilidad y una experiencia de usuario premium:

- **Framework:** [React 18](https://react.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) (Rápido HMR y empaquetado optimizado)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
- **Manejo de Estado:** [Zustand](https://zustand-demo.pmnd.rs/) (Gestión de estado global ligero y rápido)
- **Enrutamiento:** [React Router v6](https://reactrouter.com/) (Navegación del lado del cliente)
- **Gráficos:** [Recharts](https://recharts.org/) (Gráficos interactivos en Analytics y Dashboard)
- **Utilidades:** `date-fns` (Para el formato y manejo de fechas)

## 🧩 Estructura de Módulos (Arquitectura)

El sistema está dividido en 6 módulos principales interconectados:

### 1. Chat (Conversaciones)
- Interfaz para atender mensajes entrantes (simulando WhatsApp Business API).
- Vista de perfil del cliente, notas rápidas y transferencia entre agentes.

### 2. CRM Central (Prospectos)
- **Vista Kanban:** Tablero drag-and-drop (simulado) para visualizar prospectos por etapas (Nuevo, Calificado, En Proceso, Reservado, Convertido).
- **Vista de Lista:** Tabla detallada de prospectos.
- **Vista 360:** Modal interactivo con el perfil completo del cliente, línea de tiempo de interacción y acciones rápidas (llamar, correo, chatear, reservar).

### 3. Catálogo de Tours
- Visualización de la oferta turística (Ej: Tren José Cuervo, Lago de Chapala, etc.).
- Filtros por categoría (Cultural, Pueblos Mágicos, etc.).
- Botones de acción directa para "Ver Detalles" o "Reservar".

### 4. Reservaciones
- Gestión de las ventas y reservas consolidadas.
- Seguimiento de pagos y estado de confirmación.

### 5. Campañas (Marketing)
- Monitoreo del rendimiento de campañas publicitarias (Meta Ads, Google Ads).
- Métricas de ROAS, costo por lead (CPL) y alcance.

### 6. Analytics & Dashboard
- **Dashboard Ejecutivo:** Resumen principal con KPIs rápidos (Leads Hoy, Conversión, etc.), embudo de ventas y prospectos recientes.
- **Analytics Detallado:** Gráficas de rendimiento de agentes, tours más vendidos e historiales de conversión.

## 📂 Estructura de Carpetas

```text
src/
├── assets/           # Imágenes, íconos (Ej: hero.png, etc.)
├── components/       # Componentes reusables de UI
│   ├── layout/       # Sidebar, TopBar, Layout principal
│   ├── shared/       # Componentes compartidos (ProspectCard, Prospect360Modal)
│   └── ui/           # Componentes base (Button, Badge, Modal, Input, Toast)
├── data/             # Mocks de datos simulados (agentes, campañas, prospectos, etc.)
├── hooks/            # Custom React hooks (useToast, etc.)
├── pages/            # Vistas/Páginas principales (Cada módulo tiene su carpeta)
│   ├── Analytics/    
│   ├── Campaigns/    
│   ├── Conversations/
│   ├── Dashboard/    
│   ├── Prospects/    
│   ├── Reservations/ 
│   └── Tours/        
├── router/           # Configuración de React Router
├── store/            # Store global de Zustand (useAppStore.ts)
├── types/            # Definiciones de interfaces y tipos de TypeScript
├── App.tsx           # Componente raíz
└── main.tsx          # Punto de entrada de la aplicación
```

## 🛠️ Instalación y Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar el servidor de desarrollo local (Vite):
   ```bash
   npm run dev
   ```

3. Compilar para producción (Build):
   ```bash
   npm run build
   ```

## 🌐 Despliegue en Vercel

El proyecto está configurado y listo para ser desplegado en [Vercel](https://vercel.com).
Asegúrate de que la configuración de Vercel apunte a:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
