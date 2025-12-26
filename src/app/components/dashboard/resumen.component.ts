import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map, catchError, of, shareReplay } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AnalyticsService, DashboardStats } from '../../services/analytics.service';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  
  stats$: Observable<DashboardStats> | undefined;
  pieChartStyle$: Observable<string> | undefined;

  // Colores para el gráfico
  private colors = ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

  ngOnInit() {
    this.stats$ = this.analyticsService.getDashboardStats().pipe(
      map(stats => {
        // Asignar colores a las categorías
        const distribution = stats.categoryDistribution || [];
        stats.categoryDistribution = distribution.map((cat, index) => ({
          ...cat,
          color: this.colors[index % this.colors.length]
        }));
        return stats;
      }),
      catchError(err => {
        console.error('Error cargando dashboard:', err);
        // Retornar datos vacíos para quitar el spinner si falla el backend
        return of({
          totalCost: 0,
          totalValue: 0,
          itemCount: 0,
          categoryDistribution: []
        } as DashboardStats);
      }),
      shareReplay(1) // Evita doble petición HTTP
    );

    // Generar el estilo del gradiente cónico para el gráfico de pastel
    this.pieChartStyle$ = this.stats$.pipe(
      map(stats => {
        if (!stats.categoryDistribution || stats.categoryDistribution.length === 0) {
          return 'conic-gradient(#e0e0e0 0% 100%)'; // Gráfico gris si no hay datos
        }
        let gradient = 'conic-gradient(';
        let currentDeg = 0;
        stats.categoryDistribution.forEach((cat, i) => {
          const endDeg = currentDeg + (cat.percentage * 3.6); // 3.6 grados por 1%
          gradient += `${cat.color} ${currentDeg}deg ${endDeg}deg${i < stats.categoryDistribution.length - 1 ? ', ' : ''}`;
          currentDeg = endDeg;
        });
        return gradient + ')';
      })
    );
  }
}