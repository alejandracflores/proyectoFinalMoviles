import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inspection-form-modal',
  templateUrl: './inspection-modal.component.html',
  styleUrls: ['./inspection-modal.component.scss'],
})
export class InspectionModalComponent {
  @Input() comment: string = '';

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    this.modalController.dismiss(this.comment);
  }
}
