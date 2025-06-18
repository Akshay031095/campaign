import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as timezone from 'src/app/shared/mock-data/timezone';
import moment from 'moment';
import { CampaignService } from 'src/app/shared/services/campaign.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// import { CampaignListService as WhatsappCampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { CreateCampaignService as CreateVoiceCampaignService } from "src/app/shared/services/voice/create-campaign.service";

// export interface expiryData {
//   campaignName: string,
//   campaignCategory: string,
//   expiryDate: string,
//   timezone: string

// }
@Component({
  selector: 'app-set-expiry',
  templateUrl: './set-expiry.component.html',
  styleUrls: ['./set-expiry.component.css']
})
export class SetExpiryComponent implements OnInit {

  scheduleData: any;
  campaignCategoryList: any;
  categorySelectText: any;
  expiryCampaignForm: FormGroup;
  loaderSpinner: boolean = false;
  stop = new Subject<void>();

  configCategory = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: true
  };
  sendExpiryDate: boolean = false;
  public date: moment.Moment;
  public showSpinners = true;
  public showSeconds = true;
  public touchUi = false;
  public enableMeridian = false;
  public hideTime = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public timezones;
  // private whatsappUnsubscribe: Subscription;
  private voiceUnsubscribe: Subscription;
  @Input() public setExpiryData:any;
  // private smsUnsubscribe: Subscription;
  timezonesArr = [];
  timezoneSelectText: any;
  configTimezone = {
    image: false,
    title: '',
    key: 'text',
    search: true,
    open: false
  }
  defaultDate: any = {};
  datePickerObj = {
    dateObj: this.defaultDate,
    type: "dateTimePicker"
  };

  @Output() sendLoaderState = new EventEmitter<any>();
  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: true,
    // minDate: moment.Moment,
    // maxDate: moment.Moment,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1
  }
  messageClassificationType: any = null;
  messageStartTime: any;
  messageEndTime: any;
  invalidSlotTime: boolean = false;
  scheduleCampaignError: any;
  invalidSlotTimeText: any;
  @Input() config: any;
  translatedObj: any;

  constructor(
    public common: CommonService,
    public createCampaignService: CreateCampaignService,
    public fb: FormBuilder, public campaignService: CampaignService,
    public matDialog: MatDialog, public router: Router,
    public translate: TranslateService,
    public voiceCampaignListService: VoiceCampaignListService,
    private createVoiceCampaignService: CreateVoiceCampaignService
  ) {
    this.expiryCampaignForm = this.fb.group({
      campaignName: ['', [Validators.required]],
      campaignCategory: ['', [Validators.required]],
      dateTime: ['', [Validators.required]],
      timezone: [null, [Validators.required]]
    });
    translate.stream(['campaign.select-text', 'campaign.schedule-campaign-error']).pipe(takeUntil(this.stop)).subscribe((text) => {
      this.configCategory.title = text['campaign.select-text']
      this.configTimezone.title = text['campaign.select-text']
      this.scheduleCampaignError = text['campaign.schedule-campaign-error']
    });

    this.common.translatedObj.pipe(takeUntil(this.stop)).subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
      }
    })
    /// getting expiry data
    // this.createVoiceCampaignService.getCampaignDetails().subscribe
    //////
    this.voiceCampaignListService.getScheduleCampaignData().pipe(takeUntil(this.stop)).subscribe(res => {
      this.scheduleData = res;
      if (this.scheduleData) {
        this.invalidSlotTime = false;
        this.expiryCampaignForm.get('campaignName').setValue(this.scheduleData.name);
        if (this.campaignCategoryList && this.campaignCategoryList.length > 0) {
          this.campaignCategoryList.forEach(el => {
            if (el.name == this.scheduleData.category_name) {
              this.categorySelectText = el.name;
              this.expiryCampaignForm.get('campaignCategory').setValue(this.categorySelectText);
              this.expiryCampaignForm.get('campaignCategory').setValue(el.name);
            }
          })
        }
        this.timezones = this.getTimezone(timezone.timezone);
        this.setTimezone();
        const dateObject = this.scheduleData.expiry_date ? moment(new Date(this.scheduleData.expiry_date)).format() : this.defaultDate;
        this.datePickerObj = {
          dateObj: dateObject,
          type: "dateTimePicker"
        }
        this.expiryCampaignForm.get('dateTime').setValue(this.scheduleData.expiry_date ? moment(new Date(this.scheduleData.expiry_date)).format() : "");
        if (this.scheduleData.message_classification_type) {
          // this.messageClassificationType = this.scheduleData.message_classification_type
        }
        else {
          // this.messageClassificationType = null
        }
      }
    });

    //////





  }// End of constructor
  ngOnInit(): void {
    this.getCategory();
  }



  closeModal(id: string) {
    this.common.close(id);
  }

  private getCategory(value?) {
    this.createCampaignService.getCampaignCategory().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.campaignCategoryList = res.data;
      // if (value) {
      //   this.campaignCategoryList.forEach(el => {
      //     if (el._id == value.data._id) {
      //       this.categorySelectText = el.name;
      //       this.expiryCampaignForm.get('campaignCategory').setValue(value.data._id);
      //     }
      //   })
      // }
    })
  }



  selectActionRecive(item, key) {

    this.timezoneSelectText = item ? item.text : this.translatedObj['campaign.select-text'];
    this.expiryCampaignForm.get(key).setValue(item ? item.value : '');
  }

  showErrors(fieldName, errorType, formName) {
    if (this.expiryCampaignForm.controls[fieldName].errors && this.expiryCampaignForm.controls[fieldName].errors[errorType]) {
      return this.sendExpiryDate && this.expiryCampaignForm.controls[fieldName].errors[errorType];
      // return this.expiryCampaignForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  setTimezone() {
    let userTimezone = this.scheduleData.timezone ? this.scheduleData.timezone : localStorage.getItem('timezone');
    this.timezones.forEach((e, index) => {
      if (e.value == userTimezone) {
        this.timezoneSelectText = e.text;
        this.expiryCampaignForm.get('timezone').setValue(e.value);
      }
    })
  }

  getTimezone(timezones) {
    for (var key in timezones) {
      this.timezonesArr.push({
        'value': key,
        'text': timezones[key]
      })
    }
    return this.timezonesArr;
  }

  public receiveDate(e) {
    e.setHours(0, 0, 0, 0);
    if (this.config.voice) {
      this.sendExpiryDate = false;
      this.expiryCampaignForm.get('dateTime').setValue(e);
      this.checkCurrentAndExpDateValidation('dateTime');
    }
  }
  public checkCurrentAndExpDateValidation = (dateString: string) => {
    if (!this.expiryCampaignForm.get('dateTime').value) return;
    const expDate = this.expiryCampaignForm.get('dateTime').value;
    // let schDate = new Date(this.scheduleData.schedule_date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if ((!this.isSameDate(expDate, currentDate) && (+expDate < +currentDate))) {
      this.expiryCampaignForm.get(dateString).setValue(null);
      if (dateString == 'dateTime') {
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: this.defaultDate
        }
      }
      this.common.openSnackBar(`Select Present/Future Expiry Date `, "error");
    }
  }

  public isSameDate = (expDate, currentDate) => {
    if (expDate.getFullYear() === currentDate.getFullYear()
      && expDate.getMonth() === currentDate.getMonth()
      && expDate.getDate() === currentDate.getDate()) {
      return true;
    } else {
      return false;
    }
  }
  public updateExpiryDate() {
    this.sendExpiryDate = true;
    if (this.expiryCampaignForm.invalid) {
      return;
    }
    let request = {};
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let date = new Date(this.expiryCampaignForm.get('dateTime').value);
    request["expiry_date"] = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    request["expiry_timezone"] = this.expiryCampaignForm.get('timezone').value;
    const serviceCall = this.voiceCampaignListService.updateExpiryCamp(request, this.scheduleData._id);
    serviceCall.pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res['success']) {
        this.sendExpiryDate = false;
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.voiceCampaignListService.setExpiryUpdateSucess(res);
        this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
      }
    }, err => {
      this.loaderSpinner = false;
      this.sendExpiryDate = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.common.openSnackBar(err['error']['message'], 'error');
    });

    this.expiryCampaignForm.reset();
    this.closeModal('expiry');


  }

  cancel() {
    this.expiryCampaignForm.reset();
    this.closeModal('expiry');
    this.sendExpiryDate = false;
  }

  OnDestroy() {
    // this.voiceUnsubscribe.unsubscribe();
    this.stop.next();
    this.stop.complete();
  }

}//end of class
