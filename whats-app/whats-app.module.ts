import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignListComponent} from './campaign-list/campaign-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CreateCampaignComponent } from './create-campaign/create-campaign.component';
import { SharedModule as campaignSharedModule } from '../shared/shared.module';
import { MessageContentComponent } from './message-content/message-content.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatTabsModule } from '@angular/material/tabs';
import { CarouselConfigurationComponent } from './carousel-configuration/carousel-configuration.component';

const routes: Routes = [

  {
    path: '', component: CampaignListComponent
  },
  {
    path: 'create/:id', component: CreateCampaignComponent
  }
]

@NgModule({
  declarations: [CampaignListComponent, CreateCampaignComponent, MessageContentComponent, CarouselConfigurationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule,
    campaignSharedModule,
    MatMenuModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatMomentModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatTabsModule,
  ],
  exports: [TranslateModule, RouterModule, MessageContentComponent]
})
export class WhatsAppModule {

}
