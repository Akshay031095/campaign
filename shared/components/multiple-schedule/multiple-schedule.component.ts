import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import * as timezone from '../../../../shared/mock-data/timezone';

@Component({
  selector: 'app-multiple-schedule',
  templateUrl: './multiple-schedule.component.html',
  styleUrls: ['./multiple-schedule.component.css']
})
export class MultipleScheduleComponent implements OnInit {

  @Input() multipleScheduleForm: FormGroup;
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
  datePickerObj = {
    type: "dateTimePicker",
    dateObj: ""
  }
  @Input() testCampaign: any;
  @Input() sendCampaignData: any;
  public timezones;
  configTimezone = {
    image: false,
    title: '',
    key: 'text',
    search: true,
    open: false
  }
  translatedObj: any;
  timezoneSelectText: any;
  timezonesArr = [];
  multipleScheduleList: FormArray;
  stop = new Subject<any>();
  @Input() isMultipleSchedule: any;
  @Output() addRow = new EventEmitter<any>();
  @Output() removeRow = new EventEmitter<any>();

  constructor(public fb: FormBuilder, public common: CommonService, public createCampaignService: CreateCampaignService) {
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        if(this.translatedObj) {
          this.configTimezone.title = this.translatedObj['campaign.select-text']
        }
      }
    })

    this.createCampaignService.getEventToGetMultipleScheduleValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.getMultipleScheduleValues(res);
    })
   }

  ngOnInit(): void {
    this.timezones = this.getTimezone(timezone.timezone);
  }

  receiveDate(e, key, item?) {
    const hasError = this.createCampaignService.setValidatonForCampaignScheduleDate({ e, key, item });
    if (hasError) return;
    item.get(key).setValue(e);
  }

  showErrors(fieldName, errorType, formName) {
    if (formName.get(fieldName).errors && formName.get(fieldName).errors[errorType]) {
      return !this.testCampaign && this.sendCampaignData && formName.get(fieldName).errors[errorType];
    } else {
      return false;
    }
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

  selectActionRecive(event, key, item?) {
    if (key == 'timezone') {
      item.get('timezoneSelectText').setValue(event ? event.text : this.translatedObj['campaign.select-text'])
      item.get(key).setValue(event ? event.value : '')
    }
  }

  removeSchedule(index) {
    this.removeRow.emit(index);
  }

  addScheduleItem() {
    this.addRow.emit(true);
  }

  getMultipleScheduleValues(data) {
    this.createCampaignService.setEventToGetAllFormValues({ ...this.multipleScheduleForm.value, ...data })
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
