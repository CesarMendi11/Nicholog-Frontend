import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { CatalogService, CollectionTemplate, Item } from '../../services/catalog.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  itemForm: FormGroup;
  collectionName: string = '';
  template: CollectionTemplate | undefined;
  isEditMode = false;
  itemId: string | null = null;
  
  // Para previsualización de imagen
  imagePreview: string | null = null;

  constructor() {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: [''], // Por ahora URL manual
      acquisition: this.fb.group({
        price: [0],
        estimatedValue: [0],
        date: [new Date()]
      }),
      dynamicData: this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.collectionName = params.get('name') || '';
        this.itemId = params.get('itemId');
        
        // 1. Obtener la plantilla de la colección
        return this.catalogService.getCollectionByName(this.collectionName);
      })
    ).subscribe(template => {
      if (template) {
        this.template = template;
        this.buildDynamicForm(template);

        // 2. Si es edición, cargar los datos del ítem
        if (this.itemId) {
          this.isEditMode = true;
          this.loadItemData(this.itemId);
        }
      }
    });

    // Escuchar cambios en la URL de imagen para actualizar la vista previa
    this.itemForm.get('imageUrl')?.valueChanges.subscribe(val => {
      this.imagePreview = val;
    });
  }

  buildDynamicForm(template: CollectionTemplate) {
    const dynamicGroup = this.itemForm.get('dynamicData') as FormGroup;
    
    template.fields?.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      // Inicializamos el control en el grupo dinámico
      dynamicGroup.addControl(field.name, this.fb.control('', validators));
    });
  }

  loadItemData(id: string) {
    this.catalogService.getItemById(id).subscribe(item => {
      if (item) {
        this.itemForm.patchValue({
          name: item.name,
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : '',
          acquisition: {
            price: item.acquisition?.price,
            estimatedValue: item.acquisition?.estimatedValue,
            date: item.acquisition?.date
          },
          dynamicData: item.dynamicData
        });
        this.imagePreview = item.images && item.images.length > 0 ? item.images[0] : null;
      }
    });
  }

  onSubmit() {
    if (this.itemForm.valid && this.template) {
      const formValue = this.itemForm.value;
      
      const itemData: Item = {
        name: formValue.name,
        templateId: this.template._id!,
        dynamicData: formValue.dynamicData,
        acquisition: formValue.acquisition,
        images: formValue.imageUrl ? [formValue.imageUrl] : []
      };

      if (this.isEditMode && this.itemId) {
        this.catalogService.updateItem(this.itemId, itemData).subscribe({
          next: () => {
            this.snackBar.open('Artículo actualizado', 'Cerrar', { duration: 3000 });
            this.goBack();
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.catalogService.createItem(itemData).subscribe({
          next: () => {
            this.snackBar.open('Artículo creado', 'Cerrar', { duration: 3000 });
            this.goBack();
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/inventario', this.collectionName]);
  }
}