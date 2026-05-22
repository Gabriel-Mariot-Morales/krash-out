import { Component, inject, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TiendaService } from '../../core/services/tienda.service';
import { StatsService } from '../../shared/services/stats.service';
import { RarezaItem } from '../../core/models/tienda.model';

@Component({
  selector: 'app-tienda',
  imports: [CommonModule, MatIconModule],
  templateUrl: './tienda.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tienda implements OnInit, OnDestroy {
  private tiendaService = inject(TiendaService);
  private statsService = inject(StatsService);

  // Variables reactivas para renderizar la vista
  escaparate = this.tiendaService.escaparate;
  monedas = this.statsService.monedas;

  // Contador de rotacion en tiempo real
  tiempoRestante = signal<string>('00:00:00');
  private intervaloReloj: any;

  // Inicializa el temporizador al cargar la pantalla
  ngOnInit() {
    this.actualizarReloj();
    this.intervaloReloj = setInterval(() => this.actualizarReloj(), 1000);
  }

  // Limpia el temporizador en segundo plano al salir de la vista
  ngOnDestroy() {
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }

  // Metodo para calcular la diferencia entre la hora actual y el siguiente bloque de 6h
  private actualizarReloj() {
    const ahora = new Date();
    const horas = ahora.getHours();
    const proximoBloque = Math.floor(horas / 6) * 6 + 6;

    const proximaRotacion = new Date(ahora);
    proximaRotacion.setHours(proximoBloque, 0, 0, 0);

    const diff = proximaRotacion.getTime() - ahora.getTime();

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    this.tiempoRestante.set(
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    );
  }

  // Extrae unicamente los objetos de una categoria especifica y rellena huecos si faltan
  getItemsPorCategoria(categoria: string): any[] {
    const items = this.escaparate().filter(item => item.categoria === categoria);
    const resultado: any[] = [...items];
    
    while (resultado.length < 3) {
      resultado.push({ 
        id: `vacio-${categoria}-${resultado.length}`, 
        sinExistencias: true 
      });
    }
    
    return resultado;
  }

  // Fija un objeto para la siguiente rotacion
  togglePin(id: string) {
    this.tiendaService.togglePin(id);
  }

  // Intenta comprar el objeto validando los fondos
  comprar(id: string) {
    this.tiendaService.comprarItem(id);
  }

  // Asigna un color de fondo/borde basado en la rareza del objeto
  getRarezaColor(rareza: RarezaItem): string {
    switch (rareza) {
      case 'comun': return 'bg-green-400';
      case 'raro': return 'bg-blue-400';
      case 'epico': return 'bg-purple-400';
      case 'legendario': return 'bg-yellow-400';
      case 'mitico': return 'bg-linear-to-tr from-red-500 via-yellow-400 to-purple-600';
      default: return 'bg-shark-base';
    }
  }
}