import { Injectable } from '@angular/core';
import { RarezaItem } from '../../core/models/tienda.model';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  // Colores de rareza heredados de la logica central de estilos
  getRarezaColor(rareza: RarezaItem): string {
      switch (rareza) {
        case 'comun': return 'bg-rareza-comun';
        case 'raro': return 'bg-rareza-raro';
        case 'epico': return 'bg-rareza-epico';
        case 'legendario': return 'bg-rareza-legendario';
        case 'mitico': return 'bg-rareza-mitico';
        default: return 'bg-shark-base';
      }
  }
}