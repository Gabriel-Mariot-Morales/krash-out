import { Injectable, signal, effect, inject } from '@angular/core';
import { TimeService } from './time.service';

// Estructura de una rutina reutilizable
export interface Rutina {
  id: string;
  nombre: string;
  descripcion: string;
  dificultad: number;
  dias: number[];
  hora?: string;
  completadaHoy: boolean;
  aplazadaHoy: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RutinasService {
  private timeService = inject(TimeService);
  
  // Signal para gestionar el estado de todas las rutinas
  rutinas = signal<Rutina[]>([]);
  
  // Rastreo del ultimo dia en el que se reiniciaron las tareas (formato YYYY-MM-DD)
  ultimoDiaRevisado = signal<string>('');

  constructor() {
    // Cargar datos iniciales
    this.cargarRutinas();

    // Guardar automaticamente en cada actualizacion
    effect(() => {
      localStorage.setItem('shark_rutinas', JSON.stringify(this.rutinas()));
      localStorage.setItem('shark_rutinas_dia', this.ultimoDiaRevisado());
    });

    // Escucha constante al reloj para desencadenar el reinicio diario
    effect(() => {
      const hoy = this.timeService.fechaSimulada();
      this.revisarCambioDeDia(hoy);
    }, { allowSignalWrites: true });
  }

  // Metodo para leer las rutinas guardadas en el dispositivo
  private cargarRutinas() {
    const almacenadas = localStorage.getItem('shark_rutinas');
    const diaGuardado = localStorage.getItem('shark_rutinas_dia');
    if (almacenadas) {
      try {
        this.rutinas.set(JSON.parse(almacenadas));
      } catch (e) {
        console.error("Error cargando rutinas:", e);
      }
    }
    if (diaGuardado) {
      this.ultimoDiaRevisado.set(diaGuardado);
    }
  }

  // Metodo auxiliar de seguridad para formatear la fecha local sin problemas de zona horaria
  private getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Comprueba si el dia del calendario ha cambiado respecto al ultimo guardado
  private revisarCambioDeDia(hoy: Date) {
    const fechaStr = this.getLocalDateString(hoy);
    
    if (this.ultimoDiaRevisado() && this.ultimoDiaRevisado() !== fechaStr) {
      this.rutinas.update(r => r.map(rutina => ({
        ...rutina,
        completadaHoy: false,
        aplazadaHoy: false
      })));
    }
    this.ultimoDiaRevisado.set(fechaStr);
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