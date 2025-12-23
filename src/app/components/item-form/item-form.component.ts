import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CatalogService, CollectionTemplate, Item } from '../../services/catalog.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);

  collectionName: string = '';
  template: CollectionTemplate | null = null;
  itemId: string | null = null;
  isEditMode = false;

  itemForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    image: [''], // Campo simple para la URL de la imagen principal
    acquisition: this.fb.group({
      price: [null],
      date: [null],
      estimatedValue: [null]
    }),
    dynamicData: this.fb.group({})
  });

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.collectionName = params.get('name') || '';
        this.itemId = params.get('itemId');
        this.isEditMode = !!this.itemId;
        
        return this.catalogService.getCollectionByName(this.collectionName);
      })
    ).subscribe(template => {
      if (template) {
        this.template = template;
        this.buildDynamicForm(template);
        
        if (this.isEditMode && this.itemId) {
          this.loadItemData(this.itemId);
        }
      } else {
        alert('Colección no encontrada');
        this.router.navigate(['/dashboard/colecciones']);
      }
    });
  }

  buildDynamicForm(template: CollectionTemplate) {
    const dynamicGroup = this.itemForm.get('dynamicData') as FormGroup;
    
    template.fields?.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      const control = field.type === 'checkbox' ? new FormControl(false) : new FormControl('', validators);
      dynamicGroup.addControl(field.name, control);
    });
  }

  loadItemData(id: string) {
    this.catalogService.getItemById(id).subscribe(item => {
      this.itemForm.patchValue({
        name: item.name,
        image: item.images && item.images.length > 0 ? item.images[0] : '',
        acquisition: item.acquisition,
        dynamicData: item.dynamicData
      });
    });
  }

  onSubmit() {
    if (this.itemForm.invalid || !this.template?._id) {
      return;
    }

    const formValue = this.itemForm.value;
    
    const payload: Partial<Item> = {
      name: formValue.name,
      templateId: this.template._id,
      dynamicData: formValue.dynamicData,
      acquisition: formValue.acquisition,
      images: formValue.image ? [formValue.image] : [] // Convertir la URL simple en un array
    };

    const operation = this.isEditMode && this.itemId
      ? this.catalogService.updateItem(this.itemId, payload)
      : this.catalogService.createItem(payload as Item);

    operation.subscribe({
      next: () => this.goBack(),
      error: (err) => {
        console.error('Error al guardar el artículo:', err);
        alert(`Error: ${err.error?.message || 'No se pudo guardar el artículo.'}`);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/inventario', this.collectionName]);
  }
}