import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  // Señal que emite la fecha actual (o la simulada para depuracion)
  fechaSimulada = signal<Date>(new Date());

  // Metodo para avanzar o retroceder el reloj del sistema en dias completos
  avanzarDias(dias: number) {
    const nuevaFecha = new Date(this.fechaSimulada());
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaSimulada.set(nuevaFecha);
  }

  // Metodo para restaurar el reloj a la hora real del dispositivo
  resetearReloj() {
    this.fechaSimulada.set(new Date());
  }
}