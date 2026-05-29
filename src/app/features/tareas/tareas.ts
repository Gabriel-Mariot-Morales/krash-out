import { Component, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { TareasService } from '../../core/services/tareas.service';
import { StatsService } from '../../shared/services/stats.service';
import { ToastService } from '../../shared/services/toast.service';
import { ItemForm } from '../../shared/components/item-form/item-form';

@Component({
  selector: 'app-tareas',
  imports: [
    CommonModule, 
    MatIconModule, 
    MatBottomSheetModule, 
    DatePipe
  ],
  templateUrl: './tareas.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tareas implements OnDestroy {
  // Inyeccion de los servicios necesarios para el componente
  private bottomSheet = inject(MatBottomSheet);
  private tareasService = inject(TareasService);
  private statsService = inject(StatsService);
  private toastService = inject(ToastService);
  
  // Obtenemos la lista de tareas del servicio para pintarlas
  tareas = this.tareasService.tareas;
  toast = this.toastService.data;

  // Variables para controlar el movimiento de deslizamiento del dedo
  activeSwipeId: string | null = null;
  startX: number = 0;
  currentX: number = 0;

  // Se ejecuta automaticamente cuando el usuario sale de esta vista
  ngOnDestroy() {
    this.toastService.ocultarInmediato();
  }

  // Metodo para abrir el formulario de creacion de tareas inferior
  abrirCreacion() {
    const bottomSheetRef = this.bottomSheet.open(ItemForm, {
      data: {
        modo: 'tarea',
        titulo: 'Nueva Tarea',
        placeholderNombre: '¿Qué quieres conseguir?'
      }
    });

    // Guardamos la tarea si el formulario devuelve datos validos
    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        this.tareasService.addTarea({
          id: crypto.randomUUID(),
          nombre: result.nombre,
          descripcion: result.descripcion,
          dificultad: result.dificultad,
          fecha: result.fecha,
          completada: false
        });
      }
    });
  }

  // Detectamos cuando el usuario empieza a tocar o hacer clic en una tarea
  onPointerDown(event: PointerEvent, id: string) {
    this.activeSwipeId = id;
    this.startX = event.clientX;
    this.currentX = this.startX;
    // Bloqueamos el puntero para seguir el movimiento fuera del elemento
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  // Registramos el movimiento del dedo o raton en el eje horizontal
  onPointerMove(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    this.currentX = event.clientX;
  }

  // Funcion para cuando el usuario suelta la tarea y evaluar la accion
  onPointerUp(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    
    const deltaX = this.currentX - this.startX;
    const umbral = 100; // Distancia necesaria para activar la accion

    const tareaSeleccionada = this.tareas().find(tareaActiva => tareaActiva.id === id);

    if (deltaX > umbral && tareaSeleccionada) {
      // Si desliza a la derecha completamos la tarea y damos premios
      const recompensas = this.statsService.anadirRecompensa(tareaSeleccionada.dificultad);
      this.toastService.mostrar(recompensas.xpGanada, recompensas.monedasGanadas);
      this.tareasService.deleteTarea(id); 
    } else if (deltaX < -umbral) {
      // Si desliza a la izquierda eliminamos la tarea sin premio
      this.tareasService.deleteTarea(id);
    }

    // Limpiamos los datos del deslizamiento para el siguiente uso
    this.activeSwipeId = null;
    this.startX = 0;
    this.currentX = 0;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  // Metodo para mover la tarjeta visualmente en la pantalla con CSS
  getTransform(id: string): string {
    if (this.activeSwipeId === id) {
      const deltaX = this.currentX - this.startX;
      return `translateX(${deltaX}px)`;
    }
    return 'translateX(0px)';
  }

  // Determina si estamos deslizando a la izquierda o derecha para mostrar iconos traseros
  getSwipeDirection(id: string): 'left' | 'right' | 'none' {
    if (this.activeSwipeId !== id) return 'none';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 20) return 'right';
    if (deltaX < -20) return 'left';
    return 'none';
  }

  // Devuelve el color del fondo segun la direccion del deslizamiento
  getSwipeBackground(id: string): string {
    if (this.activeSwipeId !== id) return 'var(--color-shark-dark)';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 0) return 'var(--color-action-complete)'; 
    if (deltaX < 0) return 'var(--color-action-delete)'; 
    return 'var(--color-shark-dark)';
  }
}