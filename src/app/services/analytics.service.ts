import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalCost: number;
  totalValue: number;
  itemCount: number;
  categoryDistribution: { label: string; value: number; percentage: number; color?: string }[];
  topItems: { name: string; value: number; image?: string; collectionName: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }
}
