import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatDatepickerModule, 
    DatePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './item-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' }
})
export class ItemForm {
  private bottomSheetRef = inject(MatBottomSheetRef<ItemForm>);
  public data = inject(MAT_BOTTOM_SHEET_DATA);
  
  // Nivel de dificultad: 0 significa no seleccionado para la validacion
  dificultadSeleccionada = signal<number | null>(null);
  fechaSeleccionada = signal<Date | null>(null);
  
  // Control de validacion reactiva
  intentadoGuardar = signal(false);

  onFechaCambiada(event: any) {
    this.fechaSeleccionada.set(event.value);
  }

  seleccionarDificultad(nivel: number) {
    this.dificultadSeleccionada.set(nivel);
  }

  cerrar() {
    this.bottomSheetRef.dismiss();
  }

  guardar(nombre: string, descripcion: string) {
    this.intentadoGuardar.set(true);

    // Validacion: Titulo y Dificultad son obligatorios
    if (!nombre.trim() || this.dificultadSeleccionada() === null) {
      return;
    }

    this.bottomSheetRef.dismiss({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      dificultad: this.dificultadSeleccionada(),
      fecha: this.fechaSeleccionada()
    });
  }
}