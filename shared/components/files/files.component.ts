import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as CreateVoiceCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { CreateCampaignService as CreateRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { RcsCapabilityService } from 'src/app/shared/services/rcs/rcs-capability.service';
import { BlacklistService } from 'src/app/shared/services/blacklist.service';
import { SmsBlacklistService } from 'src/app/shared/services/sms-blacklist/sms-blacklist.service';
import { RcsBlacklistService } from 'src/app/shared/services/rcs/blacklist/rcs.blacklist.service';
import { ConsoleService } from '@ng-select/ng-select/lib/console.service';
import { isArray } from 'ngx-bootstrap/chronos';
import { CreateCampaignService as CreateTruecallerCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})

export class FilesComponent implements OnInit {
  fileForm: FormGroup;
  fileToProcess: boolean = false;
  progress: number = 0;
  existingFilesArray: any;
  configExistingFile = {
    image: false,
    title: '',
    key: 'original_name',
    search: false,
    open: false
  };
  existingFileSelectText: any;
  fileName: any;
  showBackButton: boolean = false;
  configSelectedSheet = {
    image: false,
    title: '',
    key: 'sheet_name',
    search: false,
    open: false
  };
  sheetSelection: boolean;
  contacts: any;
  configContacts = {
    image: false,
    title: '',
    key: 'contact_name',
    search: false,
    open: false
  };
  contactSelectText: any;
  extraFieldsArr: any[];
  showMultiSelectionFields: boolean;
  configExtraFields = {
    image: false,
    title: '',
    key: 'contact_name',
    search: false,
    open: false,
    checkbox: true,
    isAllCheckbox: true
  };
  ExtraFieldselectText: any;
  showPreview: boolean = false;
  previewDataRes: any;
  fileContactCount: any;
  filesDataSubmitted: boolean = false;
  sheets: any;
  selectedSheetSelectText: any;
  selectedTabIndex: any;
  loaderSpinner: boolean = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  @Output() sendTabIndexData = new EventEmitter<any>();
  @Output() scheduledAddContact = new EventEmitter<any>();
  @Input() campaignId: any;
  errorsArr = [];
  showDynamicError: boolean = false;
  importedFileSelected: boolean = false;
  sendFileToUpload: any = null;
  files: boolean = false;
  stop = new Subject<void>();
  extraFields: any;
  @ViewChild('fileInput') fileInput: any;
  @Input() config: any;
  @Output() contactCount = new EventEmitter<any>();
  @Input() blacklistConfig: any;
  @Input() id: any;
  fileData: any;
  @Output() listRecordStatus = new EventEmitter<any>();
  configAgent = {
    image: false,
    title: 'Select',
    key: 'name',
    search: false,
    open: false,
    checkbox: false
  };
  agentSelectText: any;
  agentList: any;
  agentId: any;
  @Input() selectedTab: any;
  @Input() langWiseTabLabelVal: any;

