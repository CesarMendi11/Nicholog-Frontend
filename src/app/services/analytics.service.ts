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

export interface ItemDetail {
  name: string;
  collectionName: string;
  value: number;
  date: Date;
  image?: string;
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

  getMetricDetails(metric: string): Observable<ItemDetail[]> {
    return this.http.get<ItemDetail[]>(`${this.apiUrl}/details/${metric}`);
  }
}
