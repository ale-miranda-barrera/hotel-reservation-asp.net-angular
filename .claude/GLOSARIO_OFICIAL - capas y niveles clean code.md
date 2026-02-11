# 📚 GLOSARIO OFICIAL - CLEAN ARCHITECTURE

## 🎯 INTRODUCCIÓN

Este documento define los **términos clave** de Clean Architecture. Son palabras técnicas que tienen significado PRECISO y SIEMPRE aparecen en los mismos niveles/capas.

**La regla de oro:** Conocer estas definiciones es 80% de entender Clean Architecture.

---

## 📍 CAPAS Y NIVELES (De adentro hacia afuera)

```
NIVEL 1: CORE (El corazón - Lo que NUNCA cambia)
├─ ENTIDAD (Entity)
└─ INTERFACE (Contrato)

NIVEL 2: ORQUESTACIÓN (Lo que cambia si cambia funcionalidad)
├─ SERVICIO (Service)
└─ DTO (Data Transfer Object)

NIVEL 3: TÉCNICA (Lo que cambia si cambias de BD)
└─ REPOSITORIO (Repository)

NIVEL 4: EXPOSICIÓN (Lo que cambia si cambias de API)
├─ CONTROLADOR (Controller)
└─ RUTAS (Routes)
```

---

## 🔴 NIVEL 1: CORE - ENTIDAD (Entity)

### Definición oficial:

**Una Entidad es una clase que representa un concepto del negocio.**

