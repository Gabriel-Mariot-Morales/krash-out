export interface Tarea {
  id: string;
  nombre: string;
  descripcion?: string; // Opcional
  dificultad: number; // Del 1 (muy fácil) al 5 (muy difícil)
  fechaHora?: string; // Puramente visual
  completada: boolean;
}