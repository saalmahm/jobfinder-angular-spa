
import { Pipe, PipeTransform } from '@angular/core';
import { Application } from '../models/application.model';

@Pipe({
  name: 'statusColor',
  standalone: true,
})
export class StatusColorPipe implements PipeTransform {
  transform(value: Application['status'] | null | undefined): string {
    switch (value) {
      case 'en_attente':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'accepte':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'refuse':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }
}
