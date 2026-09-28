import { auth } from './firebase';

export class OpenpayClientError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'OpenpayClientError';
    this.status = status;
  }
}

export function createIdempotencyKey() {
  return crypto.randomUUID();
}

export async function createOpenpayCharge(payload, idempotencyKey) {
  const user = auth.currentUser;
  if (!user) {
    throw new OpenpayClientError('Inicia sesión para continuar.', 401);
  }

  const token = await user.getIdToken();
  const response = await fetch('/api/openpay-cargo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new OpenpayClientError(
      data.message || data.description || 'No se pudo generar el cargo.',
      response.status
    );
  }

  return data;
}
