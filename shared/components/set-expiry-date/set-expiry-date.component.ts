import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MissedCallCampaignService } from 'src/app/shared/services/missed-call-campaign.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service'
import { CreateCampaignService as TruecallerCreateCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service'
@Component({
  selector: 'app-set-expiry-date',
  templateUrl: './set-expiry-date.component.html',
  styleUrls: ['./set-expiry-date.component.css']
})
export class SetExpiryDateComponent implements OnInit, OnDestroy {

  expiryCampaignForm: FormGroup;
  loaderSpinner: boolean = false;
  stop = new Subject<void>();
  public date: moment.Moment;
  public timezones;
  @Output() sendLoaderState = new EventEmitter<any>();
  translatedObj: any;
  @Input() selectorData: any;
  @Input() config: any;
  datePickerConfig = {
    showSpinners: true,
    touchUi: false,
    hideTime: true,
    minDate: moment(new Date()).format(),
  }
  datePickerObj: any = {
    type: "dateTimePicker",
    dateObj: ""
  }
  @Input() sendCampaignData: any;
  endDatePickerObj = {
    type: "dateTimePicker",
    dateObj: moment(new Date()).add(1, 'days').format()
  }
  highlightedDate: any;
  datePickerObjExp = {
    type: "dateTimePicker",
    dateObj: ""
  }
  invalidAlertNumbers: boolean = false;
  maxNumberError: boolean = false;
  maxEmailIdError: boolean = false;
  invalidEmailId: boolean = false;
  editCampaignData: any;
  emailOrNumberRequired = false;
  isDatePickerDisabled: any = false;
  VMNTFNNumber: any
  updatedVMNTFNNumber: any;

  constructor(
    public common: CommonService,
    public fb: FormBuilder, public router: Router,
    public translate: TranslateService,
    public _missedCallCampaignService: MissedCallCampaignService,
    public _createCampaignService: CreateCampaignService,
    public _truecallerCreateCampaignService: TruecallerCreateCampaignService,
    public _actRoute: ActivatedRoute,
  ) {
    this.expiryCampaignForm = this.fb.group({
      expiry_date: ['', [Validators.required]],
      send_expiry_alert: [0, []],
      set_days_alert: ['', []],
      alert_email: ['', []],
      alert_number: ['', []],
      is_active: ['1', []]
    });

    this.common.translatedObj.pipe(takeUntil(this.stop)).subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
      }
    })

    this._missedCallCampaignService.getEventToGetSetExpiryValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res && Object.keys(res).length) {
        if (this.config && (this.config?.missedCall || this.config?.ibd)) {
          this.validateInputValue(this.expiryCampaignForm.value, res)
        }
      }
    })

    this._missedCallCampaignService.getExpiryDate().subscribe((val) => {
      this.isDatePickerDisabled = true
      this.datePickerObj = {
        type: "dateTimePicker",
        dateObj: val,
      }
      this.expiryCampaignForm.get('expiry_date').setValue(moment(val).format('MM-DD-YYYY'))
    })

    this._missedCallCampaignService.getVMNTFNNumber().subscribe((number: any) => {
      if (number) {
        const { id, ...rest } = number
        this.VMNTFNNumber = rest
      }
    })

  }// End of constructor

  isEdit = false;
  ngOnInit(): void {
    this._actRoute.queryParams.subscribe(params => {
      this.isEdit = params['is_edit'] == 'true' ? true : false;
    })
    this._missedCallCampaignService.setEditCampaignData.subscribe(res => {
      if (res) {
        this.editCampaignData = res;
        if (this.editCampaignData && Object.keys(this.editCampaignData).length) {
          this.isDatePickerDisabled = true
          this.datePickerObj = {
            type: "dateTimePicker",
            dateObj: this.editCampaignData?.expiry_date,
          }
          this.expiryCampaignForm.get('expiry_date').setValue(this.editCampaignData?.expiry_date);
          this.expiryCampaignForm.get('set_days_alert').setValue(this.editCampaignData?.set_days_alert);
          this.expiryCampaignForm.get('alert_email').setValue(this.editCampaignData?.alert_email);
          this.expiryCampaignForm.get('alert_number').setValue(this.editCampaignData?.alert_number);
          this.expiryCampaignForm.get('send_expiry_alert').setValue(this.editCampaignData?.send_expiry_alert);
          this.expiryCampaignForm.get('is_active').setValue(this.editCampaignData?.is_active?.toLowerCase() == 'active' && '1' || '0');
        }
      }
    })
  }

  validateInputValue(data, res) {
    this.emailOrNumberRequired = this.invalidAlertNumbers = this.invalidEmailId = this.maxNumberError = this.maxEmailIdError = false;
    if (this.expiryCampaignForm.get('send_expiry_alert').value) {
      if (!this.expiryCampaignForm.get('alert_number').value && !this.expiryCampaignForm.get('alert_email').value) {
        this.emailOrNumberRequired = true;
      }
      if (this.expiryCampaignForm.get('alert_number').value) {
        let text = (this.expiryCampaignForm.get('alert_number').value).split(" ").join("");
        let arr = text.split(",")
        if (arr.length <= 10) {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].length < 9 || arr[i].length > 16) {
              this.invalidAlertNumbers = true;
              break;
            }
          }
        } else {
          this.maxNumberError = true;
        }
      }
      if (this.expiryCampaignForm.get('alert_email').value) {
        let text = (this.expiryCampaignForm.get('alert_email').value).split(" ").join("");
        let arr = text.split(",")
        if (arr.length <= 10) {
          let regex = /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/g
          this.invalidEmailId = !regex.test(this.expiryCampaignForm.get('alert_email').value);
        } else {
          this.maxEmailIdError = true;
        }
      }
      if (this.emailOrNumberRequired || this.invalidAlertNumbers || this.invalidEmailId || this.maxNumberError || this.maxEmailIdError) {
        return;
      }
    }
    if (this.expiryCampaignForm.valid) this._createCampaignService.setEventToGetAllFormValues({ ...this.expiryCampaignForm.value, ...this.VMNTFNNumber, ...res })
  }

  receiveDate(e, key) {
    this.expiryCampaignForm.get(key).setValue(e);
    if ((key == 'expiry_date')) {
      this.endDatePickerObj = {
        type: "dateTimePicker",
        dateObj: ""
      }
      let date = new Date(this.expiryCampaignForm.get('expiry_date').value)
      date.setDate(date.getDate() + 1)
      this.highlightedDate = date
    }
  }

  checkSchAndExpDateValidation = (Date) => {
    if (!this.expiryCampaignForm.get('expiry_date').value || !this.expiryCampaignForm.get('expiry_date').value) return;
    let expDate = this.expiryCampaignForm.get('expiry_date').value;
    let schDate = this.expiryCampaignForm.get('expiry_date').value;

    if (!this.isSameDate(expDate, schDate) && (+expDate < +schDate)) {
      this.expiryCampaignForm.get(Date).setValue(null);
      if (Date == 'expiry_date') {
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

  showErrors(fieldName, errorType, formName) {
    if (this.expiryCampaignForm.controls[fieldName].errors && this.expiryCampaignForm.controls[fieldName].errors[errorType]) {
      if (this.config.email) {
        return this.sendCampaignData && this.expiryCampaignForm.controls[fieldName].errors[errorType];
      } else {
        return this.sendCampaignData && this.expiryCampaignForm.controls[fieldName].errors[errorType];
      }
    } else {
      return false;
    }
  }

  setExpiryAlert(e) {
    this.expiryCampaignForm.get('send_expiry_alert').setValue(e?.checked ? 1 : 0);
    if (e?.checked) {
      this.expiryCampaignForm.get('set_days_alert').setValidators([Validators.required]);
      this.expiryCampaignForm.get('set_days_alert').updateValueAndValidity();
    } else {
      this.expiryCampaignForm.get('set_days_alert').setValue('');
      this.expiryCampaignForm.get('alert_email').setValue('');
      this.expiryCampaignForm.get('alert_number').setValue('');
      this.expiryCampaignForm.get('set_days_alert').clearValidators();
      this.expiryCampaignForm.get('set_days_alert').updateValueAndValidity();
    }
  }

  changeStatus(e) {
    this.expiryCampaignForm.get('is_active').setValue(e['value']);
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
