# Feature Specification: Chatbot IA Multicanal

**Feature Branch**: `003-ai-chatbot-multicanal`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir el chatbot de IA multicanal (WhatsApp, y preparado para Messenger e Instagram) usando la API de OpenAI que califica prospectos automáticamente para Panoramex."

## Clarifications

### Session 2026-07-03
- Q: Manejo de Opt-Out y Cancelaciones (Compliance) → A: Pausar bot, notificar al agente para que un humano intente salvar la conversión manualmente.
- Q: Estrategia de Rate Limiting y Anti-Spam → A: Pausar envío, encolar los mensajes salientes y reintentar con backoff exponencial.
- Q: Re-enganche en el límite exacto de la ventana de 24 horas → A: Usar un margen de seguridad de 5 minutos (si pasaron 23h 55m, usar plantilla).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Flujo de Calificación Automática por Tour (Priority: P1)

Un prospecto envía un mensaje de WhatsApp (orgánico o desde un anuncio Click-to-WhatsApp) y el chatbot inicia un flujo de conversación personalizado según el tour anunciado. El bot pregunta fecha deseada, número de personas y nombre completo usando botones de respuesta rápida (máximo 3 opciones por mensaje). Al completar las preguntas, el prospecto recibe el flyer/imagen del tour correspondiente y queda registrado en el CRM con semáforo verde (flujo completo) y canal de origen identificado.

**Why this priority**: Sin la calificación automática no hay propuesta de valor. El 80% del volumen de prospectos de Panoramex entra por WhatsApp. Automatizar la captura de datos y la entrega del flyer es el corazón del producto.

**Independent Test**: Se puede probar enviando un mensaje de WhatsApp al número configurado y verificando que el bot responde con el flujo completo del tour, registra al prospecto en la tabla `prospects` con semáforo verde, y envía la imagen del flyer.

**Acceptance Scenarios**:

1. **Given** un prospecto envía un mensaje desde un anuncio del Tren José Cuervo, **When** el webhook recibe el mensaje y detecta el tour, **Then** el bot inicia el flujo de calificación del Tren José Cuervo con botones de respuesta rápida.
2. **Given** el prospecto completa todas las preguntas de calificación (fecha, personas, nombre), **When** el bot recibe la última respuesta, **Then** envía la imagen del flyer del tour, registra el prospecto en el CRM con estado "Calificado" y semáforo verde, y asigna un agente mediante round-robin.
3. **Given** un prospecto llega desde WhatsApp orgánico sin contexto de tour, **When** el webhook recibe el mensaje, **Then** el bot presenta un menú con los 5 tours disponibles usando botones de respuesta rápida para que el prospecto elija.
4. **Given** un prospecto envía una imagen, sticker o audio en lugar de texto, **When** el webhook recibe el mensaje, **Then** el bot responde amablemente pidiendo que use texto o botones.

---

### User Story 2 - Sistema de Semáforo y Re-enganche Automático (Priority: P2)

El sistema asigna automáticamente un semáforo al prospecto según su progreso en el flujo de conversación. Cuando un prospecto abandona el flujo a mitad (semáforo amarillo), el sistema programa mensajes de re-enganche automáticos a las 3 horas y 24 horas. Si no hay respuesta después de 24 horas, el prospecto pasa a semáforo rojo y entra a una lista fría para reactivación a los 7 días.

**Why this priority**: El re-enganche recupera entre el 15% y 25% de prospectos abandonados. Sin este sistema, los prospectos incompletos se pierden silenciosamente.

**Independent Test**: Se puede probar iniciando un flujo de calificación, abandonándolo a la mitad, y verificando que el bot envía mensajes de re-enganche a las 3h y 24h, respetando la ventana de 24h de Meta.

**Acceptance Scenarios**:

1. **Given** un prospecto responde 1 de 3 preguntas y deja de responder, **When** pasan 3 horas desde el último mensaje, **Then** el sistema envía un mensaje de re-enganche con texto amigable y el bot continúa desde donde se quedó.
2. **Given** un prospecto no responde al re-enganche de 3 horas, **When** pasan 24 horas desde el primer mensaje del prospecto, **Then** el sistema envía un segundo re-enganche usando una plantilla pre-aprobada por Meta (porque la ventana de 24h ya expiró).
3. **Given** un prospecto no responde a ninguno de los re-enganches, **When** pasan 7 días desde el último intento, **Then** el sistema envía un mensaje de reactivación con plantilla pre-aprobada y el prospecto permanece en semáforo rojo.
4. **Given** un prospecto con semáforo amarillo responde al re-enganche, **When** el bot recibe el mensaje, **Then** el flujo de calificación continúa desde la última pregunta contestada.

