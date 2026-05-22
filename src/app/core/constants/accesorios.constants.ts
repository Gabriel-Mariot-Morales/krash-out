import { ItemTienda } from '../models/tienda.model';

// Listado de items de la categoria accesorios
export const ACCESORIOS_CATALOGO: ItemTienda[] = [
  { id: 'a1', nombre: 'Gafas de Buceo', categoria: 'accesorios', rareza: 'comun', precio: 50, rutaSvg: 'assets/items/accesorios/gafas-buceo.svg' },
  { id: 'a2', nombre: 'Gorro de Lana', categoria: 'accesorios', rareza: 'comun', precio: 50, rutaSvg: 'assets/items/accesorios/gorro-lana.svg' },
  { id: 'a3', nombre: 'Snorkel de Neón', categoria: 'accesorios', rareza: 'raro', precio: 120, rutaSvg: 'assets/items/accesorios/snorkel-neon.svg' },
  { id: 'a4', nombre: 'Sombrero Pirata', categoria: 'accesorios', rareza: 'raro', precio: 120, rutaSvg: 'assets/items/accesorios/sombrero-pirata.svg' },
  { id: 'a5', nombre: 'Casco Submarino', categoria: 'accesorios', rareza: 'epico', precio: 275, rutaSvg: 'assets/items/accesorios/casco-submarino.svg' },
  { id: 'a6', nombre: 'Aleta Dorsal Falsa', categoria: 'accesorios', rareza: 'epico', precio: 275, rutaSvg: 'assets/items/accesorios/aleta-dorsal.svg' },
  { id: 'a7', nombre: 'Corona Abisal', categoria: 'accesorios', rareza: 'legendario', precio: 600, rutaSvg: 'assets/items/accesorios/corona-abisal.svg' },
  { id: 'a8', nombre: 'Tridente de Poseidón', categoria: 'accesorios', rareza: 'mitico', precio: 1350, rutaSvg: 'assets/items/accesorios/tridente.svg' }
];