import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetParametersComponent } from './components/set-parameters/set-parameters.component';
import { TestCampaignComponent } from './components/test-campaign/test-campaign.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ChartsModule } from 'ng2-charts';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule as SM } from 'src/app/shared/shared.module'
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadContactsComponent } from './components/upload-contacts/upload-contacts.component';
import { ImportContactsComponent } from './components/import-contacts/import-contacts.component';
import { FilesComponent } from './components/files/files.component';
import { UserContactsComponent } from './components/user-contacts/user-contacts.component';
import { ManualEntryComponent } from './components/manual-entry/manual-entry.component';
import { SendMessageComponent } from './components/send-message/send-message.component';
import { MessageClassificationComponent } from './components/message-classification/message-classification.component';
import { InsertTemplateComponent } from './components/insert-template/insert-template.component';
import { PersonalizeVariablessComponent } from './components/personalize-variabless/personalize-variabless.component';
import { ValidateComponent } from './components/validate/validate.component';
import { ViewCampaignComponent } from './components/view-campaign/view-campaign.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { SetExpiryComponent } from './components/set-expiry/set-expiry.component';
import { ViewScheduleComponent } from './components/view-schedule/view-schedule.component';
import { MultipleSuggestionsComponent } from './components/multiple-suggestions/multiple-suggestions.component';
import { StaggerComponent } from './components/stagger/stagger.component';
import { SubscriberLimitComponent } from './components/subscriber-limit/subscriber-limit.component';
import { UploadTemporaryBlacklistComponent } from './components/upload-temporary-blacklist/upload-temporary-blacklist.component';
import { ImportBlacklistContactsComponent } from './components/import-blacklist-contacts/import-blacklist-contacts.component';
import { MultipleScheduleComponent } from './components/multiple-schedule/multiple-schedule.component';
import { ManageScheduleComponent } from './components/manage-schedule/manage-schedule.component';
import { ShortUrlComponent } from './components/short-url/short-url.component';
import { ConfirmationPopupComponent } from './components/confirmation-popup/confirmation-popup.component';
import { SetExpiryDateComponent } from './components/set-expiry-date/set-expiry-date.component';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { ComposeCallPreviewComponent } from './components/compose-call-preview/compose-call-preview.component';
import { FlowBuilderModule } from 'src/app/chatbot-callflowbuilder/callflow-builder/custom-modules/flow-builder/flow-builder.module';
import { StatsModalComponent } from './components/stats-modal/stats-modal.component';
import { ConfigureSmsComponent } from './components/configure-sms/configure-sms.component';



@NgModule({
  declarations: [SetParametersComponent, TestCampaignComponent, UploadContactsComponent, ImportContactsComponent, FilesComponent, UserContactsComponent, ManualEntryComponent, SendMessageComponent, MessageClassificationComponent, InsertTemplateComponent, PersonalizeVariablessComponent, ValidateComponent, ViewCampaignComponent, ScheduleComponent, SetExpiryComponent, ViewScheduleComponent, MultipleSuggestionsComponent, UploadTemporaryBlacklistComponent, ImportBlacklistContactsComponent, StaggerComponent, MultipleScheduleComponent, SubscriberLimitComponent, ShortUrlComponent, ManageScheduleComponent, ConfirmationPopupComponent, SetExpiryDateComponent, TextEditorComponent, ComposeCallPreviewComponent, ConfigureSmsComponent, StatsModalComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatDialogModule,
    MatTabsModule,
    RouterModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    ChartsModule,
    NgxMatMomentModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatTooltipModule,
    TranslateModule,
    SM,
    FlowBuilderModule,
  ],
  exports: [
    SetParametersComponent,
    TestCampaignComponent,
    UploadContactsComponent,
    ImportContactsComponent,
    FilesComponent,
    UserContactsComponent,
    ManualEntryComponent,
    SendMessageComponent,
    MessageClassificationComponent,
    InsertTemplateComponent,
    PersonalizeVariablessComponent,
    ValidateComponent,
    ViewCampaignComponent,
    ScheduleComponent,
    MultipleSuggestionsComponent,
    UploadTemporaryBlacklistComponent,
    SetExpiryComponent,
    ViewScheduleComponent,
    MultipleSuggestionsComponent,
    UploadTemporaryBlacklistComponent,
    ImportBlacklistContactsComponent,
    ViewScheduleComponent,
    ImportBlacklistContactsComponent,
    StaggerComponent,
    SubscriberLimitComponent,
    ManageScheduleComponent,
    ShortUrlComponent,
    ConfirmationPopupComponent,
    SetExpiryDateComponent,
    TextEditorComponent,
    ComposeCallPreviewComponent,
    StatsModalComponent,
    ConfigureSmsComponent
  ]
})
export class SharedModule { }
