import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-item-form',
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
  // Inyección de los servicios necesarios
  private bottomSheetRef = inject(MatBottomSheetRef<ItemForm>);
  public data = inject(MAT_BOTTOM_SHEET_DATA);
  
  // Variables reactivas para el formulario general y tareas
  dificultadSeleccionada = signal<number | null>(null);
  fechaSeleccionada = signal<Date | null>(null);
  intentadoGuardar = signal(false);

  // Definición de los días para iterar en la vista de rutinas
  diasSemana = [
    { id: 1, letra: 'L' }, { id: 2, letra: 'M' }, { id: 3, letra: 'X' },
    { id: 4, letra: 'J' }, { id: 5, letra: 'V' }, { id: 6, letra: 'S' }, { id: 7, letra: 'D' }
  ];

  // Variables reactivas exclusivas para rutinas
  diasSeleccionados = signal<number[]>([]);
  horaSeleccionada = signal<string | null>(null);

  // Señal computada que sabe si todos los dias estan marcados
  todosSeleccionados = computed(() => this.diasSeleccionados().length === 7);

  // Captura el cambio de fecha en el calendario
  onFechaCambiada(event: any) {
    this.fechaSeleccionada.set(event.value);
  }

  // Actualiza la dificultad
  seleccionarDificultad(nivel: number) {
    this.dificultadSeleccionada.set(nivel);
  }

  // Alterna un día específico en el array de rutinas
  toggleDia(id: number) {
    const actuales = this.diasSeleccionados();
    if (actuales.includes(id)) {
      // Si ya está, lo quitamos (Cambiado 'd' por 'diaID' para mayor claridad)
      this.diasSeleccionados.set(actuales.filter(diaID => diaID !== id));
    } else {
      // Si no está, lo añadimos
      this.diasSeleccionados.set([...actuales, id]);
    }
  }

  // Botón maestro "Todos": si están todos los borra, si falta alguno los pone todos
  toggleTodos() {
    if (this.todosSeleccionados()) {
      this.diasSeleccionados.set([]);
    } else {
      this.diasSeleccionados.set([1, 2, 3, 4, 5, 6, 7]);
    }
  }

  // Captura la hora del input nativo
  onHoraCambiada(event: any) {
    this.horaSeleccionada.set(event.target.value);
  }

  // Cierra el panel sin hacer nada
  cerrar() {
    this.bottomSheetRef.dismiss();
  }

  // Empaqueta los datos según el modo y valida
  guardar(nombre: string, descripcion: string) {
    this.intentadoGuardar.set(true);

    // Validación base
    if (!nombre.trim() || this.dificultadSeleccionada() === null) {
      return;
    }

    // Validación extra para rutinas: debe haber al menos un día seleccionado
    if (this.data.modo === 'rutina' && this.diasSeleccionados().length === 0) {
      return;
    }

    // Retornamos el objeto con toda la información
    this.bottomSheetRef.dismiss({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      dificultad: this.dificultadSeleccionada(),
      fecha: this.data.modo === 'tarea' ? this.fechaSeleccionada() : undefined,
      dias: this.data.modo === 'rutina' ? this.diasSeleccionados() : undefined,
      hora: this.data.modo === 'rutina' ? this.horaSeleccionada() : undefined
    });
  }
}