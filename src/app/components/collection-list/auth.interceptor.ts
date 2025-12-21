import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtener el token del almacenamiento local
  // (Asegúrate de que en tu Login guardaste el token con la clave 'token')
  const token = localStorage.getItem('token');

  if (token) {
    // 2. Clonar la solicitud y agregar el header Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // 3. Si no hay token, pasar la solicitud original
  return next(req);
};