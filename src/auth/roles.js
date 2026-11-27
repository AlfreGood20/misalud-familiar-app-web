export function normalizeRole(role) {
  return String(role ?? '').replace(/^ROLE_/i, '').toUpperCase();
}

export function isAdminRole(role) {
  return normalizeRole(role) === 'ADMIN';
}

export function isSupportedRole(role) {
  const normalized = normalizeRole(role);
  return normalized === 'ADMIN' || normalized === 'CUIDADOR';
}
