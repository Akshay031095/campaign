import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';

@Component({
  selector: 'app-message-classification',
  templateUrl: './message-classification.component.html',
  styleUrls: ['./message-classification.component.css']
})
export class MessageClassificationComponent implements OnInit {

  messageClassificationForm: FormGroup;
  @Input() isKsaUser: any;
  @Input() sendCampaignData: any;
  // classificationList = [{
  //   name: '',
  //   value: 'promotional',
  //   type: 'promotional',
  //   typeData: []
  // },
  // {
  //   name: '',
  //   value: '',
  //   type: 'transactional',
  //   typeData: [
  //     { name: '', value: 'awareness', type: 'transactional' },
  //     { name: '', value: 'service', type: 'transactional' },
  //     { name: '', value: 'warning', type: 'transactional' },
  //     { name: '', value: 'personal', type: 'transactional' },
  //   ]
  // }]
  classificationList = [];
  configClassification = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: false,
    groupBy: false,
    childArray: 'typeData'
  };
  classificationText: any = '';
  messageClassificationData: any;
  messageStartTime: any;
  messageEndTime: any;
  disableSend: boolean = false;
  @Output() sendClassificationData = new EventEmitter<any>();
  @Input() hasScheduleAccess: any;
  noScheduleRights: any;
  messageClassificationpopupText: any;
  personalClassificationText: any;
  @Output() sendMessageClassification = new EventEmitter<any>();
  stop = new Subject<void>();
  @Output() sendIsDisable = new EventEmitter<any>();
  translatedObj: any;


  constructor(public fb: FormBuilder, public translate: TranslateService, public createCampaignService: CreateCampaignService, public common: CommonService, public matDialog: MatDialog, public router: Router) {
    if(localStorage.getItem('vertical_categories') && localStorage.getItem('vertical_categories') != 'undefined' && localStorage.getItem('vertical_categories') != 'null') {
      let verticalCategories = JSON.parse(localStorage.getItem('vertical_categories'))
      let verticalList = Object.keys(verticalCategories)
      this.classificationList = [];
      if(verticalList && verticalList.length > 0) {
        verticalList.forEach(e => {
          this.classificationList.push({
            name: e,
            type: verticalCategories[e],
            value: e
          })
        })
      }
    }
    this.messageClassificationForm = this.fb.group({
      messageClassification: [null, []]
    });
    translate.stream(['campaigns.change-sender-popup-prompt-message1', 'campaigns.change-campaign-type-popup-message', 'common.please-confirm-text', 'campaign.validate-slot-time-schedule-text1', 'campaign.validate-slot-time-schedule-text2', 'campaign.personal-message-classification-text1', 'campaign.validate-slot-time-send-text1', 'common.validate-form-text', 'campaign.sender-id-text', 'campaign.default-text-preview', 'campaign.select-text', 'campaign.message-classification-type-promotional-blacklist', 'campaign.message-classification-type-awareness', 'campaign.message-classification-type-service', 'campaign.message-classification-type-warning', 'campaign.message-classification-type-personal', 'campaign.message-classification-type-transactional-whitelist', 'campaign.validate-slot-time-no-schedule-rights-text']).subscribe((text) => {
      this.messageClassificationpopupText = text['campaign.validate-slot-time-schedule-text1']
      this.personalClassificationText = text['campaign.personal-message-classification-text1']
      this.configClassification.title = text['campaign.select-text']
      // this.classificationList[0].name = text['campaign.message-classification-type-promotional-blacklist']
      // this.classificationList[1].name = text['campaign.message-classification-type-transactional-whitelist']
      // this.classificationList[1].typeData[0].name = text['campaign.message-classification-type-awareness']
      // this.classificationList[1].typeData[1].name = text['campaign.message-classification-type-service']
      // this.classificationList[1].typeData[2].name = text['campaign.message-classification-type-warning']
      // this.classificationList[1].typeData[3].name = text['campaign.message-classification-type-personal']
      this.noScheduleRights = text['campaign.validate-slot-time-no-schedule-rights-text']
    });

    this.common.translatedObj.subscribe((data:any)=> {
      if(data) {
        this.translatedObj = data.translations;
      }
    })
    
    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.messageClassificationForm.reset();
      this.classificationText = '';
    })
  }

  ngOnInit(): void {
    this.isKsaUser = JSON.parse(localStorage.getItem('is_message_classification'));
    this.validateKsaUser();
  }

  validateKsaUser() {
    if (this.isKsaUser) {
      this.messageClassificationForm.get('messageClassification').setValidators([Validators.required]);
      this.messageClassificationForm.get('messageClassification').updateValueAndValidity();
    }
    else {
      // this.getSenderId();
      let data = {
        type: 'messageClassification',
        action: 'getSender',
        data: ''
      }
      this.sendClassificationData.emit(data)
      this.messageClassificationForm.get('messageClassification').clearValidators();
      this.messageClassificationForm.get('messageClassification').updateValueAndValidity();
    }

  }

  showErrors(fieldName, errorType, formName) {
    if (this.messageClassificationForm.controls[fieldName].errors && this.messageClassificationForm.controls[fieldName].errors[errorType]) {
      return this.sendCampaignData && this.messageClassificationForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  selectActionRecive(item, key, defaultSender?) {
    this.validateSlotTime(item, key);
  }

  validateSlotTime(item, key) {
    this.createCampaignService.validateMessage(item.value).subscribe((res: any) => {
      if (res['success']) {
        this.messageClassificationData = res;
        if (!this.messageClassificationData.data.valid_slot_time) {
          this.messageStartTime = this.messageClassificationData.data.start_time;
          this.messageEndTime = this.messageClassificationData.data.end_time;
          this.messageClassificationPopupConfig(item, key, false);
        }
        else {
          this.messageClassificationPopupConfig(item, key, true);
        }
      }
      else {
        this.common.openSnackBar(res['message'], 'error');
      }
    },
      err => {
        this.common.openSnackBar(err['error']['message'], 'error');
      })
  }

  messageClassificationPopupConfig(item, key, valid?) {
    let value = this.messageClassificationForm.get(key).value;
    this.disableSend = false;
    this.sendIsDisable.emit(this.disableSend);
    if ((value != item.value.toLowerCase()) && ((item.value.toLowerCase() == 'awareness') || (item.value.toLowerCase() == 'advertisement')) && !valid) {
      let data = {
        type: 'messageClassification',
        action: 'resetSender',
        vertical: item && item.value ? item.value : ''
      }
      this.sendClassificationData.emit(data)
      let invalidSlotTimeText = '';
      var mapObj = {
        '{{messageClassification}}': item.name,
        '{{startTime}}': this.messageStartTime,
        '{{endTime}}': this.messageEndTime
      };
      if (!this.hasScheduleAccess) {
        invalidSlotTimeText = this.common.getUpdatedTranslatedVariables(this.noScheduleRights, /{{messageClassification}}|{{startTime}}|{{endTime}}/gi, mapObj)
        this.openDialog(`${invalidSlotTimeText}`, '', 'noScheduleRights', (e) => {
          if (e) {
            if (e.type) {
              this.router.navigate(['/campaigns']);
            }
          }
          else {
            this.messageClassificationForm.get(key).setValue(value ? value : null);
            this.classificationText = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
            this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
          }
        })
        this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
        return;
      }
      invalidSlotTimeText = this.common.getUpdatedTranslatedVariables(this.messageClassificationpopupText, /{{messageClassification}}|{{startTime}}|{{endTime}}/gi, mapObj)
      this.openDialog(`${invalidSlotTimeText}`, '', 'messageClassification', (e) => {
        if (e) {
          if (e.type) {
            this.router.navigate(['/campaigns']);
          }
          else {
            this.classificationText = item ? item.name : this.translatedObj['campaign.select-text'];
            this.messageClassificationForm.get(key).setValue(item ? item.value : '');
            let data = {
              type: 'messageClassification',
              action: 'getSender',
              data: item
            }
            this.sendClassificationData.emit(data)
            this.disableSend = true;
            this.sendIsDisable.emit(this.disableSend);
            this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
          }
        }
        else {
          this.messageClassificationForm.get(key).setValue(value ? value : null);
          this.classificationText = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
          this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
        }
      })
      this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
    }
    else if ((value != item.value) && (item.value == 'personal')) {
      let data = {
        type: 'messageClassification',
        action: 'resetSender',
        vertical: item && item.value ? item.value : ''
      }
      this.sendClassificationData.emit(data)
      this.openDialog(`${this.personalClassificationText}`, '', 'prompt', (e) => {
        if (e) {
          this.messageClassificationForm.get(key).setValue(null);
          this.classificationText = '';
          this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
        }
        else {
          this.messageClassificationForm.get(key).setValue(value ? value : null);
          this.classificationText = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
          this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
        }
      })
      this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
    }
    else if ((value != item.value)) {
      let data = {
        type: 'messageClassification',
        action: 'resetSender',
        vertical: item && item.value ? item.value : ''
      }
      this.sendClassificationData.emit(data)
      this.classificationText = item ? item.name : this.translatedObj['campaign.select-text'];
      this.messageClassificationForm.get(key).setValue(item ? item.value : '');
      let val = {
        type: 'messageClassification',
        action: 'getSender',
        data: item
      }
      this.sendClassificationData.emit(val)
      this.sendMessageClassification.emit(this.messageClassificationForm.get('messageClassification').value)
    }
  }

  openDialog(message, subtitle, type, callback) {
    const dialogRef = this.matDialog.open(DialogComponent, {
      data: { title: message, subtitle: subtitle, type: type },
      disableClose: true,
      panelClass: 'common-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      callback(result);
    });
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
