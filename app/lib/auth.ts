export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem('workexpress_token');
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
}; 