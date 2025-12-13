import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // <--- Importa RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  // Agrega RouterOutlet a los imports del componente
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend-nicholog';
}
