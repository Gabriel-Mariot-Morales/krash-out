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
}