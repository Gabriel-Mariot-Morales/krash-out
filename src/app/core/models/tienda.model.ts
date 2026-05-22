// Definicion de tipos para el ecosistema de items
export type CategoriaItem = 'accesorios' | 'superior' | 'inferior';
export type RarezaItem = 'comun' | 'raro' | 'epico' | 'legendario' | 'mitico';

export interface ItemTienda {
  id: string;
  nombre: string;
  categoria: CategoriaItem;
  rareza: RarezaItem;
  precio: number;
  rutaSvg: string;
}

export interface ItemEnVenta extends ItemTienda {
  pineado: boolean;
  comprado: boolean;
}