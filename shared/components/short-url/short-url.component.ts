import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CreateCampaignService as createWhatsappCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as CreateTCCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';

class data {
  data: any;
  type: string;
  previewValue: any;
  shortUrl: any;
  urlType: any;
  previewUrl: any;
}

@Component({
  selector: 'app-short-url',
  templateUrl: './short-url.component.html',
  styleUrls: ['./short-url.component.css']
})
export class ShortUrlComponent implements OnInit, OnDestroy {

  modalType = 'insert-link';
  @Output() sendData = new EventEmitter<any>()
  urlForm: FormGroup;
  urlTabIndex: number = 0;
  urlType: string;
  campaignFormValue: any;
  originalUrl: any;
  personalizeUrlOptions: any = [];
  @Input() campaignId: any;
  sendShortUrlData: boolean = false;
  personalizeUrlSelectText: any;
  domainSelectText: any;
  validUrl: boolean = true;
  configPersonalizeUrlColumns = {
    image: false,
    title: 'Columns',
    key: 'headerName',
    search: false,
    open: false,
    emptyError: true
  };
  domainList: any[];
  configDomainList = {
    image: false,
    title: 'Domain',
    key: 'domainName',
    search: false,
    open: false
  };
  public date: moment.Moment;
  public showUrlSpinners = true;
  public showUrlSeconds = false;
  public touchUiUrl = false;
  public enableMeridianUrl = false;
  public hideUrlTime = true;
  public minDateUrl: moment.Moment;
  public maxDateUrl: moment.Moment;
  public stepHourUrl = 1;
  public stepUrlMinute = 1;
  public stepUrlSecond = 1;
  insertShortUrl: boolean = false;
  shortUrl: any = 'https://demo.com';
  @Input() previewValue: any;
  @Output() sendUrlFormValue = new EventEmitter<any>();
  urlFormValue: any;
  @Input() textareaInput: any;
  @Input() contactCount: any;
  datePickerObj: any = {
    type: "dateTimePicker",
    dateObj: "",
    rangeObj: ""
  }
  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: true,
    minDate: new Date(),
    // maxDate: moment.Moment,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1,
    noDateRange: true
  }
  validUrlText: any;
  columnSelectText: any;
  importContactText: any;
  authorizedForOtherShortUrl: boolean = false;
  urlFormText: boolean = false;
  @Input() urlChanged: any;
  @Output() urlTypeTab = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();
  @Input() showDrawer;
  @ViewChild('actualText') actualText: ElementRef;
  formList = [];
  configFormList = {
    image: false,
    title: '',
    key: 'name',
    search: true,
    open: false,
    ajax: true,
    type: 'form'
  };
  formSelectText: any;
  showAddForm: boolean = false;
  stop = new Subject<any>();
  createFormBtnPermission: boolean;
  permissions = permissions
  isTeammate: number;
  @Input() config: any;
  @Input() hideDropdown: any;
  @Input() hideForm: any;
  senderId;
  isDltUser;

  constructor(public common: CommonService, public fb: FormBuilder, public createCampaignService: CreateCampaignService, public translate: TranslateService, public createWhatsappCampaignService: createWhatsappCampaignService,
    public _createTCCampaignService: CreateTCCampaignService
  ) {
    this.urlForm = this.fb.group({
      originalUrl: ['', []],
      headerName: ['', []],
      urlDate: ['', []],
      setValidity: [false, []],
      urlFromColumn: ['', []],
      domainName: ['', [Validators.required]],
      addForm: [false, []],
      selectedForm: ['', []]
    });

    translate.stream(['common.enter-valid-url', 'campaign.select-a-column-text', 'campaign.import-contacts-text', 'campaign.select-text']).subscribe((text) => {
      this.validUrlText = text['common.enter-valid-url']
      this.columnSelectText = text['campaign.select-a-column-text']
      this.importContactText = text['campaign.import-contacts-text']
      this.configFormList.title = text['campaign.select-text']
    });

    this.isTeammate = parseInt(localStorage.getItem('is_team_mate'));
    this.createFormBtnPermission = this.common.checkUserPermission(permissions.permissionsTag['Form'], permissions.permissionName['create_form'], false)

    this.createCampaignService.getUrlFormValue().pipe(takeUntil(this.stop)).subscribe(res => {
      this.showAddForm = false;
      this.authorizedForOtherShortUrl = false;
      this.urlForm.get('selectedForm').clearValidators();
      this.urlForm.get('selectedForm').updateValueAndValidity();
      this.urlFormValue = '';
      if (res) {
        this.urlFormValue = res;
        if (this.config?.workflow) {
          this.urlTabIndex = 0;
          if (this.urlFormValue && this.urlFormValue.urlFromColumn) {
            this.urlType = 'column';
            this.urlTabIndex = 1;
          }
        }

        setTimeout(() => {
          if (this.urlFormValue && this.urlFormValue.urlFromColumn && (this.urlType != 'text')) {
            this.personalizeUrlSelectText = this.urlFormValue.urlFromColumn;
            this.urlForm.get('urlFromColumn').setValue(this.urlFormValue.urlFromColumn);
          }
          this.urlFormText = false;
          if (this.urlFormValue.originalUrl) {
            this.urlFormText = true;
          }
          this.showAddForm = false;
          this.urlForm.get('selectedForm').setValue(null);
          this.formSelectText = this.configFormList.title
          if (this.urlFormValue && this.urlFormValue.selectedForm) {
            this.showAddForm = true;
            this.urlForm.get('addForm').setValue(true);
            this.addForm(true, '', this.urlFormValue.selectedForm);
          }
          if (this.config?.workflow) {
            this.getDomain(res && res.domainName ? res : '');
            this.urlForm.get('setValidity').setValue(false)
            if (res.setValidity) {
              this.urlForm.get('setValidity').setValue(true)
              this.datePickerObj = {
                dateObj: res.urlDate,
                type: "dateTimePicker"
              }
              this.urlForm.get('urlDate').setValue(res.urlDate);
            }
          }
        }, 10);
      }
    })

    this.createCampaignService.getCampaignFormValue().pipe(takeUntil(this.stop)).subscribe(res => {
      // this.showDrawer = true;
      this.authorizedForOtherShortUrl = false;
      this.sendShortUrlData = false;
      this.campaignFormValue = res;
      if (!this.config?.workflow) {
        this.urlTabIndex = 0;
      } else if (this.config?.workflow) {
        this.campaignFormValue.messageType = 'Personalised';
      }
      this.urlForm.get('selectedForm').setValue(null);
      this.formSelectText = this.configFormList.title
      if (res && res.formId) {
        this.urlForm.get('addForm').setValue(true);
        this.showAddForm = true
        this.addForm('hasForm', '', res.formId);
      }
      if (res && res.domainName) {
        this.urlForm.get('domainName').setValue(res.domainName)
      } else {
        this.urlForm.get('domainName').setValue("")
      }
      if (!this.urlTabIndex) {
        this.urlType = 'text';
        this.urlForm.get('originalUrl').setValidators([Validators.required]);
        this.urlForm.get('originalUrl').updateValueAndValidity();
        this.actualText.nativeElement.innerHTML = this.campaignFormValue['actualHtml'] ? this.campaignFormValue['actualHtml'].replace(/<br>/g, '\n') : '';
        if (res.isTrucallerCtaUrl) {
          this.actualText.nativeElement.innerText = this.campaignFormValue['actualHtml'];
        }
        this.originalUrl = this.campaignFormValue['varClicked'] ? '' : this.checkForUrl(this.campaignFormValue['clickedUrl'] ? this.campaignFormValue['clickedUrl'] : this.actualText.nativeElement.innerText)
        this.urlForm.get('originalUrl').setValue(this.originalUrl);

        if (this.config && (!this.config.whatsapp && !this.config.rcs)) {
          this.createCampaignService.getPersonalize(this.campaignId, this.config?.truecaller && 'truecaller' || 'sms').subscribe((res: any) => {
            if (res.data && res.data.length > 0) {
              this.personalizeUrlOptions = [];
              res.data.forEach(e => {
                this.personalizeUrlOptions.push({
                  headerName: e
                });
              })
            }
          }, err => {

          })
        }
        else {
          this.personalizeUrlOptions = res.columnContainingUrlList
        }
        this.getDomain();
      }
    })

    this.common.getSearchAjaxData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res && res?.key == 'form') this.addForm('hasForm', res?.value);
    })

    this.createCampaignService.getClosePopupEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) this.closeShortUrlModal();
    })
    this.createCampaignService.commonHeaders.subscribe(res => {
      if (res && res.common_headers && res.common_headers.length > 0) {
        this.personalizeUrlOptions = [];
        res.common_headers.forEach(e => {
          this.personalizeUrlOptions.push({
            headerName: e
          });
        })
      }
    })

    this.createCampaignService.senderId.subscribe(data => {
      if (data) {
        this.senderId = data?.data ? data?.data?.id : data.id;
      }
    })

  }

  ngOnInit(): void {
    this.campaignFormValue = '';
    this.isDltUser = JSON.parse(localStorage.getItem('is_dlt_user'));
  }

  closeModal(id: string) {
    this.common.close(id);
  }

  showErrors(fieldName, errorType, formName) {
    if (this.urlForm.controls[fieldName].errors && this.urlForm.controls[fieldName].errors[errorType]) {
      return this.sendShortUrlData && this.urlForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  selectActionRecive(item, key) {
    if (key == 'headerName') {
      this.personalizeUrlSelectText = item.headerName;
      this.urlForm.get(key).setValue(item.headerName);
    }
    else if (key == 'domainName') {
      this.domainSelectText = item.domainName;
      this.urlForm.get(key).setValue(item.domainName);
    }
    else if (key == 'urlFromColumn') {
      this.personalizeUrlSelectText = item.headerName;
      this.urlForm.get(key).setValue(item.headerName);
    }
    else if (key == 'selectedForm') {
      this.formSelectText = item.name;
      this.urlForm.get(key).setValue(item._id);
    }
  }

  linkTabChanged(index) {
    this.authorizedForOtherShortUrl = false;
    this.sendShortUrlData = false;
    this.urlTabIndex = index;
    this.personalizeUrlSelectText = '';
    this.urlForm.get('urlFromColumn').setValue('');
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: "",
      rangeObj: ""
    }
    this.urlForm.get('setValidity').setValue(false)
    this.validityCheck();
    this.domainSelectText = '';
    this.urlForm.get('domainName').setValue('');
    if (this.campaignFormValue && this.campaignFormValue.domainName && this.hideDropdown) {
      this.urlForm.get('domainName').setValue(this.campaignFormValue.domainName)
    }
    if (!this.urlTabIndex) {
      this.urlForm.get('originalUrl').setValue('');
      this.urlType = 'text';
      this.urlForm.get('originalUrl').setValidators([Validators.required]);
      this.urlForm.get('originalUrl').updateValueAndValidity();
      this.urlForm.get('urlFromColumn').clearValidators();
      this.urlForm.get('urlFromColumn').updateValueAndValidity();

      if (this.urlFormValue && this.urlFormValue.domainName) {
        if (this.urlFormValue.originalUrl) {
          this.originalUrl = this.campaignFormValue['varClicked'] ? '' : this.checkForUrl(this.campaignFormValue['clickedUrl'] ? this.campaignFormValue['clickedUrl'] : this.campaignFormValue['textMessage'])
          this.urlForm.get('originalUrl').setValue(this.originalUrl);
        }
        else {
          this.urlForm.get('originalUrl').setValue('');
        }
      }
      else {
        this.originalUrl = this.campaignFormValue['varClicked'] ? '' : this.checkForUrl(this.campaignFormValue['clickedUrl'] ? this.campaignFormValue['clickedUrl'] : this.campaignFormValue['textMessage'])
        this.urlForm.get('originalUrl').setValue(this.originalUrl);
      }
    }
    else {
      this.urlType = 'column';
      this.urlForm.get('originalUrl').clearValidators();
      this.urlForm.get('originalUrl').updateValueAndValidity();
      this.urlForm.get('urlFromColumn').setValidators([Validators.required]);
      this.urlForm.get('urlFromColumn').updateValueAndValidity();
      // if(this.urlFormValue) {
      //   this.urlForm.get('originalUrl').setValue('')
      // }
    }
    if (this.urlFormValue && this.urlFormValue.urlFromColumn && (this.urlType != 'text')) {
      this.personalizeUrlSelectText = this.urlFormValue.urlFromColumn;
      this.urlForm.get('urlFromColumn').setValue(this.urlFormValue.urlFromColumn);
    }
  }

  insertShortUrlData() {
    this.sendShortUrlData = true;

    if (this.urlForm.invalid) {
      return;
    }
    if (!this.urlTabIndex) {
      if (!this.validUrl) {
        this.common.openSnackBar(this.validUrlText, 'error');
        return;
      }
    }

    this.insertShortUrl = true;
    let shortcodeHash = this.common.randomString(this.common.shortcodeHashLength);
    if (this.isDltUser) {
      let gotiny_sender_id = localStorage.getItem('gotiny_sender_id') ? localStorage.getItem('gotiny_sender_id') : '';
      if (gotiny_sender_id === 'null') gotiny_sender_id = null;
      if (gotiny_sender_id === 'undefined') gotiny_sender_id = undefined;
      if (this.config.sms || this.config.configureSms) {
        if (!gotiny_sender_id) {
          gotiny_sender_id = this.senderId;
        }
        shortcodeHash = gotiny_sender_id + '/' + shortcodeHash;
      }
    }
    this.shortUrl = this.urlForm.get('domainName').value + shortcodeHash;

    let previewUrl = '';
    let textUrl = '';
    if (this.urlFormValue) {
      if (this.urlChanged) {
        this.urlFormValue['domainName'] = '';
        this.urlFormValue['headerName'] = '';
        this.urlFormValue['originalUrl'] = '';
        this.urlFormValue['setValidity'] = '';
        this.urlFormValue['urlDate'] = '';
        this.urlFormValue['urlFromColumn'] = '';
      }
    }
    if (this.previewValue) {
      if (!this.urlTabIndex) {
        previewUrl = this.checkForUrl(this.previewValue)
        textUrl = this.checkForUrl(this.campaignFormValue.textMessage)
        if (previewUrl) {
          if (this.urlFormValue && this.urlFormValue.domainName) {
            if (this.urlFormText) {
              this.previewValue = this.previewValue.replace(previewUrl, this.shortUrl);
              previewUrl = this.urlForm.get('originalUrl').value ? this.urlForm.get('originalUrl').value.trim() : '';
              this.campaignFormValue.textMessage = this.campaignFormValue?.textMessage?.replace(textUrl, previewUrl);
            }
            else {
              this.authorizedForOtherShortUrl = true;
              return;
            }
          }
          else {
            this.previewValue = this.previewValue.replace(previewUrl, this.shortUrl);
            previewUrl = this.urlForm.get('originalUrl').value ? this.urlForm.get('originalUrl').value.trim() : '';
            this.campaignFormValue.textMessage = this.campaignFormValue?.textMessage?.replace(textUrl, previewUrl);
          }
        }
        else {
          previewUrl = this.urlForm.get('originalUrl').value ? this.urlForm.get('originalUrl').value.trim() : '';
          let textValue = this.campaignFormValue.textMessage + previewUrl
          this.campaignFormValue.textMessage = textValue;
          this.previewValue += this.shortUrl;
        }
      }
      else {
        if (this.urlFormValue) {
          previewUrl = `##${this.urlForm.get('urlFromColumn').value}##`
          // previewUrl = `##${this.urlFormValue.urlFromColumn}##`
        }
        else {
          previewUrl = `##${this.urlForm.get('urlFromColumn').value}##`;
        }
        textUrl = this.checkForUrl(this.campaignFormValue.textMessage)
        let urlColumn = `##${this.urlForm.get('urlFromColumn').value}##`;
        if (previewUrl) {
          if (this.urlFormValue && this.urlFormValue.domainName) {
            if (!this.urlFormText) {
              if (previewUrl) {
                if (this.campaignFormValue?.textMessage?.includes(previewUrl)) {
                  let urlColumnFormValue = this.urlForm.get('urlFromColumn').value;
                  let value = this.campaignFormValue.textMessage.replace(this.urlFormValue.urlFromColumn, urlColumnFormValue)
                  this.campaignFormValue.textMessage = value;
                  this.previewValue = this.campaignFormValue.textMessage;
                  this.previewValue = this.previewValue.replace(urlColumn, this.shortUrl)
                }
                else {
                  let data = {
                    previewUrl: urlColumn,
                    shortUrl: this.shortUrl
                  }
                  this.createCampaignService.setUrlFromColumnValue(data);
                  this.previewValue = this.previewValue.replace(urlColumn, this.shortUrl);
                }
              }
              else {
                if (this.campaignFormValue.textMessage.includes(this.urlFormValue.urlFromColumn)) {
                  let urlColumnFormValue = this.urlForm.get('urlFromColumn').value;
                  let value = this.campaignFormValue.textMessage.replace(this.urlFormValue.urlFromColumn, urlColumnFormValue)
                  this.campaignFormValue.textMessage = value;
                  this.previewValue = this.campaignFormValue.textMessage;
                  this.previewValue = this.previewValue.replace(urlColumn, this.shortUrl)
                }
              }
            }
            else {
              this.authorizedForOtherShortUrl = true;
              return;
            }
          }
          else {
            this.previewValue = this.previewValue.replace(urlColumn, this.shortUrl);
          }
        }
        else {
          previewUrl = `##${this.urlForm.get('urlFromColumn').value}##`;
          let data = {
            previewUrl: previewUrl,
            shortUrl: this.shortUrl
          }
          this.createCampaignService.setUrlFromColumnValue(data);
          this.previewValue = this.previewValue.replace(previewUrl, this.shortUrl);
        }
      }
    }
    else {
      if (!this.urlTabIndex) {
        previewUrl = this.urlForm.get('originalUrl').value ? this.urlForm.get('originalUrl').value.trim() : '';
        this.campaignFormValue.textMessage = previewUrl;
        this.previewValue = this.shortUrl;
      }
      else {
        previewUrl = `##${this.urlForm.get('urlFromColumn').value}##`;
        let textValue = previewUrl
        this.campaignFormValue.textMessage = textValue;
        this.previewValue += this.shortUrl;
      }
    }
    if (this.urlFormValue) {
      if ((this.urlFormValue.originalUrl && (this.urlType != 'text')) || (this.urlFormValue.urlFromColumn && (this.urlType == 'text'))) {
        this.authorizedForOtherShortUrl = true;
        return
      }
    }
    this.closeDrawer('insert-link');
    this.urlFormValue = this.urlForm.value;
    if (this.urlType == 'text') {
      this.urlFormValue['urlFromColumn'] = ''
    }
    else {
      this.urlFormValue['originalUrl'] = ''
    }
    this.sendUrlFormValue.emit(this.urlFormValue)
    this.urlForm.reset();
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: "",
      rangeObj: ""
    }
    this.urlForm.get('setValidity').setValue(false)
    this.validityCheck();
    this.personalizeUrlSelectText = '';
    this.personalizeUrlSelectText = '';
    this.domainSelectText = '';
    if (!this.urlTabIndex) {
      this.urlFormText = true;
    }
    else {
      this.urlFormText = false;
    }
    this.urlTypeTab.emit(this.urlFormText);
    this.urlTabIndex = 0;
    this.sendShortUrlData = false;

    let data: data = {
      data: this.campaignFormValue,
      type: 'insert-link',
      previewValue: this.previewValue,
      shortUrl: this.shortUrl,
      urlType: this.urlType,
      previewUrl: previewUrl
    }
    this.sendData.emit(data);
  }

  validityCheck() {
    if (this.urlForm.get('setValidity').value) {
      this.urlForm.get('urlDate').setValidators([Validators.required]);
      this.urlForm.get('urlDate').updateValueAndValidity();
    }
    else {
      this.datePickerObj = {
        type: "dateTimePicker",
        dateObj: "",
        rangeObj: ""
      }
      this.urlForm.get('urlDate').clearValidators();
      this.urlForm.get('urlDate').updateValueAndValidity();
    }
  }

  insertUrlColumn(input, data?) {
    if (data && !data.headerName) {
      this.common.openSnackBar(this.columnSelectText, 'error')
      return
    }

    this.urlForm.get('originalUrl').setValue(this.common.getValueAsPerPointer(input, this.urlForm.get('originalUrl').value, data.headerName));
    this.checkTypedUrl(this.urlForm.get('originalUrl').value);
  }

  checkForUrl(string) {
    let hasUrlRegex = this.common.detectUrlFromTextRegex
    if (hasUrlRegex.test(string)) {
      let validateUrlRegex = this.common.validateUrl;
      let url = string.match(hasUrlRegex)[0]
      if (validateUrlRegex.test(url)) {
        return url;
      }
    }
  }

  checkTypedUrl(string) {
    string = string.replace(/\s+/g, '');
    var regex = this.common.validateUrl;
    if (regex.test(string)) {
      this.originalUrl = string.match(regex)[0];
      this.validUrl = true;
    }
    else {
      this.validUrl = false;
    }
  }

  getDomain(data?) {
    let serviceCall;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.getDomainList()
    } else if (this.config && this.config.truecaller) {
      serviceCall = this._createTCCampaignService.getDomainList()
    }
    else {
      serviceCall = this.createCampaignService.getDomainList()
    }
    serviceCall.subscribe((res: any) => {
      if (res.data && res.data.length > 0) {
        this.domainList = [];
        res.data.forEach(e => {
          this.domainList.push({
            domainName: e
          });
        })
        if (data) {
          this.domainSelectText = data.domainName;
          this.urlForm.get('domainName').setValue(data.domainName);
        }
      }
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  getDate(event, input) {
    let date = event.target.value;
    let dateFormat = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    input.value = dateFormat;
  }

  showEmptyError(event) {
    if (!this.contactCount && !this.config?.workflow) {
      this.common.openSnackBar(this.importContactText, 'error')
    }
  }

  receiveDate(e) {
    this.urlForm.get('urlDate').setValue(e);
  }

  closeShortUrlModal() {
    this.closeDrawer('insert-link');
    this.urlForm.reset();
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: "",
      rangeObj: ""
    }
    this.urlForm.get('setValidity').setValue(false)
    this.validityCheck();
    this.personalizeUrlSelectText = '';
    this.personalizeUrlSelectText = '';
    this.domainSelectText = '';
    this.previewValue = "";
  }

  closeDrawer(id) {
    // this.showDrawer = false;
    this.previewValue = "";
    this.close.emit(id);
  }

  addForm(hasForm?, searchText?, id?) {
    this.urlForm.get('selectedForm').setValue(null);
    this.formSelectText = this.configFormList.title
    this.urlForm.get('selectedForm').clearValidators();
    this.urlForm.get('selectedForm').updateValueAndValidity();
    if (!this.showAddForm || hasForm) {
      this.createCampaignService.getFormsList(searchText ? searchText : '', 1, 25).subscribe((res: any) => {
        this.formList = res.docs
        if (!hasForm) this.showAddForm = !this.showAddForm;
        if (this.showAddForm) {
          this.urlForm.get('selectedForm').setValidators([Validators.required]);
          this.urlForm.get('selectedForm').updateValueAndValidity();
        }
        if (id && this.formList.length) {
          let obj = this.formList.find(e => e._id == id);
          this.selectActionRecive(obj, 'selectedForm')
        }
      }, err => {
        this.common.openSnackBar(err['message'], 'error');
      })
    }
    else {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.urlForm.get('selectedForm').setValidators([Validators.required]);
        this.urlForm.get('selectedForm').updateValueAndValidity();
      }
    }
  }

  createForm(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}

