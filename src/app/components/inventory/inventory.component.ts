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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { listStaggerAnimation } from '../../animations';
import { CatalogService, Item, CollectionTemplate } from '../../services/catalog.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

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
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  animations: [listStaggerAnimation]
})
export class InventoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  collectionName: string = '';
  items$: Observable<Item[]> = of([]);
  template: CollectionTemplate | undefined;

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
    // Cargamos también la plantilla para tener acceso a los colores
    this.catalogService.getCollectionByName(this.collectionName).subscribe(t => {
      this.template = t;
    });
  }

  deleteItem(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que quieres eliminar este artículo?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogService.deleteItem(id).subscribe({
          next: () => {
            this.snackBar.open('Artículo eliminado', 'Cerrar', { duration: 3000 });
            this.loadItems(); // Recargar la lista
          },
          error: (err) => {
            console.error('Error al eliminar el artículo:', err);
            this.snackBar.open('Error: No se pudo eliminar el artículo', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  // Para mostrar los datos dinámicos en la tarjeta
  objectKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj);
  }

  // Obtener color para un valor específico
  getBadgeColor(key: string, value: any): string {
    if (!this.template || !this.template.fields) return 'default';
    
    const field = this.template.fields.find(f => f.name === key);
    if (field && field.optionColors && field.optionColors[value]) {
      return field.optionColors[value];
    }
    return 'default';
  }
}