import { Component, inject, ChangeDetectionStrategy, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { RutinasService, Rutina } from '../../core/services/rutinas.service';
import { StatsService } from '../../shared/services/stats.service';
import { ToastService } from '../../shared/services/toast.service';
import { TimeService } from '../../core/services/time.service';
import { ItemForm } from '../../shared/components/item-form/item-form';

@Component({
  selector: 'app-rutinas',
  imports: [
    CommonModule, 
    MatIconModule, 
    MatBottomSheetModule
  ],
  templateUrl: './rutinas.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Rutinas implements OnDestroy {
  // Inyeccion de los servicios necesarios
  private bottomSheet = inject(MatBottomSheet);
  private rutinasService = inject(RutinasService);
  private statsService = inject(StatsService);
  private toastService = inject(ToastService);
  private timeService = inject(TimeService);

  // Control de submenú superior: 'hoy' o 'todas'
  submenuActivo = signal<'hoy' | 'todas'>('hoy');
  toast = this.toastService.data;

  // Variables para medir el deslizamiento tactil o de raton
  activeSwipeId: string | null = null;
  startX: number = 0;
  currentX: number = 0;

  // Limpieza automatica del aviso flotante al salir de la pantalla
  ngOnDestroy() {
    this.toastService.ocultarInmediato();
  }

  // Cambia de submenu arriba
  cambiarSubmenu(tipo: 'hoy' | 'todas') {
    this.submenuActivo.set(tipo);
  }

  // Obtiene el dia actual adaptado (1=Lunes, 7=Domingo) basandose en el reloj del sistema
  private getDiaSemanaActual(): number {
    const jsDay = this.timeService.fechaSimulada().getDay();
    return jsDay === 0 ? 7 : jsDay;
  }

  // Metodo auxiliar para ordenar rutinas por hora (las vacias van al final)
  private ordenarPorHora(lista: Rutina[]): Rutina[] {
    return [...lista].sort((a, b) => {
      if (!a.hora) return 1;
      if (!b.hora) return -1;
      return a.hora.localeCompare(b.hora);
    });
  }

  // Filtrado computado para las rutinas programadas el dia de hoy
  rutinasHoy = computed(() => {
    const diaActual = this.getDiaSemanaActual();
    const filtradas = this.rutinasService.rutinas().filter(r => r.dias.includes(diaActual));
    return this.ordenarPorHora(filtradas);
  });

  // Filtrado computado para el gestor general (todas las rutinas existentes)
  todasLasRutinas = computed(() => {
    return this.ordenarPorHora(this.rutinasService.rutinas());
  });

  // Convierte el array de números en letras de dias para la vista
  getDiasString(dias: number[]): string {
    if (dias.length === 7) return 'Todos los días';
    const mapa: { [key: number]: string } = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };
    return [...dias].sort((a,b) => a - b).map(d => mapa[d]).join(', ');
  }

  // Abre el formulario configurado en modo rutina para crear una nueva
  abrirCreacion() {
    const ref = this.bottomSheet.open(ItemForm, {
      data: {
        modo: 'rutina',
        titulo: 'Nueva Rutina',
        placeholderNombre: '¿Qué hábito quieres crear?'
      }
    });

    ref.afterDismissed().subscribe(result => {
      if (result) {
        this.rutinasService.addRutina({
          id: crypto.randomUUID(),
          nombre: result.nombre,
          descripcion: result.descripcion,
          dificultad: result.dificultad,
          dias: result.dias,
          hora: result.hora,
          completadaHoy: false,
          aplazadaHoy: false
        });
      }
    });
  }

  // Abre el panel cargado con los datos de una rutina para proceder a editarla
  abrirEdicion(rutina: Rutina) {
    const ref = this.bottomSheet.open(ItemForm, {
      data: {
        modo: 'rutina',
        titulo: 'Editar Rutina',
        placeholderNombre: 'Nombre de la rutina',
        nombreInicial: rutina.nombre,
        descInicial: rutina.descripcion
      }
    });

    // Rellenar las variables reactivas en el formulario
    setTimeout(() => {
      const instancia = ref.instance;
      if (instancia) {
        instancia.dificultadSeleccionada.set(rutina.dificultad);
        instancia.diasSeleccionados.set(rutina.dias);
        instancia.horaSeleccionada.set(rutina.hora || null);
      }
    }, 50);

    ref.afterDismissed().subscribe(result => {
      if (result) {
        this.rutinasService.updateRutina(rutina.id, {
          nombre: result.nombre,
          descripcion: result.descripcion,
          dificultad: result.dificultad,
          dias: result.dias,
          hora: result.hora
        });
      }
    });
  }

  onPointerDown(event: PointerEvent, id: string) {
    this.activeSwipeId = id;
    this.startX = event.clientX;
    this.currentX = this.startX;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    this.currentX = event.clientX;
  }

  // Lógica para procesar las acciones gestuales con transiciones de estado
  onPointerUp(event: PointerEvent, id: string) {
    if (this.activeSwipeId !== id) return;
    
    const deltaX = this.currentX - this.startX;
    const umbral = 100;
    const modo = this.submenuActivo();

    if (modo === 'hoy') {
      const rutina = this.rutinasHoy().find(r => r.id === id);
      if (rutina) {
        if (deltaX > umbral) {
          if (!rutina.completadaHoy) {
            const premios = this.statsService.anadirRecompensaRutina(rutina.dificultad);
            this.toastService.mostrar(premios.xpGanada, premios.monedasGanadas);
            this.rutinasService.marcarEstadoDiario(id, 'completadaHoy', true);
            this.rutinasService.marcarEstadoDiario(id, 'aplazadaHoy', false);
          }
        } else if (deltaX < -umbral) {
          if (!rutina.aplazadaHoy) {
            if (rutina.completadaHoy) {
              this.statsService.restarRecompensaRutina(rutina.dificultad);
            }
            this.rutinasService.marcarEstadoDiario(id, 'aplazadaHoy', true);
            this.rutinasService.marcarEstadoDiario(id, 'completadaHoy', false);
          }
        }
      }
    } else {
      const rutina = this.todasLasRutinas().find(r => r.id === id);
      if (rutina) {
        if (deltaX > umbral) {
          this.abrirEdicion(rutina);
        } else if (deltaX < -umbral) {
          this.rutinasService.deleteRutina(id);
        }
      }
    }

    this.activeSwipeId = null;
    this.startX = 0;
    this.currentX = 0;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  getTransform(id: string): string {
    if (this.activeSwipeId === id) {
      return `translateX(${this.currentX - this.startX}px)`;
    }
    return 'translateX(0px)';
  }

  getSwipeDirection(id: string): 'left' | 'right' | 'none' {
    if (this.activeSwipeId !== id) return 'none';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 20) return 'right';
    if (deltaX < -20) return 'left';
    return 'none';
  }

  getSwipeBackground(id: string): string {
    if (this.activeSwipeId !== id) return 'var(--color-shark-dark)';
    const deltaX = this.currentX - this.startX;
    if (deltaX > 0) return 'var(--color-action-complete)'; 
    if (deltaX < 0) return 'var(--color-action-delete)'; 
    return 'var(--color-shark-dark)';
  }
}