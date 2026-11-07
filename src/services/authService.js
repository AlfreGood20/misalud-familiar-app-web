
const API_URL = import.meta.env.VITE_API_URL;

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