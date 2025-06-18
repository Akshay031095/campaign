import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';

const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);

@Component({
  selector: 'app-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent implements OnInit {

  loaderSpinner: boolean = false;
  categorySelectText: any;
  sendCampaignData: boolean = false;
  setParametersConfig = {
    campaign: true,
    category: true,
    sender: false,
    campaignType: false,
    WhatsappBusinessNumber: true,
    messageQuota: true,
    whatsapp: true,
  }
  campaignId: any;
  messageType = '';
  contactCount = '';
  urlType = '';
  showSchedule: boolean = false;
  disableSend: boolean = false;
  hasScheduleAccess: boolean = false;
  campaignData: any;
  whatsAppBusinessNumbers = [];
  messageQuota: any;
  stop = new Subject<void>();
  formValues: any;
  validateFormText: any;
  translatedObj: any;
  validateRes: any;
  validateDataPreview = {};
  scheduledOn: any;
  scheduleTime: any;
  modalType: any;
  userPermissions: any = [];
  isTeammate: any;
  hasPermissions = permissions;
  hasCreateCampaignAccess: boolean = false;
  campaignName: any;
  allPersonalisedRequired: any;
  uploadMediaError: any;
  titleText: boolean = false;
  testCampaign: boolean = false;
  endDate: any;
  endTime: any;
  wabaNumber: any;
  showStaggered: boolean = false;
  noOfMessageZeroError: any;
  daysHoursMinutesZeroError: any;
  showUploadBlacklist: boolean = false;
  blacklistConfig = {
    blacklist: true
  }
  blacklistContactCount: any;
  isKsaUser: any = false;
  blacklistFileUploaded: boolean = false;
  isExcludeFreqCappingChecked: any;
  urlFormValue: any;
  urlCarouselFormValue: any;
  urlCarouselType: any;
  carouselCardMediaUploadError;
  carouselCardPersonalizationError;
  isDltUser;
  selectedLanguage;
  langSelectedCardsButtons: any;

  constructor(public createCampaignService: CreateCampaignService, public common: CommonService, public router: Router, public activatedRoute: ActivatedRoute, public createWhatsappCampaignService: WACreateCampaignService) {
    this.campaignId = this.activatedRoute.snapshot.params.id;
    this.isKsaUser = JSON.parse(localStorage.getItem('is_message_classification'));
    this.showUploadBlacklist = this.common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['WhatsAppCampaigns'], this.hasPermissions.permissionName['whatsapp_temporary_blacklist'], false);
    this.createCampaignService.getContactCount().pipe(takeUntil(this.stop)).subscribe(res => {
      this.contactCount = res;
    })

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        if (this.translatedObj) {
          this.validateFormText = this.translatedObj['common.validate-form-text']
          this.allPersonalisedRequired = this.translatedObj['campaign.personalise-msg-error'];
          this.uploadMediaError = this.translatedObj['campaign.upload-media-error'];
          this.noOfMessageZeroError = this.translatedObj['campaign.stagger-no-of-messages-zero-error']
          this.daysHoursMinutesZeroError = this.translatedObj['campaign.stagger-days-hours-minutes-zero-error']
          this.carouselCardMediaUploadError = this.translatedObj['campaign.whatsapp-carousel-card-media-upload-error']
          this.carouselCardPersonalizationError = this.translatedObj['campaign.whatsapp-carousel-card-personalization-error']
        }
      }
    })

    this.userPermissions = JSON.parse(localStorage.getItem('permissions'));
    this.isTeammate = parseInt(localStorage.getItem('is_team_mate'));

    this.createCampaignService.getEventToGetAllFormValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.formValues = res;
      this.sendValidateData();
    })

    this.validateCreateCampaignPermission();

    this.createWhatsappCampaignService.getBlacklistContactCount().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.blacklistContactCount = res.count ? res.count : 0;
        this.blacklistFileUploaded = res.uploaded ? res.uploaded : false;
      }
    })
  }

  ngOnInit(): void {
    this.isDltUser = JSON.parse(localStorage.getItem('is_dlt_user'));
  }

  getCategoryValue(data) {
    this.categorySelectText = data;
  }

  receivedLoaderState(value) {
    this.common.setLoader(value);
  }

  getParametersData(data) {
    // console.log(data);
  }

  getCampaignDataVar(data) {
    this.sendCampaignData = data;
    this.testCampaign = true;
  }

  validateData() {
    this.sendCampaignData = false;
    if (this.setParametersConfig.whatsapp) {
      setTimeout(() => {
        this.sendCampaignData = true;
      });
      this.testCampaign = false;
      this.createCampaignService.setEventToGetSetParametersValues(true);
    }
  }

  getCampaignDetails() {
    this.common.setLoader(true);
    this.createWhatsappCampaignService.getCampaignDetails(this.campaignId).subscribe((res: any) => {
      if (res['success']) {
        this.campaignData = res;
        this.campaignName = res.data.name;
        this.contactCount = res.data.data_count;
        this.createCampaignService.newCampaignData = res.data;
        this.common.setLoader(false);
      }
      else {
        if (res['status_code'] == 500) {
          this.common.openSnackBar(res['message'], 'error');
          this.common.setLoader(false);
          this.router.navigate(['campaigns/whatsapp']);
        }
      }
    }, err => {
      this.common.openSnackBar(err['error']['message'], 'error');
      this.common.setLoader(false);
      this.router.navigate(['campaigns/whatsapp']);
    })
  }

  getWhatsAppBusinessNumberList() {
    this.createWhatsappCampaignService.getWhatsappBusinessNumbers().subscribe((res: any) => {
      let arr = res.data;
      arr.forEach(e => {
        this.whatsAppBusinessNumbers.push({
          waba_number: `+${e.country_code}-${e.waba_number}`,
          label: `+${e.country_code}-${e.label}`,
          business_id: e?.business_id,
          waba_number_wc: e?.waba_number,
          country_code: e?.country_code
        })
      })
    })
  }

  wabaNumberObj: any;
  getWhatsappBusinessNumber(data) {
    this.wabaNumberObj = data;
    this.wabaNumber = '';
    this.createCampaignService.setEventtoResetText(true);
    if (data) {
      this.wabaNumber = data['waba_number'];
      let numbersData = this.getNumberandCode(data['waba_number'])
      this.getMessageQuota(numbersData['number'], numbersData['code']);
    }
  }

  getMessageQuota(number, code) {
    this.createWhatsappCampaignService.getMessageQuota(number, code).subscribe((res: any) => {
      this.messageQuota = res.data.rate_limit;
    })
  }

  getNumberandCode(data) {
    let arr = data.split('-');
    let value = {
      code: arr[0].replace('+', ''),
      number: arr[1]
    }
    return value;
  }

  cancelCreateCampaign() {
    this.router.navigate(['/campaigns/whatsapp']);
  }

  sendValidateData() {
    if (!this.formValues['campaignName'] || (this.formValues.campaignName && this.formValues.campaignName.length < 6 || this.formValues.campaignName.length > 100) || !this.formValues['campaignCategory'] || !this.formValues['whatsappBusinessNumber'] || !this.formValues['body'] || !this.contactCount || (this.showStaggered && (!this.formValues.noOfMessages || (!this.formValues.day && !this.formValues.hour && !this.formValues.minute))) || (this.formValues.showSchedule && (((this.formValues.scheduleType == 'oneTime') && (!this.formValues.dateTime || !this.formValues.timezone)) || ((this.formValues.scheduleType == 'recurring') && (!this.formValues.dateTime || !this.formValues.timezone || (!this.formValues.endAfter || (this.formValues.endAfter && (((this.formValues.endAfter == 'date') && !this.formValues.endDate) || ((this.formValues.endAfter == 'occurrences') && !this.formValues.occurrences || (this.formValues.occurrences && this.formValues.occurrences.length > 30))))) || (!this.formValues.repeatOn || (this.formValues.repeatOn && ((((this.formValues.repeatOn == 'days') || (this.formValues.repeatOn == 'weeks') || (this.formValues.repeatOn == 'months')) && !this.formValues.frequency || (this.formValues.frequency && this.formValues.frequency.length > 30)) || ((this.formValues.repeatOn == 'day_of_week') && !this.formValues.weekdays) || ((this.formValues.repeatOn == 'date_of_month') && !this.formValues.repeatOnDate)))))) || ((this.formValues.scheduleType == 'multiple') && this.checkMultipleSchedule())))) {
      this.common.openSnackBar(this.validateFormText, 'error');
      return;
    }

    if (this.formValues['noOfMessages']) {
      if (Number(this.formValues['noOfMessages']) == 0) {
        this.common.openSnackBar(this.noOfMessageZeroError, 'error')
        return
      }
      if ((Number(this.formValues['day']) == 0) && (Number(this.formValues['hour']) == 0) && (Number(this.formValues['minute']) == 0)) {
        this.common.openSnackBar(this.daysHoursMinutesZeroError, 'error')
        return
      }
    }

    if (this.checkButtonsVariables(this.formValues.variables, this.formValues.button_info).length && this.formValues.notAllVariablesPersonalised) {
      this.common.openSnackBar(this.allPersonalisedRequired, 'error');
      return;
    }

    if (this.formValues.hasMedia && !this.formValues.hasMediaUploaded) {
      this.common.openSnackBar(this.uploadMediaError, 'error');
      return;
    }

    if (!this.formValues?.media_uploaded_for_all_card && this.mediaTypeAndLangData.media_type === 'carousel') {
      this.common.openSnackBar(this.carouselCardMediaUploadError, 'error');
      return;
    }

    if (this.formValues?.personalization_not_done_for_card && this.mediaTypeAndLangData.media_type === 'carousel') {
      this.common.openSnackBar(this.carouselCardPersonalizationError, 'error');
      return;
    }

    if (this.formValues['dateTime'] || this.formValues['scheduleType'] == "multiple") {
      let hasError = false;
      if (this.formValues['dateTime'] && this.formValues['scheduleType'] != "multiple") {
        hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e: this.formValues['dateTime'], key: "dateTime" });
      } else if (this.formValues['scheduleType'] == "multiple") {
        for (let item of this.formValues['multipleScheduleArr']) {
          hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e: item?.dateTime, key: "dateTime" });
          if (hasError) break;
        }
      }
      if (hasError) return;
    }

    let request = {
      "campaign_id": this.campaignId,
      "country_code": this.formValues.whatsappBusinessNumber.split('-')[0].replace('+', ''),
      "waba_number": this.formValues.whatsappBusinessNumber.split('-')[1],
      "is_duplicate": this.formValues.removeDuplicate,
      "template_category": this.formValues.templateCategory
    }
    if ((this.formValues['urlFormValue'] && this.formValues['urlFormValue'].setValidity) && this.formValues['dateTime']) {
      request['smart_url_validity'] = this.common.getYMDDate(this.formValues['urlFormValue'].urlDate) + ' 23:59:59'
    }
    if ((((this.formValues['urlFormValue'] && this.formValues['urlFormValue'].setValidity) && this.formValues['dateTime']) || (this.isKsaUser && this.formValues['dateTime'])) && (!this.formValues.multipleScheduleArr || (this.formValues.multipleScheduleArr && !this.formValues.multipleScheduleArr.length))) {
      request['schedule_date'] = this.common.getYMDDate(this.formValues['dateTime'])
      request['schedule_time'] = this.common.getHMSTime(this.formValues['dateTime'])
      request['timezone'] = this.formValues['timezone']
    }
    this.scheduledOn = '';
    if (this.formValues['multipleScheduleArr'] && this.formValues['multipleScheduleArr'].length > 0) {
      let dates = this.formValues['multipleScheduleArr'].map(e => e.dateTime)
      let moments = dates.map(d => moment(d))
      let date = moment.min(moments).toDate();
      let getMinutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      this.scheduledOn = `${('0' + date.getDate()).slice(-2)} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      this.scheduleTime = `${date.getHours()}:${getMinutes} ${this.formValues['multipleScheduleArr'][0]['timezoneSelectText']}`;
    }
    else if (this.formValues.dateTime) {
      let date = new Date(this.formValues.dateTime);
      let getHours = (date.getHours() < 10 ? '0' : '') + date.getHours();
      let getMinutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      this.scheduledOn = `${('0' + date.getDate()).slice(-2)} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      this.scheduleTime = `${getHours}:${getMinutes} ${this.formValues.timezoneText}`;
      if (this.formValues['endAfter'] && (this.formValues['endAfter'] == 'date')) {
        let endReccurringDate = new Date(this.formValues['endDate']);
        let endHours = (endReccurringDate.getHours() < 10 ? '0' : '') + endReccurringDate.getHours();
        let endMinutes = (endReccurringDate.getMinutes() < 10 ? '0' : '') + endReccurringDate.getMinutes();
        this.endDate = `${('0' + endReccurringDate.getDate()).slice(-2)} ${endReccurringDate.toLocaleString('default', { month: 'short' })} ${endReccurringDate.getFullYear()}`;
        this.endTime = `${endHours}:${endMinutes}`;
      }
      request["schedule_date"] = this.common.getYMDDate(this.formValues.dateTime)
      request["schedule_time"] = this.common.getHMSTime(this.formValues.dateTime)
      request["timezone"] = this.formValues.timezone
    }

    if (this.formValues['urlFormValue'] && this.formValues['urlFormValue']['domainName']) {
      request["smart_url_type"] = this.urlType
      let requestedUrl = '';
      if (this.urlType == 'column') {
        requestedUrl = this.formValues['urlFormValue'].urlFromColumn
      }
      else {
        if (this.formValues['urlFormValue'] || this.formValues['urlFormValue'].headerName) {
          requestedUrl = this.formValues['urlFormValue'].originalUrl;
        }
      }
      request["smart_url"] = requestedUrl
    }

    if (this.formValues.multipleScheduleArr && this.formValues.multipleScheduleArr.length > 0) {
      let arr = []
      this.formValues.multipleScheduleArr.forEach((schData, index) => {
        let date = new Date(schData.dateTime)
        let obj = {
          scheduler_id: index + 1,
          schedule_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
          schedule_time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
          timezone: schData.timezone
        }
        arr.push(obj);
      })
      request['multiple_scheduler'] = arr
    }

    this.common.setLoader(true);
    this.createWhatsappCampaignService.validateCampaign(request).subscribe((res: any) => {
      if (res['success']) {
        this.sendCampaignData = false;
        // this.showValidate = true;
        this.validateRes = res.data;
        let data = {
          removeDuplicate: this.formValues['removeDuplicate'],
          blacklistCount: this.blacklistContactCount,
          blacklistFileUploaded: this.blacklistFileUploaded,
          exclude_frequncy_capping: this.formValues['removeFrequencyCapping']
        }
        this.validateDataPreview = {
          createCampaignForm: { ...this.formValues, ...data },
          validateRes: this.validateRes
        }
        if (this.scheduledOn) {
          this.validateDataPreview['scheduledOn'] = this.scheduledOn
        }
        if (this.scheduleTime) {
          this.validateDataPreview['scheduleTime'] = this.scheduleTime
        }
        if (this.endDate) {
          this.validateDataPreview['endDate'] = this.endDate
        }
        if (this.endTime) {
          this.validateDataPreview['endTime'] = this.endTime
        }
        let repeatDate = [];
        if (this.formValues.repeatOnDate.length) {
          this.formValues.repeatOnDate.forEach(e => {
            repeatDate.push(e != 'Last Date' ? e + this.common.ordinalSuffix(e) : e)
          })
          this.validateDataPreview['repeatDate'] = repeatDate
        }
        this.common.setLoader(false);
        this.openModal('validate');
        // this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.common.setLoader(false);
        this.common.openSnackBar(res['message'], 'error');
      }
    }, err => {
      this.common.setLoader(false);
      this.common.openSnackBar(err['error']['message'], 'error');
    })
  }

  openModal(id: string) {
    this.common.open(id);
    this.modalType = id;
  }

  recievedDataValidate(data) {
    let request = {
      "name": this.formValues['campaignName'],
      "category_name": this.formValues['categorySelectText'],
      "country_code": this.formValues.whatsappBusinessNumber.split('-')[0].replace('+', ''),
      "waba_number": this.formValues.whatsappBusinessNumber.split('-')[1],
      "is_duplicate": this.formValues.removeDuplicate,
      "language": this.formValues.language,
      "header_text": this.formValues.headerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(this.formValues.headerText, textHnFormatRegex)), this.formValues.IsNonEnglish ? true : false) : null,
      "footer_text": this.formValues.footerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(this.formValues.footerText, textFnFormatRegex)), this.formValues.IsNonEnglish ? true : false) : null,
      "body": this.formValues.body ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(this.formValues.body, textVnFormatRegex)), this.formValues.IsNonEnglish ? true : false) : null,
      "url": this.formValues.uploadFromUrl ? this.formValues.uploadFromUrl : (this.formValues.columnUrl ? this.formValues.columnUrl : null),
      "url_type": this.formValues.uploadFromUrl ? 'text' : (this.formValues.columnUrl ? 'column' : null),
      "media_id": this.formValues.mediaId ? this.formValues.mediaId : null,
      "button_info": (this.formValues.button_info && this.formValues.button_info.length > 0) ? this.reformatButtonsArr(this.formValues.button_info) : null,
      "template_id": this.formValues.templateId,
      "service_template_id": this.formValues ? this.formValues.service_template_id : '',
      "content_type": (this.formValues && this.formValues.content_type) ? this.formValues.content_type : null,
      "template_name": this.formValues.templateName,
      "type": (this.formValues.personalisedHeader || this.formValues.personalisedButton || this.formValues.personalisedBody) ? 'personalised' : 'common',
      "header_text_personalised": this.formValues.personalisedHeader,
      "media_type": this.formValues.media ? this.formValues.media : null,
      "header_type": this.formValues.header,
      "is_unicode": this.formValues ? this.formValues.IsNonEnglish : [],
      "template_category": this.formValues.templateCategory,
      "exclude_frequncy_capping": this.formValues['removeFrequencyCapping'],
      "campaign_summary": this.validateDataPreview,
      "buttons_info": this.formValues.buttons_info
    }
    let obj = {};
    if (this.formValues.variablesDetails && this.formValues.variablesDetails.length) {
      this.formValues.variablesDetails.forEach(e => {
        if (/\{\{[V][0-9]*\}\}/g.test(e.actualVar)) {
          obj[e.actualVar.replace(/\{\{|\}\}/g, '')] = e.personalizedUrl ? (this.urlType == 'text' ? (e.personalizedUrl.includes('##') ? e.personalizedUrl : '##' + e.personalizedUrl + '##') : e.personalizedUrl) : e.personalizedVar
        }
      })
    }
    // if(this.formValues.variablesData && this.formValues.variablesData.length > 0) {
    //     this.formValues.variablesData.forEach(e => {
    //       obj[e.variable] = e.urlValue ? (this.urlType == 'text' ?  (e.urlValue.includes('##') ? e.urlValue : '##'+e.urlValue+'##') : e.urlValue) : e.PersonalizedValue
    //     })
    // }
    request['personalized_column'] = obj
    if (this.formValues.dateTime && (!this.formValues.multipleScheduleArr || (this.formValues.multipleScheduleArr && !this.formValues.multipleScheduleArr.length))) {
      request["schedule_date"] = this.common.getYMDDate(this.formValues.dateTime)
      request["schedule_time"] = this.common.getHMSTime(this.formValues.dateTime)
      request["timezone"] = this.formValues.timezone
    }
    if (this.formValues['noOfMessages']) {
      request['stagger_message_count'] = Number(this.formValues['noOfMessages'])
      request['stagger_day'] = Number(this.formValues['day'] ? this.formValues['day'] : '00')
      request['stagger_hour'] = Number(this.formValues['hour'] ? this.formValues['hour'] : '00')
      request['stagger_minute'] = Number(this.formValues['minute'] ? this.formValues['minute'] : '00')
    }
    if (this.formValues['urlFormValue']) {
      request["domain"] = this.formValues['urlFormValue'].domainName
      request["smart_url_type"] = this.urlType
      let requestedUrl = '';
      if (this.urlType == 'column') {
        requestedUrl = this.formValues['urlFormValue'].urlFromColumn
      }
      else {
        if (this.formValues['urlFormValue'] || this.formValues['urlFormValue'].headerName) {
          requestedUrl = this.formValues['urlFormValue'].originalUrl;
        }
      }
      request["smart_url"] = requestedUrl
      if (this.formValues['urlFormValue']['selectedForm']) {
        request['form_id'] = this.formValues.urlFormValue.selectedForm
      }
    }
    if (this.formValues['urlFormValue'] && this.formValues['urlFormValue'].setValidity) {
      request['smart_url_validity'] = this.common.getYMDDate(this.formValues['urlFormValue'].urlDate) + ' 23:59:59'
    }
    if (this.formValues['scheduleType'] == 'recurring') {
      request['is_recurring'] = true;
      request['recurring_type'] = this.formValues['endAfter']
      if (this.formValues['endAfter'] == 'occurrences') {
        request['occurrences'] = Number(this.formValues['occurrences']);
      }
      if (this.formValues['endAfter'] == 'date') {
        let endDate = new Date(this.formValues['endDate']);
        request['end_date'] = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
        request['end_time'] = `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`;
      }
      request['frequency'] = this.formValues['repeatOn']
      if ((this.formValues['repeatOn'] == 'days') || (this.formValues['repeatOn'] == 'weeks') || (this.formValues['repeatOn'] == 'months')) {
        request['repeat_interval'] = Number(this.formValues['frequency'])
      }
      if (this.formValues['repeatOn'] == 'day_of_week') {
        request['repeat_days_of_week'] = this.formValues['weekdays'].map(e => {
          return e.toLowerCase();
        })
      }
      if (this.formValues['repeatOn'] == 'date_of_month') {
        request['last_date_of_month'] = false;
        let index = this.formValues['repeatOnDate'].findIndex(e => e == 'Last Date')
        if (index > -1) {
          this.formValues['repeatOnDate'].splice(index, 1);
          request['last_date_of_month'] = true;
        }
        request['repeat_dates_of_month'] = this.formValues['repeatOnDate']
      }
    }
    else {
      request['is_recurring'] = false;
    }
    if (this.formValues.fileName) {
      request['file_name'] = this.formValues.fileName;
    }
    if (this.formValues && this.formValues?.newFileName) {
      request['new_filename'] = this.formValues.newFileName;
    }
    if (this.formValues.multipleScheduleArr && this.formValues.multipleScheduleArr.length > 0) {
      let arr = []
      this.formValues.multipleScheduleArr.forEach((schData, index) => {
        let date = new Date(schData.dateTime)
        let obj = {
          scheduler_id: index + 1,
          schedule_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
          schedule_time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
          timezone: schData.timezone
        }
        arr.push(obj);
      })
      request['multiple_scheduler'] = arr
    }
    if (this.mediaTypeAndLangData.media_type === 'carousel') {
      request['carousel'] = this.formValues.carousel;
    }
    this.common.setLoader(true);
    this.createWhatsappCampaignService.updateCampaign(request, this.campaignId).subscribe((res: any) => {
      if (res['success']) {
        this.common.setLoader(false);
        this.common.openSnackBar(res['message'], 'success');
        this.router.navigate(['/campaigns/whatsapp']);
      }
      else {
        this.common.setLoader(false);
        this.common.openSnackBar(res['message'], 'error');
      }
    }, err => {
      this.common.setLoader(false);
      this.common.openSnackBar(err['error']['message'], 'error');
    })
  }

  validateCreateCampaignPermission() {
    if (this.isTeammate == 0) {
      this.hasCreateCampaignAccess = true;
      this.hasScheduleAccess = true;
      this.authorizeCampaign();
    }
    else {
      if (this.userPermissions.find(e => (e === 'schedule_whatsapp_campaign'))) {
        this.hasScheduleAccess = true;
      }
      else {
        this.hasScheduleAccess = false
      }
      if (this.userPermissions.find(e => ((e === 'create_whatsapp_campaign_maker_checker') || (e === 'create_whatsapp_campaign_maker')))) {
        this.hasCreateCampaignAccess = true;
        this.authorizeCampaign();
      }
      else {
        this.hasCreateCampaignAccess = false;
        this.router.navigate(['/403']);
      }
    }
  }

  authorizeCampaign() {
    this.getWhatsAppBusinessNumberList();
    this.getCampaignDetails();
  }

  removeVarFormText(text, regex, regex2?) {
    let arr = text.match(regex)
    if (regex2 && !arr || (arr && arr.length == 0)) {
      arr = text.match(regex2)
      regex = regex2
    }
    let index = 0;
    if (arr && arr.length > 0) {
      return text.replace(regex, function (m) {
        let value = ''
        index++;
        return value;
      });
    }
    else {
      return text
    }
  }

  reformatButtonsArr(arr) {
    if (arr && arr.length > 0) {
      arr.forEach(e => {
        if (e.url_type && (e.url_type == 'dynamic')) {
          e.url = this.common.removeEndWhitespace(this.removeVarFormText(e.url, TextVarRegex, textFnFormatRegex))
        }
      })
      return arr;
    }
    else {
      return null;
    }
  }

  noMessageQuotaEvent(data) {
    if (data) {
      this.messageQuota = '';
    }
  }

  getScheduleEvent(data) {
    this.showSchedule = data;
  }

  showStaggeredEvent(data) {
    this.showStaggered = data;
  }

  checkMultipleSchedule() {
    if (this.formValues.multipleScheduleArr && this.formValues.multipleScheduleArr.length > 0) {
      return this.formValues.multipleScheduleArr.some(e => !e.dateTime || !e.timezone)
    }
    else {
      return true
    }
  }

  receivedExcludeFreqCappingEvent(event) {
    this.isExcludeFreqCappingChecked = event.checked
  }

  getUrlType(data) {
    this.urlType = data;
  }

  getUrlFormValue(event) {
    this.urlFormValue = event;
  }

  checkButtonsVariables(variables, buttons) {
    let arr = []
    if (variables && variables.length) {
      if (buttons && buttons.length) {
        let idSet = new Set(buttons.map(obj => '>' + obj.buttonText));
        arr = variables.filter(obj => !idSet.has(obj.variable));
      }
      else {
        arr = variables
      }
    }
    return arr;
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

  mediaTypeAndLangData = {
    media_type: null,
    lang_data: null,
    step_number: null
  }

  getMediaTypeAndLangData(MediaTypeAndLangData) {
    this.mediaTypeAndLangData = MediaTypeAndLangData;
    this.receivedCardObj(null);
  }

  getCarouselUrlFormValue(event) {
    this.urlCarouselFormValue = event;
  }

  getCarouselUrlType(data) {
    this.urlCarouselType = data;
  }

  getSelectedLanguage(e) {
    this.selectedLanguage = e;
  }

  receivedCardObj(event) {
    this.langSelectedCardsButtons = event;
  }

}
