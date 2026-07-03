# Feature Specification: Módulo de Campañas de WhatsApp

**Feature Branch**: `[005-campanas-whatsapp]`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir el módulo de campañas de WhatsApp. - Segmentación por tour de interés previo, estado en pipeline, canal de origen, fecha de último contacto. - Envío a listas externas (contactos que Panoramex ya tiene fuera del CRM, ej. en Excel) además de los segmentos generados desde el CRM. - Uso de plantillas pre-aprobadas de Meta para todo envío masivo. - Automatización de cumpleaños: mensaje con oferta de descuento disparado automáticamente según la fecha de nacimiento registrada del prospecto. - Encuesta de satisfacción post-tour con 2-3 preguntas vía botones de WhatsApp, cuyo resultado se guarda y se refleja en Analytics. - Métricas por campaña: enviados, leídos, respondidos, conversiones. - Límite de envíos respetando políticas anti-spam de Meta."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Creación y Envío de Campaña Segmentada (Priority: P1)

Como agente de ventas, quiero crear una campaña de WhatsApp seleccionando prospectos en el CRM basados en su tour de interés y última fecha de contacto, usando una plantilla pre-aprobada por Meta, para reenganchar clientes inactivos.

**Why this priority**: Es la funcionalidad principal (core) para explotar la base de datos de prospectos y generar más ventas de forma masiva.

**Independent Test**: Se puede probar creando un segmento con criterios específicos, seleccionando una plantilla válida, y verificando que los mensajes se envían (y se controlan por throttling) solo a los prospectos que cumplen la condición.

**Acceptance Scenarios**:

1. **Given** un segmento de 500 prospectos y una plantilla aprobada, **When** el agente inicia la campaña, **Then** el sistema encola los 500 mensajes, los envía respetando el límite de Meta (throttling), y los marca en las métricas de la campaña.
2. **Given** que el usuario selecciona una plantilla, **When** intenta enviar la campaña, **Then** el sistema requiere que se llenen las variables dinámicas (si aplica) antes de permitir el envío.

---

### User Story 2 - Envío a Listas Externas (Priority: P1)

Como administrador, quiero importar un archivo externo (ej. Excel/CSV) con números de teléfono que no están en el CRM, para incluirlos en una campaña de difusión junto con o aparte de mis prospectos actuales.

**Why this priority**: Panoramex posee bases de datos históricas que necesitan ser contactadas sin saturar el CRM con perfiles vacíos de antemano.

**Independent Test**: Cargar un CSV con números válidos e inválidos. El sistema debe validar el formato, ignorar los inválidos, y permitir el envío de la plantilla a los números válidos.

**Acceptance Scenarios**:

1. **Given** un archivo con 50 contactos, **When** el administrador lo sube a una campaña, **Then** el sistema lo procesa y añade esos números a la lista de destinatarios.
2. **Given** que un contacto externo responde a la campaña, **Then** el sistema lo convierte automáticamente en un 'Prospecto' en el CRM con estado "Nuevo" y el origen etiquetado con la campaña correspondiente, permitiendo su seguimiento inmediato.

---

### User Story 3 - Automatización de Cumpleaños (Priority: P2)

Como administrador, quiero que el sistema dispare automáticamente un mensaje de cumpleaños (con descuento) a los prospectos cuando sea su fecha de nacimiento, para fidelizar clientes.

**Why this priority**: Genera ventas pasivas constantes y mejora la relación con el cliente sin esfuerzo operativo.

**Independent Test**: El sistema lee los prospectos cuya fecha de nacimiento coincide con hoy, y encola la plantilla de cumpleaños.

**Acceptance Scenarios**:

1. **Given** que hoy es el cumpleaños de 3 prospectos, **When** corre el proceso diario, **Then** se envían los 3 mensajes de felicitación automáticamente usando la plantilla configurada.
2. **Given** un nuevo prospecto en el CRM, **When** el agente registra sus datos, **Then** puede introducir su fecha de nacimiento.

---

### User Story 4 - Encuesta de Satisfacción Post-Tour (Priority: P2)

Como administrador, quiero enviar automáticamente una encuesta de satisfacción (botones de WhatsApp) al finalizar el tour de un cliente, para medir el Net Promoter Score o la calidad del servicio.

**Why this priority**: Fundamental para el control de calidad de los operadores de Panoramex.

**Independent Test**: Crear una reserva para hoy. Al día siguiente (o al terminar el horario del tour), el sistema envía la encuesta al cliente, procesa la respuesta del botón y la guarda en la base de datos.

**Acceptance Scenarios**:

