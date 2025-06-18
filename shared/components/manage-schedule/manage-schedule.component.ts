import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as timezone from '../../../../shared/mock-data/timezone';
import moment from 'moment';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from "src/app/shared/services/create-campaign.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {CreateCampaignService as createVoiceCampaignService} from "src/app/shared/services/voice/create-campaign.service"
@Component({
  selector: 'app-manage-schedule',
  templateUrl: './manage-schedule.component.html',
  styleUrls: ['./manage-schedule.component.css']
})
export class ManageScheduleComponent implements OnInit {
  manageScheduleForm: FormGroup;
  @Input() config: any;
  timezoneSelectText: any;
  public timezones;
  timezonesArr = [];
  datePickerObj = {
    type: "dateTimePicker",
    dateObj: ""
  }
  showSchedule: boolean = false;
  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    stepHour: 1,
    minDate: moment(new Date()).format(),
    stepMinute: 1,
    stepSecond: 1
  }
  translatedObj: any;
  configTimezone = {
    image: false,
    title: '',
    key: 'text',
    search: true,
    open: false
  }
  @Input() manageScheduleData;
  validateDataPreview = {};
  validateRes: any;
  stop = new Subject<any>();
  formValues: any;
  validateFormText: any;
  scheduledOn: any;
  scheduleTime: any;
  modalType: any;
  @Output() sendValidateDataPreview = new EventEmitter<any>()
  sendScheduleData: boolean = false;

  constructor(public fb: FormBuilder, public translate: TranslateService, public common: CommonService,
    public createCampaignService: CreateCampaignService, public createVoiceCampaignService: createVoiceCampaignService,) {
    this.manageScheduleForm = this.fb.group({
      dateTime: ['', []],
      switchedScheduler: [false, []],
      timezone: ['', []],
      showSchedule: [false, []]
    })

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        this.configTimezone.title = this.translatedObj['campaign.select-text']
      }
    })
    this.createCampaignService.ScheduleModalEvt.subscribe(res=> {
      if(res) {
        this.scheduleSwitch({target: {checked: false }})
        this.timezones = this.getTimezone(timezone.timezone)
        this.setTimezone();
      }
    })
  }

  ngOnInit(): void {}

  setTimezone(_Timezone?) {
    let userTimezone = _Timezone ? _Timezone : localStorage.getItem('timezone');
    this.timezones.forEach((e, index) => {
      if (e.value == userTimezone) {
        this.timezoneSelectText = e.text;
        this.manageScheduleForm.get('timezone').setValue(e.value);
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

  scheduleSwitch(event) {
    let toggle = event.target.checked;
    this.resetReccurringElements();
    if (toggle) {
      this.showSchedule = true;
    }
    else {
      this.showSchedule = false;
      if (this.manageScheduleForm.get('dateTime').value) {
        this.manageScheduleForm.get('dateTime').setValue('');
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: ""
        }
      }
    }
    if (this.showSchedule) {
      this.setValidator('dateTime');
      this.setValidator('timezone');
    }
    else {
      this.clearValidator('dateTime');
      this.clearValidator('timezone');
    }
    this.manageScheduleForm.get('showSchedule').setValue(this.showSchedule);
    if(!this.manageScheduleForm.get('showSchedule').value){
      this.scheduledOn = null;
      this.scheduleTime = null;
    }
  }

  resetReccurringElements() {
    this.datePickerObj = {
      type: "dateTimePicker",
      dateObj: ""
    }
  }

  setValidator(key) {
    this.manageScheduleForm.get(key).setValidators([Validators.required]);
    this.manageScheduleForm.get(key).updateValueAndValidity();
  }

  clearValidator(key) {
    this.manageScheduleForm.get(key).clearValidators();
    this.manageScheduleForm.get(key).updateValueAndValidity();
  }

  showErrors(fieldName, errorType, formName) {
    if (this.manageScheduleForm.controls[fieldName].errors && this.manageScheduleForm.controls[fieldName].errors[errorType]) {
      return this.sendScheduleData && this.manageScheduleForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  receiveDate(e, key) {
    this.manageScheduleForm.get(key).setValue(e);
    if ((key == 'dateTime') && (this.manageScheduleForm.get('scheduleType').value == 'recurring')) {
      let date = new Date(this.manageScheduleForm.get('dateTime').value)
      date.setDate(date.getDate() + 1)
    }
  }

  selectActionRecive(item, key) {
    if (key == 'timezone') {
      this.timezoneSelectText = item ? item.text : this.translatedObj['campaign.select-text'];
      this.manageScheduleForm.get(key).setValue(item ? item.value : '');
    }
  }

  closeModal(id: string) {
    this.common.close(id);
  }

  cancel() {
    this.closeModal('manage-schedule');
    this.manageScheduleForm.reset({});
    this.sendScheduleData = false;
  }

  sendData = () => {
    this.sendScheduleData = true;
    if(this.manageScheduleForm.valid) {
      let reSubmitCampaignData = {};
      reSubmitCampaignData['showSchedule'] = this.manageScheduleForm.value['showSchedule'];
      reSubmitCampaignData['dateTime'] = this.manageScheduleForm.value['dateTime'];
      reSubmitCampaignData['timezone'] = this.manageScheduleForm.value['timezone'];
      this.manageScheduleData['reSubmitCampaignData'] = reSubmitCampaignData;
      this.formValues = this.manageScheduleData;
      let request = {
        campaign_id: this.formValues._id,
        is_duplicate: this.formValues["removeDuplicate"],
        exclude_frequncy_capping: this.formValues['removeFrequencyCapping'],
        "campaign_type": this.formValues["campaign_type"]
      };

      if (this.formValues['is_only_latching'] == 1) {
        request['is_only_latching'] = this.formValues['is_only_latching']
        if (this.formValues['call_center_number_type'] == '1') {
          if (this.formValues['call_center_number']) {
            request['call_center_number'] = this.formValues['call_center_number']
          }
        }
        if (this.formValues['call_center_number_type'] == '2') {
          if (this.formValues['call_center_column_name']) {
            request['call_center_column_name'] = this.formValues['call_center_column_name']
          }
        }
      }
      request['is_tts_first'] = this.formValues['is_tts_first']
      this.scheduledOn = '';
      if (this.formValues?.dateTime) {
        let date = new Date(this.formValues?.dateTime);
        let getMinutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
        this.scheduledOn = `${("0" + date.getDate()).slice(
          -2
        )} ${date.toLocaleString("default", {
          month: "short",
        })} ${date.getFullYear()}`;
        this.scheduleTime = `${date.getHours()}:${getMinutes} ${this.timezoneSelectText
          }`;
      }
      this.common.setLoader(true);
      this.createVoiceCampaignService.validateCampaign(request).subscribe(
        (res: any) => {
          if (res["success"]) {
            this.closeModal('manage-schedule');
            this.validateRes = res.data;
            let data = this.formValues;
            this.validateDataPreview = {
              createCampaignForm: { ...data },
              validateRes: this.validateRes,
            };
            if (this.scheduledOn) {
              this.validateDataPreview["scheduledOn"] = this.scheduledOn;
            }
            if (this.scheduleTime) {
              this.validateDataPreview["scheduleTime"] = this.scheduleTime;
            }
            this.createCampaignService.setEventToGetAllFormValues({...this.manageScheduleData})
            this.common.setLoader(false);
            this.createCampaignService.validatePreviewData.next(this.validateDataPreview)
            this.openModal("validate");
          } else {
            this.common.setLoader(false);
            if (res.data && res.data.start_time) {
            } else {
              this.common.openSnackBar(res["message"], "error");
            }
          }
        },
        (err) => {
          this.common.setLoader(false);
          this.common.openSnackBar(err["error"]["message"], "error");
        }
      );
    }
  }

  validateData() {
    if (!this.formValues['name'] || (this.formValues.name && (this.formValues.name.length < 6 || this.formValues.name.length > 100))
    || !this.formValues['campaignCategory']
    || !this.formValues["selectedTemplate"]
    || !this.formValues["callerId"]
    || !this.formValues["campaign_type"]
    || (this.formValues["showSchedule"] && !this.formValues["dateTime"])
    || !this.formValues["selectedTemplate"]) {
      this.common.openSnackBar(this.validateFormText, 'error');
      return;
    }
    this.validateDataBeforeSubmitting(this.formValues)
  }

  validateDataBeforeSubmitting = (request) => {
    let incompleteWidgets = this.createVoiceCampaignService.validateDataBeforeSubmitting(request);
    if(incompleteWidgets.length) {
      let txt = '';
      incompleteWidgets.forEach((e,i) => {
        txt += e.id+ ((i == (incompleteWidgets.length-1)) ? '' : ' ,');
      })
      if(incompleteWidgets.length == 1){
        this.common.openSnackBar(`Widget id(s):- ${txt} is missing`, 'error');
      }else{
        this.common.openSnackBar(`Widget id(s):- ${txt} are incomplete`, 'error');
      }
    }else{
      this.sendData();
    }
  }

  openModal(id: string) {
    this.common.open(id);
    this.modalType = id;
  }

}
