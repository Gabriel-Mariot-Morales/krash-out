import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatsService } from '../../shared/services/stats.service';
import { TimeService } from '../../shared/services/time.service';

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

  debugAnadirOro() {
    this.statsService.monedas.update(monedasActuales => monedasActuales + 1000);
  }

  debugAnadirExp() {
    this.statsService.experiencia.update(expActual => expActual + 1000);
  }

  debugResetearInventario() {
    this.statsService.itemsInventario.set(0);
    localStorage.removeItem('krash_tienda_inventario');
    location.reload(); 
  }

  debugResetearTodo() {
    localStorage.clear();
    location.reload(); 
  }
}