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
  // Inyección de los servicios necesarios
  private bottomSheet = inject(MatBottomSheet);
  private tareasService = inject(TareasService);
  private statsService = inject(StatsService);
  private toastService = inject(ToastService);
  
  // Obtenemos la lista de tareas del servicio
  tareas = this.tareasService.tareas;
  toast = this.toastService.data;

  // Variables para controlar el movimiento de deslizamiento
  activeSwipeId: string | null = null;
  startX: number = 0;
  currentX: number = 0;

  // Se ejecuta automáticamente cuando el usuario sale de esta vista
  ngOnDestroy() {
    this.toastService.ocultarInmediato();
  }

  // Método para abrir el formulario de creación de tareas
  abrirCreacion() {
    const ref = this.bottomSheet.open(ItemForm, {
      data: {
        modo: 'tarea',
        titulo: 'Nueva Tarea',
        placeholderNombre: '¿Qué quieres conseguir?'
      }
    });

    // Guardamos la tarea si el formulario devuelve datos
    ref.afterDismissed().subscribe(result => {
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

  // Registramos el movimiento del dedo o ratón
  onPointerMove(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    this.currentX = event.clientX;
  }

  // Función para cuando el usuario suelta la tarea y ejecutar la acción
  onPointerUp(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    
    const deltaX = this.currentX - this.startX;
    const umbral = 100; // Distancia necesaria para activar la acción

    const tarea = this.tareas().find(t => t.id === id);

    if (deltaX > umbral && tarea) {
      // Si desliza a la derecha se completa
      const recompensas = this.statsService.anadirRecompensa(tarea.dificultad);
      this.toastService.mostrar(recompensas.xpGanada, recompensas.monedasGanadas);
      this.tareasService.deleteTarea(id); 
    } else if (deltaX < -umbral) {
      // Si desliza a la izquierda se elimina
      this.tareasService.deleteTarea(id);
    }

    // Limpiamos los datos del deslizamiento
    this.activeSwipeId = null;
    this.startX = 0;
    this.currentX = 0;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  // Método para mover la tarjeta visualmente en la pantalla
  getTransform(id: string): string {
    if (this.activeSwipeId === id) {
      const deltaX = this.currentX - this.startX;
      return `translateX(${deltaX}px)`;
    }
    return 'translateX(0px)';
  }

  // Determina si estamos deslizando a la izquierda o derecha para mostrar iconos
  getSwipeDirection(id: string): 'left' | 'right' | 'none' {
    if (this.activeSwipeId !== id) return 'none';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 20) return 'right';
    if (deltaX < -20) return 'left';
    return 'none';
  }

  // Devuelve el color del fondo según la dirección del deslizamiento
  getSwipeBackground(id: string): string {
    if (this.activeSwipeId !== id) return 'var(--color-shark-dark)';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 0) return 'var(--color-action-complete)'; 
    if (deltaX < 0) return 'var(--color-action-delete)'; 
    return 'var(--color-shark-dark)';
  }
  
}