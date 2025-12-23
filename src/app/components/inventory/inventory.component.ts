import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { listStaggerAnimation } from '../../animations';
import { CatalogService, Item } from '../../services/catalog.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  animations: [listStaggerAnimation]
})
export class InventoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);

  collectionName: string = '';
  items$: Observable<Item[]> = of([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (name) {
        this.collectionName = name;
        this.loadItems();
      }
    });
  }

  loadItems(): void {
    this.items$ = this.catalogService.getItemsByCollectionName(this.collectionName);
  }

  deleteItem(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (!id) return;

    if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      this.catalogService.deleteItem(id).subscribe({
        next: () => {
          alert('Artículo eliminado');
          this.loadItems(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar el artículo:', err);
          alert('No se pudo eliminar el artículo.');
        }
      });
    }
  }

  // Para mostrar los datos dinámicos en la tarjeta
  objectKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj);
  }
}