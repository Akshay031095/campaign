import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as timezone from 'src/app/shared/mock-data/timezone';
import moment from 'moment';
import { CampaignService } from 'src/app/shared/services/campaign.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CampaignListService as WhatsappCampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { CampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';
import { CampaignListService as RcsCampaignListService } from 'src/app/shared/services/rcs/campaigns/campaign-list.service';
import { WorkflowBuilderService } from 'src/app/workflow/workflow-builder/builder/workflow-builder.service';
import { CampaignListService as TruecallerCampaignListService } from 'src/app/shared/services/truecaller/campaigns/campaign-list.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  scheduleData: any;
  campaignCategoryList: any;
  categorySelectText: any;
  scheduleCampaignForm: FormGroup;
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
  sendScheduleData: boolean = false;
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
  private whatsappUnsubscribe: Subscription;
  private voiceUnsubscribe: Subscription;
  private smsUnsubscribe: Subscription;
  public timezones;
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
  }
  @Output() sendLoaderState = new EventEmitter<any>();
  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    minDate: moment(new Date()).format(),
    // maxDate: moment.Moment,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1,
    hideDefaultMsg: true
  }
  messageClassificationType: any = null;
  messageStartTime: any;
  messageEndTime: any;
  invalidSlotTime: boolean = false;
  scheduleCampaignError: any;
  invalidSlotTimeText: any;
  @Input() config: any;
  translatedObj: any;
  endAfterList = [
    { key: 'Date', value: 'date' },
    { key: 'Occurrences', value: 'occurrences' }
  ];
  configEndAfter = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false
  };
  endAfterSelectText = '';
  endDatePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    minDate: moment(new Date()).add(1, 'days').format(),
    // maxDate: moment.Moment,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1
  }
  configRepeatOn = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: false,
    groupBy: true,
    childArray: 'child'
  };
  repeatOnList = [
    {
      "name": "Set Frequency",
      "value": "",
      "child": [
        {
          "name": "Days",
          "value": "days"
        },
        {
          "name": "Weeks",
          "value": "weeks"
        },
        {
          "name": "Months",
          "value": "months"
        }
      ]
    },
    {
      "name": "Day of week",
      "value": "day_of_week",
      "child": []
    },
    {
      "name": "Date of month",
      "value": "date_of_month",
      "child": []
    }
  ];
  repeatOnSelectText = '';
  weekdaysList = [
    { key: 'Monday', value: 'monday' },
    { key: 'Tuesday', value: 'tuesday' },
    { key: 'Wednesday', value: 'wednesday' },
    { key: 'Thursday', value: 'thursday' },
    { key: 'Friday', value: 'friday' },
    { key: 'Saturday', value: 'saturday' },
    { key: 'Sunday', value: 'sunday' }
  ];
  configWeekdays = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false,
    checkbox: true
  };
  weekdaysselectText = '';
  repeatOnDateList = [
    { key: 1, value: 1 },
    { key: 2, value: 2 },
    { key: 3, value: 3 },
    { key: 4, value: 4 },
    { key: 5, value: 5 },
    { key: 6, value: 6 },
    { key: 7, value: 7 },
    { key: 8, value: 8 },
    { key: 9, value: 9 },
    { key: 10, value: 10 },
    { key: 11, value: 11 },
    { key: 12, value: 12 },
    { key: 13, value: 13 },
    { key: 14, value: 14 },
    { key: 15, value: 15 },
    { key: 16, value: 16 },
    { key: 17, value: 17 },
    { key: 18, value: 18 },
    { key: 19, value: 19 },
    { key: 20, value: 20 },
    { key: 21, value: 21 },
    { key: 22, value: 22 },
    { key: 23, value: 23 },
    { key: 24, value: 24 },
    { key: 25, value: 25 },
    { key: 26, value: 26 },
    { key: 27, value: 27 },
    { key: 28, value: 28 },
    { key: 29, value: 29 },
    { key: 30, value: 30 },
    { key: 31, value: 31 },
    { key: 'Last Date', value: 'lastDate' }
  ]
  configRepeatOnDate = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false,
    checkbox: true
  };
  repeatOnDateSelectText = '';
  endDatePickerObj = {
    type: "dateTimePicker",
    dateObj: moment(new Date()).add(1, 'days').format()
  }
  isRecurring: boolean = false;
  futureOccurrencesList = [
    { key: 'Pause Future Occurrences', value: 'Pause Future Occurrences', disable: false },
    { key: 'Resume Future Occurrences', value: 'Resume Future Occurrences', disable: false },
    { key: 'Stop Future Occurrences', value: 'Stop Future Occurrences', disable: false }
  ];
  configFutureOccurrences = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false
  };
  futureOccurrencesSelectText = '';
  isMultipleSchedule: boolean = false;
  multipleScheduleForm: FormGroup;
  multipleScheduleList: FormArray;
  highlightedDate: any;
  trueCallerUnsubscribe: Subscription;

  constructor(
    public common: CommonService,
    public createCampaignService: CreateCampaignService,
    public fb: FormBuilder,
    public campaignService: CampaignService,
    public matDialog: MatDialog,
    public router: Router,
    public translate: TranslateService,
    public whatsappCampaignListService: WhatsappCampaignListService,
    public voiceCampaignListService: VoiceCampaignListService,
    public rcsCampaignListService: RcsCampaignListService,
    public workflowBuilderService: WorkflowBuilderService,
    public trueCallerCampaignList: TruecallerCampaignListService) {
    this.scheduleCampaignForm = this.fb.group({
      campaignName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      campaignCategory: [null, [Validators.required]],
      dateTime: ['', []],
      timezone: [null, [Validators.required]],
      endAfter: ['', []],
      endDate: ['', []],
      occurrences: ['', []],
      repeatOn: ['', []],
      frequency: ['', []],
      weekdays: ['', []],
      repeatOnDate: ['', []],
      futureOccurrences: ['', []]
    });
    this.multipleScheduleForm = this.fb.group({
      multipleScheduleArr: this.fb.array([this.addSchedule()]),
    })
    this.multipleScheduleList = this.multipleScheduleForm.get('multipleScheduleArr') as FormArray;

    translate.stream(['campaign.select-text', 'campaign.schedule-campaign-error']).pipe(takeUntil(this.stop)).subscribe((text) => {
      this.configCategory.title = text['campaign.select-text']
      this.configTimezone.title = text['campaign.select-text']
      this.configFutureOccurrences.title = text['campaign.select-text']
      this.scheduleCampaignError = text['campaign.schedule-campaign-error']
    });

    this.common.translatedObj.pipe(takeUntil(this.stop)).subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        this.configEndAfter.title = this.translatedObj['common-select'];
        this.configRepeatOn.title = this.translatedObj['common-select'];
        this.configWeekdays.title = this.translatedObj['common-select'];
        this.configRepeatOnDate.title = this.translatedObj['common-select'];
        this.endAfterSelectText = this.translatedObj['common-select'];
        this.repeatOnSelectText = this.translatedObj['common-select'];
        this.weekdaysselectText = this.translatedObj['common-select'];
        this.repeatOnDateSelectText = this.translatedObj['common-select'];
      }
    })

    this.smsUnsubscribe = this.campaignService.getScheduleCampaignData().subscribe(res => {
      this.scheduleData = res;
      this.setEditScheduleValues();
    });

    this.whatsappUnsubscribe = this.whatsappCampaignListService.getScheduleCampaignData().subscribe(res => {
      this.scheduleData = res;
      this.setEditScheduleValues();
    });

    this.trueCallerUnsubscribe = this.trueCallerCampaignList.getScheduleCampaignData().subscribe(res => {
      this.scheduleData = res;
      this.setEditScheduleValues();
    });
    //////
    this.voiceCampaignListService.getScheduleCampaignData().subscribe(res => {
      this.scheduleData = res;
      this.setEditScheduleValues();
    });

    //////
    this.rcsCampaignListService.getScheduleCampaignData().subscribe(res => {
      this.scheduleData = res;
      this.setEditScheduleValues();
    });
  }// End of constructor
  ngOnInit(): void {
    this.getCategory();
    if (this.weekdaysList.length) {
      this.weekdaysList.forEach(e => {
        e['checkbox'] = false;
      })
    }
    if (this.repeatOnDateList.length) {
      this.repeatOnDateList.forEach(e => {
        e['checkbox'] = false;
      })
    }
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: ""
    }
  }

  addSchedule(data?, hasAdd?): FormGroup {
    let timezone = hasAdd ? this.scheduleCampaignForm.get('timezone').value : (data ? data.timezone : '')
    let timezoneSelectText = hasAdd ? this.timezoneSelectText : (data ? data.timezoneSelectText : '')
    let dateTime = hasAdd ? '' : (data ? data.dateTime : '')
    return this.fb.group({
      dateTime: [dateTime, [Validators.required]],
      timezone: [timezone, [Validators.required]],
      timezoneSelectText: [timezoneSelectText, []],
      configTimezone: {
        image: false,
        title: this.translatedObj ? this.translatedObj['campaign.select-text'] : '',
        key: 'text',
        search: true,
        open: false
      },
      datePickerObj: [{
        type: "dateTimePicker",
        dateObj: hasAdd ? '' : (data ? moment(data.dateTime).format() : '')
      }, []]
    })
  }

  closeModal(id: string) {
    this.common.close(id);
  }

  getCategory(value?) {
    this.createCampaignService.getCampaignCategory().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.campaignCategoryList = res.data;
      if (value) {
        this.campaignCategoryList.forEach(el => {
          if (el._id == value.data._id) {
            this.categorySelectText = el.name;
            this.scheduleCampaignForm.get('campaignCategory').setValue(value.data._id);
          }
        })
      }
    })
  }

  newCategory(event) {
    if (!event) {
      return;
    }
    let request = {
      name: event,
      type: "campaign"
    }
    this.loaderSpinner = true;
    this.createCampaignService.createCampaignCategory(request).pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res['success']) {
        this.loaderSpinner = false;
        this.getCategory(res);
        this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.loaderSpinner = false;
        this.common.openSnackBar(res['message'], 'error');
      }
    },
      err => {
        this.loaderSpinner = false;
        this.common.openSnackBar(err['error']['data']['errors']['name'], 'error');
      })
  }

  selectActionRecive(item, key) {
    if (item.value == "occurrences") {
      this.scheduleCampaignForm.get('repeatOn').setValue('');
      this.repeatOnSelectText = '';
    }
    if (key == 'campaignCategory') {
      this.categorySelectText = item.name ? item.name : this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get(key).setValue(item._id ? item._id : '');
    }
    else if (key == 'endAfter') {
      this.endAfterSelectText = item ? item.key : this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get(key).setValue(item ? item.value : '');
      this.scheduleCampaignForm.get('occurrences').setValue('');
      if (this.scheduleCampaignForm.get(key).value == 'date') {
        this.setValidator('endDate');
        this.clearValidator('occurrences');
      }
      else if (this.scheduleCampaignForm.get(key).value == 'occurrences') {
        this.setValidator('occurrences');
        this.clearValidator('endDate');
      }
      else {
        this.clearValidator('occurrences');
        this.clearValidator('endDate');
      }
    }
    else if (key == 'repeatOn') {
      this.repeatOnSelectText = item ? item.name : this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get(key).setValue(item ? item.value : '');
      this.scheduleCampaignForm.get('frequency').setValue('');
      this.weekdaysselectText = this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get('weekdays').setValue('');
      this.repeatOnDateSelectText = this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get('repeatOnDate').setValue('');
      if (this.weekdaysList.length) {
        this.weekdaysList.forEach(e => {
          e['checkbox'] = false;
        })
      }
      if (this.repeatOnDateList.length) {
        this.repeatOnDateList.forEach(e => {
          e['checkbox'] = false;
        })
      }
      this.setReccurringValidators();
    }
    else if (key == 'weekdays') {
      this.weekdaysselectText = item.toString();
      this.scheduleCampaignForm.get(key).setValue(item);
      if (this.weekdaysList.length) {
        if (item && item.length > 0) {
          item.forEach(res => {
            let index = this.weekdaysList.findIndex(ev => res == ev.value)
            if (index > -1) {
              this.weekdaysList[index]['checkbox'] = true
            }
          })
        }
      }
    }
    else if (key == 'repeatOnDate') {
      this.repeatOnDateSelectText = item.toString();
      if (item && item.length > 0) {
        let index = item.findIndex(e => (e == 'Last Date') || (e == 'lastDate'))
        if (index > -1) {
          item.splice(index, 1);
          item.push('lastDate')
        }
      }
      this.scheduleCampaignForm.get(key).setValue(item);
      if (this.repeatOnDateList.length) {
        if (item && item.length > 0) {
          item.forEach(res => {
            let index = this.repeatOnDateList.findIndex(ev => res == ev.value)
            if (index > -1) {
              this.repeatOnDateList[index]['checkbox'] = true
            }
          })
        }
      }
    }
    else if (key == 'futureOccurrences') {
      this.futureOccurrencesSelectText = item ? item.key : this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get(key).setValue(item ? item.value : '');
    }
    else {
      this.timezoneSelectText = item ? item.text : this.translatedObj['campaign.select-text'];
      this.scheduleCampaignForm.get(key).setValue(item ? item.value : '');
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.scheduleCampaignForm.controls[fieldName].errors && this.scheduleCampaignForm.controls[fieldName].errors[errorType]) {
      return this.sendScheduleData && this.scheduleCampaignForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  setTimezone(multiple?) {
    let userTimezone = multiple ? localStorage.getItem('timezone') : this.scheduleData.timezone;
    this.timezones.forEach((e, index) => {
      if (e.value == userTimezone) {
        this.timezoneSelectText = e.text;
        this.scheduleCampaignForm.get('timezone').setValue(e.value);
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

  receiveDate(e, type?) {
    const hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e, key:'dateTime', item: this.scheduleCampaignForm });
    if (hasError) {
      this.datePickerObj = {
        type: "dateTimePicker",
        dateObj: ''
      };
      return;
    }

    if (type) {
      this.scheduleCampaignForm.get(type).setValue(e);
    }
    else {
      this.scheduleCampaignForm.get('dateTime').setValue(e);
      this.scheduleCampaignForm.get('endDate').setValue('');
      this.endDatePickerObj = {
        type: "dateTimePicker",
        dateObj: ""
      }
      this.endDatePickerConfig.minDate = moment(this.scheduleCampaignForm.get('dateTime').value).add(1, 'days').format();
      let date = new Date(this.scheduleCampaignForm.get('dateTime').value)
      date.setDate(date.getDate() + 1)
      this.highlightedDate = date
    }
  }

  updateScheduledCampaign() {
    this.sendScheduleData = true;
    if (this.isMultipleSchedule) {
      this.scheduleCampaignForm.get('timezone').clearValidators();
      this.scheduleCampaignForm.get('timezone').updateValueAndValidity();
    }
    else {
      this.scheduleCampaignForm.get('timezone').setValidators([Validators.required]);
      this.scheduleCampaignForm.get('timezone').updateValueAndValidity();
    }
    if (this.scheduleCampaignForm.invalid || this.multipleScheduleForm.invalid) {
      return;
    }

    let formValues = this.scheduleCampaignForm.value;
    console.log(formValues);
    if (formValues['dateTime'] || this.isMultipleSchedule) {
      let hasError = false;
      if (formValues['dateTime'] && !this.isMultipleSchedule) {
        hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e: formValues['dateTime'], key: "dateTime" });
      } else if (this.isMultipleSchedule) {
        for (let item of this.multipleScheduleList.value) {
          hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e: item?.dateTime, key: "dateTime" });
          if (hasError) break;
        }
      }
      if (hasError) return;
    }

    let request = {
      name: this.scheduleCampaignForm.get('campaignName').value,
      timezone: this.scheduleCampaignForm.get('timezone').value
    }
    if (this.config?.workflow) request['category'] = this.categorySelectText;
    else request['category_name'] = this.categorySelectText;

    if (this.isMultipleSchedule) {
      let arr = []
      this.multipleScheduleList.controls.forEach((schData, index) => {
        let date = new Date(schData.get('dateTime').value)
        let obj = {
          scheduler_id: index + 1,
          schedule_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
          schedule_time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
          timezone: schData.get('timezone').value
        }
        arr.push(obj);
      })
      request['multiple_scheduler'] = arr
    }
    else {
      let date = new Date(this.scheduleCampaignForm.get('dateTime').value);
      request["schedule_date"] = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      request["schedule_time"] = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
    if (this.messageClassificationType) {
      request['message_classification_type'] = this.messageClassificationType;
    }
    if (this.scheduleData) {
      request["campaign_type"] = this.scheduleData['campaign_type']
    }
    if (this.isRecurring) {
      request['is_recurring'] = true
      request['recurring_type'] = this.scheduleCampaignForm.get('endAfter').value
      let endDate = new Date(this.scheduleCampaignForm.get('endDate').value);
      request['end_date'] = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
      request["end_time"] = `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
      request['frequency'] = this.scheduleCampaignForm.get('repeatOn').value
      request['repeat_interval'] = this.scheduleCampaignForm.get('frequency').value
      request['occurrences'] = this.scheduleCampaignForm.get('occurrences').value
      // request['pause_schedule'] = this.scheduleCampaignForm.get('futureOccurrences').value == 'Pause Future Occurrences' ? true : false
      request['pause_future_occurance'] = this.scheduleCampaignForm.get('futureOccurrences').value == 'Pause Future Occurrences' ? true : false;
      request['stop_future_occurance'] = this.scheduleCampaignForm.get('futureOccurrences').value == 'Stop Future Occurrences' ? true : false;
    }
    if (this.scheduleCampaignForm.get('repeatOn').value == 'day_of_week') {
      request['repeat_days_of_week'] = this.scheduleCampaignForm.get('weekdays').value.map(e => {
        return e.toLowerCase();
      })
    }
    if (this.scheduleCampaignForm.get('repeatOn').value == 'date_of_month') {
      request['last_date_of_month'] = false;
      let index = this.scheduleCampaignForm.get('repeatOnDate').value.findIndex(e => e == 'lastDate')
      if (index > -1) {
        this.scheduleCampaignForm.get('repeatOnDate').value.splice(index, 1);
        request['last_date_of_month'] = true;
      }
      request['repeat_dates_of_month'] = this.scheduleCampaignForm.get('repeatOnDate').value.map(e => {
        return e;
      })
    }
    // this.closeModal('schedule');
    this.invalidSlotTime = false
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.whatsappCampaignListService.updateScheduleCamp(request, this.scheduleData._id)
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.voiceCampaignListService.updateScheduleCamp(request, this.scheduleData._id);
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.rcsCampaignListService.updateScheduleCamp(request, this.scheduleData._id)
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this.trueCallerCampaignList.updateScheduleCamp(request, this.scheduleData._id)
    }
    else if (this.config && this.config.workflow) {
      serviceCall = this.workflowBuilderService.updateScheduleWorkflow(request, this.scheduleData._id)
    }
    else {
      serviceCall = this.campaignService.updateScheduleCamp(request, this.scheduleData._id)
    }
    serviceCall.pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res['success']) {
        this.closeModal('schedule');
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        if (this.config && this.config.whatsapp) {
          this.whatsappCampaignListService.setScheduleUpdateSuccess(res);
        }
        else if (this.config && this.config.voice) {
          this.voiceCampaignListService.setScheduleUpdateSuccess(res);
        }
        else if (this.config && this.config.rcs) {
          this.rcsCampaignListService.setScheduleUpdateSuccess(res);
        }
        else if (this.config && this.config.truecaller) {
          this.trueCallerCampaignList.setScheduleUpdateSuccess(res);
        }
        else if (this.config && this.config.workflow) {
          this.workflowBuilderService.setScheduleUpdateSuccess(res);
        }
        else {
          this.campaignService.setScheduleUpdateSuccess(res);
        }
        this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        if (res.data && res.data.start_time) {
          if (!res.data.valid_slot_time) {
            this.messageStartTime = res.data.start_time;
            this.messageEndTime = res.data.end_time;
            var mapObj = {
              '{{messageClassificationType}}': this.messageClassificationType,
              '{{messageStartTime}}': this.messageStartTime,
              '{{messageEndTime}}': this.messageEndTime
            };
            this.invalidSlotTimeText = this.common.getUpdatedTranslatedVariables(this.scheduleCampaignError, /{{messageClassificationType}}|{{messageStartTime}}|{{messageEndTime}}/gi, mapObj)
            this.invalidSlotTime = true;
          }
        }
        else {
          this.closeModal('schedule');
          this.common.openSnackBar(res['message'], 'error');
        }
      }
    }, err => {
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.common.openSnackBar(err['error']['message'], 'error');
    })
  }

  cancel() {
    this.closeModal('schedule');
    this.scheduleCampaignForm.reset();
    this.sendScheduleData = false;
  }

  getInputData(event, key) {
    var input = event.currentTarget.value;

    if (input.search(/^0/) != -1) {
      this.scheduleCampaignForm.get(key).setValue('');
      return;
    }
    this.scheduleCampaignForm.get(key).setValue(this.scheduleCampaignForm.get(key).value.replace(/[^0-9+]*/g, ''))
  }

  getRepeatList(value) {
    let repeatList = []
    if (value == 'Occurrences') {
      repeatList = this.repeatOnList.filter(({ value }) => value !== 'day_of_week' && value !== 'date_of_month');
    } else {
      repeatList = [...this.repeatOnList];
    }
    return repeatList;
  }

  clearValidator(key) {
    this.scheduleCampaignForm.get(key).clearValidators();
    this.scheduleCampaignForm.get(key).updateValueAndValidity();
  }

  setValidator(key) {
    this.scheduleCampaignForm.get(key).setValidators([Validators.required]);
    this.scheduleCampaignForm.get(key).updateValueAndValidity();
  }

  setReccurringValidators() {
    if ((this.scheduleCampaignForm.get('repeatOn').value == 'days') || (this.scheduleCampaignForm.get('repeatOn').value == 'weeks') || (this.scheduleCampaignForm.get('repeatOn').value == 'months')) {
      this.setValidator('frequency');
      this.clearValidator('weekdays');
      this.clearValidator('repeatOnDate');
    }
    else if (this.scheduleCampaignForm.get('repeatOn').value == 'day_of_week') {
      this.setValidator('weekdays');
      this.clearValidator('frequency');
      this.clearValidator('repeatOnDate');
    }
    else if (this.scheduleCampaignForm.get('repeatOn').value == 'date_of_month') {
      this.setValidator('repeatOnDate');
      this.clearValidator('frequency');
      this.clearValidator('weekdays');
    }
  }

  setEditScheduleValues() {
    if (this.scheduleData) {
      while (this.multipleScheduleList.length !== 0) {
        this.multipleScheduleList.removeAt(0);
      }
      this.scheduleCampaignForm.get('endAfter').setValue('');
      this.endAfterSelectText = this.configEndAfter.title;
      this.invalidSlotTime = false;
      this.scheduleCampaignForm.get('campaignName').setValue(this.scheduleData.name)
      if (this.campaignCategoryList && this.campaignCategoryList.length > 0) {
        this.campaignCategoryList.forEach(el => {
          if (el.name == this.scheduleData[this.config?.workflow ? 'category' : 'category_name']) {
            this.categorySelectText = el.name;
            this.scheduleCampaignForm.get('campaignCategory').setValue(el._id);
          }
        })
      }
      this.timezones = this.getTimezone(timezone.timezone)
      this.setTimezone();
      this.datePickerObj = {
        dateObj: moment(new Date(this.scheduleData.schedule_date)).format(),
        type: "dateTimePicker"
      }
      this.scheduleCampaignForm.get('dateTime').setValue(moment(new Date(this.scheduleData.schedule_date)).format())
      if (this.scheduleData.message_classification_type) {
        this.messageClassificationType = this.scheduleData.message_classification_type
      }
      else {
        this.messageClassificationType = null
      }
      this.isMultipleSchedule = false;
      if (this.scheduleData.scheduler && this.scheduleData.scheduler.multiple_scheduler && this.scheduleData.scheduler.multiple_scheduler.length > 0) {
        this.setTimezone('multiple');
        this.isMultipleSchedule = true;
        this.scheduleData.scheduler.multiple_scheduler.forEach(ev => {
          let timezone = '';
          this.timezones.forEach((e, index) => {
            if (e.value == ev.timezone) {
              timezone = e.text;
            }
          })

          let obj = {
            dateTime: new Date(ev.epoch),
            timezone: ev.timezone,
            timezoneSelectText: timezone
          }
          this.addRow('', obj);
        })
      }
      this.isRecurring = false;
      this.setRecurringValidators(this.isRecurring);
      if (this.scheduleData.scheduler && this.scheduleData.scheduler.is_recurring) {
        if (this.scheduleData.scheduler.stop_future_occurance || this.scheduleData.scheduler.pause_future_occurance) {
          this.disableOccurences('Pause Future Occurrences');
        }
        else {
          this.disableOccurences('Resume Future Occurrences');
        }
        this.isRecurring = true;
        this.setRecurringValidators(this.isRecurring);
        if (this.scheduleData.scheduler.recurring_type == 'date') {
          this.selectActionRecive(this.endAfterList.find(e => e.value == this.scheduleData.scheduler.recurring_type), 'endAfter')
          this.endDatePickerObj = {
            type: "dateTimePicker",
            dateObj: moment(new Date(this.scheduleData.scheduler.end_date)).format()
          }
          this.scheduleCampaignForm.get('endDate').setValue(this.endDatePickerObj.dateObj);
          this.endDatePickerConfig.minDate = moment(this.scheduleCampaignForm.get('dateTime').value).add(1, 'days').format();
        }
        else {
          this.selectActionRecive(this.endAfterList.find(e => e.value == this.scheduleData.scheduler.recurring_type), 'endAfter')
          this.scheduleCampaignForm.get('occurrences').setValue(this.scheduleData.scheduler.occurrences);
        }
        if ((this.scheduleData.scheduler.frequency == 'days') || (this.scheduleData.scheduler.frequency == 'weeks') || (this.scheduleData.scheduler.frequency == 'months')) {
          this.setRepeatOn();
          this.scheduleCampaignForm.get('frequency').setValue(this.scheduleData.scheduler.repeat_interval ? this.scheduleData.scheduler.repeat_interval : 0);
        }
        else if (this.scheduleData.scheduler.frequency == 'day_of_week') {
          this.setRepeatOn();
          this.selectActionRecive(this.scheduleData.scheduler.repeat_days_of_week, 'weekdays')
        }
        else if (this.scheduleData.scheduler.frequency == 'date_of_month') {
          this.setRepeatOn();
          if (this.scheduleData.scheduler.last_date_of_month) {
            let index = this.scheduleData.scheduler.repeat_dates_of_month.findIndex(e => (e == 'Last Date') || (e == 'lastDate'))
            if (index > -1) {
              this.scheduleData.scheduler.repeat_dates_of_month.splice(index, 1);
            }
            this.scheduleData.scheduler.repeat_dates_of_month.push('Last Date')
          }
          this.selectActionRecive(this.scheduleData.scheduler.repeat_dates_of_month, 'repeatOnDate')
        }
      }
    }
  }

  setRecurringValidators(data) {
    if (data) {
      this.setValidator('futureOccurrences');
      this.setValidator('endAfter');
      this.setValidator('repeatOn');
      if (this.scheduleCampaignForm.get('endAfter').value == 'date') {
        this.setValidator('endDate');
        this.clearValidator('occurrences');
      }
      else {
        this.setValidator('occurrences');
        this.clearValidator('endDate');
      }
      if ((this.scheduleCampaignForm.get('repeatOn').value == 'days') || (this.scheduleCampaignForm.get('repeatOn').value == 'weeks') || (this.scheduleCampaignForm.get('repeatOn').value == 'months')) {
        this.setValidator('frequency');
        this.clearValidator('weekdays');
        this.clearValidator('repeatOnDate');
      }
      if (this.scheduleCampaignForm.get('repeatOn').value == 'day_of_week') {
        this.setValidator('weekdays');
        this.clearValidator('frequency');
        this.clearValidator('repeatOnDate');
      }
      if (this.scheduleCampaignForm.get('repeatOn').value == 'date_of_month') {
        this.setValidator('repeatOnDate');
        this.clearValidator('frequency');
        this.clearValidator('weekdays');
      }
    }
    else {
      this.clearValidator('futureOccurrences');
      this.clearValidator('endAfter');
      this.clearValidator('repeatOn');
      this.clearValidator('endDate');
      this.clearValidator('occurrences');
      this.clearValidator('frequency');
      this.clearValidator('weekdays');
      this.clearValidator('repeatOnDate');

    }
  }

  disableOccurences(value) {
    this.futureOccurrencesList.map(e => {
      e.disable = false;
      if (e.key == value) {
        e.disable = true;
        this.selectActionRecive(e, 'futureOccurrences');
      }
    })
  }

  setRepeatOn() {
    this.repeatOnList.find(ev => {
      if (ev.child && ev.child.length > 0) {
        let item = ev.child.find(e => e.value == this.scheduleData.scheduler.frequency)
        if (item) this.selectActionRecive(item, 'repeatOn')
      }
      else {
        if (ev.value == this.scheduleData.scheduler.frequency) {
          this.selectActionRecive(ev, 'repeatOn')
        }
      }
    })
  }

  addRow(event, obj?) {
    this.multipleScheduleList.push(this.addSchedule(obj, obj && obj == 'add' ? obj : ''));
  }

  removeRow(index) {
    this.multipleScheduleList.removeAt(index);
  }

  OnDestroy() {
    this.whatsappUnsubscribe.unsubscribe();
    this.voiceUnsubscribe.unsubscribe();
    this.smsUnsubscribe.unsubscribe();
    this.trueCallerUnsubscribe.unsubscribe()
    this.stop.next();
    this.stop.complete();
  }
}//End of class
