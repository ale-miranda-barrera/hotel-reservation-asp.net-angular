# 🏨 Hotel Reservation System

**Solución empresarial de gestión de reservas hoteleras para Hoteles San Bernardo (1,000+ hoteles en Colombia)**

---

## 🎯 El Problema

Hoteles San Bernardo necesitaba:
- ❌ Sistema descentralizado de reservas (múltiples herramientas desconectadas)
- ❌ Dificultad para escalar operaciones entre sucursales
- ❌ Falta de integración entre datos de hoteles y reservas
- ❌ Problemas de mantenimiento por acoplamiento de código

## ✅ La Solución

Plataforma unificada con arquitectura **completamente desacoplada**, donde cada capa es independiente, reemplazable y fácil de testear.

---

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
- **S3** → Almacenamiento de imágenes (preparado para futuro)
- **Security Groups** → Firewall a nivel infraestructura

**Filosofía:** Servicios gestionados = menos DevOps, más focus en código

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

---

## 🚀 Quick Start

```bash
# Backend
cd Backend/HotelReservationAPI.Presentation
dotnet run
# API: https://localhost:5001/swagger/index.html

# Frontend (próximamente)
cd Frontend
npm install && ng serve
```

---

## 📝 Notas

- **Backend:** Completamente funcional y deployado en AWS
- **Frontend:** En desarrollo, se integrará con API Backend  
- **Documentación técnica:** Disponible en `.docs/`

---

**Estado:** ✅ Backend funcional | 🔄 Frontend en desarrollo  
**Última actualización:** Febrero 2026