---

### User Story 3 - Envío de Contenido Multimedia (Priority: P2)

El chatbot envía imágenes (flyers de tours) y videos promocionales dentro de la conversación de WhatsApp, no solo texto. Cada tour tiene su propio set de assets multimedia que se envían en el momento adecuado del flujo.

**Why this priority**: Los flyers visuales son el principal material de venta de Panoramex. Sin multimedia, la conversación es solo texto y pierde la capacidad de "vender" visualmente.

**Independent Test**: Se puede probar completando el flujo de calificación de un tour y verificando que el bot envía la imagen del flyer correspondiente a ese tour específico.

**Acceptance Scenarios**:

1. **Given** un prospecto completa la calificación del tour Tren José Cuervo, **When** el bot envía la confirmación, **Then** incluye la imagen del flyer del Tren José Cuervo (no un flyer genérico).
2. **Given** un prospecto solicita más información sobre un tour, **When** el bot tiene un video promocional configurado para ese tour, **Then** lo envía como media message a través de la API de WhatsApp.

---

### User Story 4 - Ventana de 24 Horas de Meta (Priority: P1)

Antes de enviar cualquier mensaje saliente, el sistema verifica si el último mensaje entrante del prospecto fue hace menos de 24 horas. Si la ventana está activa, envía mensajes de texto libre. Si la ventana expiró, utiliza exclusivamente plantillas pre-aprobadas por Meta.

**Why this priority**: Violar la ventana de 24 horas de Meta causa bloqueo de la línea de WhatsApp Business. Es una restricción de cumplimiento obligatorio.

**Independent Test**: Se puede probar simulando un re-enganche donde el último mensaje del prospecto fue hace más de 24 horas y verificando que el sistema usa una plantilla pre-aprobada en vez de texto libre.

**Acceptance Scenarios**:

1. **Given** un prospecto envió su último mensaje hace 2 horas, **When** el bot necesita enviar un mensaje, **Then** envía texto libre normalmente.
2. **Given** un prospecto envió su último mensaje hace 25 horas, **When** el sistema necesita enviar un re-enganche, **Then** usa una plantilla pre-aprobada por Meta con las variables correspondientes (nombre, tour).
3. **Given** no existe una plantilla pre-aprobada configurada para el tipo de mensaje requerido, **When** la ventana de 24h ha expirado, **Then** el sistema NO envía el mensaje y lo registra como fallido en la línea de tiempo del prospecto.

---

### User Story 5 - Escalación a Agente Humano (Priority: P2)

Cuando el chatbot detecta frustración, solicitudes explícitas de hablar con un humano, o temas que exceden su capacidad (precios especiales, grupos grandes, quejas), pausa el bot automáticamente en esa conversación y notifica al agente asignado.

**Why this priority**: La experiencia del prospecto se degrada rápidamente si el bot insiste cuando el usuario quiere un humano. La escalación protege la conversión.

**Independent Test**: Se puede probar enviando "quiero hablar con una persona" al bot y verificando que el bot se detiene, el agente asignado recibe una notificación, y los mensajes subsiguientes del prospecto no son respondidos por el bot.

**Acceptance Scenarios**:

1. **Given** un prospecto escribe "quiero hablar con alguien" o frases similares, **When** el sistema de detección procesa el mensaje, **Then** el bot envía un mensaje de despedida ("Un asesor te atenderá en breve"), pausa el bot para esa conversación, y notifica al agente asignado.
2. **Given** el bot ha sido pausado en una conversación, **When** el prospecto envía nuevos mensajes, **Then** el bot NO responde automáticamente y los mensajes se acumulan para que el agente los lea.
3. **Given** un prospecto expresa frustración reiterada (3+ mensajes negativos consecutivos), **When** el modelo de IA analiza el tono, **Then** el sistema escala automáticamente sin esperar a que el usuario lo pida.

---

### User Story 6 - Registro Automático de Canal de Origen (Priority: P1)

El sistema identifica y registra automáticamente de dónde viene cada prospecto: WhatsApp orgánico, Click-to-WhatsApp de Facebook Ads, Click-to-WhatsApp de Instagram Ads, o formulario web. Esta información se persiste en el perfil del prospecto en el CRM.