- Contiene **solo datos** (propiedades) y **lógica pura** (métodos sin efectos secundarios)
- NO depende de nada externo
- Sus métodos son **puros** (misma entrada = misma salida siempre)
- Es **independiente del framework**
- Vive en: **Domain/Entities/**

### Características:

```
✅ SÍ tiene:
   - Propiedades (Id, Name, Email, etc)
   - Métodos puros (IsValid(), Calculate(), etc)
   - Relaciones con otras entidades (1:N, N:N)

❌ NO tiene:
   - Imports de base de datos (DbContext)
   - Imports de HTTP (HttpClient)
   - Imports de frameworks externos
   - Métodos que hacen IO (lectura/escritura)
   - Logging directo (Console.WriteLine)
```

### Ejemplo en tu proyecto:

```csharp
// Domain/Entities/Reservation.cs
public class Reservation
{
    // PROPIEDADES (datos puros)
    public int Id { get; set; }
    public int HotelId { get; set; }
    public string GuestName { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public decimal TotalPrice { get; set; }
    public ReservationStatus Status { get; set; }
    
    // MÉTODOS PUROS (lógica sin efectos secundarios)
    public bool IsValidReservation()
    {
        return CheckOutDate > CheckInDate && 
               !string.IsNullOrEmpty(GuestName);
    }
    
    public decimal CalculatePrice(decimal nightlyRate)
    {
        int nights = (CheckOutDate - CheckInDate).Days;
        return nights * nightlyRate;
    }
}
```

**¿Por qué aquí?**
- La definición de "qué es una reserva" NUNCA cambia
- Las reglas (CheckOut > CheckIn) son reglas de negocio eternas
- Si cambias de BD, el cálculo de precio no cambia

---

## 🟠 NIVEL 1: CORE - INTERFACE (Contrato)

### Definición oficial:

**Una Interface es un contrato que define QUÉ métodos deben existir, pero NO define CÓMO se implementan.**

### Diferencia Interface vs Clase Abstracta:

| Aspecto | Interface | Clase Abstracta |
|--------|-----------|-----------------|
| **Propósito** | Definir contrato (QUÉ) | Definir contrato + código común (QUÉ + CÓMO) |
| **Métodos** | Sin implementación | Con implementación |
| **Propiedades** | No las típicas | Sí, puede tener propiedades |
| **Herencia** | Múltiples interfaces | Una sola clase abstracta |
| **Uso** | "Esto DEBE tener estos métodos" | "Esto es CASI lo mismo que" |
| **Instanciación** | No se puede instanciar | No se puede instanciar |

### Ejemplo en tu proyecto:

```csharp
// Domain/Interfaces/IReservationRepository.cs
public interface IReservationRepository
{
    // ✅ Solo QUÉS (sin HOW)
    // El "qué": "Debe poder obtener por ID"
    // El "cómo": Lo define Infrastructure (PostgreSQL, MongoDB, etc)
    Task<Reservation> GetByIdAsync(int id);
    Task AddAsync(Reservation reservation);
    Task SaveChangesAsync();
}

// Infrastructure/Repositories/ReservationRepository.cs
public class ReservationRepository : IReservationRepository
{
    // Aquí viene el HOW
    public async Task<Reservation> GetByIdAsync(int id)
    {
        return await _context.Reservations.FirstOrDefaultAsync(r => r.Id == id);
    }
    
    public async Task AddAsync(Reservation reservation)
    {
        await _context.Reservations.AddAsync(reservation);
    }
    
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
```

**¿Por qué la interface en Domain?**
- Define el "contrato de acceso a datos"
- El Domain define QUÉ se necesita, no CÓMO
- La implementación específica (PostgreSQL) va en Infrastructure

**¿Por qué usar interfaces?**
```csharp
// ❌ MAL: Acoplamiento directo
public class ReservationService
{
    private PostgresRepository _repo; // Conoce la implementación
}

// ✅ BIEN: Desacoplamiento
public class ReservationService
{
    private IReservationRepository _repo; // Solo conoce el contrato
    
    // Puedo pasar PostgresRepository, MongoDbRepository, MockRepository
    // Sin cambiar el código
}
```

---

## 🟢 NIVEL 2: SERVICIO (Service)

### Definición oficial:

**Un Servicio es una clase que orquesta flujos de negocio. Toma decisiones, coordinaempresa diferentes partes, implementa casos de uso.**

### Características:

```
✅ SÍ tiene:
   - Métodos que orquestan (si esto, luego esto, luego esto)
   - Casos de uso (CreateReservation, CancelReservation, etc)
   - Validaciones complejas (que requieren repositorio)
   - Inyección de dependencias
   - Logging y manejo de errores

❌ NO tiene:
   - Acceso directo a BD (usa repositorio)
   - Métodos triviales (una línea)
   - Lógica pura (eso es Domain)
   - Exposición HTTP (eso es Controller)
```

### El Servicio es el "DIRECTOR DE ORQUESTA"

```csharp
// Application/Services/ReservationService.cs
public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IHotelRepository _hotelRepository;
    
    public async Task<ReservationDto> CreateReservationAsync(
        CreateReservationDto dto)
    {
        // PASO 1: Orquestar
        // "Si voy a crear una reserva, primero debo verificar que el hotel existe"
        var hotel = await _hotelRepository.GetByIdAsync(dto.HotelId);
        if (hotel == null)
            throw new InvalidOperationException("Hotel no existe");
        
        // PASO 2: Usar lógica pura de Domain
        // "Una reserva debe cumplir estas reglas"
        var reservation = new Reservation { ... };
        if (!reservation.IsValidReservation())
            throw new InvalidOperationException("Datos inválidos");
        
        // PASO 3: Calcular (Domain)
        reservation.TotalPrice = reservation.CalculatePrice(100m);
        
        // PASO 4: Persistir (Infrastructure)
        await _reservationRepository.AddAsync(reservation);
        await _reservationRepository.SaveChangesAsync();
        
        // PASO 5: Retornar en formato seguro
        return new ReservationDto { ... };
    }
}
```

**¿Por qué es importante?**
- La **lógica de flujo** está en UN lugar (reutilizable)
- Si necesitas crear 100 reservas en batch, reutilizas este método
- Si cambias el flujo (nuevo paso), solo cambias aquí

---

## 🔵 NIVEL 2: DTO (Data Transfer Object)

### Definición oficial:

**Un DTO es una clase que SOLO contiene datos. Su único propósito es transportar datos entre capas.**

### Características:

```
✅ SÍ tiene:
   - Solo propiedades (sin lógica)
   - Getters y setters
   - Sin métodos complejos

❌ NO tiene:
   - Lógica de negocio
   - Métodos que hacen operaciones
   - Relaciones complejas con otras entidades
```

### ¿Por qué usar DTOs?

```csharp
// ❌ MAL: Retornar la entidad directamente
public class ReservationService
{
    public Reservation CreateReservation(CreateReservationDto dto)
    {
        var reservation = new Reservation { ... };
        return reservation; // Expone TODOS los detalles internos
    }
}

// ✅ BIEN: Retornar un DTO
public class ReservationService
{
    public ReservationDto CreateReservation(CreateReservationDto dto)
    {
        var reservation = new Reservation { ... };
        return new ReservationDto
        {
            Id = reservation.Id,
            GuestName = reservation.GuestName,
            Status = reservation.Status.ToString(),
            TotalPrice = reservation.TotalPrice
            // NO exponemos la propiedad Hotel, createdAt, etc
        };
    }
}
```

**Beneficios:**
1. **Seguridad:** No exponemos detalles internos
2. **Desacoplamiento:** El cliente no depende de la estructura interna
3. **Flexibilidad:** Puedo cambiar la entidad sin romper el cliente

---

## 💜 NIVEL 3: REPOSITORIO (Repository)

### Definición oficial:

**Un Repositorio es una clase que abstrae CÓMO se accede a los datos. Implementa la persistencia.**

### Características:

```
✅ SÍ tiene:
   - Acceso a la base de datos
   - Métodos CRUD (Create, Read, Update, Delete)
   - Inyección de DbContext
   - Queries SQL (implícitas en ORM)
   - Manejo de transacciones

❌ NO tiene:
   - Lógica de negocio (validaciones complejas)
   - Flujos (eso es Service)
   - Métodos que coordinan otras cosas
   - Exposición HTTP
```

### El Repositorio es el "GUARDIÁN DE DATOS"

```csharp
// Infrastructure/Repositories/ReservationRepository.cs
public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;
    
    // Su ÚNICO trabajo: acceso a datos
    
    public async Task<Reservation> GetByIdAsync(int id)
    {
        return await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == id);
    }
    
    public async Task AddAsync(Reservation reservation)
    {
        await _context.Reservations.AddAsync(reservation);
    }
    
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
```

**¿Por qué es importante?**
- Si cambias de PostgreSQL a MongoDB, solo cambias aquí
- El Service no sabe si usas SQL, MongoDB o un CSV
- Puedes testear Service sin BD (con mock repository)

---

## 🔴 NIVEL 4: CONTROLADOR (Controller)

### Definición oficial:

**Un Controlador es una clase que expone endpoints HTTP. Su único propósito es recibir peticiones y delegar al servicio.**

### Características:

```
✅ SÍ tiene:
   - Métodos que responden a HTTP (GET, POST, DELETE, etc)
   - Decoradores ([HttpPost], [Route], etc)
   - Conversión de excepciones a HTTP status codes
   - Validación básica de entrada

❌ NO tiene:
   - Lógica de negocio (eso es Service)
   - Acceso directo a BD (eso es Repository)
   - Métodos que cordinan cosas complejas
   - Lógica que debería estar en Service
```

### El Controlador es el "PORTERO"

```csharp
// Presentation/Controllers/ReservationsController.cs
[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _service;
    
    // ✅ Thin Controller (delegación pura)
    [HttpPost]
    public async Task<ActionResult<ReservationDto>> CreateReservation(
        [FromBody] CreateReservationDto dto)
    {
        try
        {
            // PASO 1: Validación mínima
            if (string.IsNullOrEmpty(dto.GuestName))
                return BadRequest("GuestName es requerido");
            
            // PASO 2: Delegar al servicio
            var result = await _service.CreateReservationAsync(dto);
            
            // PASO 3: Retornar respuesta HTTP
            return CreatedAtAction(nameof(GetReservation), 
                new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            // PASO 4: Mapear excepciones a HTTP status codes
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

**¿Por qué Thin Controllers?**
- El Controller NO debe tener lógica
- Si el Controller es gordo (mucho código), es sign de que hay lógica en el lugar equivocado
- Controllers son fáciles de cambiar (si cambias de REST a GraphQL, reescribes aquí)

---

## 📊 TABLA RESUMEN: DÓNDE VA CADA COSA

| Concepto | Dónde va | Por qué | Cambia si... |
|----------|----------|--------|--------------|
| **Entidad** | Domain/Entities/ | Lógica pura, sin dependencias | NUNCA |
| **Interface** | Domain/Interfaces/ | Define contrato, no implementación | NUNCA |
| **Servicio** | Application/Services/ | Orquesta flujos de negocio | Cambias el flujo |
| **DTO** | Application/DTOs/ | Transporta datos entre capas | Cambias qué expones |
| **Repositorio** | Infrastructure/Repositories/ | Abstrae acceso a datos | Cambias de BD |
| **DbContext** | Infrastructure/Data/ | Configuración ORM | Cambias de ORM |
| **Controlador** | Presentation/Controllers/ | Expone HTTP | Cambias de API (REST→GraphQL) |
| **Program.cs** | Presentation/ | Dependency Injection | Añades nuevos servicios |

---

## 🎯 FLUJO TÍPICO: UNA PETICIÓN HTTP

```
1. HTTP REQUEST
   POST /api/reservations
   { "hotelId": 1, "guestName": "Juan", ... }
   
   ↓ (llega a)
   
2. CONTROLLER (Presentation)
   ReservationsController.CreateReservation()
   ├─ Valida entrada básica
   ├─ Llama → _service.CreateReservationAsync(dto)
   └─ Mapea respuesta a HTTP
   
   ↓ (delega a)
   
3. SERVICE (Application)
   ReservationService.CreateReservationAsync()
   ├─ Verifica hotel existe (llama al repositorio)
   ├─ Crea entidad Reservation
   ├─ Valida (llama a métodos de la entidad)
   ├─ Calcula precio (llama a métodos de la entidad)
   ├─ Persiste (llama al repositorio)
   └─ Retorna DTO
   
   ↓ (usa)
   
4. DOMAIN ENTITY (Domain)
   Reservation.IsValidReservation()
   Reservation.CalculatePrice()
   ├─ Lógica pura, sin efectos secundarios
   └─ Retorna resultado
   
   ↓ (usa)
   
5. REPOSITORY (Infrastructure)
   ReservationRepository.AddAsync()
   ReservationRepository.SaveChangesAsync()
   ├─ Accede a PostgreSQL
   ├─ Ejecuta INSERT
   └─ Retorna
   
   ↓ (retorna a)
   
6. SERVICE
   Convierte Reservation → ReservationDto
   Retorna al Controller
   
   ↓ (retorna a)
   
7. CONTROLLER
   Retorna HTTP 201 Created con JSON
   
   ↓
   
8. HTTP RESPONSE
   201 Created
   { "id": 123, "guestName": "Juan", ... }
```

---

## 🔄 CAMBIOS TÍPICOS Y DÓNDE AFECTAN

### Cambio 1: "Las reservas ahora tienen un campo 'notas'"

```
Domain:        ✅ CAMBIA (agregar propiedad Notes a Reservation)
Application:   ❌ NO CAMBIA (el flujo es igual)
Infrastructure: ❌ NO CAMBIA (solo es una propiedad más en BD)
Presentation:  ⚠️ PUEDE CAMBIAR (si quieres exponer 'notes' en el DTO)
```

### Cambio 2: "Ahora usamos MongoDB en vez de PostgreSQL"

```
Domain:        ❌ NO CAMBIA
Application:   ❌ NO CAMBIA
Infrastructure: ✅ CAMBIA (toda la clase ReservationRepository es nueva)
Presentation:  ❌ NO CAMBIA
```

### Cambio 3: "El cálculo de precio ahora tiene descuento"

```
Domain:        ✅ CAMBIA (nuevo método CalculatePriceWithDiscount)
Application:   ✅ CAMBIA (usar el nuevo método)
Infrastructure: ❌ NO CAMBIA (solo guardamos un número)
Presentation:  ❌ NO CAMBIA
```

### Cambio 4: "Ahora exponemos la API en GraphQL además de REST"

```
Domain:        ❌ NO CAMBIA
Application:   ❌ NO CAMBIA
Infrastructure: ❌ NO CAMBIA
Presentation:  ✅ CAMBIA (agregamos GraphQL resolver además de REST controller)
```

---

## 💬 TRADUCCIÓN A TÉRMINOS QUE QUIZÁS CONOCES (React/Node)

| Clean Architecture | Node/Express | React |
|------------------|--------------|-------|
| **Entidad** | Data model | — (datos puros) |
| **Servicio** | Route handler / Middleware | Custom Hook |
| **Repositorio** | Database module | — (API call) |
| **Controlador** | Express route | — (no existe) |
| **DTO** | Response object | Props |
| **Interface** | Type/Interface | PropTypes |
| **Middleware** | Express middleware | — (no existe) |

---

## 📝 CHECKLIST: ¿ENTIENDO ESTOS TÉRMINOS?

- [ ] **Entidad:** Representa un concepto. Tiene lógica pura. No depende de nada.
- [ ] **Interface:** Contrato que dice QUÉ métodos deben existir, no CÓMO.
- [ ] **Servicio:** Orquesta flujos. Toma decisiones. Usa entidades y repositorios.
- [ ] **DTO:** Solo datos. Sin lógica. Para transportar entre capas.
- [ ] **Repositorio:** Abstrae acceso a datos. Implementa la persistencia.
- [ ] **Controlador:** Expone HTTP. Delega al servicio. Thin controller.
- [ ] **Interfaz vs Clase Abstracta:** Una es contrato puro, otra puede tener código.

---

## 🎓 RESPUESTA PARA ENTREVISTA

**Si te preguntan: "Explica los componentes clave de Clean Architecture"**

> "Los componentes clave son:
>
> **Entidad:** Representa un concepto del negocio con lógica pura y sin dependencias externas.
>
> **Interface:** Define contratos que especifican QUÉ métodos deben existir, permitiendo múltiples implementaciones sin acoplamiento.
>
> **Servicio:** Orquesta flujos de negocio, coordinando entidades, validaciones y llamadas a repositorios para implementar casos de uso.
>
> **DTO:** Transporta datos entre capas sin exponer detalles internos de las entidades.
>
> **Repositorio:** Abstrae el acceso a datos, permitiendo cambiar la persistencia sin afectar la lógica de negocio.
>
> **Controlador:** Expone la API HTTP, recibe peticiones, delega al servicio y mapea respuestas.
>
> La regla clave es que las dependencias siempre apuntan hacia el core (las entidades), nunca hacia afuera."

---

## 🚀 RESUMEN DE UNA FRASE

**Entidad = QUÉ es | Interface = QUÉ debe hacer | Servicio = CÓMO orquestar | Repositorio = CÓMO persistir | Controlador = CÓMO exponer | DTO = QUÉ retornar**

---

**Creado:** 2026-02-10  
**Versión:** 1.0 - Definiciones oficiales  
**Estado:** ✅ Referencia completa
