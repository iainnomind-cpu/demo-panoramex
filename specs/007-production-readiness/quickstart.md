# Quickstart & Validation Guide: Preparación para Producción

## 1. Validación de PWA (Instalación en Móvil)

**Prerequisite**: El proyecto debe estar desplegado en HTTPS o ser servido localmente a través de un túnel (e.g., ngrok) o usando `npm run preview`.

1. Abre el navegador (Chrome/Safari) en un dispositivo móvil e ingresa la URL de la aplicación web.
2. Navega a las opciones del navegador y selecciona "Agregar a la pantalla de inicio" (Add to Home Screen).
3. Cierra el navegador y verifica que un icono con el logo de Panoramex ha sido agregado a tu pantalla de inicio.
4. Abre la aplicación desde el nuevo icono; debe lanzarse sin barra de direcciones (modo standalone).

## 2. Validación de Estado de Cuenta Pausado

1. Inicia sesión en la aplicación como un usuario Administrador.
2. Navega a los Ajustes de la Organización (nuevo módulo en Settings).
3. Cambia el interruptor de "Estado de la cuenta" a **Pausado**.
4. Envía un mensaje desde WhatsApp al número del CRM de Panoramex.
5. Verifica en los logs del servidor (Vercel Log) que el webhook haya detectado la cuenta pausada y haya abortado la ejecución, y que no se haya procesado el mensaje en el CRM.
6. Intenta enviar una campaña desde el dashboard del CRM y verifica que el sistema devuelva un error indicando "La cuenta se encuentra pausada".

## 3. Validación de Exportación de Datos

1. En el módulo de Ajustes de la Organización, localiza la sección de "Exportar Datos".
2. Haz clic en "Exportar JSON (Completo)".
3. El navegador descargará un archivo `panoramex_export_<fecha>.json`.
4. Abre el archivo y valida que la estructura JSON contenga todas las llaves (prospects, messages, tours, reservations).

## 4. Validación de Rate Limiting y Backups

1. Usa una herramienta como `curl` o Postman, o un script simple para realizar 50 solicitudes rápidas concurrentes al endpoint `/api/webhook/whatsapp`.
   ```bash
   for i in {1..50}; do curl -X POST https://tu-dominio/api/webhook/whatsapp & done
   ```
2. Verifica que las últimas solicitudes respondan con un código HTTP `429 Too Many Requests`.
3. Para validar backups, dirígete al dashboard de Supabase (https://app.supabase.com/), selecciona tu proyecto -> Database -> Backups y comprueba que la programación diaria esté activa.
