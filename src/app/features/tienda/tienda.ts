import { Component, inject, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TiendaService } from '../../core/services/tienda.service';
import { StatsService } from '../../shared/services/stats.service';
import { ItemEnVenta } from '../../core/models/tienda.model'; // Añadido ItemEnVenta
import { ColorService } from '../../shared/services/rarity-color.service';
@Component({
  selector: 'app-tienda',
  imports: [CommonModule, MatIconModule],
  templateUrl: './tienda.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tienda implements OnInit, OnDestroy {
  private tiendaService = inject(TiendaService);
  private statsService = inject(StatsService);
  protected colorService = inject(ColorService);

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

    const horaActual = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutoActual = Math.floor((diff / 1000 / 60) % 60);
    const segundoActual = Math.floor((diff / 1000) % 60);

    this.tiempoRestante.set(
      `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}:${segundoActual.toString().padStart(2, '0')}`
    );
  }

  // Extrae unicamente los objetos de una categoria especifica y rellena huecos si faltan
  getItemsPorCategoria(categoria: string) {
    const itemsActuales = this.escaparate().filter(item => item.categoria === categoria);
    
    // Tipamos el array combinando el modelo original con la propiedad extra de stock
    const resultado = [...itemsActuales] as (ItemEnVenta & { sinExistencias?: boolean })[];
    
    while (resultado.length < 3) {
      resultado.push({ 
        id: `vacio-${categoria}-${resultado.length}`, 
        sinExistencias: true 
      } as ItemEnVenta & { sinExistencias?: boolean });
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
}