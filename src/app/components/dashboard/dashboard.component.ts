import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

// Módulos de Material necesarios
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { routeFadeAnimation } from '../../animations'; 


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [routeFadeAnimation]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private contexts = inject(ChildrenOutletContexts);
  searchQuery: string = ''; // Variable para el buscador

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animationState'];
  }

  onSearch() {
    if (this.searchQuery && this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // Aquí podrías redirigir a una vista de resultados de búsqueda
    }
  }
}
