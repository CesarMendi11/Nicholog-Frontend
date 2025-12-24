import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CatalogService, FieldType, CollectionTemplate, CollectionField } from '../../services/catalog.service';

@Component({
  selector: 'app-collection-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './collection-builder.component.html',
  styleUrls: ['./collection-builder.component.css']
})
export class CollectionBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  collectionId: string | null = null;
  isEditMode = false;
  
  // Definición del formulario principal
  collectionForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    fields: this.fb.array([])
  });

  // Tipos de campos disponibles para el usuario
  fieldTypes: { value: FieldType, label: string }[] = [
    { value: 'text-short', label: 'Texto Corto (Ej. Modelo)' },
    { value: 'text-long', label: 'Texto Largo (Ej. Historia)' },
    { value: 'number', label: 'Número (Ej. Talla, Año)' },
    { value: 'selector', label: 'Selector (Opciones predefinidas)' },
    { value: 'checkbox', label: 'Checkbox (Sí/No)' },
    { value: 'date', label: 'Fecha' },
    { value: 'url', label: 'Enlace URL' }
  ];

  ngOnInit(): void {
    // Verificar si estamos en modo edición (si hay un ID en la URL)
    this.collectionId = this.route.snapshot.paramMap.get('id');
    
    if (this.collectionId) {
      this.isEditMode = true;
      this.loadCollectionData(this.collectionId);
    }
  }

  loadCollectionData(id: string) {
    this.catalogService.getCollectionById(id).subscribe(collection => {
      if (collection) {
        // 1. Cargar nombre
        this.collectionForm.patchValue({ name: collection.name });

        // 2. Limpiar campos previos (por si acaso)
        this.fields.clear();

        // 3. Reconstruir los campos dinámicos (con validación)
        if (collection.fields && Array.isArray(collection.fields)) {
          collection.fields.forEach(field => {
            this.addField(field);
          });
        }
      }
    });
  }

  // Getter para acceder fácilmente al FormArray de campos
  get fields() {
    return this.collectionForm.get('fields') as FormArray;
  }

  // Añadir un nuevo campo al formulario
  // Modificado para aceptar datos opcionales (para cuando cargamos una colección existente)
  addField(data?: any) {
    // Normalizamos los datos para manejar compatibilidad (backend viejo vs nuevo)
    const fieldType = data?.type || data?.fieldType || 'text-short';
    const fieldName = data?.name || data?.fieldName || '';
    const fieldRequired = data?.required || false;
    const fieldOptions = data?.options || [];

    const fieldGroup = this.fb.group({
      type: [fieldType, Validators.required],
      name: [fieldName, Validators.required],
      required: [fieldRequired],
      options: this.fb.array([]) // Solo se usa si type === 'selector'
    });

    // Lógica: Si el usuario cambia el tipo a algo que no sea 'selector', limpiamos las opciones
    fieldGroup.get('type')?.valueChanges.subscribe(type => {
      const optionsArray = fieldGroup.get('options') as FormArray;
      if (type !== 'selector') {
        optionsArray.clear();
      } else if (optionsArray.length === 0) {
        // Si cambia a selector, añadimos una opción por defecto para empezar
        this.addOption(optionsArray);
      }
    });

    // Si estamos cargando datos y es un selector, rellenar las opciones
    if (fieldType === 'selector' && Array.isArray(fieldOptions)) {
      fieldOptions.forEach((opt: any) => {
        (fieldGroup.get('options') as FormArray).push(this.fb.control(opt, Validators.required));
      });
    }

    this.fields.push(fieldGroup);
  }

  // Eliminar un campo
  removeField(index: number) {
    this.fields.removeAt(index);
  }

  // --- Gestión de Opciones (Solo para Selectores) ---
  
  getOptions(fieldIndex: number): FormArray {
    return this.fields.at(fieldIndex).get('options') as FormArray;
  }

  addOption(optionsArray: FormArray) {
    optionsArray.push(this.fb.control('', Validators.required));
  }

  removeOption(optionsArray: FormArray, index: number) {
    optionsArray.removeAt(index);
  }

  cancel() {
    this.router.navigate(['/dashboard/colecciones']);
  }

  // --- Guardar ---

  onSubmit() {
    if (this.collectionForm.valid) {
      const formValue = this.collectionForm.value;
      
      const newTemplate: CollectionTemplate = {
        name: formValue.name,
        fields: formValue.fields
      };

      
      if (this.isEditMode && this.collectionId) {
        // MODO EDICIÓN
        this.catalogService.updateCollection(this.collectionId, newTemplate).subscribe({
          next: (res) => {
            this.snackBar.open('Colección actualizada con éxito', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/colecciones']);
          },
          error: (err) => {
            console.error('Error al actualizar:', err);
            if (err.error) console.error('Detalles del error (Backend):', err.error);
            const msg = err.error?.message || 'Error al actualizar. Revisa la consola.';
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          }
        });
      } else {
        // MODO CREACIÓN
        this.catalogService.createCollection(newTemplate).subscribe({
          next: (res) => {
            this.snackBar.open('Colección creada con éxito', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/colecciones']);
          },
          error: (err) => {
            console.error('Error al crear:', err);
            if (err.error) console.error('Detalles del error (Backend):', err.error);
            const msg = err.error?.message || 'Error al guardar. Revisa la consola.';
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          }
        });
      }
    } else {
      this.collectionForm.markAllAsTouched();
    }
  }
}
