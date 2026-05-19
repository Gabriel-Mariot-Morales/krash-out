import { Injectable, signal, effect } from '@angular/core';

// Definicion de la estructura de una tarea con soporte para fecha
export interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  dificultad: number;
  completada: boolean;
  fecha?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  // Signal que gestiona el estado global de las tareas
  tareas = signal<Tarea[]>([]);

  constructor() {
    // Recuperar datos al arrancar
    this.cargarTareas();

    // Persistencia automatica en cada cambio
    effect(() => {
      localStorage.setItem('shark_tareas', JSON.stringify(this.tareas()));
    });
  }

  private cargarTareas() {
    const almacenadas = localStorage.getItem('shark_tareas');
    if (almacenadas) {
      try {
        const parsed = JSON.parse(almacenadas);
        const convalidadas = parsed.map((t: any) => ({
          ...t,
          fecha: t.fecha ? new Date(t.fecha) : undefined
        }));
        this.tareas.set(convalidadas);
      } catch (e) {
        console.error("Error cargando tareas:", e);
      }
    }
  }

  // Agrega una nueva tarea al inicio de la lista
  addTarea(tarea: Tarea) {
    this.tareas.update(t => [tarea, ...t]);
  }

  // Filtra la lista para eliminar por ID
  deleteTarea(id: string) {
    this.tareas.update(t => t.filter(tarea => tarea.id !== id));
  }

  // Alterna el estado de completado de una tarea
  toggleTarea(id: string) {
    this.tareas.update(t => t.map(tarea => 
      tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    ));
  }
}