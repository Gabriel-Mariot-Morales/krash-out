import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  // Señales para las monedas y la experiencia
  monedas = signal<number>(0);
  experiencia = signal<number>(0);

  constructor() {
    // Cargamos los datos guardados al iniciar
    const stats = localStorage.getItem('krash_stats');
    if (stats) {
      const { monedas, experiencia } = JSON.parse(stats);
      this.monedas.set(monedas);
      this.experiencia.set(experiencia);
    }

    // Guardamos cada vez que cambien los valores
    effect(() => {
      localStorage.setItem('krash_stats', JSON.stringify({
        monedas: this.monedas(),
        experiencia: this.experiencia()
      }));
    });
  }

  // Metodo para añadir recompensas segun la dificultad
  añadirRecompensa(dificultad: number) {
    const xpGanada = dificultad * 20;
    const monedasGanadas = dificultad * 10;

    this.experiencia.update(v => v + xpGanada);
    this.monedas.update(v => v + monedasGanadas);

    return { xpGanada, monedasGanadas };
  }

  // Metodo nuevo para añadir la mitad de recompensa en las rutinas
  añadirRecompensaRutina(dificultad: number) {
    const xpGanada = dificultad * 10;
    const monedasGanadas = dificultad * 5;

    this.experiencia.update(v => v + xpGanada);
    this.monedas.update(v => v + monedasGanadas);

    return { xpGanada, monedasGanadas };
  }

  // Metodo para retirar la recompensa si el usuario cancela una rutina completada
  restarRecompensaRutina(dificultad: number) {
    const xpPerdida = dificultad * 10;
    const monedasPerdidas = dificultad * 5;

    // Aseguramos que nunca bajen de 0
    this.experiencia.update(v => Math.max(0, v - xpPerdida));
    this.monedas.update(v => Math.max(0, v - monedasPerdidas));
  }
}