
import { Pipe, PipeTransform } from '@angular/core';
import { Application } from '../models/application.model';

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: Application['status'] | null | undefined): string {
    switch (value) {
      case 'en_attente':
        return 'En attente';
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      default:
        return '';
    }
  }
}
