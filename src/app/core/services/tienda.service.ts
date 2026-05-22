import { Injectable, signal, effect, inject } from '@angular/core';
import { TimeService } from './time.service';
import { StatsService } from '../../shared/services/stats.service';
import { CategoriaItem, RarezaItem, ItemTienda, ItemEnVenta } from '../models/tienda.model';
import { ACCESORIOS_CATALOGO } from '../constants/accesorios.constants';
import { SUPERIOR_CATALOGO } from '../constants/superior.constants';
import { INFERIOR_CATALOGO } from '../constants/inferior.constants';

// Base de datos temporal con el catalogo global de Krash-Out unificado
const CATALOGO_BASE: ItemTienda[] = [
  ...ACCESORIOS_CATALOGO,
  ...SUPERIOR_CATALOGO,
  ...INFERIOR_CATALOGO
];

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  private timeService = inject(TimeService);
  private statsService = inject(StatsService);

  // Señales de estado de la tienda y el jugador
  escaparate = signal<ItemEnVenta[]>([]);
  inventario = signal<string[]>([]);
  ultimoBloqueRotacion = signal<string>('');

  constructor() {
    // Carga de datos almacenados en local
    this.cargarDatos();

    // Guardado automatico en cada actualizacion del escaparate o inventario
    effect(() => {
      localStorage.setItem('krash_tienda_escaparate', JSON.stringify(this.escaparate()));
      localStorage.setItem('krash_tienda_inventario', JSON.stringify(this.inventario()));
      localStorage.setItem('krash_tienda_bloque', this.ultimoBloqueRotacion());
    });

    // Vigilante de cambios de hora para ejecutar la rotacion
    effect(() => {
      const hoy = this.timeService.fechaSimulada();
      this.comprobarRotacion(hoy);
    }, { allowSignalWrites: true });
  }

  // Metodo de lectura inicial del almacenamiento
  private cargarDatos() {
    const escaparateGuardado = localStorage.getItem('krash_tienda_escaparate');
    const inventarioGuardado = localStorage.getItem('krash_tienda_inventario');
    const bloqueGuardado = localStorage.getItem('krash_tienda_bloque');

    if (escaparateGuardado) this.escaparate.set(JSON.parse(escaparateGuardado));
    if (inventarioGuardado) this.inventario.set(JSON.parse(inventarioGuardado));
    if (bloqueGuardado) this.ultimoBloqueRotacion.set(bloqueGuardado);
  }

  // Comprueba si se ha cruzado un bloque de 6 horas (0, 6, 12, 18)
  private comprobarRotacion(hoy: Date) {
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    
    const bloqueHora = Math.floor(hoy.getHours() / 6);
    const identificadorBloque = `${año}-${mes}-${dia}-${bloqueHora}`;

    if (this.ultimoBloqueRotacion() !== identificadorBloque || this.escaparate().length === 0) {
      this.generarNuevoEscaparate();
      this.ultimoBloqueRotacion.set(identificadorBloque);
    }
  }

  // Extrae un item aleatorio disponible basandose en la cantidad real del catalogo (Bolsa ciega)
  private obtenerItemAleatorio(categoria: CategoriaItem, ignorarIds: string[]): ItemEnVenta | null {
    
    // Filtramos todos los objetos de la categoria que el usuario no tiene y no esten ya seleccionados
    const candidatos = CATALOGO_BASE.filter(item => 
      item.categoria === categoria && 
      !this.inventario().includes(item.id) &&
      !ignorarIds.includes(item.id)
    );

    if (candidatos.length === 0) return null; // Todo comprado en esta categoria

    // Seleccion puramente aleatoria. Las rarezas salen de forma natural segun su proporcion en la lista
    const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    return { ...elegido, pineado: false, comprado: false };
  }

  // Renueva el escaparate manteniendo los items pineados
  private generarNuevoEscaparate() {
    const escaparateActual = this.escaparate();
    const nuevoEscaparate: ItemEnVenta[] = [];
    const idsEnUso: string[] = [];

    const categorias: CategoriaItem[] = ['accesorios', 'superior', 'inferior'];

    categorias.forEach(cat => {
      // Filtrar items de esta categoria que estaban pineados (y no comprados)
      const pineados = escaparateActual.filter(i => i.categoria === cat && i.pineado && !i.comprado);
      
      for (let i = 0; i < 3; i++) {
        if (pineados[i]) {
          // Mantener el item pineado en su posicion
          nuevoEscaparate.push(pineados[i]);
          idsEnUso.push(pineados[i].id);
        } else {
          // Generar un item nuevo asegurando que no se duplique en el escaparate
          const nuevoItem = this.obtenerItemAleatorio(cat, idsEnUso);
          if (nuevoItem) {
            nuevoEscaparate.push(nuevoItem);
            idsEnUso.push(nuevoItem.id);
          }
        }
      }
    });

    this.escaparate.set(nuevoEscaparate);
  }

  // Fija o suelta un objeto del escaparate para la siguiente rotacion
  togglePin(id: string) {
    this.escaparate.update(esc => esc.map(item => 
      item.id === id ? { ...item, pineado: !item.pineado } : item
    ));
  }

  // Metodo de transaccion para comprar un objeto
  comprarItem(id: string) {
    const item = this.escaparate().find(i => i.id === id);
    if (!item || item.comprado) return false;

    if (this.statsService.monedas() >= item.precio) {
      // Descontar monedas e incrementar la estadistica global de items
      this.statsService.monedas.update(v => v - item.precio);
      this.statsService.itemsInventario.update(v => v + 1);
      
      // Registrar en el inventario y marcar como vendido en el escaparate
      this.inventario.update(inv => [...inv, item.id]);
      this.escaparate.update(esc => esc.map(i => 
        i.id === id ? { ...i, comprado: true, pineado: false } : i
      ));
      
      return true;
    }
    return false;
  }
}