
const API_URL = import.meta.env.VITE_API_URL;

async function ensureAuthSuccess(response, fallbackMessage) {
  if (response.ok) return;

  let message = `${fallbackMessage}: ${response.status}`;
  try {
    const body = await response.json();
    message = body.menssaje || body.message || body.error || message;
  } catch {
    // Keep the HTTP status message when the response has no JSON body.
  }
  throw new Error(message);
}

export async function getCurrentUser() {
  // CONSUMO DE API: obtiene los datos del usuario autenticado.
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el usuario autenticado: ${response.status}`);
  }

  return response.json();
}

export async function updateCurrentUser(data) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      correo: data.correo,
      telefono: data.telefono,
    }),
  });

  await ensureAuthSuccess(response, 'Error al actualizar los datos personales');
}

export async function changeCurrentPassword(data) {
  const response = await fetch(`${API_URL}/auth/me/password`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contrasenaActual: data.contrasenaActual,
      nuevaContrasena: data.nuevaContrasena,
    }),
  });

  await ensureAuthSuccess(response, 'Error al cambiar la contraseña');
}

export async function postLogout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al cerrar sesión: ${response.status}`);
  }
}

export async function postLogin(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Error de autenticación: ${response.status}`);
  }

  return response;
}

export async function postRegistro(data) {
  
  const response = await fetch(`${API_URL}/auth/registro`,{
    method: 'POST',
    headers: {
      'Content-Type':'application/json'
    },
    body: JSON.stringify(data)
  })

  return response;
}