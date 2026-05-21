import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatsService } from '../../shared/services/stats.service';
import { TimeService } from '../../core/services/time.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, MatIconModule, DatePipe],
  templateUrl: './perfil.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Perfil {
  private statsService = inject(StatsService);
  private timeService = inject(TimeService);

  // Fecha simulada actual
  fechaActual = this.timeService.fechaSimulada;

  // Variables reactivas vinculadas al estado global
  nombreUsuario = this.statsService.nombreUsuario;
  monedas = this.statsService.monedas;
  experiencia = this.statsService.experiencia;
  
  // Elementos de progresion de nivel y titulos
  nivel = this.statsService.nivel;
  xpActual = this.statsService.xpActualNivel;
  xpMeta = this.statsService.xpParaSiguiente;
  porcentaje = this.statsService.porcentajeNivel;
  titulo = this.statsService.tituloTiburon;

  // Listado de contadores estadisticos
  tareasCompletadas = this.statsService.tareasCompletadas;
  rachaActual = this.statsService.rachaActual;
  rachaMasLarga = this.statsService.rachaMasLarga;
  itemsInventario = this.statsService.itemsInventario;

  // Metodo para asignar el nombre desde la interfaz del formulario inicial
  establecerNombre(nombre: string) {
    if (nombre.trim()) {
      this.statsService.registrarUsuario(nombre);
    }
  }

  // --- ZONA DE DEPURACION ---

  debugAvanzarDia() {
    this.timeService.avanzarDias(1);
  }

  debugResetearReloj() {
    this.timeService.resetearReloj();
  }

  debugResetearTodo() {
    localStorage.clear();
    location.reload(); 
  }
}