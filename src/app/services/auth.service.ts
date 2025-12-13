import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // IMPORTANTE: Apuntamos al API Gateway (Puerto 8080), no al Auth Service directo.
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    // Hacemos POST a /login según la documentación
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Si el login es exitoso, guardamos el token JWT
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          console.log('Token guardado exitosamente');
        }
      })
    );
  }

  // Método utilitario para cerrar sesión
  logout() {
    localStorage.removeItem('token');
  }
  
  // Método para verificar si está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
