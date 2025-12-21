import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CollectionBuilderComponent } from './components/collection-builder/collection-builder.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';

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
      
      // 1. Redirección por defecto al resumen
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },

      // 2. Vista Principal (Dashboard Stats)
      // { path: 'resumen', component: ResumenComponent },

      // 3. Gestión de Colecciones (Listado)
      { path: 'colecciones', component: CollectionListComponent },
      
      // 4. EL MOLDE: Constructor de Plantillas (Crear/Editar)
      { path: 'colecciones/nueva', component: CollectionBuilderComponent },
      { path: 'colecciones/editar/:id', component: CollectionBuilderComponent },

      // 5. Inventario Global
      // { path: 'inventario', component: InventoryComponent }
    ]
  },

  // 4. Wildcard: Cualquier ruta desconocida te manda al login
  {
    path: '**',
    redirectTo: '/login'
  }
];
