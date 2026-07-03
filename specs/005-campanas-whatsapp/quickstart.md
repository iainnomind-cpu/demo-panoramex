# Quickstart Validation: Campañas de WhatsApp

## Requisitos Previos

- Entorno local ejecutándose (`npm run dev`).
- Base de datos Supabase con la migración `00004_campanas_encuestas.sql` aplicada.
- Plantilla de Meta pre-aprobada disponible en la cuenta del Business Manager (ej. `cumpleanos_descuento`).
- Ngrok configurado para apuntar los webhooks de Meta hacia tu `localhost:3000` si vas a probar el ciclo completo de "Leído" y "Respondido".

## Validaciones

### 1. Creación y Despacho de Campaña Masiva

1. En la UI, navega a **Campañas**.
2. Haz clic en **Nueva Campaña**.
3. Sube un archivo CSV con 2 números de prueba que controles:
   ```csv
   phone,name
   +5213312345678,Juan Perez
   +5215512345678,Maria Gomez
   ```
4. Selecciona la plantilla `hello_world` o la que tengas configurada.
5. Haz clic en **Enviar Campaña**.
6. **Expectativa**: Los mensajes llegan a tus dispositivos.
7. **Expectativa DB**: La tabla `campaign_sends` tiene 2 registros en estado `sent`.

### 2. Prueba del Cron Job de Cumpleaños

1. En Supabase (SQL Editor o UI), edita un `prospecto` y pon su `birth_date` con la fecha de hoy.
2. Abre el navegador web u Postman y haz un GET a la ruta local:
   `http://localhost:3000/api/cron/birthdays`
3. **Expectativa**: La respuesta indica `{"success": true, "sent": 1}`. El teléfono del prospecto editado recibe el mensaje de cumpleaños.

### 3. Prueba de Encuestas Post-Tour

1. Crea o usa una reserva (en `reservations`) cuya `service_date` sea la fecha de ayer.
2. Abre Postman y haz un GET a:
   `http://localhost:3000/api/cron/surveys`
3. **Expectativa**: El cliente vinculado a esa reserva recibe un mensaje de WhatsApp con botones (ej. "5 Estrellas", "3 Estrellas").
4. Simula la respuesta en WhatsApp haciendo clic en "5 Estrellas".
5. **Expectativa DB**: En la tabla `satisfaction_surveys` aparece un registro con `rating = 5` vinculado a la reserva.

### 4. Seguimiento de Métricas (Webhook)

1. Observa el estado del envío en la UI de la campaña (Debe decir `sent`).
2. Abre el mensaje en WhatsApp (marca el doble check azul).
3. **Expectativa**: El webhook local de Ngrok recibe el evento de Meta.
4. **Expectativa UI/DB**: Al refrescar, la tabla `campaign_sends` y la UI reflejan el estado `read`.
