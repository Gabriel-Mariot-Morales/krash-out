import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AvatarService } from '../../core/services/avatar.service';
import { TiendaService } from '../../core/services/tienda.service';
import { StatsService } from '../../shared/services/stats.service';
import { ItemTienda, RarezaItem } from '../../core/models/tienda.model';
import { ACCESORIOS_CATALOGO } from '../../core/constants/accesorios.constants';
import { SUPERIOR_CATALOGO } from '../../core/constants/superior.constants';
import { INFERIOR_CATALOGO } from '../../core/constants/inferior.constants';

// Reconstruimos el catalogo completo para buscar la informacion de los objetos que poseemos
const CATALOGO_BASE: ItemTienda[] = [
  ...ACCESORIOS_CATALOGO, 
  ...SUPERIOR_CATALOGO, 
  ...INFERIOR_CATALOGO
];

@Component({
  selector: 'app-avatar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './avatar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Avatar {
  // Inyeccion de los servicios necesarios
  private avatarService = inject(AvatarService);
  private tiendaService = inject(TiendaService);
  private statsService = inject(StatsService);

  // Señales reactivas vinculadas al estado global
  equipamiento = this.avatarService.equipamiento;
  inventarioIds = this.tiendaService.inventario;
  nombreUsuario = this.statsService.nombreUsuario;

  // Cruza los IDs del inventario con el catalogo base para obtener los objetos completos
  misItems = computed(() => {
    const ids = this.inventarioIds();
    return CATALOGO_BASE.filter(item => ids.includes(item.id));
  });

  // Filtro de objetos en propiedad por categoria para los generadores visuales
  getItemsPorCategoria(categoria: string) {
    return this.misItems().filter(item => item.categoria === categoria);
  }

  // Obtiene los datos completos del objeto que esta equipado actualmente en una ranura
  getItemEquipado(categoria: 'accesorios' | 'superior' | 'inferior'): ItemTienda | null {
    const id = this.equipamiento()[categoria];
    if (!id) return null;
    return CATALOGO_BASE.find(item => item.id === id) || null;
  }

  // Alterna entre ponerse y quitarse una prenda con un solo toque desde el inventario
  toggleEquipar(item: ItemTienda) {
    const cat = item.categoria as 'accesorios' | 'superior' | 'inferior';
    const equipadoActual = this.equipamiento()[cat];
    
    if (equipadoActual === item.id) {
      this.avatarService.desequipar(cat);
    } else {
      this.avatarService.equipar(cat, item.id);
    }
  }

  // Comprobador booleano para cambiar el estilo visual de la tarjeta si la prenda esta puesta
  estaEquipado(id: string): boolean {
    const eq = this.equipamiento();
    return eq.accesorios === id || eq.superior === id || eq.inferior === id;
  }

  // Ejecuta la limpieza total del avatar
  quitarTodo() {
    this.avatarService.limpiarTodo();
  }

  // Feedback visual simulado, la persistencia real ya ocurre por el efecto del servicio
  guardarAvatar() {
    alert('¡Avatar guardado!');
  }

  // Colores de rareza heredados de la logica de la tienda
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