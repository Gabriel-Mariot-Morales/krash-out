import { Component, inject, ChangeDetectionStrategy, computed, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import * as htmlToImage from 'html-to-image';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { AvatarService } from '../../core/services/avatar.service';
import { TiendaService } from '../../core/services/tienda.service';
import { StatsService } from '../../shared/services/stats.service';
import { ItemTienda, RarezaItem } from '../../core/models/tienda.model';
import { ACCESORIOS_CATALOGO } from '../../core/constants/accesorios.constants';
import { SUPERIOR_CATALOGO } from '../../core/constants/superior.constants';
import { INFERIOR_CATALOGO } from '../../core/constants/inferior.constants';

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
  private avatarService = inject(AvatarService);
  private tiendaService = inject(TiendaService);
  private statsService = inject(StatsService);

  @ViewChild('lienzoAvatar') lienzoAvatar!: ElementRef;

  equipamiento = this.avatarService.equipamiento;
  inventarioIds = this.tiendaService.inventario;
  nombreUsuario = this.statsService.nombreUsuario;

  // Señal local reinstaurada para uso exclusivo del HTML del avatar
  mostrarToast = signal<boolean>(false);

  misItems = computed(() => {
    const ids = this.inventarioIds();
    return CATALOGO_BASE.filter(item => ids.includes(item.id));
  });

  getItemsPorCategoria(categoria: string) {
    return this.misItems().filter(item => item.categoria === categoria);
  }

  getItemEquipado(categoria: 'accesorios' | 'superior' | 'inferior'): ItemTienda | null {
    const id = this.equipamiento()[categoria];
    if (!id) return null;
    return CATALOGO_BASE.find(item => item.id === id) || null;
  }

  toggleEquipar(item: ItemTienda) {
    const cat = item.categoria as 'accesorios' | 'superior' | 'inferior';
    const equipadoActual = this.equipamiento()[cat];
    
    if (equipadoActual === item.id) {
      this.avatarService.desequipar(cat);
    } else {
      this.avatarService.equipar(cat, item.id);
    }
  }

  estaEquipado(id: string): boolean {
    const eq = this.equipamiento();
    return eq.accesorios === id || eq.superior === id || eq.inferior === id;
  }

  quitarTodo() {
    this.avatarService.limpiarTodo();
  }

  async guardarAvatar() {
    if (!this.lienzoAvatar) return;

    try {
      const nodo = this.lienzoAvatar.nativeElement;
      
      const dataUrl = await htmlToImage.toPng(nodo, { 
        pixelRatio: 3,
        fontEmbedCSS: '' 
      });

      const nombreArchivo = `krash-avatar-${new Date().getTime()}.png`;

      if (Capacitor.getPlatform() === 'web') {
        const enlace = document.createElement('a');
        enlace.download = nombreArchivo;
        enlace.href = dataUrl;
        enlace.click();
      } else {
        const base64Data = dataUrl.split(',')[1];
        await Filesystem.writeFile({
          path: nombreArchivo,
          data: base64Data,
          directory: Directory.Documents
        });
      }

      // Disparador de la notificación visual local
      this.mostrarToast.set(true);
      setTimeout(() => this.mostrarToast.set(false), 3000);

    } catch (error) {
      console.error('Error critico al procesar la captura:', error);
    }
  }

  // Colores de rareza heredados de la logica central de estilos
  getRarezaColor(rareza: RarezaItem): string {
    switch (rareza) {
      case 'comun': return 'bg-[var(--color-rareza-comun)]';
      case 'raro': return 'bg-[var(--color-rareza-raro)]';
      case 'epico': return 'bg-[var(--color-rareza-epico)]';
      case 'legendario': return 'bg-[var(--color-rareza-legendario)]';
      case 'mitico': return 'bg-rareza-mitico';
      default: return 'bg-shark-base';
    }
  }
}