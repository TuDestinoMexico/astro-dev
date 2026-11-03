---
name: crm-integracion
description: Integración con el CRM de Tu Destino MX (reservas CT, grupos GB, pagos y documentos vía /api/crm-*). Usar al tocar src/pages/api/crm-*.ts, ClientReservas, ClientPagos, GrupoDetalle, DocumentosModal o al consumir datos de reserva o grupo.
---

# Integración CRM

Fuente completa: `docs/api.md` (secciones "Endpoints internos", "API externa" y "Estructura de datos") y `docs/database.md` (colecciones de clientes).

## Reglas

- El CRM se consume solo desde proxies server-side. El cliente nunca llama directamente a `API_CRM_URL`.
- Los endpoints proxy exigen `Authorization: Bearer <Firebase ID token>` con email verificado. Verificar que el CT o GB pertenezca al usuario autenticado consultando `users/{uid}/reservas` o `users/{uid}/grupos` en Firestore.
- Los llamados al CRM llevan el header `X-Api-Token` con `API_CRM_TOKEN`. El valor nunca se expone al cliente.
- Respetar el modo de mantenimiento: si `config/general.modoMantenimiento` o `config/general.pausarConsultasReservas` están activos, responder `503` sin consultar el CRM. El historial Openpay en Firestore no se pausa.
- Usar los nombres reales de campos del CRM. No asumir `checkIn`, `monto` ni `adultos` como array:
  - Reserva: `ct`, `checkin`, `checkout`, `precio_total`, `pax` (string tipo "2.1.0"), `adultos` (null), `ninos`.
  - Grupo: `gb`, `hoteles[]`, `cliente`, `reservation_type` (Q/NQ).
- Pagos: `abonos[]` con `fecha_abono`, `cantidad`, `tipo_pago.metodo_pago`, `tipo_pago.referencia`.
- Documentos: los tipos permitidos dependen de `reservation_type`. Los docs subidos por el cliente nacen `pendiente` y solo cuentan como cargados cuando están `verificado`. El cliente no puede eliminar ni previsualizar documentos.
- Toda llamada al CRM va en try/catch y devuelve `{ success, message }` en error.

## Checklist al modificar

1. Confirmar el campo en `docs/api.md` antes de usarlo.
2. Revisar el endpoint proxy correspondiente, incluyendo validación de método, email verificado y pertenencia.
3. Si cambia la forma de la respuesta, actualizar solo `docs/api.md`.
