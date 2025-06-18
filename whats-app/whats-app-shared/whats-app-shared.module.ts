import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightAndUpdateVariablesService } from './services/highlight-and-update-variables.service';
import { UpdatePersonalisedValuesService } from './services/update-personalised-values.service';
import { ResetVariablesService } from './services/reset-variables.service';
import { UpdateShortUrlVariablesService } from './services/update-short-url-variables.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [HighlightAndUpdateVariablesService, UpdatePersonalisedValuesService, ResetVariablesService, UpdateShortUrlVariablesService]
})
export class WhatsAppSharedModule { }
