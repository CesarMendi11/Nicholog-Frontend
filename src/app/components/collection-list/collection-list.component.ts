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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { listStaggerAnimation } from '../../animations';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
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
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css'],
  animations: [listStaggerAnimation]
})
export class CollectionListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // Usamos el pipe 'async' en el HTML para manejar la suscripción
  collections$!: Observable<CollectionTemplate[]>;

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.collections$ = this.catalogService.getUserCollections();
  }

  // Método para editar (navegación manual para mayor seguridad)
  editCollection(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (id) {
      this.router.navigate(['/dashboard/colecciones/editar', id]);
    }
  }

  // Método para eliminar (lo conectaremos más adelante)
  deleteCollection(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation(); // Evita que se active el click de la card
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que quieres eliminar esta colección? Todos sus artículos también serán borrados permanentemente.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogService.deleteCollection(id).subscribe({
          next: () => {
            this.snackBar.open('Colección eliminada con éxito', 'Cerrar', { duration: 3000 });
            this.loadCollections(); // Recargamos la lista
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            this.snackBar.open('Error: No se pudo eliminar la colección', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
