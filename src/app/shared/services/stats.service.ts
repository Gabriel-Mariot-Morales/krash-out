import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { TimeService } from './time.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  // Servicio para simular el paso del tiempo
  private timeService = inject(TimeService);

  // Señales para las monedas y la experiencia
  monedas = signal<number>(0);
  experiencia = signal<number>(0);

  // Registro de perfil e historial del usuario
  nombreUsuario = signal<string>('');
  tareasCompletadas = signal<number>(0);
  rachaActual = signal<number>(0);
  rachaMasLarga = signal<number>(0);
  itemsInventario = signal<number>(0);
  
  // Registro de la ultima fecha (YYYY-MM-DD) en la que se consiguieron puntos
  ultimaActividad = signal<string>('');

  // Calculo de progresion escalonada (Lvl 1: 200 XP, Lvl 2: 250 XP...)
  private progresoNivel = computed(() => {
    let xpRestante = this.experiencia();
    let lvl = 1;
    let xpRequerida = 200;

    // Bucle para calcular el nivel actual restando la experiencia requerida
    while (xpRestante >= xpRequerida) {
      xpRestante -= xpRequerida;
      lvl++;
      xpRequerida += 50;
    }

    // Devuelve el estado actual del progreso del usuario
    return {
      nivel: lvl,
      xpActual: xpRestante,
      xpMeta: xpRequerida,
      porcentaje: (xpRestante / xpRequerida) * 100
    };
  });

  // Exposicion de señales computadas de nivel para los componentes
  nivel = computed(() => this.progresoNivel().nivel);
  xpActualNivel = computed(() => this.progresoNivel().xpActual);
  xpParaSiguiente = computed(() => this.progresoNivel().xpMeta);
  porcentajeNivel = computed(() => this.progresoNivel().porcentaje);

  // Asignacion dinamica de titulos de escualos cada 5 niveles
  tituloTiburon = computed(() => {
    const lvl = this.nivel();
    switch (true) {
      case lvl >= 50: return 'Megalodon';
      case lvl >= 45: return 'Gran Tiburón Blanco';
      case lvl >= 40: return 'Tiburón Martillo';
      case lvl >= 35: return 'Tiburón Tigre';
      case lvl >= 30: return 'Tiburón Mako';
      case lvl >= 25: return 'Tiburón Toro';
      case lvl >= 20: return 'Tiburón Zorro';
      case lvl >= 15: return 'Tiburón Azul';
      case lvl >= 10: return 'Tiburón Leopardo';
      case lvl >= 5: return 'Tiburón Linterna';
      default: return 'Tiburón Bambú';
    }
  });

  constructor() {
    // Cargar los datos guardados al iniciar
    const stats = localStorage.getItem('krash_stats');
    if (stats) {
      const data = JSON.parse(stats);
      this.monedas.set(data.monedas || 0);
      this.experiencia.set(data.experiencia || 0);
      this.nombreUsuario.set(data.nombreUsuario || '');
      this.tareasCompletadas.set(data.tareasCompletadas || 0);
      this.rachaActual.set(data.rachaActual || 0);
      this.rachaMasLarga.set(data.rachaMasLarga || 0);
      this.itemsInventario.set(data.itemsInventario || 0);
      this.ultimaActividad.set(data.ultimaActividad || '');
    }

    // Guardar cada vez que cambien los valores
    effect(() => {
      localStorage.setItem('krash_stats', JSON.stringify({
        monedas: this.monedas(),
        experiencia: this.experiencia(),
        nombreUsuario: this.nombreUsuario(),
        tareasCompletadas: this.tareasCompletadas(),
        rachaActual: this.rachaActual(),
        rachaMasLarga: this.rachaMasLarga(),
        itemsInventario: this.itemsInventario(),
        ultimaActividad: this.ultimaActividad()
      }));
    });

    // Vigilante de ruptura de rachas por inactividad
    effect(() => {
      const hoy = this.timeService.fechaSimulada();
      this.comprobarRachaPerdida(hoy);
    });
  }

  // Metodo para guardar el nombre de usuario inicial
  registrarUsuario(nombre: string) {
    this.nombreUsuario.set(nombre.trim());
  }

  // Metodo auxiliar de seguridad para formatear la fecha local sin problemas de zona horaria
  private getLocalDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // Metodo auxiliar para calcular dias exactos de diferencia aislando saltos de horario de verano
  private getDiferenciaDias(fecha1Str: string, fecha2Date: Date): number {
    if (!fecha1Str) return 0;
    const [y1, m1, d1] = fecha1Str.split('-').map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(fecha2Date.getFullYear(), fecha2Date.getMonth(), fecha2Date.getDate());
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  // Metodo para verificar si han pasado mas de 24h sin completar nada y romper la racha
  private comprobarRachaPerdida(hoy: Date) {
    if (!this.ultimaActividad()) return;
    if (this.getDiferenciaDias(this.ultimaActividad(), hoy) > 1 && this.rachaActual() > 0) {
      this.rachaActual.set(0);
    }
  }

  // Metodo interno para actualizar la racha de forma progresiva
  private procesarAumentoRacha() {
    const hoyStr = this.getLocalDateString(this.timeService.fechaSimulada());
    if (this.ultimaActividad() !== hoyStr) {
      this.rachaActual.update(racha => racha + 1);
      if (this.rachaActual() > this.rachaMasLarga()) {
        this.rachaMasLarga.set(this.rachaActual());
      }
      this.ultimaActividad.set(hoyStr);
    }
  }

  // Metodo para añadir recompensas segun la dificultad
  anadirRecompensa(dificultad: number) {
    const xpGanada = dificultad * 20;
    const monedasGanadas = dificultad * 10;

    this.experiencia.update(expActual => expActual + xpGanada);
    this.monedas.update(monedasActuales => monedasActuales + monedasGanadas);
    this.tareasCompletadas.update(tareas => tareas + 1);
    this.procesarAumentoRacha();

    return { xpGanada, monedasGanadas };
  }

  // Metodo nuevo para añadir la mitad de recompensa en las rutinas
  anadirRecompensaRutina(dificultad: number) {
    const xpGanada = dificultad * 10;
    const monedasGanadas = dificultad * 5;

    this.experiencia.update(expActual => expActual + xpGanada);
    this.monedas.update(monedasActuales => monedasActuales + monedasGanadas);
    this.procesarAumentoRacha();

    return { xpGanada, monedasGanadas };
  }

  // Metodo para retirar la recompensa si el usuario cancela una rutina completada
  restarRecompensaRutina(dificultad: number) {
    this.experiencia.update(expActual => Math.max(0, expActual - (dificultad * 10)));
    this.monedas.update(monedasActuales => Math.max(0, monedasActuales - (dificultad * 5)));
  }
}