import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map, catchError, of, shareReplay, startWith, take } from 'rxjs';
import { RouterModule } from '@angular/router';

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
    RouterModule,
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
  
  stats$: Observable<DashboardStats | null> | undefined;
  pieChartStyle$: Observable<string> | undefined;

  // Variables para el ROI
  roiValue: number = 0;
  roiPercentage: number = 0;

  // Colores para el gráfico
  private colors = ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

  // Mock Data para Actividad Reciente (Simulación)
  recentActivity = [
    { action: 'Agregaste', item: 'Air Jordan 1 Chicago', time: 'Hace 2 horas', icon: 'add_circle', color: '#4caf50' },
    { action: 'Editaste', item: 'Colección de Monedas', time: 'Ayer', icon: 'edit', color: '#ff9800' },
    { action: 'Valor Subió', item: 'Charizard 1st Ed.', time: 'Hace 2 días', icon: 'trending_up', color: '#3f51b5' }
  ];

  // Datos para el gráfico de línea (Histórico)
  historyData: { month: string; value: number }[] = [];
  chartPoints: string = '';
  chartAreaPath: string = '';

  ngOnInit() {
    console.log('Inicializando ResumenComponent...'); // Debug para verificar carga
    this.stats$ = this.analyticsService.getDashboardStats().pipe(
      startWith(null), // Forzar emisión inicial para mostrar spinner
      map(stats => {
        // Validación de seguridad: Si el backend no devuelve nada o devuelve null
        if (!stats) return null; // Mantiene el estado de carga

        // Asegurar que todas las propiedades existan (Evita pantalla blanca por undefined)
        stats.categoryDistribution = stats.categoryDistribution || [];
        stats.topItems = stats.topItems || [];
        stats.totalCost = stats.totalCost || 0;
        stats.totalValue = stats.totalValue || 0;
        stats.itemCount = stats.itemCount || 0;

        // Asignar colores a las categorías
        const distribution = stats.categoryDistribution || [];
        stats.categoryDistribution = distribution.map((cat, index) => ({
          ...cat,
          color: this.colors[index % this.colors.length]
        }));

        // Calcular ROI
        this.roiValue = stats.totalValue - stats.totalCost;
        this.roiPercentage = stats.totalCost > 0 ? (this.roiValue / stats.totalCost) * 100 : 0;

        // Generar gráfico histórico basado en el valor actual
        const val = stats.totalValue || 0;
        this.generateChartData(val);

        return stats;
      }),
      catchError(err => {
        console.error('Error cargando dashboard (Backend no listo o caído):', err);
        // Retornar datos vacíos para que la UI cargue con ceros
        return of({
          totalCost: 0,
          totalValue: 0,
          itemCount: 0,
          categoryDistribution: [],
          topItems: []
        } as DashboardStats);
      }),
      shareReplay(1) // Evita duplicar la petición
    );

    // Generar el estilo del gradiente cónico para el gráfico de pastel
    this.pieChartStyle$ = this.stats$.pipe(
      map(stats => {
        let gradient = 'conic-gradient(';
        let currentDeg = 0;
        if (!stats || !stats.categoryDistribution || stats.categoryDistribution.length === 0) {
          return 'conic-gradient(#e0e0e0 0% 100%)';
        }
        stats.categoryDistribution.forEach((cat, i) => {
          const endDeg = currentDeg + (cat.percentage * 3.6); // 3.6 grados por 1%
          gradient += `${cat.color} ${currentDeg}deg ${endDeg}deg${i < stats.categoryDistribution.length - 1 ? ', ' : ''}`;
          currentDeg = endDeg;
        });
        return gradient + ')';
      })
    );
  }

  generateChartData(currentValue: number) {
    // Vista anual completa
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']; 
    
    this.historyData = months.map((m, i) => {
      // Simula una curva de crecimiento orgánica sobre 12 meses (de 50% a 100% del valor)
      const factor = 0.5 + (i / (months.length - 1)) * 0.5; 
      const randomVar = (Math.random() * 0.05) - 0.025; // Pequeña variación aleatoria
      let val = currentValue * (factor + randomVar);
      if (i === months.length - 1) val = currentValue; // Asegura que el último mes sea el valor actual exacto
      return { month: m, value: Math.max(0, val) };
    });

    // Convertir a puntos SVG (ViewBox 300x100)
    const width = 300;
    const height = 100;
    const maxVal = Math.max(...this.historyData.map(d => d.value)) * 1.2; // 20% margen superior

    this.chartPoints = this.historyData.map((d, i) => {
      const x = (i / (this.historyData.length - 1)) * width;
      const y = height - ((d.value / (maxVal || 1)) * height); // Evitar div por 0
      return `${x},${y}`;
    }).join(' ');

    // Generar el path para el área sombreada del gráfico
    const areaPoints = this.chartPoints;
    this.chartAreaPath = `M0,${height} ${areaPoints} L${width},${height} Z`;
  }

  exportReport() {
    // Reutilizamos el endpoint de detalles 'items' para obtener todo el inventario
    this.analyticsService.getMetricDetails('items').pipe(take(1)).subscribe(data => {
      if (!data || data.length === 0) return;
      
      // 1. Construimos el contenido del CSV
      const header = "Nombre,Coleccion,Valor,Fecha Adquisicion\n";
      const rows = data.map(e => {
        // Escapamos las comillas dobles y envolvemos los textos en comillas para proteger comas y caracteres especiales
        const name = `"${(e.name || '').replace(/"/g, '""')}"`;
        const collection = `"${(e.collectionName || '').replace(/"/g, '""')}"`;
        return `${name},${collection},${e.value || 0},${e.date}`;
      }).join("\n");
        
      // 2. Usamos encodeURIComponent para que caracteres como '#' no corten la descarga
      const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reporte_completo_nicholog.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
