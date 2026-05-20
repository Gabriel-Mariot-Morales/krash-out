import { Injectable, signal, effect } from '@angular/core';

// Estructura de una rutina reutilizable
export interface Rutina {
  id: string;
  nombre: string;
  descripcion: string;
  dificultad: number;
  dias: number[]; // Array del 1 (L) al 7 (D)
  hora?: string;
  completadaHoy: boolean;
  aplazadaHoy: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RutinasService {
  // Signal para gestionar el estado de todas las rutinas
  rutinas = signal<Rutina[]>([]);

  constructor() {
    // Recuperar el listado guardado en local
    this.cargarRutinas();

    // Guardar automaticamente en cada actualizacion
    effect(() => {
      localStorage.setItem('shark_rutinas', JSON.stringify(this.rutinas()));
    });
  }

  // Metodo para leer las rutinas guardadas en el dispositivo
  private cargarRutinas() {
    const almacenadas = localStorage.getItem('shark_rutinas');
    if (almacenadas) {
      try {
        this.rutinas.set(JSON.parse(almacenadas));
      } catch (e) {
        console.error("Error cargando rutinas:", e);
      }
    }
  }

  // Inserta una nueva rutina en la lista
  addRutina(rutina: Rutina) {
    this.rutinas.update(r => [...r, rutina]);
  }

  // Elimina una rutina de forma permanente de la lista
  deleteRutina(id: string) {
    this.rutinas.update(r => r.filter(rutina => rutina.id !== id));
  }

  // Modifica los datos de una rutina existente
  updateRutina(id: string, valoresActualizados: Partial<Rutina>) {
    this.rutinas.update(r => r.map(rutina => 
      rutina.id === id ? { ...rutina, ...valoresActualizados } : rutina
    ));
  }

  // Cambia el estado diario de una rutina (completada o aplazada)
  marcarEstadoDiario(id: string, campo: 'completadaHoy' | 'aplazadaHoy', valor: boolean) {
    this.rutinas.update(r => r.map(rutina => 
      rutina.id === id ? { ...rutina, [campo]: valor } : rutina
    ));
  }
}