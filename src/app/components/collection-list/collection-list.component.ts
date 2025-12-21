import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// Imports de Material y Servicios
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CatalogService, CollectionTemplate } from '../../services/catalog.service';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css']
})
export class CollectionListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  
  // Usamos el pipe 'async' en el HTML para manejar la suscripción
  collections$!: Observable<CollectionTemplate[]>;

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.collections$ = this.catalogService.getUserCollections();
  }

  // Método para eliminar (lo conectaremos más adelante)
  deleteCollection(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation(); // Evita que se active el click de la card
    if (!id) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta colección y todos sus ítems?')) {
      this.catalogService.deleteCollection(id).subscribe({
        next: () => {
          alert('Colección eliminada');
          this.loadCollections(); // Recargamos la lista
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar la colección.');
        }
      });
    }
  }
}
