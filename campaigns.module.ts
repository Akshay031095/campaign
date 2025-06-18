import { EmailModule } from './email/email.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleGuard } from '../shared/guards/module.guard';

const routes: Routes = [
  {
    path: 'sms',
    loadChildren: () => import('./sms/sms.module').then(m => m.SmsModule),
    data: {
      title: ''
    },
    canActivate: [ModuleGuard]
  },
  {
    path: 'whatsapp',
    loadChildren: () => import('./whats-app/whats-app.module').then(m => m.WhatsAppModule),
    data: {
      title: ''
    },
    canActivate: [ModuleGuard]
  },
  {
    path: 'voice',
    loadChildren: () => import('./voice/voice.module').then(m => m.VoiceModule),
    data: {
      title: ''
    },
    canActivate: [ModuleGuard]
  },
  {
    path: 'rcs',
    loadChildren: () => import('./rcs/rcs.module').then(m => m.RcsModule),
    data: {
      title: ''
    },
    canActivate: [ModuleGuard]
  },
  {
    path: 'email',
    loadChildren: () => import('./email/email.module').then(m => m.EmailModule),
    data: {
      title: ''
    }
  },
  {
    path: 'missed-call',
    loadChildren: () => import('./missed-call/missed-call.module').then(m => m.MissedCallModule),
    data: {
      title: ''
    }
  },
  {
    path: 'ibd',
    loadChildren: () => import('./ibd/ibd.module').then(m => m.IbdModule),
    data: {
      title: ''
    }
  },
  {
    path: 'truecaller',
    loadChildren: () => import('./truecaller/truecaller.module').then(m => m.TruecallerModule),
    data: {
      title: ''
    }
  },
  {
    path: '', redirectTo: 'sms', pathMatch: 'full'
  }
]

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgxMatMomentModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatTabsModule,
    FormsModule,
    MatMenuModule,
    TranslateModule
  ],
  exports: [RouterModule]
})
export class CampaignsModule {
  constructor() { }
}