**Why this priority**: Sin atribución de canal, Panoramex no puede medir el ROI de sus campañas publicitarias.

**Independent Test**: Se puede probar enviando mensajes desde diferentes orígenes (orgánico, ad de Facebook, ad de Instagram) y verificando que el campo `origin_channel` del prospecto refleja la fuente correcta.

**Acceptance Scenarios**:

1. **Given** un prospecto hace clic en un anuncio Click-to-WhatsApp de Facebook, **When** el webhook recibe el primer mensaje, **Then** el sistema extrae los parámetros de referral del payload de Meta y registra el canal como "ctwa_facebook".
2. **Given** un prospecto envía un mensaje orgánico de WhatsApp, **When** el webhook recibe el mensaje sin parámetros de referral, **Then** el sistema registra el canal como "whatsapp".
3. **Given** un prospecto llega desde un formulario web que redirige a WhatsApp, **When** la URL de WhatsApp contiene un parámetro de campaña, **Then** el sistema registra el canal como "web".

---

### Edge Cases

- ¿Qué pasa cuando un prospecto ya calificado (semáforo verde) envía un nuevo mensaje? El bot debe detectar que ya fue calificado y responder con un menú de opciones: "Ver mi reserva", "Preguntar sobre otro tour", "Hablar con asesor".
- ¿Qué pasa si el webhook de Meta falla o responde lento? El sistema debe responder con HTTP 200 inmediatamente y procesar el mensaje de forma asíncrona para evitar que Meta reintente el webhook.
- ¿Qué pasa si el sistema excede los límites de envío de Meta (Rate Limit)? El bot debe pausar el envío, encolar los mensajes salientes y reintentar automáticamente usando backoff exponencial.
- ¿Qué pasa cuando llegan mensajes duplicados (Meta reintenta)? El sistema debe deduplicar por `message_id` de WhatsApp antes de procesarlos.
- ¿Qué pasa si la API de OpenAI está caída o responde con error? El sistema debe tener un flujo de fallback basado en reglas (sin IA) que capture la información mínima y notifique al agente.
- ¿Qué pasa si un prospecto envía un mensaje en un idioma diferente al español? El bot debe responder en español pero con un tono más simple, y ofrecer escalación a agente humano.
- ¿Qué pasa si Meta envía una notificación de cambio de estado del mensaje (delivered, read) en vez de un mensaje de usuario? El webhook debe procesar las notificaciones de estado sin dispararle un flujo de calificación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-SEC-001**: El sistema DEBE habilitar Row Level Security (RLS) para todas las tablas nuevas de Supabase inmediatamente.
- **FR-SEC-002**: El sistema NO DEBE exponer API keys (OpenAI, Meta Cloud API, Supabase service role) en código de frontend; todos los llamados se realizan vía funciones serverless en Vercel.
- **FR-SEC-003**: El webhook DEBE verificar la firma (`X-Hub-Signature-256`) de cada solicitud entrante de Meta usando el App Secret.
- **FR-PERF-001**: El webhook DEBE responder HTTP 200 a Meta en menos de 5 segundos; el procesamiento de mensajes se realiza de forma asíncrona.
- **FR-AUD-001**: El sistema DEBE registrar todas las operaciones sensibles (escalación a humano, cambio de semáforo, envío de plantilla) en `audit_log`.
- **FR-BOT-001**: El sistema DEBE soportar flujos de calificación diferenciados para al menos 5 tours: Tren José Cuervo, Tequila Express, City Tour, Lago de Chapala y Mazamitla.
- **FR-BOT-002**: Cada flujo de calificación DEBE recoger: fecha deseada del tour, número de personas y nombre completo del prospecto, usando botones de respuesta rápida de WhatsApp (máximo 3 opciones por mensaje).
- **FR-BOT-003**: El sistema DEBE enviar imágenes (flyers) y videos dentro de la conversación de WhatsApp, no solo mensajes de texto.
- **FR-BOT-004**: El sistema DEBE detectar frustración o solicitud explícita de agente humano y pausar el bot automáticamente para esa conversación, notificando al agente asignado.
- **FR-BOT-005**: El sistema DEBE implementar el semáforo automático: verde (flujo completo), amarillo (abandonado a mitad con re-enganche a 3h y 24h), rojo (sin respuesta, lista fría con reactivación a 7 días).
- **FR-BOT-006**: Antes de enviar un mensaje saliente, el sistema DEBE verificar el timestamp del último mensaje entrante e incluir un margen de seguridad de 5 minutos; si pasaron más de 23h 55m, DEBE usar una plantilla pre-aprobada por Meta.
- **FR-BOT-007**: El sistema DEBE detectar y registrar automáticamente el canal de origen del prospecto (WhatsApp orgánico, Click-to-WhatsApp de Facebook/Instagram Ads, web) usando los parámetros de referral de Meta.
- **FR-BOT-008**: El sistema DEBE deduplicar mensajes entrantes por `message_id` de WhatsApp para evitar procesamiento duplicado.
- **FR-BOT-012**: El sistema DEBE pausar el bot, notificar a un agente humano e inhibir futuros mensajes automáticos (opt-out) si un usuario envía la palabra "STOP" o solicita darse de baja.
- **FR-BOT-009**: El sistema DEBE asignar prospectos calificados a agentes disponibles mediante round-robin entre los agentes habilitados para ese tour.
- **FR-BOT-010**: El sistema DEBE tener un flujo de fallback basado en reglas (sin IA) cuando la API de OpenAI esté indisponible, capturando la información mínima del prospecto.
- **FR-BOT-011**: El sistema DEBE procesar correctamente las notificaciones de estado de mensaje de Meta (delivered, read, failed) sin disparar flujos de calificación.
- **FR-MULTI-001**: La arquitectura del webhook y los flujos DEBEN estar preparados para soportar Messenger e Instagram en el futuro, usando una capa de abstracción de canal.

