import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CommonService } from 'src/app/shared/services/common.service';
import { day, hour, minutes } from 'src/app/shared/constants/variables';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stagger',
  templateUrl: './stagger.component.html',
  styleUrls: ['./stagger.component.css']
})
export class StaggerComponent implements OnInit {
  hasPermissions = permissions;
  @Input() config: any;
  showStaggered: boolean = false;
  staggerForm: FormGroup;
  days = day;
  hours = hour;
  minutes = minutes;
  daysSelectText: any;
  configDays = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false
  };
  hoursSelectText: any;
  configHours = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false
  };
  minutesSelectText: any;
  configMinutes = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false
  };
  noOfMessageZeroError: any;
  daysHoursMinutesZeroError: any;
  translatedObj: any;
  @Output() showStaggeredEvent = new EventEmitter<any>();
  @Input() sendCampaignData: any;
  stop = new Subject<void>();
  disableStagger: boolean = false;
  constructor(public common: CommonService, public fb: FormBuilder, public createCampaignService: CreateCampaignService) {
    this.staggerForm = this.fb.group({
      noOfMessages: ['', [Validators.maxLength(30)]],
      day: ['00', []],
      hour: ['00', []],
      minute: ['00', []]
    })
    this.daysSelectText = this.hoursSelectText = this.minutesSelectText = "00";

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        if (this.translatedObj) {
          this.configDays.title = this.translatedObj['common-select'];
          this.configHours.title = this.translatedObj['common-select'];
          this.configMinutes.title = this.translatedObj['common-select'];
          this.noOfMessageZeroError = this.translatedObj['campaign.stagger-no-of-messages-zero-error'];
          this.daysHoursMinutesZeroError = this.translatedObj['campaign.stagger-days-hours-minutes-zero-error'];
        }
      }
    })

    this.createCampaignService.getEventToGetStaggerValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.validateStaggeredValidators();
      if (res.scheduleType == 'multiple') {
        this.createCampaignService.setEventToGetMultipleScheduleValues({ ...this.staggerForm.value, ...res })
      }
      else {
        this.createCampaignService.setEventToGetAllFormValues({ ...this.staggerForm.value, ...res })
      }
    });
    this.createCampaignService.checkEventToGetScheduleValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if ((res == 'recurring') || (res == 'multiple')) {
        this.disableStagger = true
      } else {
        this.disableStagger = false;
      }
    })
  }

  ngOnInit(): void {
    // let keys = ['','','']
    // this.selectActionRecive()
  }

  staggeredSwitch(event) {
    let toggle = event.target.checked;
    if (toggle) {
      this.showStaggered = true;
    }
    else {
      this.showStaggered = false;
      this.staggerForm.get('noOfMessages').setValue('');
      this.staggerForm.get('day').setValue('');
      this.staggerForm.get('hour').setValue('');
      this.staggerForm.get('minute').setValue('');
      this.daysSelectText = this.translatedObj['common-select'];
      this.hoursSelectText = this.translatedObj['common-select'];
      this.minutesSelectText = this.translatedObj['common-select'];
    }
    this.showStaggeredEvent.emit(this.showStaggered);
    if (this.showStaggered) {
      this.setValidator('noOfMessages');
    }
    else {
      this.clearValidator('noOfMessages');
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.staggerForm.controls[fieldName].errors && this.staggerForm.controls[fieldName].errors[errorType]) {
      return this.sendCampaignData && this.staggerForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  selectActionRecive(item, key) {
    this.staggerForm.get(key).setValue(item ? item : '');
    if (key == 'day') {
      this.daysSelectText = item ? item : this.translatedObj['campaign.select-text'];
    }
    if (key == 'hour') {
      this.hoursSelectText = item ? item : this.translatedObj['campaign.select-text'];
    }
    if (key == 'minute') {
      this.minutesSelectText = item ? item : this.translatedObj['campaign.select-text'];
    }
  }

  clearValidator(key) {
    this.staggerForm.get(key).clearValidators();
    this.staggerForm.get(key).updateValueAndValidity();
  }

  setValidator(key) {
    if (key == 'noOfMessages') {
      this.staggerForm.get(key).setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      this.staggerForm.get(key).setValidators([Validators.required]);
    }
    this.staggerForm.get(key).updateValueAndValidity();
  }

  validateStaggeredValidators() {
    if (this.showStaggered) {
      this.setValidator('noOfMessages');
      this.setValidator('day');
      this.setValidator('hour');
      this.setValidator('minute');
      if (this.staggerForm.get('day').value) {
        this.clearValidator('hour');
        this.clearValidator('minute');
      }
      if (this.staggerForm.get('hour').value) {
        this.clearValidator('day');
        this.clearValidator('minute');
      }
      if (this.staggerForm.get('minute').value) {
        this.clearValidator('day');
        this.clearValidator('hour');
      }
    }
    else {
      this.clearValidator('noOfMessages');
      this.clearValidator('day');
      this.clearValidator('hour');
      this.clearValidator('minute');
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
