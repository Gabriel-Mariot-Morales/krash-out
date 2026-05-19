import { Injectable, signal } from '@angular/core';

export interface ToastData {
  xp: number;
  monedas: number;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Estado que controla la visibilidad y datos del mensaje
  data = signal<ToastData>({ xp: 0, monedas: 0, visible: false });
  
  // Referencia interna para limpiar el tiempo de espera, inicializada en null
  private timeoutId: any = null;

  // Metodo para mostrar la recompensa durante un segundo
  mostrar(xp: number, monedas: number) {
    // Limpiamos cualquier temporizador activo antes de empezar uno nuevo para evitar que se acumulen
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.data.set({ xp, monedas, visible: true });
    
    // El mensaje desaparece tras 1000 milisegundos (1 segundo exacto)
    this.timeoutId = setTimeout(() => {
      this.data.update(d => ({ ...d, visible: false }));
      this.timeoutId = null;
    }, 1000);
  }

  // Metodo para forzar el cierre al cambiar de pantalla
  ocultarInmediato() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.data.update(d => ({ ...d, visible: false }));
  }
}