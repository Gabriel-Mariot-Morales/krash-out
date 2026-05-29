import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {

  async exportarDatos() {
    const data = {
      stats: localStorage.getItem('krash_stats'),
      avatar: localStorage.getItem('krash_avatar_equipado'),
      rutinas: localStorage.getItem('shark_rutinas'),
      rutinasDia: localStorage.getItem('shark_rutinas_dia'),
      tareas: localStorage.getItem('shark_tareas'),
      tiendaEscaparate: localStorage.getItem('krash_tienda_escaparate'),
      tiendaInventario: localStorage.getItem('krash_tienda_inventario'),
      tiendaBloque: localStorage.getItem('krash_tienda_bloque')
    };

    const jsonString = JSON.stringify(data);
    const fileName = `krash_backup_${new Date().getTime()}.json`;

    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      
      await Share.share({
        title: 'Copia de Seguridad Krash-Out',
        text: 'Copia de seguridad de tus datos.',
        url: result.uri,
      });
    } catch (e) {
      console.error('Error al exportar datos:', e);
    }
  }

  importarDatos(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.stats) localStorage.setItem('krash_stats', data.stats);
      if (data.avatar) localStorage.setItem('krash_avatar_equipado', data.avatar);
      if (data.rutinas) localStorage.setItem('shark_rutinas', data.rutinas);
      if (data.rutinasDia) localStorage.setItem('shark_rutinas_dia', data.rutinasDia);
      if (data.tareas) localStorage.setItem('shark_tareas', data.tareas);
      if (data.tiendaEscaparate) localStorage.setItem('krash_tienda_escaparate', data.tiendaEscaparate);
      if (data.tiendaInventario) localStorage.setItem('krash_tienda_inventario', data.tiendaInventario);
      if (data.tiendaBloque) localStorage.setItem('krash_tienda_bloque', data.tiendaBloque);
      
      location.reload();
    } catch (e) {
      console.error('Error al importar datos:', e);
      alert('El archivo seleccionado no es válido o está corrupto.');
    }
  }
}