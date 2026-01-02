import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // CONFIGURACIÓN DE CLOUDINARY
  // 1. Entra a https://cloudinary.com/console
  // 2. Copia tu 'Cloud Name' aquí:
  private cloudName = 'TU_CLOUD_NAME_AQUI'; 
  
  // 3. Ve a Settings -> Upload -> Upload presets -> Add upload preset
  // 4. Signing Mode: "Unsigned" -> Save. Copia el nombre aquí:
  private uploadPreset = 'TU_UPLOAD_PRESET_AQUI'; 

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('cloud_name', this.cloudName);

    return this.http.post<any>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      formData
    ).pipe(
      map(response => response.secure_url) // Retornamos solo la URL segura
    );
  }
}