### Key Entities

- **Conversation Session**: Representa una sesión activa de conversación entre el bot y un prospecto. Contiene el estado actual del flujo (en qué pregunta va), el tour asociado, el semáforo actual, y si el bot está activo o pausado.
- **Tour Flow Configuration**: Define las preguntas, opciones de botones, assets multimedia (flyers, videos) y textos de cada flujo de calificación por tour.
- **Re-engagement Queue**: Cola de mensajes de re-enganche programados para prospectos con semáforo amarillo, con timestamps de ejecución (3h, 24h, 7d) y estado de envío.
- **Message Template**: Plantillas pre-aprobadas por Meta para comunicación fuera de la ventana de 24 horas, con variables de personalización (nombre, tour).
- **Webhook Event**: Registro de cada evento recibido del webhook de Meta, incluyendo tipo de evento, message_id para deduplicación, y estado de procesamiento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 90% de los prospectos que inician el flujo de calificación lo completan (semáforo verde) dentro de los primeros 10 minutos de conversación.
- **SC-002**: El sistema de re-enganche recupera al menos el 15% de los prospectos con semáforo amarillo (responden al re-enganche y completan el flujo).
- **SC-003**: El tiempo promedio desde que un prospecto envía su primer mensaje hasta que es calificado y asignado a un agente es menor a 5 minutos.
- **SC-004**: El 100% de los mensajes fuera de ventana de 24h se envían usando plantillas pre-aprobadas; cero violaciones de la política de Meta.
- **SC-005**: La escalación a agente humano ocurre en menos de 30 segundos desde la detección de frustración o solicitud explícita.
- **SC-006**: El canal de origen se registra correctamente en el 100% de los prospectos entrantes.
- **SC-007**: El webhook responde HTTP 200 a Meta en menos de 3 segundos en el percentil 95.
- **SC-008**: El sistema procesa al menos 100 conversaciones simultáneas sin degradación perceptible.

## Assumptions

- Los flyers e imágenes de cada tour ya existen como archivos estáticos y serán proporcionados por el equipo de marketing de Panoramex. Se alojarán en un CDN accesible.
- La cuenta de WhatsApp Business de Panoramex ya está configurada y verificada con la Meta Cloud API. Los tokens de acceso permanente ya están generados.
- Las plantillas de mensajes para re-enganche y reactivación ya están pre-aprobadas por Meta en el panel de WhatsApp Business Manager, o se aprobarán antes del despliegue.
- El modelo de OpenAI a utilizar es GPT-4o-mini por su balance de costo y velocidad para conversaciones transaccionales.
- Los 5 tours iniciales (Tren José Cuervo, Tequila Express, City Tour, Lago de Chapala, Mazamitla) cubren el 80% del volumen de prospectos entrantes.
- La infraestructura existente de Supabase y Vercel del CRM de la fase de fundación está operativa y disponible para este módulo.
- Messenger e Instagram se integrarán en una fase posterior; esta fase solo incluye WhatsApp como canal activo pero la arquitectura debe soportar los otros canales.
