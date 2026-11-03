---
name: openpay-pagos
description: Pagos con Openpay en tdmx-astro (cargos, verificación, webhook, idempotencia, rate limit, límites de monto, sandbox vs producción). Usar al tocar openpay-*.ts, PaymentMethods, CreditCardDrawer, WelcomeModal o el flujo de pagos.
---

# Pagos Openpay

Fuente completa: `docs/api.md` (endpoints `openpay-*`) y `docs/auth.md`.

## Reglas

- La llave privada (`OPENPAY_PRIVATE_KEY`) solo se usa server-side con Basic Auth. Nunca va al cliente ni se hardcodea.
- Los secretos viven en `.env`. Este skill solo referencia nombres de variables, nunca valores.
- Endpoints:
  - `POST /api/openpay-cargo`: requiere Bearer ID token con email verificado, `Idempotency-Key` de 8 a 128 caracteres y rate limit por UID e IP.
  - `GET /api/openpay-check?paymentId=`: verifica que el `paymentId` pertenezca al usuario en `users/{uid}/pagos` antes de consultar Openpay.
  - `POST /api/openpay-webhook`: autenticado con `X-Openpay-Webhook-Token` o el query `token`. Nunca crea pagos nuevos; solo actualiza el documento encontrado por `openpayChargeId`.
- Campos controlados por el servidor: email (desde el token), `confirm`, `send_email`, `redirect_url`. El cliente no los envía.
- Validar el importe entre `OPENPAY_MIN_AMOUNT` y `OPENPAY_MAX_AMOUNT`, con máximo dos decimales.
- Métodos permitidos en el cargo: `card`, `store`, `bank_account`.
- El cliente conserva la `Idempotency-Key` durante reintentos y la borra solo tras una respuesta exitosa.
- Los cargos exitosos se guardan en `users/{uid}/pagos/{paymentId}`. El cliente no escribe en esa colección.
- El token del webhook es distinto por entorno. No reutilizarlo entre Sandbox y Production.
- Redirección: Openpay regresa a `SITE_URL?id={openpayChargeId}`. `WelcomeModal` lo acepta sin permitir URLs externas.
- Los formularios de pago van en React y llaman a `/api/openpay-*`.

## Antes de tocar producción

Confirmar que `OPENPAY_API_BASE_URL` apunta al entorno esperado. No probar cargos reales contra Production.
