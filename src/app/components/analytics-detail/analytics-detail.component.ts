import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map, switchMap, catchError, of, BehaviorSubject, tap, take } from 'rxjs';
import { AnalyticsService, ItemDetail } from '../../services/analytics.service';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-analytics-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './analytics-detail.component.html',
  styleUrls: ['./analytics-detail.component.css']
})
export class AnalyticsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private analyticsService = inject(AnalyticsService);
  private snackBar = inject(MatSnackBar);

  metric$: Observable<string> | undefined;
  title$: Observable<string> | undefined;
  details$: Observable<ItemDetail[]> | undefined;
  hasError$ = new BehaviorSubject<boolean>(false); // Nueva variable para controlar el estado de error

  displayedColumns: string[] = ['image', 'name', 'collectionName', 'date', 'value'];
  
  ngOnInit(): void {
    this.metric$ = this.route.params.pipe(map(params => params['metric']));

    this.title$ = this.metric$.pipe(
      map(metric => {
        switch (metric) {
          case 'costo': return 'Desglose de Costo Total';
          case 'valor': return 'Desglose de Valor Estimado';
          case 'items': return 'Listado Total de Artículos';
          default: return 'Detalles';
        }
      })
    );

    // Ocultamos la columna de valor si la métrica es 'items'
    this.metric$.subscribe(metric => {
      if (metric === 'items') {
        this.displayedColumns = ['image', 'name', 'collectionName', 'date'];
      }
    });

    this.details$ = this.metric$.pipe(
      tap(() => this.hasError$.next(false)), // Reseteamos el error al cambiar de métrica
      switchMap(metric => this.analyticsService.getMetricDetails(metric).pipe(
        catchError(err => {
          console.error('Error cargando detalles (Backend falló):', err);
          this.snackBar.open('Error del servidor: No se pudieron cargar los detalles.', 'Cerrar', { duration: 5000 });
          this.hasError$.next(true); // Activamos el estado de error
          // Retornamos una lista vacía para que la UI no se rompa
          return of([]);
        })
      ))
    );
  }

  exportToCsv() {
    this.details$?.pipe(take(1)).subscribe(data => {
      if (!data || data.length === 0) return;
      
      const header = "Nombre,Coleccion,Valor,Fecha\n";
      const rows = data.map(e => {
        // Escapamos comillas y envolvemos textos
        const name = `"${(e.name || '').replace(/"/g, '""')}"`;
        const collection = `"${(e.collectionName || '').replace(/"/g, '""')}"`;
        return `${name},${collection},${e.value},${e.date}`;
      }).join("\n");
        
      // Usamos encodeURIComponent para evitar cortes por caracteres especiales
      const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reporte_nicholog.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
