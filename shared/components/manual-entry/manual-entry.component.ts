import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as CreateRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { CreateCampaignService as CreateEmailCampaignService } from 'src/app/shared/services/email/campaigns/create-campaign.service';

@Component({
  selector: 'app-manual-entry',
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.css']
})
export class ManualEntryComponent implements OnInit {

  copyContactsForm: FormGroup;
  @Input() campaignId: any;
  sendTypedContactData: boolean = false;
  selectedTabIndex = 2;
  @Output() sendTabIndexData = new EventEmitter<any>();
  @Output() sendLoaderState = new EventEmitter<any>();
  loaderSpinner: boolean = false;
  hasImportedData: boolean = false;
  stop = new Subject<void>();
  @Input() config: any;
  translatedObj: any;
  manualEntryError: any;
  @Input() blacklistConfig: any;
  @Input() id: any;
  emailIdNotEntered = false;
  invalidEmailId = false;
  showDynamicError: boolean = false;
  listDelimter = [
    {
      "_id": "\n",
      "name": "New Line"
    },
    {
      "_id": ",",
      "name": "Comma"
    },
    {
      "_id": "|",
      "name": "Pipe"
    }];
  configDelimiter = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: false
  };
  delimiterSelectText: any;
  @Input() selectedTab: any;
  @Input() langWiseTabLabelVal: any;

  constructor(public createCampaignService: CreateCampaignService, public fb: FormBuilder, public common: CommonService, public createWhatsappCampaignService: WACreateCampaignService, public createRcsCampaignService: CreateRcsCampaignService, public createEmailCampaignService: CreateEmailCampaignService) {

    this.copyContactsForm = this.fb.group({
      typedContacts: ['', [Validators.required]],
      delimiter: ['', [Validators.required]]
    });
    this.createCampaignService.getSelectedTabIndex().pipe(takeUntil(this.stop)).subscribe(res => {
      if (this.selectedTab == this.langWiseTabLabelVal?.manual) {
        this.sendTypedContactData = false
        this.getImportedData();
      }
    })
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        this.configDelimiter.title = this.translatedObj['campaign.select-text']
        this.delimiterSelectText = this.translatedObj['campaign.select-text']
        this.manualEntryError = (this.config && !this.config.email) ? this.translatedObj['campaign.man-entry-pl-type-cont-num'] : this.translatedObj['campaign.man-entry-pl-type-cont-email'];
      }
    })
    this.createCampaignService.getCloseEvent().subscribe((res: any) => {
      if (res) {
        this.invalidEmailId = false;
        this.emailIdNotEntered = false;
      }
    });
  }

  ngOnInit(): void {
    this.manualEntryError = (this.config && !this.config.email) ? this.translatedObj['campaign.man-entry-pl-type-cont-num'] : this.translatedObj['campaign.man-entry-pl-type-cont-email'];
  }

  getImportedData() {
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.email) {
      serviceCall = this.createEmailCampaignService.getimportDetails(this.campaignId)
    }
    else {
      serviceCall = this.createCampaignService.getimportDetails(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      if (res.data.typed_numbers && res.data.typed_numbers?.delimiter) {
        this.delimiterReceived(this.listDelimter.find(e => e._id == res.data.typed_numbers.delimiter))
      }
      if (res.data.typed_numbers && res.data.typed_numbers.contacts && res.data.typed_numbers.contacts.length) {
        let importedTypedNumbers = (res.data.typed_numbers.contacts).toString();
        this.copyContactsForm.get('typedContacts').setValue(importedTypedNumbers);
        this.hasImportedData = true
      }
      else {
        this.hasImportedData = false
      }
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  showErrors(fieldName, errorType) {
    if (this.copyContactsForm.controls[fieldName].errors && this.copyContactsForm.controls[fieldName].errors[errorType]) {
      return (this.sendTypedContactData || this.copyContactsForm.controls[fieldName].dirty) && this.copyContactsForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  resetManualEntryImport() {
    this.copyContactsForm.reset();
  }

  insertTypedContactData() {
    this.sendTypedContactData = true;
    let typedContactWithoutSpace: any;
    let finalTypedData: any;
    if (this.config && this.config.email) {
      this.invalidEmailId = false;
      this.emailIdNotEntered = false;
    }
    finalTypedData = this.copyContactsForm.get('typedContacts').value
    let request = {
      campaign_id: this.campaignId,
      contacts: finalTypedData
    }
    if (this.hasImportedData && !this.copyContactsForm.get('typedContacts').value) {
      this.delimiterSelectText = this.translatedObj['campaign.select-text']
      this.copyContactsForm.get('delimiter').setValue('')
    }
    if (!this.hasImportedData && (!finalTypedData.length || !this.copyContactsForm.get('delimiter').value)) {
      return
    }
    if (this.copyContactsForm.get('typedContacts').value && !this.hasValidEntries()) {
      // this.common.openSnackBar(this.config?.email ? this.translatedObj['manual-entry.emails-error'] : this.translatedObj['manual-entry.numbers-error'], 'error')
      this.common.openSnackBar(this.translatedObj['manual-entry.invalid-recipients'], 'error');
      return
    }
    request['delimiter'] = this.copyContactsForm.get('delimiter').value
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.blacklistConfig && this.blacklistConfig.blacklist) {
      serviceCall = this.createCampaignService.importBlacklistTypedContacts(request)
    }
    else if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.importTypedContacts(request)
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.importTypedContacts(request)
    }
    else if (this.config && this.config.email) {
      serviceCall = this.createEmailCampaignService.importTypedContacts(request);
      // this.createEmailCampaignService.commonHeaders.next(null);
      this.createEmailCampaignService.recipientsAddedManuallyPreVal.next(JSON.parse(JSON.stringify(this.createEmailCampaignService.isRecipientsAddedManually.value)));
      this.createEmailCampaignService.isRecipientsAddedManually.next(true);
    }
    else {
      serviceCall = this.createCampaignService.importTypedContacts(request)
    }
    serviceCall.subscribe((res: any) => {
      if (res['success']) {
        this.closeModal(this.id);
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        if (res.data.show_error) {
          this.common.openSnackBar(res['message'], 'error');
        }
        else {
          this.common.openSnackBar(res['message'], 'success');
        }
        if (this.blacklistConfig && this.blacklistConfig.blacklist) {
          let obj = {
            count: res.data.data_count,
            uploaded: true
          }
          this.createCampaignService.setBlacklistContactCount(obj);
        }
        else {
          this.createCampaignService.setContactCount(res.data.data_count);
          this.createCampaignService.setEventtoResetText(true);
        }
        if (this.config && this.config.email) {
          this.createEmailCampaignService.getCommonHeaders(this.campaignId);
        }
      }
      else {

        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(res['message'], 'error');
        this.showDynamicError = true
        this.copyContactsForm.get('typedContacts').setErrors(res['message']);

      }
    }, err => {
      this.showDynamicError = true
      this.copyContactsForm.get('typedContacts').setErrors(err['error']['message'])
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.common.openSnackBar(err['error']['message'], 'error');
    })
  }

  closeModal(id: string) {
    this.common.close(id);
    this.resetManualEntryImport();
    this.selectedTabIndex = 0;
    this.sendTabIndexData.emit(this.selectedTabIndex);
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

  checkTypeOf(value) {
    return typeof value;
  }

  delimiterReceived(item) {
    this.delimiterSelectText = item && item.name ? item.name : this.translatedObj['campaign.select-text'];
    this.copyContactsForm.get('delimiter').setValue(item && item._id ? item._id : '');
  }

  hasValidEntries() {
    let content = this.copyContactsForm.get('typedContacts').value
    let delimiter = this.copyContactsForm.get('delimiter').value
    let pattern = this.config?.email ? `^\\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})(\\s*\\${delimiter}\\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})*\\s*$` : `^(?:\\d{9,16}\\${delimiter}\\s*)*\\d{9,16}$`;
    let regex = new RegExp(pattern, 'g')
    return regex.test(content)
  }
}
