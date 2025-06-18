import { AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import * as timezone from '../../../../shared/mock-data/timezone';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService as createVoiceCampaignService } from 'src/app/shared/services/voice/create-campaign.service';

import { CreateCampaignService as CreateRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import moment from 'moment';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CreateCampaignService as ECSS } from 'src/app/shared/services/email/campaigns/create-campaign.service';
import { WorkflowBuilderService } from 'src/app/workflow/workflow-builder/builder/workflow-builder.service';
import { CreateCampaignService as CreateTrucallerCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SendMessageComponent implements OnInit, OnChanges {

  showSchedule: boolean = false;
  showScheduleExpiry: boolean = true;
  createCampaignForm: FormGroup;
  // createExpiryForm: FormGroup;
  @Input() hasScheduleAccess: any;
  @Input() config: any;
  datePickerObj = {
    type: "dateTimePicker",
    dateObj: ""
  }
  datePickerObjExp = {
    type: "dateTimePicker",
    dateObj: ""
  }
  timezoneSelectText: any;
  public timezones;
  timezonesArr = [];
  @Input() sendCampaignData: any;
  @Input() testCampaign: any;
  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    stepHour: 1,
    minDate: moment(new Date()).format(),
    stepMinute: 1,
    stepSecond: 1,
    hideDefaultMsg: true
  }
  datePickerConfigExpiry = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: true,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1
  };
  configTimezone = {
    image: false,
    title: '',
    key: 'text',
    search: true,
    open: false
  }
  @Input() isKsaUser: any;
  stop = new Subject<void>();
  translatedObj: any;
  @Input() titleText: any;
  @Output() sendScheduleEvent = new EventEmitter<any>();
  hasPermissions = permissions;
  showStaggered: boolean = false;
  @Output() showStaggeredEvent = new EventEmitter<any>();
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
    checkbox: true,
    hidePlaceholder: true
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
    checkbox: true,
    hidePlaceholder: true
  };
  repeatOnDateSelectText = '';
  endDatePickerObj = {
    type: "dateTimePicker",
    dateObj: moment(new Date()).add(1, 'days').format()
  }
  @Output() getToggleValue = new EventEmitter<any>();
  @Input() contactCount: any;
  emailTestCampaign;
  tabCount;
  isTempBacklistAllowed = false;
  @Input() campaignData;
  hideRecurringOptionInCaseOfSplit = false;
  @Input() emailCampaignApproval: any;
  multipleScheduleForm: FormGroup;
  multipleScheduleList: FormArray;
  highlightedDate: any;
  @Input() selectorData: any;
  selectorInputValue: any = {}
  @Output() sendSelectorInputValue = new EventEmitter<any>();
  @Input() show_variant: boolean;
  @Input() stepCount: any;


  constructor(public fb: FormBuilder, public translate: TranslateService, public createWhatsappCampaignService: WACreateCampaignService, public createCampaignService: CreateCampaignService, public common: CommonService, public createRcsCampaignService: CreateRcsCampaignService, public createVoiceCampaignService: createVoiceCampaignService, public emailCreateCampaignService: ECSS, public workflowBuilderService: WorkflowBuilderService, public trucallerCampaignService: CreateTrucallerCampaignService) {
    this.initializeFormValues();
    this.createCampaignForm = this.fb.group({
      dateTime: ['', []],
      expiry_date: ['', []],
      timezone: ['', []],
      showSchedule: [false, []],
      scheduleType: ['oneTime', []],
      endAfter: ['', []],
      endDate: ['', []],
      occurrences: ['', [Validators.maxLength(30)]],
      repeatOn: ['', []],
      frequency: ['', [Validators.maxLength(30)]],
      weekdays: ['', []],
      repeatOnDate: ['', []],
      switchedScheduler: [false, []]
    })
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        if (this.translatedObj) {
          this.configEndAfter.title = this.translatedObj['common-select'];
          this.configRepeatOn.title = this.translatedObj['common-select'];
          this.configWeekdays.title = this.translatedObj['common-select'];
          this.configRepeatOnDate.title = this.translatedObj['common-select'];
        }
      }
    })
    this.multipleScheduleForm = this.fb.group({
      multipleScheduleArr: this.fb.array([this.addSchedule()]),
    })
    this.multipleScheduleList = this.multipleScheduleForm.get('multipleScheduleArr') as FormArray;
    translate.stream(['campaign.select-text']).subscribe((text) => {
      this.configTimezone.title = text['campaign.select-text']
    });


    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.createCampaignForm.get('scheduleType').setValue('oneTime');
    })

    this.createCampaignService.getTestCampaignEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      if (this.showSchedule) {
        this.clearValidator('dateTime');
        this.clearValidator('timezone');
        this.clearReccurringElementsValidators();
      }
      if (this.showStaggered) {
        this.clearValidator('day');
        this.clearValidator('hour');
        this.clearValidator('minute');
        this.clearStaggeredElementValidators();
      }
    })

    this.emailCreateCampaignService.emailCampaignType.subscribe((data: any) => {
      if (data) {
        this.tabCount = data.tab_count;
      }
    })

    this.createWhatsappCampaignService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        let a: any = {
          timezoneText: ''
        };
        if (this.showSchedule || this.showScheduleExpiry) {
          a['timezoneText'] = this.timezoneSelectText
        }
        this.validateScheduleValidators();
        if (this.config.whatsapp && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['WhatsAppCampaigns'], this.hasPermissions.permissionName['stagger_whatsapp_campaign'], false)) {
          this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
        }
        else {
          if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
            this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
          }
          else {
            this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a })
          }
        }
      }
    })

    this.createRcsCampaignService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        let a: any = {
          timezoneText: ''
        };
        if (this.showSchedule || this.showScheduleExpiry) {
          a['timezoneText'] = this.timezoneSelectText
        }
        this.validateScheduleValidators();
        if (this.config.rcs && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['RCS_Campaigns'], this.hasPermissions.permissionName['stagger_rcs_campaign'], false)) {
          this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
        }
        else {
          if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
            this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
          }
          else {
            this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a })
          }
        }
      }
    })

    // Email Start
    this.createCampaignService.emailTestCampaign.subscribe(data => {
      this.emailTestCampaign = data;
    })

    this.emailCreateCampaignService.getScheduleValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        let a: any = {
          timezoneText: ''
        };
        if (this.showSchedule) {
          a['timezoneText'] = this.timezoneSelectText
        }
        if (this.config.email && !this.show_variant && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['Email_Campaigns'], this.hasPermissions.permissionName['stagger_email_campaign'], false)
        ) {
          this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
        } else {
          this.validateScheduleValidators();
          this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a });
        }
      }
    })
    // Email End

    this.createVoiceCampaignService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        let a: any = {
          timezoneText: ''
        };
        a['timezoneText'] = this.timezoneSelectText
        if (this.config?.voice && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['VoiceCampaigns'], this.hasPermissions.permissionName['stagger_voice_obd_campaign'], false)) {
          this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
        } else {
          if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
            this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
          }
          else {
            this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a });
          }
        }
      }
    })

    this.common.voiceCampaignDefaultExpiryDays.subscribe(res => {
      if (res) {
        this.setExpiryDate(res);
      }
    })

    this.createCampaignService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      let a: any = {
        timezoneText: ''
      };
      if (this.showSchedule) {
        a['timezoneText'] = this.timezoneSelectText
      }
      this.validateScheduleValidators();
      if (this.config.sms && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['SMSCampaigns'], this.hasPermissions.permissionName['stagger_sms_campaign'], false)) {
        this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
      }
      else {
        if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
          this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
        }
        else {
          this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a })
        }
      }
    })

    this.workflowBuilderService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      let a: any = {
        timezoneText: ''
      };
      if (this.showSchedule) {
        a['timezoneText'] = this.timezoneSelectText
      }
      this.validateScheduleValidators();
      if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
        this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
      }
      else {
        this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a })
      }
    })

    this.emailCreateCampaignService.isTempBacklistAllowed.subscribe(data => {
      this.isTempBacklistAllowed = data;
    })

    this.emailCreateCampaignService.emailCampaignType.subscribe((data: any) => {
      if (data && data?.value != 'regular') {
        this.initializeFormValues(false);
        this.hideRecurringOptionInCaseOfSplit = true;
      } else {
        this.hideRecurringOptionInCaseOfSplit = false;
      }
      this.setData();
    })

    this.trucallerCampaignService.getEventToGetSendMessagePanelValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      let a: any = {
        timezoneText: ''
      };
      if (this.showSchedule) {
        a['timezoneText'] = this.timezoneSelectText
      }
      this.validateScheduleValidators();
      if (this.config?.truecaller && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['TruecallerCampaigns'], this.hasPermissions.permissionName['stagger_truecaller_campaign'], false)) {
        this.createCampaignService.setEventToGetStaggerValues({ ...this.createCampaignForm.value, ...res, ...a });
      }else{
        if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
          this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.createCampaignForm.value, ...res, ...a })
        }
        else {
          this.createCampaignService.setEventToGetAllFormValues({ ...this.createCampaignForm.value, ...res, ...a })
        }
      }
    })

  }

  ngOnInit(): void {

    this.timezones = this.getTimezone(timezone.timezone)
    this.setTimezone();
  }


  scheduleSwitch(event) {
    this.sendCampaignData = false
    let toggle = event.target.checked;
    this.createCampaignForm.get('scheduleType').setValue('oneTime');
    this.resetReccurringElements();
    if (toggle) {
      this.showSchedule = true;
    }
    else {
      this.showSchedule = false;
      this.clearReccurringElementsValidators();
      if (this.createCampaignForm.get('dateTime').value) {
        this.createCampaignForm.get('dateTime').setValue('');
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: ""
        }
      }
      if (!this.config.voice && this.createCampaignForm.get('timezone').value) {
        this.createCampaignForm.get('timezone').setValue('');
        this.timezoneSelectText = '';
        this.setTimezone();
      }
      this.createCampaignService.checkEventToSetScheduleValues('oneTime');
    }
    if (this.showSchedule) {
      this.setValidator('dateTime');
      this.setValidator('timezone');
    }
    else {
      this.clearValidator('dateTime');
      this.clearValidator('timezone');
    }
    this.createCampaignForm.get('showSchedule').setValue(this.showSchedule);
    if (this.config && this.config.voice) {
      this.getToggleValue.emit(this.showSchedule);
    }
    this.sendScheduleEvent.emit(this.createCampaignForm.get('showSchedule').value)

    this.setInputValue();
  }

  setTimezone(_Timezone?) {
    let userTimezone = _Timezone ? _Timezone : localStorage.getItem('timezone');
    this.timezones.forEach((e, index) => {
      if (e.value == userTimezone) {
        this.timezoneSelectText = e.text;
        this.createCampaignForm.get('timezone').setValue(e.value);
      }
    })
    if (this.config && this.config.voice) {
      this.createCampaignForm.get('expiry_date').setValidators([Validators.required]);
      this.createCampaignForm.get('expiry_date').updateValueAndValidity();
    }

    this.setInputValue();
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

  showErrors(fieldName, errorType, formName) {
    if (this.createCampaignForm.controls[fieldName].errors && this.createCampaignForm.controls[fieldName].errors[errorType]) {
      if (this.config.email) {
        return !this.testCampaign && this.sendCampaignData && !this.emailTestCampaign && this.createCampaignForm.controls[fieldName].errors[errorType];
      } else {
        return !this.testCampaign && this.sendCampaignData && this.createCampaignForm.controls[fieldName].errors[errorType];
      }
    } else {
      return false;
    }
  }

  public receivedExpiaryDate(e) {
    // this.createExpiryForm.get('expiry_date').setValue(e);
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    if (+currentDate > +e) {
      this.common.openSnackBar('Choose present/future date', 'error');
      this.datePickerObjExp = {
        type: "dateTimePicker",
        dateObj: ""
      }
      this.createCampaignForm.get('expiry_date').setValue(null);
      return;
    }
    this.createCampaignForm.get('expiry_date').setValue(e);
    this.checkSchAndExpDateValidation('expiry_date');
  }

  // receiveDate(e) {
  //   this.createCampaignForm.get('dateTime').setValue(e);
  //   if(this.config.voice){
  //     this.checkSchAndExpDateValidation('dateTime');
  //   }
  // }

  checkSchAndExpDateValidation = (Date) => {
    if (!this.createCampaignForm.get('expiry_date').value || !this.createCampaignForm.get('dateTime').value) return;
    let expDate = this.createCampaignForm.get('expiry_date').value;
    let schDate = this.createCampaignForm.get('dateTime').value;

    if (!this.isSameDate(expDate, schDate) && (+expDate < +schDate)) {
      this.createCampaignForm.get(Date).setValue(null);
      if (Date == 'dateTime') {
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: ""
        }
      } else {
        this.datePickerObjExp = {
          type: "dateTimePicker",
          dateObj: ""
        }
      }
      this.common.openSnackBar(`Select Valid ${Date == 'dateTime' ? 'Schedule' : 'Expiry '} Date `, "error")
    }
  }

  isSameDate = (expDate, schDate) => {
    if (expDate.getFullYear() === schDate.getFullYear()
      && expDate.getMonth() === schDate.getMonth()
      && expDate.getDate() === schDate.getDate()) {
      return true;
    } else {
      return false;
    }
  }
  receiveDate(e, key) {
    const hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e,key,item: this.createCampaignForm });
    if (hasError) {
      this.datePickerObj = {
        type: "dateTimePicker",
        dateObj: ''
      };
      return;
    }
    this.createCampaignForm.get(key).setValue(e);
    if ((key == 'dateTime') && (this.createCampaignForm.get('scheduleType').value == 'recurring')) {
      this.endDatePickerObj = {
        type: "dateTimePicker",
        dateObj: ""
      }
      this.endDatePickerConfig.minDate = moment(this.createCampaignForm.get('dateTime').value).add(1, 'days').format();
      let date = new Date(this.createCampaignForm.get('dateTime').value)
      date.setDate(date.getDate() + 1)
      this.highlightedDate = date
    }
    if (this.config.voice) {
      this.checkSchAndExpDateValidation('dateTime');
    }

    this.setInputValue()
  }

  selectActionRecive(item, key, defaultSender?) {
    if (item.value == "occurrences") {
      this.createCampaignForm.get('repeatOn').setValue('');
      this.repeatOnSelectText = '';
    }

    if (key == 'timezone') {
      this.timezoneSelectText = item ? item.text : this.translatedObj['campaign.select-text'];
      this.createCampaignForm.get(key).setValue(item ? item.value : '');
    }
    else if (key == 'endAfter') {
      this.endAfterSelectText = item ? item.key : this.translatedObj['campaign.select-text'];
      this.createCampaignForm.get(key).setValue(item ? item.value : '');
      this.createCampaignForm.get('occurrences').setValue('');
      if (this.createCampaignForm.get(key).value == 'date') {
        this.setValidator('endDate');
        this.clearValidator('occurrences');
      }
      else if (this.createCampaignForm.get(key).value == 'occurrences') {
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
      this.createCampaignForm.get(key).setValue(item ? item.value : '');
      this.createCampaignForm.get('frequency').setValue('');
      this.weekdaysselectText = this.translatedObj['campaign.select-text'];
      this.createCampaignForm.get('weekdays').setValue('');
      this.repeatOnDateSelectText = this.translatedObj['campaign.select-text'];
      this.createCampaignForm.get('repeatOnDate').setValue('');
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
      this.createCampaignForm.get(key).setValue(item);
    }
    else if (key == 'repeatOnDate') {
      this.repeatOnDateSelectText = item.toString();
      this.createCampaignForm.get(key).setValue(item);
    }

    this.setInputValue()
  }

  scheduleType(event) {
    this.sendCampaignData = false
    while (this.multipleScheduleList.length !== 0) {
      this.multipleScheduleList.removeAt(0);
    }
    this.setTimezone();
    if (this.createCampaignForm.get('scheduleType').value == 'multiple') {
      this.multipleScheduleList.push(this.addSchedule());
    }
    this.createCampaignService.checkEventToSetScheduleValues(event.value);
    this.resetReccurringElements();
    this.createCampaignForm.get('scheduleType').setValue(event.value);
    if (this.createCampaignForm.get('scheduleType').value == 'recurring') {
      this.setValidator('endAfter');
      this.setValidator('repeatOn');
    }
    else {
      this.clearReccurringElementsValidators();
    }
  }

  resetReccurringElements() {
    this.createCampaignForm.get('endAfter').setValue('');
    this.endAfterSelectText = this.translatedObj['common-select'];
    this.createCampaignForm.get('occurrences').setValue('');
    this.createCampaignForm.get('repeatOn').setValue('');
    this.repeatOnSelectText = this.translatedObj['common-select'];
    this.createCampaignForm.get('frequency').setValue('');
    this.createCampaignForm.get('weekdays').setValue('');
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
    this.weekdaysselectText = this.translatedObj['common-select'];
    this.createCampaignForm.get('repeatOnDate').setValue('');
    this.repeatOnDateSelectText = this.translatedObj['common-select'];
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: ""
    }
  }

  clearReccurringElementsValidators() {
    this.clearValidator('endAfter');
    this.clearValidator('endDate');
    this.clearValidator('occurrences');
    this.clearValidator('repeatOn');
    this.clearValidator('frequency');
    this.clearValidator('weekdays');
    this.clearValidator('repeatOnDate');
  }

  clearStaggeredElementValidators() {
    this.clearValidator('noOfMessages');
  }

  getInputData(event, key) {
    var input = event.currentTarget.value;

    if (input.search(/^0/) != -1) {
      this.createCampaignForm.get(key).setValue('');
      return;
    }
    this.createCampaignForm.get(key).setValue(this.createCampaignForm.get(key).value.replace(/[^0-9+]*/g, ''))
  }

  validateScheduleValidators() {
    if (this.showSchedule) {
      this.setValidator('dateTime');
      this.setValidator('timezone');
      if (this.createCampaignForm.get('scheduleType').value == 'recurring') {
        this.setValidator('endAfter');
        this.setValidator('repeatOn');
        if (this.createCampaignForm.get('endAfter').value == 'date') {
          this.setValidator('endDate');
          this.clearValidator('occurrences');
        }
        if (this.createCampaignForm.get('endAfter').value == 'occurrences') {
          this.setValidator('occurrences');
          this.clearValidator('endDate');
        }
        this.setReccurringValidators();
      }
    }
    else {
      this.clearValidator('dateTime');
      this.clearValidator('timezone');
      this.clearReccurringElementsValidators();
    }
  }

  setReccurringValidators() {
    if ((this.createCampaignForm.get('repeatOn').value == 'days') || (this.createCampaignForm.get('repeatOn').value == 'weeks') || (this.createCampaignForm.get('repeatOn').value == 'months')) {
      this.setValidator('frequency');
      this.clearValidator('weekdays');
      this.clearValidator('repeatOnDate');
    }
    if (this.createCampaignForm.get('repeatOn').value == 'day_of_week') {
      this.setValidator('weekdays');
      this.clearValidator('frequency');
      this.clearValidator('repeatOnDate');
    }
    if (this.createCampaignForm.get('repeatOn').value == 'date_of_month') {
      this.setValidator('repeatOnDate');
      this.clearValidator('frequency');
      this.clearValidator('weekdays');
    }
  }

  clearValidator(key) {
    this.createCampaignForm.get(key).clearValidators();
    this.createCampaignForm.get(key).updateValueAndValidity();
  }

  setValidator(key) {
    if (key == 'frequency' || key == 'occurrences') {
      this.createCampaignForm.get(key).setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      this.createCampaignForm.get(key).setValidators([Validators.required]);
    }
    this.createCampaignForm.get(key).updateValueAndValidity();
  }

  getStaggeredEvent(value) {
    this.sendCampaignData = false;
    this.showStaggered = value;
    this.showStaggeredEvent.emit(this.showStaggered);
  }

  setExpiryDate(res) {
    let days = res;
    if (days) {
      let date = new Date();
      date.setDate(date.getDate() + days);
      this.datePickerObjExp = {
        type: "dateTimePicker",
        dateObj: moment(date).format()
      }
      this.createCampaignForm.get('expiry_date').setValue(date);
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
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

  initializeFormValues(ResetTimeZone = true) {

    this.showSchedule = false;
    if (ResetTimeZone) {
      this.timezoneSelectText = "";
      this.initializeAllValues();
    } else {
      this.inititializeSomeValue();
    }
  }

  inititializeSomeValue() {
    this.createCampaignForm.get('dateTime').setValue('');
    this.createCampaignForm.get('expiry_date').setValue('');
    this.createCampaignForm.get('showSchedule').setValue(false);
    this.createCampaignForm.get('scheduleType').setValue('oneTime');
    this.createCampaignForm.get('endAfter').setValue('');
    this.createCampaignForm.get('endDate').setValue('');
    this.createCampaignForm.get('occurrences').setValue('');
    this.createCampaignForm.get('repeatOn').setValue('');
    this.createCampaignForm.get('frequency').setValue('');
    this.createCampaignForm.get('weekdays').setValue('');
    this.createCampaignForm.get('repeatOnDate').setValue('');
    this.createCampaignForm.get('switchedScheduler').setValue(false);
    this.setInputValue();
  }

  initializeAllValues() {
    this.createCampaignForm = this.fb.group({
      dateTime: ['', []],
      expiry_date: ['', []],
      showSchedule: [false, []],
      scheduleType: ['oneTime', []],
      timezone: ['', []],
      endAfter: ['', []],
      endDate: ['', []],
      occurrences: ['', []],
      repeatOn: ['', []],
      frequency: ['', []],
      weekdays: ['', []],
      repeatOnDate: ['', []],
      switchedScheduler: [false, []],
    })
  }

  setData() {
    if (!this.campaignData && !this.config?.workflow) return
    // This step for setting save details in case of edit in email campaign
    if (this.config?.workflow || (this.config?.email && this.config?.campaign && (this.campaignData?.schedule_date || this.campaignData?.timezone))) {
      if (this.campaignData?.timezone) {
        this.setTimezone(this.campaignData?.timezone);
      }
      if (this.campaignData?.schedule_date) {
        this.createCampaignForm.get('switchedScheduler').setValue(true);
        this.scheduleSwitch({ target: { checked: true } })
        let Schedule_Time = (this.campaignData?.schedule_time.split(":").length == 3) ? this.campaignData?.schedule_time.split(":").slice(0, -1).join(':') : (this.campaignData?.schedule_time.includes('Z') ? this.campaignData?.schedule_time.replace("Z", "") : this.campaignData?.schedule_time);
        let date = new Date(`${this.campaignData?.schedule_date}T${Schedule_Time}`);
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: moment(date).format()
        }
        this.createCampaignForm.get('dateTime').setValue(date);
      }
      if (this.campaignData?.scheduler && this.campaignData?.scheduler?.is_recurring) {
        this.createCampaignForm.get('scheduleType').setValue('recurring');

        let EndAfter = this.endAfterList.find(x => x.value == this.campaignData?.scheduler?.recurring_type);
        this.endAfterSelectText = EndAfter.key;
        this.createCampaignForm.get('endAfter').setValue(EndAfter.value);
        this.createCampaignForm.get('occurrences').setValue(this.campaignData?.scheduler?.occurrences);

        if (this.campaignData?.scheduler?.end_date) {
          let End_Time = (this.campaignData?.scheduler?.end_date.split(" ")[1].split(":").length == 3) ? this.campaignData?.scheduler?.end_date.split(" ")[1].split(":").slice(0, -1).join(':') : (this.campaignData?.scheduler?.end_date.split(" ")[1].includes('Z') ? this.campaignData?.scheduler?.end_date.split(" ")[1].replace("Z", "") : this.campaignData?.scheduler?.end_date.split(" ")[1]);
          let date = new Date(`${this.campaignData?.scheduler?.end_date.split(" ")[0]}T${End_Time}`);
          this.endDatePickerObj = {
            type: "dateTimePicker",
            dateObj: moment(date).format()
          }
          this.createCampaignForm.get('endDate').setValue(date);
        }

        let RepeatOnArray = this.getRepeatList(this.endAfterSelectText);
        let RepeatOn;
        for (let i = 0; i < RepeatOnArray.length; i++) {
          if (RepeatOnArray[i].value == this.campaignData?.scheduler?.frequency) {
            RepeatOn = RepeatOnArray[i];
            break;
          } else if (RepeatOnArray[i].child.length) {
            for (let j = 0; j < RepeatOnArray[i].child.length; j++) {
              if (RepeatOnArray[i].child[j].value == this.campaignData?.scheduler?.frequency) {
                RepeatOn = RepeatOnArray[i].child[j];
                break;
              }
            }
            if (RepeatOn) break;
          }
        }
        this.repeatOnSelectText = RepeatOn.name;
        this.createCampaignForm.get('repeatOn').setValue(RepeatOn.value);

        this.createCampaignForm.get('frequency').setValue(this.campaignData?.scheduler?.repeat_interval);

        if (this.campaignData?.scheduler?.repeat_days_of_week.length) {
          for (let i = 0; i < this.weekdaysList.length; i++) {
            for (let j = 0; j < this.campaignData.scheduler.repeat_days_of_week.length; j++) {
              if (this.weekdaysList[i].value == this.campaignData.scheduler.repeat_days_of_week[j]) {
                this.weekdaysList[i]['checkbox'] = true;
              }
            }
          }
          this.weekdaysselectText = (this.campaignData?.scheduler?.repeat_days_of_week.map(x => x.charAt(0).toUpperCase() + x.slice(1))).toString()
          this.createCampaignForm.get('weekdays').setValue(this.weekdaysselectText);
        }

        if (this.campaignData?.scheduler?.repeat_dates_of_month.length) {
          for (let i = 0; i < this.repeatOnDateList.length; i++) {
            for (let j = 0; j < this.campaignData.scheduler.repeat_dates_of_month.length; j++) {
              if (this.repeatOnDateList[i].value == this.campaignData.scheduler.repeat_dates_of_month[j]) {
                this.repeatOnDateList[i]['checkbox'] = true;
              }
            }
          }
          this.repeatOnDateSelectText = this.campaignData?.scheduler?.repeat_dates_of_month.toString()
          this.createCampaignForm.get('repeatOnDate').setValue(this.repeatOnDateSelectText);
        }
      } else {
        this.createCampaignForm.get('scheduleType').setValue('oneTime');
      }
      if (this.config?.workflow) {
        this.createCampaignForm.get('switchedScheduler').setValue(true);
        this.scheduleSwitch({ target: { checked: true } });
        this.tabIndex = 0;
        this.tabChange(0);
      }
    }

    this.setInputValue();
  }

  addSchedule(data?): FormGroup {
    return this.fb.group({
      dateTime: [data ? data.dateTime : '', [Validators.required]],
      timezone: [this.createCampaignForm.get('timezone').value, [Validators.required]],
      timezoneSelectText: [this.timezoneSelectText, []],
      configTimezone: {
        image: false,
        title: this.translatedObj ? this.translatedObj['campaign.select-text'] : '',
        key: 'text',
        search: true,
        open: false
      },
      datePickerObj: [{
        type: "dateTimePicker",
        dateObj: data ? moment(data.dateTime).format() : ''
      }, []]
    })
  }

  addRow(event, obj?) {
    this.sendCampaignData = false;
    this.multipleScheduleList.push(this.addSchedule(obj));
  }

  removeRow(index) {
    this.sendCampaignData = false;
    this.multipleScheduleList.removeAt(index);
  }

  tabIndex = 0;
  tabChange(_Index) {
    if (_Index == 0) {
      this.createCampaignForm.get('scheduleType').setValue('oneTime');
      this.scheduleType({ value: 'oneTime' });
    } else if (_Index == 1) {
      this.createCampaignForm.get('scheduleType').setValue('multiple');
      this.scheduleType({ value: 'multiple' });
    } else if (_Index == 2) {
      this.createCampaignForm.get('scheduleType').setValue('recurring');
      this.scheduleType({ value: 'recurring' });
    }
  }

  setInputValue() {
    for (var key in this.createCampaignForm?.value) {
      this.selectorInputValue[key] = this.createCampaignForm?.value[key];
    }
    this.sendSelectorInputValue.emit(this.selectorInputValue);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stepCount = changes?.stepCount?.currentValue;
  }

}
