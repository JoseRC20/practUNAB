/**
 * Validate Chilean RUT (Rol Único Tributario) / RUN format.
 * Returns an object { valid, cleaned, dv, expectedDv }
 * cleaned: digits only part (without DV)
 * dv: provided DV (uppercase)
 * expectedDv: expected DV computed by modulo-11 algorithm (string, 'K' or '0'..'9')
 */
export default function validateRUT(input) {
  if (!input && input !== 0) return { valid: false, error: 'Empty' };
  let s = String(input).trim().toUpperCase();
  // remove dots and spaces
  s = s.replace(/[\.\s]/g, '');

  // allow with or without hyphen before DV
  let body = '';
  let dv = '';
  if (s.includes('-')) {
    const parts = s.split('-');
    dv = parts.pop();
    body = parts.join('');
  } else {
    // last char is DV
    dv = s.slice(-1);
    body = s.slice(0, -1);
  }

  body = body.replace(/[^0-9]/g, '');
  dv = dv.replace(/[^0-9K]/g, '');
  if (!body || body.length === 0 || !dv) return { valid: false, cleaned: body, dv, error: 'Formato inválido' };

  // compute expected DV using modulo-11
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    const num = parseInt(body.charAt(i), 10);
    if (Number.isNaN(num)) return { valid: false, cleaned: body, dv, error: 'Dígitos inválidos' };
    sum += num * multiplier;
    multiplier++;
    if (multiplier > 7) multiplier = 2;
  }

  const mod = 11 - (sum % 11);
  let expected = '';
  if (mod === 11) expected = '0';
  else if (mod === 10) expected = 'K';
  else expected = String(mod);

  const valid = expected === dv;
  return { valid, cleaned: body, dv, expectedDv: expected };
}
