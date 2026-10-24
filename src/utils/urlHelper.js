/**
 * Resuelve URLs de archivos o evidencias para entornos locales y de producción en la nube.
 * Si la URL ya es absoluta (https://...), la devuelve tal cual.
 * Si es relativa (/api/archivos/...) y VITE_API_BASE_URL es absoluta,
 * prepend el dominio base del backend para que la descarga sea directa.
 */
export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    const backendHost = apiBase.replace(/\/api\/?$/, '');
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url;
};
