import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

/*export const routes: Routes = [
  // Cuando la URL esté vacía (ej. http://localhost:4200/), carga el LoginComponent.
  {
    path: '',
    component: LoginComponent
  },
  
  // (Opcional, pero recomendado) Redirige cualquier otra ruta no encontrada al login.
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];*/

export const routes: Routes = [
  // 1. Ruta raíz: Redirige automáticamente al login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // 2. Ruta pública: Página de Login
  {
    path: 'login',
    component: LoginComponent
  },

  // 3. Ruta privada: Dashboard (Contenedor Principal)
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      // AQUÍ IRÁN LAS VISTAS INTERNAS (Hijas)
      // Por ahora las dejaremos comentadas hasta que creemos esos componentes
      
      // { path: 'home', component: HomeComponent },
      // { path: 'collections', component: CollectionsComponent },
      // { path: 'inventory', component: InventoryComponent },
      
      // Redirección por defecto dentro del dashboard (opcional)
      // { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // 4. Wildcard: Cualquier ruta desconocida te manda al login
  {
    path: '**',
    redirectTo: '/login'
  }
];
