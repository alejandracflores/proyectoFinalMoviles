import { Component } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { PhotoModalComponent } from '../components/photo-modal/photo-modal.component';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import { InspectionModalComponent } from '../components/inspection-modal/inspection-modal.component';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  photos: {
    dataUrl: string,
    date: Date
  }[] = [];

  locations: { latitud: number; longitud: number; date: Date; formattedDate?: string }[] = [];

  // Inspections array
  inspections: {
    photo: { dataUrl: string; date: Date },
    location: { latitud: number; longitud: number; date: Date },
    description: string
  }[] = [];

  searchText: string = '';

  filteredInspections: any[] = [];

  constructor(private modalController: ModalController, private alertController: AlertController) {
    this.filteredInspections = this.inspections;
  }

  async postInspection() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
      });

      const position = await Geolocation.getCurrentPosition();

      const modal = await this.modalController.create({
        component: InspectionModalComponent,
      });

      modal.onDidDismiss().then((result) => {
        if (result.data) {
          const inspection = {
            photo: {
              dataUrl: image.dataUrl!,
              date: new Date(),
            },
            location: {
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
              date: new Date(),
            },
            description: result.data, 
          };
          this.inspections.push(inspection);
          this.filterInspections(); 
          console.log('Inspección agregada:', this.inspections);
        }
      });

      await modal.present();
    } catch (e) {
      console.error('Error al capturar inspección:', e);
    }
  }

  deleteInspection(index: number) {
    this.inspections.splice(index, 1);
    this.filterInspections(); 
    console.log('Inspección eliminada:', this.inspections);
  }

  filterInspections() {
    if (this.searchText.trim() === '') {
      this.filteredInspections = this.inspections; 
    } else {
      this.filteredInspections = this.inspections.filter(inspection =>
        inspection.description.toLowerCase().includes(this.searchText.toLowerCase()) 
      );
    }
  }

async openModal(inspection: { photo: { dataUrl: string, date: Date } }) {
  const modal = await this.modalController.create({
    component: PhotoModalComponent,
    componentProps: { photo: inspection.photo }  
  });
  return await modal.present();
}


  async exportInspections() {
    // Convierte las inspecciones a JSON
    const data = JSON.stringify(this.inspections, null, 2);

    try {
      const base64Data = btoa(data);

      const link = document.createElement('a');
      link.href = 'data:application/json;base64,' + base64Data;
      link.download = 'inspections.json';
      link.click();

      console.log('Archivo JSON descargado correctamente');
    } catch (e) {
      console.error('Error al exportar datos:', e);
    }
  }
}
