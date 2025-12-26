import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// --- INTERFACES (Tipos de datos) ---

export type FieldType = 'text-short' | 'text-long' | 'number' | 'selector' | 'checkbox' | 'date' | 'url';

export interface CollectionField {
  type: FieldType;
  name: string;
  options?: string[]; // Solo requerido si type es 'selector'
  optionColors?: { [key: string]: string }; // Mapa de opción -> color (ej: 'Nuevo': 'green')
  required?: boolean;
  width?: 'full' | 'half'; // Control de ancho (100% o 50%)
}

export interface CollectionTemplate {
  _id?: string;      // El ID lo genera Mongo
  name: string;      // Ej: "Zapatillas"
  fields?: CollectionField[];
  userId?: string;
  createdAt?: string;
}

export interface Item {
  _id?: string;
  name: string;
  templateId: string; // ID de la colección a la que pertenece
  dynamicData: { [key: string]: any }; // Los datos variables según la plantilla
  acquisition?: {
    price?: number;
    date?: string;
    estimatedValue?: number;
  };
  images?: string[]; // Galería de imágenes
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // URL del API Gateway
  private apiUrl = 'http://localhost:8080/api/catalog';

  constructor(private http: HttpClient) {}

  // ==========================================
  // GESTIÓN DE COLECCIONES (El Molde)
  // ==========================================

  createCollection(data: CollectionTemplate): Observable<CollectionTemplate> {
    return this.http.post<CollectionTemplate>(`${this.apiUrl}/collections`, data);
  }

  getUserCollections(): Observable<CollectionTemplate[]> {
    return this.http.get<CollectionTemplate[]>(`${this.apiUrl}/collections`);
  }

  // Método auxiliar para obtener una sola colección (filtrando del listado)
  getCollectionById(id: string): Observable<CollectionTemplate | undefined> {
    return this.getUserCollections().pipe(
      map(collections => collections.find(c => c._id === id))
    );
  }

  // Método auxiliar para buscar por nombre (para la ruta /inventario/:nombre)
  getCollectionByName(name: string): Observable<CollectionTemplate | undefined> {
    return this.getUserCollections().pipe(
      map(collections => collections.find(c => c.name.toLowerCase() === name.toLowerCase()))
    );
  }

  updateCollection(id: string, data: Partial<CollectionTemplate>): Observable<CollectionTemplate> {
    return this.http.put<CollectionTemplate>(`${this.apiUrl}/collections/${id}`, data);
  }

  deleteCollection(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/collections/${id}`);
  }

  // ==========================================
  // GESTIÓN DE ITEMS (Inventario)
  // ==========================================

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }

  getItemsByCollectionName(collectionName: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/collections/${collectionName}/items`);
  }

  getItemById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/item-detail/${id}`);
  }

  updateItem(id: string, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`);
  }

  searchItems(query: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/search/${query}`);
  }

  filterItems(collectionId: string, filters: any): Observable<Item[]> {
    return this.http.post<Item[]>(`${this.apiUrl}/filter/${collectionId}`, filters);
  }
}