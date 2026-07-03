# Feature Specification: Catálogo de Tours y Módulo de Reservas

**Feature Branch**: `004-catalogo-reservas`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir el catálogo de tours y el módulo de reservas."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Consulta y Edición Rápida del Catálogo (Priority: P1)

Un agente con permisos de edición de catálogo (o un administrador) necesita actualizar el precio de un tour directamente desde la vista del detalle del tour, sin abrir un formulario separado ni crear un ticket de cambio. Panoramex ajusta sus precios aproximadamente dos veces al mes según temporada y demanda, por lo que la edición debe ser una acción fluida e inmediata dentro de la misma pantalla.

**Why this priority**: Los precios incorrectos generan conversiones perdidas y quejas de clientes. Es la operación más frecuente sobre el catálogo.

**Independent Test**: Un agente administrador puede ver la vista de detalle de un tour, hacer clic sobre el precio, editar el valor en el mismo lugar y confirmar el cambio. El nuevo precio queda reflejado de inmediato en la vista y queda registrado en el historial de auditoría.

**Acceptance Scenarios**:

1. **Given** que el agente tiene permiso `can_edit_catalog = true`, **When** accede al detalle de un tour y hace clic sobre el precio de una variante, **Then** el campo se vuelve editable en línea y muestra un control de confirmación.
2. **Given** que el agente edita el precio y confirma, **When** el sistema guarda el cambio, **Then** el nuevo precio se muestra inmediatamente sin recargar la página y se crea un registro en `audit_log` con el actor, el tour, la variante y los precios anterior/nuevo.
3. **Given** que un agente sin permiso `can_edit_catalog` accede al detalle del mismo tour, **When** intenta interactuar con el precio, **Then** el campo no es editable y no se muestra el control de confirmación.
4. **Given** que el sistema recibe un precio inválido (ej. negativo, no numérico), **When** el agente intenta confirmar, **Then** se muestra un error de validación en línea y el precio original se conserva.

---

### User Story 2 — Consulta de Disponibilidad y Variantes (Priority: P1)

Un agente o el propio chatbot necesita consultar la disponibilidad de un tour en una fecha específica para responder a un prospecto. La disponibilidad depende de la capacidad configurada por variante (ej. Tren José Cuervo: Express, Premium Plus, Diamante) y del número de plazas ya reservadas para esa fecha.

**Why this priority**: Sin disponibilidad en tiempo real no es posible confirmar reservas ni calificar prospectos correctamente desde el chatbot.

**Independent Test**: Se consulta la disponibilidad del Tren José Cuervo variante Express para una fecha dada y el sistema devuelve las plazas disponibles restando las ya reservadas en esa fecha.

**Acceptance Scenarios**:

1. **Given** que existe un tour con capacidad máxima 40 personas para una fecha, **When** ya hay 35 reservados, **Then** el sistema reporta 5 plazas disponibles.
2. **Given** que quedan menos plazas que el umbral de alerta de cupo mínimo configurado para ese tour, **When** cualquier agente consulta la disponibilidad, **Then** el sistema muestra una alerta visual de cupo bajo.
3. **Given** que la capacidad total está agotada para una fecha, **When** un agente consulta esa fecha, **Then** el sistema muestra el estado como "AGOTADO" y bloquea la creación de nuevas reservas para esa combinación tour+fecha+variante.

---

### User Story 3 — Registro de una Reserva (Priority: P1)

Un agente puede registrar una nueva reserva vinculada a un prospecto existente. La reserva incluye el tour, la variante, la fecha, el número y la lista de pasajeros, el monto total, el depósito recibido y el saldo pendiente.

**Why this priority**: Es el núcleo de negocio del módulo. Sin reservas el catálogo no genera valor.

**Independent Test**: Se crea una reserva para un prospecto, se registra un depósito parcial y el sistema muestra correctamente el saldo pendiente. Las plazas reservadas se descuentan del cupo disponible para esa fecha.

**Acceptance Scenarios**:

1. **Given** un prospecto existente y plazas disponibles, **When** el agente crea una reserva indicando tour, variante, fecha, número de personas y monto de depósito, **Then** la reserva queda guardada en estado "Confirmada" y el cupo disponible se reduce en consecuencia.
2. **Given** una reserva con depósito parcial, **When** el agente visualiza la reserva, **Then** el sistema muestra claramente el monto total, el depósito registrado y el saldo pendiente.
3. **Given** una reserva existente, **When** el agente agrega o edita la lista de pasajeros, **Then** los nombres quedan vinculados a la reserva y el conteo de pasajeros coincide con las plazas reservadas.
4. **Given** que el cupo para esa fecha ya está agotado, **When** el agente intenta crear una reserva, **Then** el sistema bloquea la operación y muestra el mensaje de cupo agotado.

