## Apariencia de la aplicacion - Mira el video dando click aqui:

[![Alt text](https://img.youtube.com/vi/bvdl8_eCVxE/0.jpg)](https://www.youtube.com/watch?v=bvdl8_eCVxE)
---


# 🏨 Hotel Reservation System

**Solución empresarial de gestión de reservas hoteleras para Hoteles San Bernardo (1,000+ hoteles en Colombia)**
---

## 🎯 El Problema
Hoteles San Bernardo enfrentaba serios problemas para gestionar las reservas de su sitio web. La información se confundía entre hoteles, las sedes operaban con distintos niveles de eficiencia y mantener los datos actualizados era un dolor de cabeza constante. Esto provocaba reservas mal gestionadas, errores operativos y poca visibilidad del negocio. Esta aplicación se desarrolló para unificar, ordenar y escalar la gestión de reservas en una sola plataforma confiable y mantenible.

Hoteles San Bernardo necesitaba:
- ❌ Sistema descentralizado de reservas (múltiples herramientas desconectadas)
- ❌ Dificultad para escalar operaciones entre sucursales
- ❌ Falta de integración entre datos de hoteles y reservas
- ❌ Problemas de mantenimiento por acoplamiento de código

## ✅ La Solución

Plataforma unificada con arquitectura **completamente desacoplada**, donde cada capa es independiente, reemplazable y fácil de testear.

---
# BACKEND 
## 🏗️ Arquitectura: Clean Architecture + SOLID

La aplicación se divide en **4 capas independientes** donde cada una tiene una responsabilidad única:

```
┌─────────────────────────────────────────┐
│        PRESENTACIÓN (API REST)          │ → Reemplazable: REST → GraphQL → gRPC
├─────────────────────────────────────────┤
│        APLICACIÓN (Servicios)           │ → Orquesta flujos, sin conocer detalles
├─────────────────────────────────────────┤
│       INFRAESTRUCTURA (Repositorios)    │ → Reemplazable: PostgreSQL → MongoDB
├─────────────────────────────────────────┤
│     DOMAIN (Lógica Pura - Núcleo)      │ → NUNCA cambia, completamente independiente
└─────────────────────────────────────────┘
```

### Desacoplamiento Total

- **Domain** → No depende de nada (ni frameworks, ni BD, ni HTTP)
- **Application** → Depende solo de Domain (mediante interfaces)
- **Infrastructure** → Implementa interfaces definidas por Domain
- **Presentation** → Delega toda lógica a Application

**Beneficio clave:** Cambiar de PostgreSQL a MongoDB = solo reescribir 1 clase (Repository). El resto de la aplicación no se entera.

### Escalabilidad para 1,000+ Hoteles

Esta arquitectura está diseñada para crecer:
- **1,000+ hoteles** → 100,000+ reservas/mes → Sin cambiar código de negocio
- **Migración de BD:** PostgreSQL saturado → MongoDB en horas (solo Repository cambia)
- **Escalado de servidores:** t2.micro → t3.xlarge sin refactorización
- **Nuevas features:** Agregar pagos, notificaciones, reportes sin romper existentes
- **Preparado para microservicios:** Cada capa puede ser independiente en el futuro

---

## 🔗 Patrones de Diseño & Arquitectura Limpia

### 1. **Dependency Injection (DI)**
```csharp
// ❌ Acoplado (no se puede testear)
var repo = new PostgresRepository();

// ✅ Desacoplado (inyectado, testeable)
public HotelService(IHotelRepository repository) { }
```
**Resultado:** Puedes reemplazar PostgresRepository con MockRepository en tests sin cambiar HotelService.

### 2. **Repository Pattern**
Abstrae el acceso a datos. Si necesitas cambiar de BD, implementas un nuevo Repository sin tocar la aplicación.

### 3. **DTO (Data Transfer Objects)**
No expone entidades internas. El cliente no conoce detalles de implementación.

### 4. **SOLID Principles**
- **S** - Single Responsibility: Cada clase hace una cosa
- **D** - Dependency Inversion: Depende de interfaces, no implementaciones
- **O** - Open/Closed: Abierto para extensión, cerrado para modificación

### Testabilidad Garantizada

```csharp
// Test sin tocar BD real
var mockRepo = new Mock<IHotelRepository>();
var service = new HotelService(mockRepo.Object);
var result = service.GetHotel(1);
// Assert...
```

---

## 🛠️ Stack Tecnológico

### Backend: ASP.NET Core 10
- **Por qué:** Tipo fuerte, rendimiento, DI nativo, soporte Clean Architecture
- **ORM:** Entity Framework Core → Abstracción de BD (cambiar PostgreSQL sin tocar código)
- **API:** REST con Swagger → Documentación automática

### Base de Datos: PostgreSQL en AWS RDS
- **Por qué:** Robusto, transacciones ACID, escalable
- **Ventaja:** RDS = gestionado (backups automáticos, patches, replicación)
- **Reemplazable:** Cambiar a MongoDB afecta solo Infrastructure layer

### Cloud: AWS Services
- **EC2 (t2.micro)** → Servidor API + Frontend estático
- **RDS PostgreSQL** → BD gestionada sin administración
- **Security Groups** → Firewall a nivel infraestructura

---

## 📊 Endpoints Principales

```
GET    /api/hotels              → Listar hoteles
GET    /api/hotels/{id}         → Detalle de hotel
POST   /api/hotels              → Crear hotel
PUT    /api/hotels/{id}         → Actualizar hotel
DELETE /api/hotels/{id}         → Eliminar hotel

POST   /api/reservations        → Crear reserva
GET    /api/reservations?email  → Mis reservas
DELETE /api/reservations/{id}   → Cancelar reserva
```


# FRONTEND

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


# ☁️ Infraestructura & Despliegue

La plataforma está desplegada sobre la infraestructura de AWS, utilizando servicios administrados para garantizar estabilidad, escalabilidad y facilidad de mantenimiento.

### 🔹 Entorno de Ejecución

- EC2 (Ubuntu Server) como servidor principal de la aplicación.

- Docker para contenerización completa del sistema.

- Backend y Frontend ejecutándose en el mismo servidor (configuración actual para testing).

### 🔹 Contenerización

- Aplicaciones dockerizadas (frontend y backend).

- Imágenes almacenadas en Amazon Elastic Container Registry (ECR).

- Despliegue mediante ejecución directa de imágenes desde ECR en EC2.

### 🔹 Persistencia de Datos

- AWS RDS (PostgreSQL) como base de datos principal.

- Base de datos administrada (backups, parches y alta disponibilidad).

- Comunicación segura entre EC2 y RDS.

### 🔹 Arquitectura de Despliegue

- Separación lógica entre aplicación y base de datos.

- Preparado para escalar frontend y backend de forma independiente en el futuro.

- Infraestructura lista para migrar a entornos productivos o microservicios.