  constructor(
    public fb: FormBuilder,
    public createCampaignService: CreateCampaignService,
    public common: CommonService, public translate: TranslateService,
    public createWhatsappCampaignService: WACreateCampaignService,
    public createVoiceCampaignService: CreateVoiceCampaignService,
    public voiceCampaignListService: VoiceCampaignListService,
    public createRcsCampaignService: CreateRcsCampaignService,
    private cdr: ChangeDetectorRef,
    public rcsCapabilityService: RcsCapabilityService,
    private _blacklistService: BlacklistService,
    private _smsBlacklistService: SmsBlacklistService,
    private rcsBlacklistService: RcsBlacklistService,
    public createTruecallerCampaignService: CreateTruecallerCampaignService
  ) {
    this.fileForm = this.fb.group({
      existingFile: [null, []],
      selectedSheet: [null, []],
      contact: [null, [Validators.required]],
      extraFields: ['', []],
      selectExtraFields: [false, []],
      service_agent_id: [null, []]
    });

    this.createCampaignService.getSelectedTabIndex().pipe(takeUntil(this.stop)).subscribe(res => {
      if (this.selectedTab == this.langWiseTabLabelVal?.file) {
        this.showDynamicError = false;
        this.files = true;
        this.resetFilesImport();
        if (!this.config?.rcsCapability && !this.config?.blacklist) this.getExistingFiles();
        this.progress = 0;
      }
      else {
        this.files = false;
      }
    })
    this.createCampaignService.getBlacklistSelectedTabIndex().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res == '0') {
        this.showDynamicError = false;
        this.files = true;
        this.resetFilesImport();
        if (!this.config?.rcsCapability && !this.config?.blacklist) this.getExistingFiles();
        this.progress = 0;
      }
      else {
        this.files = false;
      }
    })

    translate.stream(['campaign.files-existing-files', 'campaign.files-sheet', 'campaign.files-choose-column', 'campaign.files-extra-fields', 'common.sel-agent']).subscribe((text) => {
      this.configExistingFile.title = text['campaign.files-existing-files']
      this.configSelectedSheet.title = text['campaign.files-sheet']
      this.configContacts.title = text['campaign.files-choose-column']
      this.configExtraFields.title = text['campaign.files-extra-fields']
      this.configAgent['title'] = text['common.sel-agent']
    });

    this.createCampaignService.getCloseEvent().subscribe((res: any) => {
      if (res) {
        if (this.sendFileToUpload) {
          this.sendFileToUpload.unsubscribe();
        }
      }
    });

    this.createCampaignService.getAddMoreContacts().pipe(takeUntil(this.stop)).subscribe((value: any) => {
      this.fileName = value.fileName;
      this.sheets = value.sheet;
      if (this.fileName) {
        this.fileToProcess = true;
      }
      this.showBackButton = true;
      if (this.fileName) this.checkFileExtension(this.fileName);
    });
  }

  ngOnInit(): void {
    if(!this.config?.rcsCapability) this.configAgent['checkbox'] = true;
    if (this.config?.rcsCapability || this.config?.rcsBlackList) this.fetchRCSAgents()
  }

  showErrors(fieldName, errorType, formName) {
    if (this.fileForm.controls[fieldName].errors && this.fileForm.controls[fieldName].errors[errorType]) {
      return (this.filesDataSubmitted || this.fileForm.controls[fieldName].dirty) && this.fileForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  selectActionRecive(item, key, configKey?) {
    if (key == 'existingFile') {
      this.existingFileSelectText = item.original_name;
      this.fileForm.get(key).setValue(item._id);
      this.existingFilesArray.forEach(res => {
        if (res._id == this.fileForm.get(key).value) {
          this.fileName = res.original_name;
          this.sheets = res.sheets;
        }
      })
      this.checkFileExtension(this.fileName);
      this.fileToProcess = true;
      this.showBackButton = true;
      this.importedFileSelected = false;
    }
    else if (key == 'selectedSheet') {
      this.selectedSheetSelectText = item.sheet_name;
      this.fileForm.get(key).setValue(item.sheet_name);
      this.getPreviewData(this.fileForm.get('existingFile').value, this.fileForm.get(key).value);
      this.sheets.forEach(res => {
        if (res.sheet_name == this.fileForm.get(key).value) {
          this.fileContactCount = res.data_count;
          this.getContacts(res.headers);
        }
      })
      this.showPreview = false;
    }
    else if (key == 'contact') {
      this.contactSelectText = item.contact_name;
      this.fileForm.get(key).setValue(item.contact_name);
      this.fileForm.get('selectExtraFields').setValue(false);
      this.showMultiSelectionFields = false;
      this.getExtraFields(this.fileForm.get('contact').value);

      this.ExtraFieldselectText = '';
      this.fileForm.get('extraFields').setValue('');
    }
    else if (key == 'extraFields') {
      this.ExtraFieldselectText = item && item.length > 0 ? item : ''
      let arr = [];
      if (item && item.length > 0) {
        this.extraFieldsArr.forEach(extraField => {
          item.forEach(ele => {
            if (ele == extraField[configKey]) {
              arr.push(extraField[configKey]);
              let filteredArr = arr.filter(function (el) {
                return el != "All";
              });
              this.fileForm.get(key).setValue(filteredArr)
            }
          });
        });
      } else {
        this.fileForm.get(key).setValue('')
      }
      if (this.ExtraFieldselectText.length == this.extraFieldsArr.length) {
        this.ExtraFieldselectText.shift();
      }
    }
    else if (key == 'service_agent_id') {
      if(!this.config?.rcsCapability && isArray(item)){
        this.agentSelectText = item
        this.agentId = this.agentList.filter(ele => item.includes(ele?.name)).map(ele => ele?.id)
        this.fileForm.get(key).setValue(this.agentId);
      } else{
        this.agentSelectText = item['name'];
        this.fileForm.get(key).setValue(item['id']);
      }
    }
  }

  uploadFile(file) {
    if (file && file.length > 0) {
      if (this.sendFileToUpload) {
        this.sendFileToUpload.unsubscribe();
      }
      this.progress = 0;
      const formData = new FormData();
      formData.append('file', file[0]);
      let serviceCall: any;
      if (this.config && this.config.whatsapp) {
        serviceCall = this.createWhatsappCampaignService.uploadFile(formData)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.createVoiceCampaignService.uploadFile(formData)
      }
      else if (this.config && this.config.rcs) {
        serviceCall = this.createRcsCampaignService.uploadFile(formData)
      }
      else if (this.config && this.config.truecaller) {
        serviceCall = this.createTruecallerCampaignService.uploadFile(formData)
      }
      else if (this.config && this.config.rcsCapability) {
        serviceCall = this.rcsCapabilityService.uploadFile(formData);
      }
      else if (this.config && this.config?.blacklist && this.config.emailBlackList) {
        serviceCall = this._blacklistService.uploadFile(formData);
      }
      else if (this.config && this.config?.blacklist && this.config.smsBlackList) {
        serviceCall = this._smsBlacklistService.uploadFile(formData);

      } else if (this.config && this.config?.blacklist && this.config.voiceBlackList) {
        serviceCall = this._blacklistService.voiceOBDUploadFile(formData);

      } else if (this.config && this.config?.blacklist && this.config.rcsBlackList) {
        serviceCall = this.rcsBlacklistService.uploadFile(formData);
      }
      else {
        serviceCall = this.createCampaignService.uploadFile(formData)
      }
      this.sendFileToUpload = serviceCall.subscribe((event: HttpEvent<any>) => {
        this.showDynamicError = false;
        switch (event.type) {
          case HttpEventType.Sent:
            this.progress = 2;
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.progress = Math.round(event.loaded / event.total * 50);
            }
            break;
          case HttpEventType.Response:
            if (event['body']['success']) {
              this.progress = 100;
              this.common.openSnackBar(event['body']['message'], 'success');
              setTimeout(() => {
                this.fileForm.get('existingFile').setValue(event.body.data._id);
                this.fileName = event.body.data.original_name;
                this.fileData = event['body']['data'];
                this.sheets = event.body.data.sheets;
                this.checkFileExtension(this.fileName);
                this.fileToProcess = true;
                this.importedFileSelected = false;
              }, 500);
            }
            else {
              this.progress = 0;
              this.fileInput['nativeElement']['value'] = '';
              if (event['body'].status_code == 422) {
                this.showDynamicError = true;
                this.errorsArr = [];
                let errors = event['body'].data.errors
                for (var key in errors) {
                  this.errorsArr.push({
                    'field': key,
                    'errorMessage': errors[key]
                  })
                }
              }
              this.common.openSnackBar(event['body']['message'], 'error');
            }

        }
      }, (err: HttpErrorResponse) => {
        this.progress = 0;
        if (err['error']['status_code'] == 422) {
          this.showDynamicError = true;
          this.errorsArr = [];
          let errors = err.error.data.errors
          for (var key in errors) {
            this.errorsArr.push({
              'field': key,
              'errorMessage': errors[key]
            })
          }
        }
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  removeUploadedFile() {
    if (this.importedFileSelected) {
      this.importFilesTabData('update-contacts');
    }
    this.progress = 0;
    this.fileForm.get('existingFile').setValue(null);
    if (!this.config?.rcsCapability && !this.config?.blacklist) this.getExistingFiles();
    this.existingFileSelectText = '';
    this.selectedSheetSelectText = '';
    this.contactSelectText = '';
    this.ExtraFieldselectText = '';
    this.fileToProcess = false;
    this.showBackButton = false;
    this.showPreview = false;
    this.fileName = '';
    this.filesDataSubmitted = false;
    this.showMultiSelectionFields = false;
    this.fileForm.get('selectedSheet').clearValidators();
    this.fileForm.get('selectedSheet').updateValueAndValidity();
    this.fileForm.get('contact').setValue(null);
    this.fileForm.get('selectExtraFields').setValue(false);

  }

  checkFileExtension(fileName, data?) {
    this.contacts = [];
    this.fileContactCount = '';
    this.extraFieldsArr = [];
    let fileArr = fileName.split(".");
    let value = ''
    if (data) {
      if (this.blacklistConfig && this.blacklistConfig.blacklist) {
        value = (data.data && data.data.blacklist_files) ? data.data.blacklist_files : ''
      }
      else {
        value = (data.data && data.data.files) ? data.data.files : ''
      }
    }
    if (fileArr[fileArr.length - 1] == 'csv' || fileArr[fileArr.length - 1] == 'txt') {
      if (data) {
        this.getContacts(value['headers']);
        this.contactSelectText = value['recipient_column'];
        this.fileForm.get('contact').setValue(value['recipient_column']);
        this.fileContactCount = value['data_count'];
        if (value['extra_fields'] && value['extra_fields'].length > 0) {
          this.extraFields = value['extra_fields'];
          this.fileForm.get('selectExtraFields').setValue(true);
          this.showMultiSelectionFields = true;
          this.ExtraFieldselectText = value['extra_fields'].toString();
          this.fileForm.get('extraFields').setValue(value['extra_fields']);
        }
      }
      else {
        this.getContacts(this.sheets[0].headers);
        this.fileContactCount = this.sheets[0].data_count;
      }
      this.sheetSelection = false;
      this.getPreviewData(this.fileForm.get('existingFile').value);
    }
    if (fileArr[fileArr.length - 1] == 'xls' || fileArr[fileArr.length - 1] == 'xlsx' || fileArr[fileArr.length - 1] == 'xlsb') {
      this.sheetSelection = true;
      this.fileForm.get('selectedSheet').setValidators([Validators.required]);
      this.fileForm.get('selectedSheet').updateValueAndValidity();
      if (data) {
        this.existingFilesArray.forEach(res => {
          if (res._id == this.fileForm.get('existingFile').value) {
            this.sheets = res.sheets;
          }
          this.selectedSheetSelectText = value['sheet_name'];
          this.fileForm.get('selectedSheet').setValue(value['sheet_name']);
          this.getContacts(value['headers']);
          this.contactSelectText = value['recipient_column'];
          this.fileForm.get('contact').setValue(value['recipient_column']);
        })
        if (value['extra_fields'] && value['extra_fields'].length > 0) {
          this.extraFields = value['extra_fields'];
          this.fileForm.get('selectExtraFields').setValue(true);
          this.showMultiSelectionFields = true;
          this.ExtraFieldselectText = value['extra_fields'].toString();
          this.fileForm.get('extraFields').setValue(value['extra_fields']);
        }
        this.getPreviewData(this.fileForm.get('existingFile').value, this.fileForm.get('selectedSheet').value);
        this.fileContactCount = value['data_count'];
      }
      else {
        this.fileForm.get('selectedSheet').setValue(null);
        this.selectedSheetSelectText = '';
      }
    }
  }

  getExtraFields(selectedSheet?, uploadedValue?) {
    let count = 0;
    this.extraFieldsArr = [];
    this.extraFieldsArr = this.contacts.concat();
    let obj = { 'contact_name': 'All' };
    let index = this.extraFieldsArr.findIndex(e => e.contact_name === this.fileForm.get('contact').value)
    this.extraFieldsArr.splice(index, 1);
    if (this.extraFieldsArr.length) this.extraFieldsArr.unshift(obj);
    if (uploadedValue && uploadedValue.length > 0) {
      if (this.extraFields && this.extraFields.length > 0) {
        this.extraFieldsArr.map(fields => {
          if (this.extraFields.includes(fields['contact_name'])) {
            fields['checkbox'] = true;
            if (fields['contact_name'] != 'All') {
              count++;
            }
          }
        })
        if (count == this.extraFieldsArr.length - 1) {
          this.extraFieldsArr[this.extraFieldsArr.findIndex(x => x['contact_name'] == 'All')].checkbox = true;
        }
      }
      this.ExtraFieldselectText = uploadedValue.toString();
      this.fileForm.get('extraFields').setValue(uploadedValue);
    }
  }

  resetFilesImport() {
    this.fileForm.reset();
    this.existingFileSelectText = '';
    this.selectedSheetSelectText = '';
    this.contactSelectText = '';
    this.ExtraFieldselectText = '';
    this.fileToProcess = false;
    this.showBackButton = false;
    this.showPreview = false;
    this.fileName = '';
    this.filesDataSubmitted = false;
    this.showMultiSelectionFields = false;
    this.fileForm.get('selectedSheet').clearValidators();
    this.fileForm.get('selectedSheet').updateValueAndValidity();
  }

  closeModal(id: string) {
    this.common.close(id);
    this.resetFilesImport();
    this.selectedTabIndex = 0;
    this.progress = 0;
    this.sendTabIndexData.emit(this.selectedTabIndex);
  }

  getExistingFiles() {
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.getFiles()
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.createVoiceCampaignService.getFiles();
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.getFiles()
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this.createTruecallerCampaignService.getFiles()
    }
    else {
      serviceCall = this.createCampaignService.getFiles()
    }
    serviceCall.subscribe((res: any) => {
      this.existingFilesArray = res.data;
      if (this.files) {
        this.checkImportedData();
      }
    })
  }

  getContacts(headers) {
    let contacts = [];
    headers.forEach(res => {
      contacts.push({
        contact_name: res
      })
    })
    this.contacts = contacts;
  }

  showExtraFields() {
    this.showMultiSelectionFields = !this.showMultiSelectionFields;
    if (this.showMultiSelectionFields) {
      this.fileForm.get('extraFields').setValidators([Validators.required]);
      this.fileForm.get('extraFields').updateValueAndValidity()
    }
    else {
      this.fileForm.get('extraFields').clearValidators();
      this.fileForm.get('extraFields').updateValueAndValidity()
    }
    this.ExtraFieldselectText = '';
    this.fileForm.get('extraFields').setValue('');
    if (this.extraFieldsArr && this.extraFieldsArr.length > 0) {
      this.extraFieldsArr.map(e => {
        e['checkbox'] = false;
      })
    }
  }

  previewData() {
    this.showPreview = true;
  }

  getPreviewData(id, sheet?) {
    let serviceCall: any;
    if (this.config && (this.config.rcsCapability)) {
      serviceCall = this.rcsCapabilityService.previewData(this.fileData);
    } else if (this.config && this.config?.blacklist && (this.config.emailBlackList)) {
      serviceCall = this._blacklistService.previewData(this.fileData);
    } else if (this.config && this.config?.blacklist && (this.config.smsBlackList)) {
      serviceCall = this._smsBlacklistService.previewData(this.fileData);
    } else if (this.config && this.config?.blacklist && (this.config.voiceBlackList)) {
      serviceCall = this._blacklistService.voiceOBDPreviewData(this.fileData);
    } else if (this.config && this.config?.blacklist && (this.config.rcsBlackList)) {
      serviceCall = this.rcsBlacklistService.previewData(this.fileData);
    }
    else {
      if (sheet) {
        if (this.config && this.config.whatsapp) {
          serviceCall = this.createWhatsappCampaignService.previewData(id, sheet)
        }
        else if (this.config && this.config.voice) {
          serviceCall = this.createVoiceCampaignService.previewData(id, sheet);
        }
        else if (this.config && this.config.rcs) {
          serviceCall = this.createRcsCampaignService.previewData(id, sheet)
        }
        else if (this.config && this.config.truecaller) {
          serviceCall = this.createTruecallerCampaignService.previewData(id, sheet)
        }
        else {
          serviceCall = this.createCampaignService.previewData(id, sheet)
        }
      }
      else {
        if (this.config && this.config.whatsapp) {
          serviceCall = this.createWhatsappCampaignService.previewData(id)
        }
        else if (this.config && this.config.voice) {
          serviceCall = this.createVoiceCampaignService.previewData(id);
        }
        else if (this.config && this.config.rcs) {
          serviceCall = this.createRcsCampaignService.previewData(id)
        }
        else if (this.config && this.config.truecaller) {
          serviceCall = this.createTruecallerCampaignService.previewData(id)
        }
        else {
          serviceCall = this.createCampaignService.previewData(id)
        }
      }
    }
    serviceCall.subscribe((res: any) => {
      this.previewDataRes = res.data;
    })
  }
  public proceedToSchedule() {
    this.configContacts.open = false;
    this.configSelectedSheet.open = false;
    this.configExtraFields.open = false;
    let request: any;
    request = {
      "file_id": this.fileForm.get('existingFile').value,
      "sheet_name": this.fileForm.get('selectedSheet').value,
      "recipient_column": this.fileForm.get('contact').value,
      "extra_fields": this.fileForm.get('extraFields').value ? this.fileForm.get('extraFields').value : [],
      "campaign_id": this.campaignId
    }
    if (!this.sheetSelection) {
      let fileArr = this.fileName.split(".");
      if (fileArr[fileArr.length - 1] == 'csv' || fileArr[fileArr.length - 1] == 'txt') {
        request['sheet_name'] = null
      }
    }
    this.filesDataSubmitted = true;
    if (this.fileForm.invalid) {
      return;
    }
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    this.fileToProcess = false
    this.createCampaignService.setAddMoreContacts({})
    this.resetFilesImport()

    let serviceCall;
    if (this.config && this.config.voice && this.blacklistConfig && this.blacklistConfig['blacklist']) {
      serviceCall = this.createVoiceCampaignService.importVoiceBlacklistFilesData(request)
    } else {
      serviceCall = this.createVoiceCampaignService.importMoreFilesData(request);
    }
    // let serviceCall = this.createVoiceCampaignService.importMoreFilesData(request);
    serviceCall.subscribe((res: any) => {
      if (res['success']) {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        //  this.createCampaignService.setContactCount(res.data.data_count);
        this.contactCount.emit(res.data.data_count);
        if (this.blacklistConfig && this.blacklistConfig.blacklist) {
          let obj = {
            count: res.data.data_count,
            uploaded: true
          }
          if (this.config && this.config.voice || this.config && this.config.voiceListing) {
            this.createVoiceCampaignService.setBlacklistContactCountInVoice(obj);
          }
        }
        this.scheduledAddContact.emit({ id: 'schedule-add-contact' });
        this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(res['message'], 'error');
      }
    }, err => {
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.common.openSnackBar(err['error']['message'], 'error');
    })

  }
  public importFilesTabData(data?) {
    this.configContacts.open = false;
    this.configSelectedSheet.open = false;
    this.configExtraFields.open = false;
    let request: any;
    if (data) {
      request = {
        "campaign_id": this.campaignId
      }
    }
    else {
      if (this.config && (this.config?.rcsCapability)) {
        request = {
          "new_name": this.fileData['new_name'],
          "sheet_name": this.fileForm.get('selectedSheet').value,
          "old_file_name": this.fileData['original_name'],
          "rcs_identifier": this.fileForm.get('contact').value,
          "extra_fields": this.fileForm.get('extraFields').value ? this.fileForm.get('extraFields').value : [],
          "service_agent_id": this.fileForm.get('service_agent_id').value
        }
      } else if (this.config && this.config?.blacklist && (this.config?.emailBlackList)) {
        request = {
          "new_name": this.fileData['new_name'],
          "email_id": this.fileForm.get('contact').value,
          "sheet_name": this.fileForm.get('selectedSheet').value
        }
      } else if (this.config && this.config?.blacklist && (this.config?.smsBlackList)) {
        request = {
          "new_name": this.fileData['new_name'],
          "contact_number": this.fileForm.get('contact').value,
          "sheet_name": this.fileForm.get('selectedSheet').value
        }
      } else if (this.config && this.config?.blacklist && (this.config?.voiceBlackList)) {
        request = {
          "new_name": this.fileData['new_name'],
          "contact_number": this.fileForm.get('contact').value,
          "sheet_name": this.fileForm.get('selectedSheet').value
        }
      } else if (this.config && this.config?.blacklist && (this.config?.rcsBlackList)) {
        request = {
          "user_id": parseInt(localStorage.getItem('user_id')),
          "sender": this.fileForm.get('service_agent_id').value,
          "new_name": this.fileData['new_name'],
          "recipient_header": this.fileForm.get('contact').value,
          "sheet_name": this.fileForm.get('selectedSheet').value
        }
      } else {
        request = {
          "file_id": this.fileForm.get('existingFile').value,
          "sheet_name": this.fileForm.get('selectedSheet').value,
          "recipient_column": this.fileForm.get('contact').value,
          "extra_fields": this.fileForm.get('extraFields').value ? this.fileForm.get('extraFields').value : [],
          "campaign_id": this.createCampaignService.newCampaignData._id
        }
      }
      if (!this.sheetSelection) {
        let fileArr = this.fileName.split(".");
        if (fileArr[fileArr.length - 1] == 'csv' || fileArr[fileArr.length - 1] == 'txt') {
          request['sheet_name'] = null
        }
      }
      this.filesDataSubmitted = true;
      if (this.fileForm.invalid) {
        return;
      }
    }
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.blacklistConfig && this.blacklistConfig.blacklist) {
      if (this.config && this.config.sms) {
        serviceCall = this.createCampaignService.importBlacklistFilesData(request)
      }
      else if (this.config && this.config.whatsapp) {
        serviceCall = this.createWhatsappCampaignService.importBlacklistFilesData(request)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.createVoiceCampaignService.importVoiceBlacklistFilesData(request)

      } else if (this.config && this.config.rcs) {
        serviceCall = this.createRcsCampaignService.importRCSBlacklistFilesData(request)
      } else if (this.config && this.config.truecaller) {
        serviceCall = this.createTruecallerCampaignService.importBlacklistFilesData(request)
      }
    }
    else if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.importFilesData(request)
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.createVoiceCampaignService.importFilesData(request);
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.importFilesData(request)
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this.createTruecallerCampaignService.importFilesData(request)
    }
    else if (this.config && this.config?.rcsCapability) {
      serviceCall = this.rcsCapabilityService.importFilesData(request)
    } else if (this.config && this.config?.blacklist && this.config?.emailBlackList) {
      serviceCall = this._blacklistService.importFilesData(request)
    } else if (this.config && this.config?.blacklist && this.config?.smsBlackList) {
      serviceCall = this._smsBlacklistService.importFilesData(request)
    } else if (this.config && this.config?.blacklist && this.config?.voiceBlackList) {
      serviceCall = this._blacklistService.voiceOBDImportFilesData(request)
    } else if (this.config && this.config?.blacklist && this.config?.rcsBlackList) {
      serviceCall = this.rcsBlacklistService.importFilesData(request)
    } else {
      serviceCall = this.createCampaignService.importFilesData(request);
    }
    serviceCall.subscribe((res: any) => {
      if (res['success']) {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.closeModal(this.id);
        if (this.config && this.config?.blacklist && this.config?.smsBlackList || this.config?.voiceBlackList) this.listRecordStatus.emit({ action: true, val: res['data'] });
        if (this.blacklistConfig && this.blacklistConfig.blacklist) {
          let obj = {
            count: res.data.data_count,
            uploaded: true
          }
          if (this.config && this.config.voice || this.config && this.config.voiceListing) {
            let obj = {
              count: res.data.data_count,
              uploaded: true
            }
            this.createVoiceCampaignService.setBlacklistContactCountInVoice(obj);
          } else if (this.config && this.config.sms) {
            this.createCampaignService.setBlacklistContactCount(obj);
          } else if (this.blacklistConfig && this.blacklistConfig.blacklist && this.config && this.config.whatsapp) {
            this.createWhatsappCampaignService.setBlacklistContactCount(obj);
          } else if (this.blacklistConfig && this.blacklistConfig.blacklist && this.config && this.config.rcs) {
            this.createRcsCampaignService.setBlacklistContactCount(obj);
          } else if (this.blacklistConfig && this.blacklistConfig.blacklist && this.config && this.config.truecaller) {
            this.createTruecallerCampaignService.setBlacklistContactCount(obj);
          }

        } else {
          if (this.config && (this.config?.rcsCapability)) {
            this.rcsCapabilityService.setUpdatedTableValue(true);
          } else if (this.config && this.config?.blacklist && (this.config?.emailBlackList || this.config?.smsBlackList || this.config?.voiceBlackList || this.config?.rcsBlackList)) {
            this.config?.rcsBlackList ? this._blacklistService.setUpdatedTableValue(res) : this._blacklistService.setUpdatedTableValue(true);
          } else {
            this.createCampaignService.setContactCount(res.data.data_count);
            this.createCampaignService.setEventtoResetText(true);
            this.contactCount.emit(res.data.data_count);
          }
        }
        if (res.data.show_error) {
          this.common.openSnackBar(res['message'], 'error');
        }
        else {
          this.common.openSnackBar(res['message'], 'success');
        }
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(res['message'], 'error');
      }
    },
      err => {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(err['error']['message'], 'error');
      })
  }

  checkImportedData() {
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.createVoiceCampaignService.getimportDetails(this.campaignId);
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this.createTruecallerCampaignService.getimportDetails(this.campaignId)
    }
    else {
      serviceCall = this.createCampaignService.getimportDetails(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      let data = '';
      if (this.blacklistConfig && this.blacklistConfig.blacklist) {
        data = (res.data && res.data.blacklist_files) ? res.data.blacklist_files : ''
      }
      else {
        data = (res.data && res.data.files) ? res.data.files : ''
      }
      if (data) {
        this.existingFilesArray.forEach(element => {
          if (element._id == data['file_id']) {
            this.existingFileSelectText = element.original_name;
            this.fileForm.get('existingFile').setValue(element._id);
            this.fileName = element.original_name
            this.fileToProcess = true;
            this.checkFileExtension(element.original_name, res);
            if (data['extra_fields'] && data['extra_fields'].length > 0) {
              this.getExtraFields(this.fileForm.get('contact').value, data['extra_fields']);
            }
            else {
              this.getExtraFields(this.fileForm.get('contact').value);
            }
            this.showBackButton = true;
            this.importedFileSelected = true;
          }
        })
      }
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
    }, err => {
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  fetchRCSAgents() {
    this.createRcsCampaignService.getAgentList().subscribe(res => {
      if (res['success']) {
        this.agentList = res['data'];
      }
    })
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
    if (this.sendFileToUpload) {
      this.sendFileToUpload.unsubscribe();
    }
  }
}
