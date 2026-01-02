import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CollectionBuilderComponent } from './components/collection-builder/collection-builder.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { ItemFormComponent } from './components/item-form/item-form.component';
import { ResumenComponent } from './components/resumen/resumen.component';
import { AnalyticsDetailComponent } from './components/analytics-detail/analytics-detail.component';

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
      
      // 1. Redirección por defecto al resumen (Estándar y seguro)
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },

      // 2. Vista Principal (Dashboard Stats)
      { path: 'resumen', component: ResumenComponent, data: { animationState: 'Resumen' } },

      // NUEVA RUTA: Vista de detalle para las métricas del dashboard
      { path: 'analytics/:metric', component: AnalyticsDetailComponent, data: { animationState: 'AnalyticsDetail' } },

      // 3. Gestión de Colecciones (Listado)
      { path: 'colecciones', component: CollectionListComponent, data: { animationState: 'Colecciones' } },
      
      // 4. EL MOLDE: Constructor de Plantillas (Crear/Editar)
      { path: 'colecciones/nueva', component: CollectionBuilderComponent, data: { animationState: 'ColeccionBuilder' } },
      { path: 'colecciones/editar/:id', component: CollectionBuilderComponent, data: { animationState: 'ColeccionBuilder' } },

      // 5. Inventario (Gestión de Artículos)
      { path: 'inventario/:name', component: InventoryComponent, data: { animationState: 'Inventario' } },
      { path: 'inventario/:name/nuevo', component: ItemFormComponent, data: { animationState: 'ItemForm' } },
      { path: 'inventario/:name/editar/:itemId', component: ItemFormComponent, data: { animationState: 'ItemForm' } }
    ]
  },

  // 4. Wildcard: Cualquier ruta desconocida te manda al login
  {
    path: '**',
    redirectTo: '/login'
  }
];