---

### User Story 4 — Listado de Pasajeros por Tour y Fecha (Priority: P2)

Un agente o coordinador de operaciones necesita ver la lista completa de pasajeros de un tour en una fecha específica para gestionar la logística del servicio.

**Why this priority**: Necesario para operaciones, pero no bloquea el registro de reservas.

**Independent Test**: Se consulta el tour Tequila Express para una fecha dada y el sistema despliega la lista de pasajeros con nombre, número de personas por reserva y estado de pago.

**Acceptance Scenarios**:

1. **Given** un tour con múltiples reservas en una misma fecha, **When** el agente consulta el listado por tour+fecha, **Then** ve todos los pasajeros agrupados, el total de plazas ocupadas y las plazas restantes.
2. **Given** que existen reservas con saldo pendiente en la lista, **When** el agente revisa el listado, **Then** las reservas con saldo pendiente están marcadas visualmente de forma diferenciada.

---

### User Story 5 — Generación de Confirmación para el Cliente (Priority: P2)

Al confirmar una reserva, el sistema puede enviar una confirmación al cliente por WhatsApp y/o generar un documento PDF descargable que incluye el detalle de la reserva, el tour, la fecha, los pasajeros y el estado de pago.

**Why this priority**: Mejora la experiencia del cliente y reduce consultas repetitivas al agente, pero el registro de la reserva ya funciona sin esto.

**Independent Test**: Desde el detalle de una reserva, el agente activa el envío de confirmación y el cliente recibe en WhatsApp un mensaje estructurado con los datos correctos.

**Acceptance Scenarios**:

1. **Given** una reserva confirmada, **When** el agente selecciona "Enviar confirmación por WhatsApp", **Then** el cliente recibe un mensaje de WhatsApp con el nombre del tour, la fecha, número de personas y el monto del depósito registrado.
2. **Given** una reserva confirmada, **When** el agente selecciona "Descargar confirmación PDF", **Then** el navegador descarga un PDF con los mismos datos de la reserva formateados para el cliente.

---

### Edge Cases

- ¿Qué ocurre si un agente intenta reservar más plazas de las disponibles? El sistema bloquea y muestra el cupo disponible real.
- ¿Qué pasa si se reduce la capacidad de un tour para una fecha que ya tiene reservas confirmadas? El sistema advierte del conflicto y no permite reducir la capacidad por debajo de las plazas ya reservadas.
- ¿Qué ocurre si se intenta eliminar un tour que tiene reservas activas? El sistema impide la eliminación y muestra cuántas reservas activas existen.
- ¿Qué pasa si el número de pasajeros en la lista difiere del número reservado? El sistema muestra una advertencia de inconsistencia.
- ¿Qué ocurre si el chatbot consulta disponibilidad de una fecha pasada? El sistema devuelve disponibilidad cero sin error.

---

## Requirements *(mandatory)*

### Functional Requirements

**Seguridad y Gobernanza (heredados de la constitución)**

- **FR-SEC-001**: El sistema DEBE habilitar RLS en todas las tablas nuevas del catálogo y reservas desde su creación.
- **FR-SEC-002**: Ninguna clave API (Supabase service role) se expone en el frontend; toda escritura sensible pasa por funciones serverless.
- **FR-AUD-001**: Toda modificación a precios de tours DEBE registrarse en `audit_log` con actor, entidad, valor anterior y nuevo valor.
- **FR-AUD-002**: La creación, modificación de estado y cancelación de reservas DEBE registrarse en `audit_log`.

**Catálogo de Tours**

- **FR-CAT-001**: El sistema DEBE permitir definir hasta 50 tours con nombre, descripción, inclusiones y al menos una variante de precio y capacidad.
- **FR-CAT-002**: Cada tour DEBE soportar múltiples variantes (ej. Express, Premium Plus, Diamante), cada variante con su propio precio base y capacidad máxima.
- **FR-CAT-003**: El sistema DEBE permitir configurar un umbral de alerta de cupo mínimo por tour (número de plazas disponibles a partir del cual se dispara la alerta).
- **FR-CAT-004**: Los agentes con `can_edit_catalog = true` DEBEN poder editar el precio de cualquier variante directamente desde la vista de detalle del tour (edición en línea), sin formulario separado.
- **FR-CAT-005**: Los agentes sin `can_edit_catalog` DEBEN poder ver los precios pero NO editarlos; el campo permanece en modo solo lectura.
- **FR-CAT-006**: El sistema DEBE mostrar un calendario de disponibilidad por tour que indique, para cada fecha futura, las plazas disponibles por variante.
- **FR-CAT-007**: El sistema DEBE mostrar una alerta visual en el calendario cuando las plazas disponibles de una variante caigan por debajo del umbral configurado.
- **FR-CAT-008**: El sistema DEBE exponer una interfaz de consulta de disponibilidad consumible por el chatbot (fase 3) para una combinación tour+variante+fecha.

