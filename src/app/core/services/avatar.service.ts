import { Injectable, signal, effect } from '@angular/core';

// Interfaz que define la estructura del equipamiento activo
export interface Equipamiento {
  accesorios: string | null;
  superior: string | null;
  inferior: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  // Estado inicial del equipamiento vacio
  equipamiento = signal<Equipamiento>({ 
    accesorios: null, 
    superior: null, 
    inferior: null 
  });

  constructor() {
    // Carga de la ropa guardada previamente en el disco local
    const guardado = localStorage.getItem('krash_avatar_equipado');
    if (guardado) {
      this.equipamiento.set(JSON.parse(guardado));
    }

    // Auto-guardado en local cada vez que el usuario se cambia de ropa
    effect(() => {
      localStorage.setItem('krash_avatar_equipado', JSON.stringify(this.equipamiento()));
    });
  }

  // Metodo para poner una prenda en su ranura correspondiente
  equipar(categoria: 'accesorios' | 'superior' | 'inferior', id: string) {
    this.equipamiento.update(eq => ({ ...eq, [categoria]: id }));
  }

  // Metodo para quitarse una prenda de una ranura especifica
  desequipar(categoria: 'accesorios' | 'superior' | 'inferior') {
    this.equipamiento.update(eq => ({ ...eq, [categoria]: null }));
  }

  // Metodo para vaciar por completo el vestuario actual
  limpiarTodo() {
    this.equipamiento.set({ accesorios: null, superior: null, inferior: null });
  }
}