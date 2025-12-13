import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Módulos de Material necesarios
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { fadeAnimation, listAnimation } from '../../animations/fade.animation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [fadeAnimation, listAnimation]
})
export class DashboardComponent {
  private contexts = inject(ChildrenOutletContexts);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    // 1. Eliminar el token del almacenamiento
    this.authService.logout();
    
    // 2. Redirigir al usuario a la pantalla de login
    this.router.navigate(['/login']);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