1. **Given** una reserva confirmada cuyo `service_date` ya pasó, **When** el sistema detecta que el tour ha concluido, **Then** dispara la plantilla de encuesta con opciones de respuesta rápida (botones).
2. **Given** que un cliente recibe la encuesta, **When** presiona un botón (ej. "5 Estrellas"), **Then** el sistema registra el valor y lo refleja en la analítica del dashboard.

---

### User Story 5 - Monitoreo de Métricas por Campaña (Priority: P3)

Como gerente, quiero ver las estadísticas (enviados, leídos, respondidos, conversiones) de cada campaña, para evaluar su rendimiento y el retorno de inversión.

**Why this priority**: Necesario para tomar decisiones sobre futuras campañas, aunque la operatividad de envíos (P1) es primero.

**Independent Test**: Abrir el detalle de una campaña ya enviada y observar los contadores en tiempo real reflejando los webhooks de Meta.

**Acceptance Scenarios**:

1. **Given** una campaña en curso, **When** los clientes abren el mensaje o responden, **Then** el sistema actualiza de forma automática las métricas de "leídos" y "respondidos".

---

### Edge Cases

- ¿Qué pasa si la plantilla pre-aprobada es rechazada o pausada por Meta en medio de una campaña masiva?
- ¿Cómo maneja el sistema la importación de un archivo CSV de gran tamaño (ej. 100,000 registros) sin causar un timeout en Vercel?
- ¿Qué ocurre si un prospecto que está en la campaña bloquea el número de Panoramex?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-SEC-001**: System MUST enable Row Level Security (RLS) for all new Supabase tables immediately.
- **FR-SEC-002**: System MUST NOT expose API keys in frontend code; all calls via Vercel serverless.
- **FR-PERF-001**: System MUST ensure WhatsApp webhook responds without blocking loops.
- **FR-AUD-001**: System MUST log all sensitive write operations in `audit_log`.
- **FR-CAM-001**: El sistema MUST permitir la creación de campañas combinando filtros de segmentación: `tour_of_interest`, `status`, `origin_channel`, y `last_activity_at`.
- **FR-CAM-002**: El sistema MUST permitir la carga de listas externas (CSV) y procesar los números (validación básica) para incluirlos en el público de la campaña.
- **FR-CAM-003**: El sistema MUST obligar al uso de plantillas de WhatsApp pre-aprobadas (aprobadas en Meta Business Manager) para todo envío originado por campañas.
- **FR-CAM-004**: El sistema MUST soportar un proceso automatizado (cron/background) que dispare felicitaciones diarias de cumpleaños.
- **FR-CAM-005**: El sistema MUST soportar un proceso automatizado (cron/background) que dispare encuestas post-tour a pasajeros/clientes al día siguiente de su `service_date`.
- **FR-CAM-006**: El sistema MUST recibir webhooks de Meta para contabilizar los estados (sent, delivered, read) y respuestas (texto o botones) asociadas a cada envío de la campaña.
- **FR-CAM-007**: El sistema MUST aplicar rate limiting y throttling a los envíos masivos para adherirse estrictamente a las restricciones anti-spam de la Meta Cloud API.

### Key Entities

- **Campaign**: Representa un envío masivo o flujo automatizado. Tiene nombre, estado, público objetivo (criterios), métricas (enviados, leídos, etc.) y la plantilla a usar.
- **CampaignRecipient**: Registro individual que une un número (sea prospecto o externo) con una campaña, para trazar su estado (enviado, leído, respondido).
- **Template**: Entidad de caché/espejo que guarda las plantillas configuradas en Meta para uso en la interfaz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El sistema es capaz de encolar y despachar una campaña a 5,000 contactos en menos de 10 minutos (incluyendo throttling), sin errores de timeout en Vercel.
- **SC-002**: Los webhooks de Meta actualizan las métricas de campaña ("leídos", "entregados") con una latencia visible para el usuario menor a 5 segundos.
- **SC-003**: El proceso de importación de listas externas puede manejar archivos CSV de hasta 10,000 filas sin causar caídas en el frontend.
- **SC-004**: El sistema bloquea el 100% de los intentos de enviar mensajes masivos libres (no plantillas) si la ventana de 24 horas del prospecto está cerrada.

## Assumptions

- Las plantillas (templates) se crean y aprueban previamente directamente desde el Meta Business Manager; el CRM solo las consulta (hace sync) o las selecciona, pero no las crea.
- Vercel Cron Jobs será la herramienta utilizada para orquestar la revisión diaria de cumpleaños y encuestas post-tour.
- Para las métricas de "conversión", se asume que un prospecto pasa al estado 'Convertido' o 'Reservado' dentro de una ventana de tiempo desde que se le envió la campaña.
- Los contactos externos de las listas se asumen como números válidos en formato internacional, o el sistema hará un intento simple de sanitización.