**Reservas**

- **FR-RES-001**: El sistema DEBE permitir crear una reserva vinculada a un prospecto existente en el CRM.
- **FR-RES-002**: Cada reserva DEBE registrar: tour, variante, fecha del servicio, número de personas, lista de pasajeros (nombre por pasajero), monto total, depósito recibido y saldo pendiente calculado automáticamente.
- **FR-RES-003**: El sistema DEBE decrementar las plazas disponibles de la variante+fecha correspondiente al confirmar una reserva, y restaurarlas si la reserva se cancela.
- **FR-RES-004**: El sistema DEBE impedir la creación de reservas cuando el cupo de la variante para esa fecha esté agotado.
- **FR-RES-005**: El sistema DEBE proporcionar un listado de pasajeros filtrable por tour y fecha, mostrando nombre, plazas y estado de pago por reserva.
- **FR-RES-006**: El sistema DEBE permitir al agente enviar una confirmación de reserva al cliente vía WhatsApp usando la integración existente con Meta Cloud API.
- **FR-RES-007**: El sistema DEBE permitir generar un documento de confirmación de reserva en formato PDF descargable.
- **FR-RES-008**: El sistema DEBE soportar los estados de reserva: Pendiente, Confirmada, Cancelada.

### Key Entities *(include if feature involves data)*

- **Tour**: Servicio ofrecido por Panoramex. Tiene nombre, descripción, inclusiones, imagen, estado activo/inactivo y umbral de alerta de cupo.
- **TourVariant**: Variante de un tour (ej. Express, Premium Plus). Tiene precio base, capacidad máxima y pertenece a un Tour.
- **TourAvailability**: Registro de disponibilidad para una combinación TourVariant + fecha. Deriva del total de plazas de la variante menos las plazas ya reservadas en esa fecha.
- **Reservation**: Reserva de un cliente. Vinculada a un Prospect y a una TourVariant. Contiene fecha, número de personas, monto total, depósito, saldo, lista de pasajeros y estado.
- **ReservationPassenger**: Pasajero individual dentro de una reserva. Tiene nombre completo y número de orden.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un agente con permiso de edición puede actualizar el precio de una variante de tour y ver el cambio reflejado en la interfaz en menos de 3 segundos tras confirmar.
- **SC-002**: La consulta de disponibilidad de un tour para una fecha específica devuelve el resultado correcto en menos de 2 segundos, incluso con 30 tours y 6 meses de datos de reservas.
- **SC-003**: El 100% de los cambios de precio quedan trazados en el historial de auditoría con el usuario responsable y la fecha exacta.
- **SC-004**: La creación de una reserva actualiza el cupo disponible de forma inmediata, sin inconsistencias de lectura posterior.
- **SC-005**: El chatbot puede consultar disponibilidad en tiempo real y obtener una respuesta válida en menos de 1 segundo desde la misma petición al backend.
- **SC-006**: Los agentes sin permiso de edición no pueden modificar ningún precio, ya sea por interfaz o por llamada directa a la API.

---

## Assumptions

- Los tours son gestionados internamente por los agentes; no existe un portal público de reservas para clientes finales en esta fase.
- La lista de ~30 tours se cargará manualmente en la base de datos como datos iniciales (seed); no se requiere importación masiva automatizada en esta iteración.
- El precio base de una variante es por persona. Los descuentos o paquetes grupales quedan fuera del alcance de esta especificación.
- Los pagos (cobro de depósitos) se gestionan fuera del sistema (en efectivo o transferencia); el módulo solo registra los montos, no procesa pagos en línea.
- La generación de PDF se realizará en el servidor para no exponer lógica de negocio en el cliente; el usuario descarga el archivo resultante.
- El chatbot (feature 003) consulta disponibilidad en solo lectura; no crea ni modifica reservas directamente.
- La autenticación y control de permisos por usuario reutiliza el campo `can_edit_catalog` ya definido en la tabla `agents` de la feature 001.
