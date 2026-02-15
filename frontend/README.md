# Sistema de Reserva de Hoteles - Frontend

Este es el frontend de la plataforma de reserva de hoteles, construido con **Angular 18+** utilizando una arquitectura modular y reactiva basada en **Signals**.

## 🏗️ Arquitectura y Estructura del Proyecto

El proyecto sigue una estructura de carpetas basada en dominios y responsabilidades claras:

```text
src/app/
├── core/              # Servicios globales, guards, y configuración (Backbone)
│   ├── services/      # Lógica de comunicación con la API (HttpClient)
│   ├── guards/        # Protección de rutas
│   └── environment.ts # Configuración de variables de entorno
├── features/          # Módulos de funcionalidad de negocio
│   ├── admin/         # Panel de administración y estadísticas
│   └── hotels/        # Listado, búsqueda y detalle de hoteles
├── shared/            # Recursos reutilizables en toda la app
│   ├── components/    # Componentes comunes (botones, modales)
│   ├── models/        # Interfaces y DTOs de TypeScript
│   └── pipes/         # Transformación de datos (moneda, fechas)
├── layout/            # Estructura visual global (Navbar, Footer, Shell)
└── app.routes.ts      # Configuración centralizada de navegación
```

## 🛠️ Componentes Principales y Funcionalidad

### 1. Panel de Administración (`Admin`)
- **Gestión de Reservas**: Visualización de reservas pendientes con capacidad de confirmar o cancelar en tiempo real.
- **Métricas Avanzadas**: Cálculo dinámico de ingresos totales y precio promedio (excluyendo cancelaciones).
- **Últimas Reservas**: Historial global y por hotel con indicadores de estado.
- **Registro de Hoteles**: Formulario modal para dar de alta nuevas propiedades.

### 2. Gestión de Hoteles (`Hotels`)
- **Explorador de Hoteles**: Lista interactiva con filtros y previsualización de precios.
- **Detalle de Hotel**: Información extendida, galería de imágenes y flujo de reserva.

## ✨ Características Destacadas

- **Angular Signals**: Gestión delegada del estado para una reactividad eficiente y minimalista.
- **Diseño Premium**: Interfaz limpia con CSS moderno, efectos de cristal (blur), degradados profesionales y layouts responsivos.
- **Feedback Proactivo**: Sistema de notificaciones (Toasts) para confirmaciones de acciones del usuario.
- **Cálculos Inteligentes**: Lógica de negocio en el frontend para procesar estadísticas de ingresos de forma precisa.

## 🚀 Tecnologías Utilizadas

- **Angular 18**: Framework principal (Standalone Components).
- **TypeScript**: Tipado estricto para modelos de datos (Hotel, Reservation).
- **Vanilla CSS**: Estilos personalizados sin dependencias externas pesadas para mayor rendimiento.
- **Reactive UI**: Uso intensivo de `computed` y `effect` para sincronización de datos.

---
*Desarrollado para ofrecer la mejor experiencia en gestión y reserva hotelera.*
