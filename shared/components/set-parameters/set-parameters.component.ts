import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as CreateCampaignEmailService } from 'src/app/shared/services/email/campaigns/create-campaign.service';
import { CreateCampaignService as CreateVoiceCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import * as countries from 'src/app/shared/mock-data/country';
import { CreateCampaignService as createRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { MissedCallCampaignService } from 'src/app/shared/services/missed-call-campaign.service';
import { ActivatedRoute } from '@angular/router';
import { CreateCampaignService as createTruecallerCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';
@Component({
  selector: 'app-set-parameters',
  templateUrl: './set-parameters.component.html',
  styleUrls: ['./set-parameters.component.css']
})
export class SetParametersComponent implements OnInit, OnDestroy {

  parametersForm: FormGroup;
  @Input() sendCampaignData: any;
  campaignCategoryList: any;
  emailCampaignType: any = [
    { name: 'Regular', value: 'regular', tab_count: 1, show_variant: false, variant: [], sequence: [0] },
    { name: 'Split A/B', value: 'split_a_b', tab_count: 2, show_variant: true, variant: ['A', 'B'], sequence: [1, 2] },
    { name: 'Split A/B/C', value: 'split_a_b_c', tab_count: 3, show_variant: true, variant: ['A', 'B', 'C'], sequence: [1, 2, 3] },
    { name: 'Split A/B/C/D', value: 'split_a_b_c_d', tab_count: 4, show_variant: true, variant: ['A', 'B', 'C', 'D'], sequence: [1, 2, 3, 4] },
    { name: 'Split A/B/C/D/E', value: 'split_a_b_c_d_e', tab_count: 5, show_variant: true, variant: ['A', 'B', 'C', 'D', 'E'], sequence: [1, 2, 3, 4, 5] }
  ];
  emailCampaignVarientTestFor: any = [
    { name: 'Subject Line', value: 'subject' },
    { name: 'Content', value: 'content' },
    { name: 'Both', value: 'both' },
  ];
  showDdForEmailVarient = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  loaderSpinner: boolean = false;
  categorySelectText: any;
  typeSelectText: any;
  testEmailVarientForSelectText: any;
  configCategory = {
    image: false,
    title: '',
    key: 'name',
    open: false,
    createNew: true,
    search: true,
    ajax: true,
    type: 'campaignCategory'
  };
  configEmailType = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: false
  };
  configEmailVarientTestFor = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false,
    createNew: false
  };
  senderId: any;
  configSenderId = {
    image: false,
    title: '',
    key: 'sender',
    search: true,
    open: false,
    ajax: true,
    type: 'setParameter'
  };
  configWhatsAppBusinessNumber = {
    image: false,
    title: '',
    key: 'label',
    search: false,
    open: false
  };
  senderIdSelectText: any;
  whatsAppBusinessNumberText: any;
  changeSenderPopupText1: any;
  commonConfirmText: any;
  senderName: any;
  @Output() sendParametersData = new EventEmitter<any>();
  changeCampaignTypeText: any;
  @Input() campaignData: any;
  @Input() isKsaUser: any;
  @Output() sendCategory = new EventEmitter<any>();
  @Output() sendEmailType = new EventEmitter<any>();
  @Output() sendEmailTestVarientFor = new EventEmitter<any>();
  stop = new Subject<void>();
  @Input() config: any;
  public countries;
  @Input() whatsAppBusinessNumbers: any;
  @Output() sendWhatsappBusinessNumber = new EventEmitter<any>();
  @Input() messageQuota: any;
  messageQuotaText: any;
  @Input() isDltUser: any;
  dltSenderIdChanged: any;
  translatedObj: any;
  @Input() campaignName: any;
  @Output() noMessageQuotaEvent = new EventEmitter<any>();
  typeList = [
    { name: 'Transactional', value: 'transactional' },
    { name: 'Promotional', value: 'promotional' }
  ];
  @Input() rbmAgentList: any;
  messageQuotaOriginalText: any;

  configCallerId = {
    image: false,
    title: '',
    key: 'name',
    search: false,
    open: false
  };
  callerIdList = [
    { name: 'Auto', value: 'auto' }
  ];
  callerIdText: any;
  rbmSelectText: any;
  configType = {
    image: false,
    title: '',
    key: 'label',
    search: false,
    open: false,
    createNew: false
  }
  configRbmAgent = {
    image: false,
    title: '',
    key: 'label',
    search: false,
    open: false,
    createNew: false
  };
  setRateLimitMessageUnlimited: any
  ajaxItem: any;
  senderType: any;
  @Input() emailCampaignApproval: any;
  disable_open_tracking = false;
  disable_click_tracking = false;
  smsWorkflowData: any;
  @Input() drawerId: any;
  whatsAppWorkflowData: any;
  rcsWorkflowData: any;
  @Input() selectorData: any;
  selectorInputValue: any = {}
  @Output() sendSelectorInputValue = new EventEmitter<any>();
  callDurationData: any = [{ key: '3', misscall_duration: '3' }, { key: '4', misscall_duration: '4' }, { key: '5', misscall_duration: '5' }, { key: '6', misscall_duration: '6' }, { key: '7', misscall_duration: '7' }];
  configCallDuration = {
    image: false,
    title: '',
    key: 'misscall_duration',
    search: false,
    open: false,
    createNew: false
  };
  callDurationSelectText: any;
  PRINumData: any;
  configPRINum = {
    image: false,
    title: '',
    key: 'number',
    search: false,
    open: false,
    createNew: false
  };
  PRINumSelectText: any;
  DidNumData: any;
  configDidNum = {
    image: false,
    title: '',
    key: 'did_number',
    search: false,
    open: false,
    createNew: false
  };
  DidNumSelectText: any;
  configVMNTFN = {
    image: false,
    title: '',
    key: 'number',
    search: false,
    open: false,
    createNew: false
  }
  VMNTFNSelectText: any;
  showConfigureVMNTollfree: boolean = false;
  VMNTollfreeData: any;
  editCampaignData: any;
  isEdit: any;
  @Input() tcNumberList;
  tcSelectText: any = "";
  configTC = {
    image: false,
    title: '',
    key: 'label',
    open: false,
    search: true
  };
  messageCategorySelectText: any;
  configMessageCategory = {
    image: false,
    title: '',
    key: 'name',
    open: false,
    search: false
  };
  vmnTfndropdownValue: any = 'VMN';
  didNumberId: any;
  truecallerWorkflowData: any;
  @Output() sendTcNumber = new EventEmitter<any>();

  constructor(public fb: FormBuilder, public createCampaignService: CreateCampaignService, public common: CommonService, public translate: TranslateService, public matDialog: MatDialog, private createVoiceCampaignService: CreateVoiceCampaignService, public createCampaignEmailService: CreateCampaignEmailService, public createRcsCampaignService: createRcsCampaignService,
    private _missedCallCampaignService: MissedCallCampaignService, public actRoute: ActivatedRoute, public truecallerCampaignService: createTruecallerCampaignService) {
    this.actRoute.queryParams.subscribe(params => {
      this.isEdit = params['is_edit'] == 'true' ? true : false;
    })
    this.parametersForm = this.fb.group({
      campaignName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      campaignCategory: [null, [Validators.required]],
      type: [null, [Validators.required]],
      variation: [null, []],
      senderId: [null, []],
      messageType: ['', []],
      whatsappBusinessNumber: ['', []],
      rbmAgent: ['', []],
      misscall_duration: [null, []],
      pri_number: ['', [Validators.required]],
      did_number: ['', [Validators.required]],
      vmn_tollfree: ['', []],
      vmn_toll_free_flag: [0, []],
      vmn_toll_free: ['VMN', []],
      tc_number: ['', [Validators.required]],
      messagecategory: ['', [Validators.required]]
    });
    this.countries = countries;
    translate.stream(['campaign.message-quota-unlimited', 'campaigns.change-sender-popup-prompt-message1', 'campaigns.change-campaign-type-popup-message', 'common.please-confirm-text', 'campaign.validate-slot-time-schedule-text1', 'campaign.validate-slot-time-schedule-text2', 'campaign.personal-message-classification-text1', 'campaign.validate-slot-time-send-text1', 'common.validate-form-text', 'campaign.sender-id-text', 'campaign.default-text-preview', 'campaign.select-text', 'campaign.message-classification-type-promotional-blacklist', 'campaign.message-classification-type-awareness', 'campaign.message-classification-type-service', 'campaign.message-classification-type-warning', 'campaign.message-classification-type-personal', 'campaign.message-classification-type-transactional-whitelist', 'campaign.validate-slot-time-no-schedule-rights-text', 'campaign.message-quota', 'campaign.dlt-sender-id-changed']).subscribe((text) => {
      this.changeSenderPopupText1 = text['campaigns.change-sender-popup-prompt-message1']
      this.changeCampaignTypeText = text['campaigns.change-campaign-type-popup-message']
      this.commonConfirmText = text['common.please-confirm-text']
      this.configCategory.title = text['campaign.select-text']
      this.configEmailType.title = text['campaign.select-text']
      this.configEmailVarientTestFor.title = text['campaign.select-text']
      this.configSenderId.title = text['campaign.select-text']
      this.configType.title = text['campaign.select-text']
      this.configCallerId.title = text['campaign.select-text']
      this.configWhatsAppBusinessNumber.title = text['campaign.select-text']
      this.messageQuotaOriginalText = text['campaign.message-quota']
      this.dltSenderIdChanged = text['campaign.dlt-sender-id-changed']
      this.configRbmAgent.title = text['campaign.select-text'];
      this.setRateLimitMessageUnlimited = text['campaign.message-quota-unlimited'];
      this.configPRINum['title'] = text['campaign.select-text'],
        this.configDidNum['title'] = text['campaign.select-text'],
        this.configCallDuration['title'] = text['campaign.select-text'],
        this.configVMNTFN['title'] = text['campaign.select-text'],
        this.configTC.title = text['campaign.select-text'],
        this.configMessageCategory.title = text['campaign.select-text']
    });
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
      }
    })

    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.parametersForm.reset();
      if (this.campaignName) {
        this.parametersForm.get('campaignName').setValue(this.campaignName);
      }
      this.parametersForm.get('messageType').setValue('');
      this.categorySelectText = '';
      this.senderName = '';
      if (!this.isKsaUser) {
        if (this.senderId && this.senderId.length > 0) {
          this.senderId.forEach(e => {
            if (e.is_default == 1) {
              this.selectActionRecive(e, 'senderId', 'defaultSender');
            }
          })
        }
      }
      else {
        this.senderId = [];
      }
    })

    this.createCampaignService.getEventToGetSetParametersValues().pipe(takeUntil(this.stop)).subscribe(res => {
      let data = {
        categorySelectText: this.categorySelectText,
        typeSelectText: this.typeSelectText,
        rbmSelectText: this.rbmSelectText
      }
      if (res.createMessage) {
        data['createMessage'] = res.createMessage
      }
      if (this.config && this.config.workflow) {
        if (this.config.truecaller) {
          let Data = JSON.parse(JSON.stringify({ ...this.parametersForm.value, ...data, ...res }));
          for (let key in Data) {
            if (!Data[key]) {
              delete Data[key];
            }
          }
          this.createCampaignService.setEventToGetTextMessage(Data)
        }
        else {
          this.createCampaignService.setEventToGetMessageValues({ ...this.parametersForm.value, ...data, ...res, ...{ senderName: this.senderName, senderType: this.senderType } })
        }
      } else if (this.config && (this.config.missedCall || this.config.ibd)) {
        if (this.parametersForm.valid)
          this._missedCallCampaignService.setEventToGetComposeCallValues({ ...this.parametersForm.value, ...data, ...res })
      }
      else {
        this.createCampaignService.setEventToGetUploadContactsValues({ ...this.parametersForm.value, ...data, ...res });
      }
    })


    this.createCampaignService.getForSenderIdData().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.senderType = '';
      if (res['action'] == 'resetSender') {
        this.senderIdSelectText = this.translatedObj['campaign.select-text'];
        this.parametersForm.get('senderId').setValue('');
      }
      if (res['action'] == 'getSender') {
        if (!res.data) {
          this.updateSenderList()
        }
        else {
          this.senderType = res['data'].type
          this.updateSenderList('', '', res['data'].type, false);
        }
      }
    })

    this.createCampaignService.getAllFormValue().pipe(takeUntil(this.stop)).subscribe(res => {
      let data = {
        categorySelectText: this.categorySelectText,
        typeSelectText: this.typeSelectText,
        is_carousel_section: res?.is_carousel_section
      }
      this.createCampaignService.setParametersForm({ ...this.parametersForm.value, ...data })
    })

    this.createCampaignService.getEventToGetParametersFormValue().pipe(takeUntil(this.stop)).subscribe(res => {
      let data = {
        categorySelectText: this.categorySelectText,
        typeSelectText: this.typeSelectText
      }
      this.createCampaignService.setParametersValue({ ...this.parametersForm.value, ...data })
    })

    this.createCampaignEmailService.setEmailData.subscribe(res => {
      if (res) {
        this.setDataForInCaseOfEmail();
      }
    })

    this.common.getSearchAjaxData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res && res?.key == 'setParameter') { this.updateSenderList(res?.value, '', '', true); }
      if (res && res?.key == 'campaignCategory') { this.getCategory('', res?.value, true); }
    })

    this.createCampaignEmailService.disable_open_tracking.subscribe(data => {
      this.disable_open_tracking = data;
    })
    this.createCampaignEmailService.disable_click_tracking.subscribe(data => {
      this.disable_click_tracking = data;
    })
    this.createCampaignService.getSMSData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.smsWorkflowData = res
        this.parametersForm.reset();
        this.senderName = '';
        this.senderType = '';
        this.updateSenderList('', '', '', false);
      }
    })

    this.createCampaignService.getWhatsAppData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.whatsAppWorkflowData = res
        this.parametersForm.reset();
        this.senderName = '';
        this.senderType = '';
        this.whatsAppBusinessNumberText = this.whatsAppWorkflowData.whatsappBusinessNumber ? this.whatsAppWorkflowData.whatsappBusinessNumber : this.translatedObj['campaign.select-text'];
        this.parametersForm.get('whatsappBusinessNumber').setValue(this.whatsAppWorkflowData.whatsappBusinessNumber ? this.whatsAppWorkflowData.whatsappBusinessNumber : '');
        let obj = '';
        if (this.whatsAppBusinessNumbers && this.whatsAppBusinessNumbers.length) {
          obj = this.whatsAppBusinessNumbers.find(e => e.waba_number == this.whatsAppWorkflowData.whatsappBusinessNumber)
        }
        this.sendWhatsappBusinessNumber.emit(this.parametersForm.get('whatsappBusinessNumber').value ? obj : '');
      }
    })

    this.createCampaignService.getRCSData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res && res.agent_name) {
        this.rcsWorkflowData = res
        this.parametersForm.reset();
        this.senderName = '';
        this.senderType = '';
        this.selectActionRecive({ label: res.agent_label, name: res.agent_name, id: res.agent_id, rbm_agent_id: res.rbm_agent_id }, 'rbmAgent')
      }
    })

    this._missedCallCampaignService.setEditCampaignData.pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.editCampaignData = res;
        if (this.editCampaignData && Object.keys(this.editCampaignData).length) {
          this.parametersForm.get('campaignName').setValue(this.editCampaignData?.campaign_name);
          this.parametersForm.get('misscall_duration').setValue(this.editCampaignData?.misscall_duration ?? '0');
          // this.parametersForm.get('pri_number').setValue(this.editCampaignData?.pri_number);
          // this.parametersForm.get('did_number').setValue(this.editCampaignData?.did_number);
          // this.selectActionRecive("", 'pri_number')
          this.parametersForm.get('vmn_toll_free_flag').setValue(this.editCampaignData?.vmn_toll_free_flag);
          this.parametersForm.get('vmn_toll_free').setValue(this.editCampaignData?.vmn_toll_free);
          this.parametersForm.get('vmn_tollfree').setValue(this.editCampaignData?.vmn_tollfree);
          // this.fetchVMNTollfreeNumberList('VMN', true);
          if (this.isEdit) {
            this.fetchPRINumberList(true);
          }
          this.showConfigureVMNTollfree = this.editCampaignData?.vmn_toll_free_flag;
          this.callDurationSelectText = this.editCampaignData?.misscall_duration;
          if (this.showConfigureVMNTollfree) {
            this.parametersForm.get('vmn_tollfree').setValidators([Validators.required]);
            this.parametersForm.get('vmn_tollfree').updateValueAndValidity();
          } else {
            this.parametersForm.get('vmn_tollfree').clearValidators();
            this.parametersForm.get('vmn_tollfree').updateValueAndValidity();
          }
          // this.DidNumSelectText = this.editCampaignData?.did_number;
          // this.PRINumSelectText = this.editCampaignData?.pri_number;
          // this.VMNTFNSelectText = this.editCampaignData?.number;
        }
      }
    })


    this.createCampaignService.getTruecallerData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.truecallerWorkflowData = res
        this.parametersForm.reset();
        this.tcSelectText = this.truecallerWorkflowData.tc_number ? this.truecallerWorkflowData.tc_number : this.translatedObj['campaign.select-text'];
        this.parametersForm.get('tc_number').setValue(this.truecallerWorkflowData.tc_number ? this.truecallerWorkflowData.tc_number : '');

        this.messageCategorySelectText = this.truecallerWorkflowData.messagecategory ? this.typeList.find(x => x.value === this.truecallerWorkflowData.messagecategory)['name'] : this.translatedObj['campaign.select-text'];
        this.parametersForm.get('messagecategory').setValue(this.truecallerWorkflowData.messagecategory ? this.truecallerWorkflowData.messagecategory : '');
        let obj = '';
        if (this.tcNumberList && this.tcNumberList.length) {
          obj = this.tcNumberList.find(e => e.tc_number == this.truecallerWorkflowData.tc_number)
        }
        this.sendTcNumber.emit(this.parametersForm.get('tc_number').value ? obj : '');
      }
    })

  }

  ngOnInit(): void {

    if (this.config && this.config.voice) {
      this.typeList = [];
      this.getTypeList();
      this.parametersForm.addControl('callerId', new FormControl('', [Validators.required]))
      this.parametersForm.addControl('type', new FormControl('', [Validators.required]))
      this.callerIdText = this.callerIdList[0].name;
      this.parametersForm.get('callerId').setValue(this.callerIdList[0].value);
    }
    if (this.config && this.config.whatsapp) {
      this.parametersForm.addControl('whatsappBusinessNumber', new FormControl('', [Validators.required]))
    }
    if (this.config && (!this.config?.missedCall && !this.config?.ibd)) this.getCategory();
    this.parametersForm.get('campaignName').setValue(this.campaignName);
    if (!this.isKsaUser && this.config && this.config?.sender && (!this.config?.workflow)) {
      this.updateSenderList();
    }

    for (var key in this.parametersForm?.value) {
      if (this.parametersForm?.value[key]) {
        this.selectorInputValue[key] = this.parametersForm?.value[key];
      }
    }
    this.sendSelectorInputValue.emit(this.selectorInputValue);

    if (this.config && (this.config?.missedCall || this.config?.ibd) && !this.isEdit) {
      this.fetchPRINumberList();
    }
    if (this.config?.truecaller) {
      this.typeList = [...this.typeList, ...[{ name: 'OTP', value: 'OTP' }, { name: 'Other', value: 'other' }]];
    }
  }

  ngOnChanges() {
    if (this.config && this.config.whatsapp) {
      this.clearValidator('senderId');
      this.clearValidator('messageType');
      this.clearValidator('callerId');
      this.clearValidator('type');
      this.clearValidator('rbmAgent');
      this.parametersForm.get('whatsappBusinessNumber').setValidators([Validators.required]);
      this.parametersForm.get('whatsappBusinessNumber').updateValueAndValidity();
      this.clearValidator('tc_number');
      this.clearValidator('messagecategory');
    }
    else if (this.config && this.config.rcs) {
      this.clearValidator('senderId');
      this.clearValidator('messageType');
      this.clearValidator('callerId');
      this.clearValidator('type');
      this.clearValidator('whatsappBusinessNumber');
      this.parametersForm.get('rbmAgent').setValidators([Validators.required]);
      this.parametersForm.get('rbmAgent').updateValueAndValidity();
      this.clearValidator('tc_number');
      this.clearValidator('messagecategory');
    }
    else if (this.config && this.config.email) {
      this.clearValidator('senderId');
      this.clearValidator('messageType');
      this.clearValidator('callerId');
      this.clearValidator('rbmAgent');
      this.clearValidator('whatsappBusinessNumber');
      this.parametersForm.get('type').setValidators([Validators.required]);
      this.parametersForm.get('type').updateValueAndValidity();
      this.clearValidator('tc_number');
      this.clearValidator('messagecategory');
    }
    else if (this.config && this.config.voice) {
      this.clearValidator('senderId');
      this.clearValidator('messageType');
      this.clearValidator('rbmAgent');
      this.clearValidator('whatsappBusinessNumber');
      this.clearValidator('tc_number');
      this.clearValidator('messagecategory');
      if (this.parametersForm.get('callerId')) {
        this.parametersForm.get('callerId').setValidators([Validators.required]);
        this.parametersForm.get('callerId').updateValueAndValidity();
      }
      this.parametersForm.get('type').setValidators([Validators.required]);
      this.parametersForm.get('type').updateValueAndValidity();
    }
    if (this.config) {
      if (this.config.missedCall || this.config.ibd) {
        this.clearValidator('campaignCategory');
        this.clearValidator('type');
        this.clearValidator('tc_number');
        this.clearValidator('messagecategory');
      }
      if (this.config.missedCall) {
        const misscall_duration = this.parametersForm.get('misscall_duration');
        misscall_duration.setValidators([Validators.required]);
        misscall_duration.updateValueAndValidity();
      }
    }
    else {
      this.clearValidator('callerId');
      this.clearValidator('type');
      this.clearValidator('rbmAgent');
      this.clearValidator('whatsappBusinessNumber');
      this.clearValidator('misscall_duration');
      this.parametersForm.get('senderId').setValidators([Validators.required]);
      this.parametersForm.get('senderId').updateValueAndValidity();
      this.parametersForm.get('messageType').setValidators([Validators.required]);
      this.parametersForm.get('messageType').updateValueAndValidity();
    }
    if (this.messageQuota) {
      var mapObj = {
        '{{quota}}': this.messageQuota == '100000000' ? this.setRateLimitMessageUnlimited : this.messageQuota,
      };
      this.messageQuotaText = this.messageQuotaOriginalText;
      this.messageQuotaText = this.common.getUpdatedTranslatedVariables(this.messageQuotaText, /{{quota}}/gi, mapObj)
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.parametersForm.controls[fieldName].errors && this.parametersForm.controls[fieldName].errors[errorType]) {
      return this.sendCampaignData && this.parametersForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  getCategory(value?, search?, eventFromSearchAjax?) {
    this.createCampaignService.getCampaignCategoryAjax(25, search, 1).subscribe((res: any) => {
      if (!eventFromSearchAjax) {
        this.campaignCategoryList = res.data;
        if (value) {
          this.campaignCategoryList.forEach(el => {
            if (el._id == value.data._id) {
              this.categorySelectText = el.name;
              this.parametersForm.get('campaignCategory').setValue(value?.data?._id);
              this.selectorInputValue['campaignCategory'] = this.parametersForm?.value['campaignCategory']
              this.sendSelectorInputValue.emit(this.selectorInputValue)
              this.sendCategory.emit(this.categorySelectText);
            }
          });
        } else {
          this.createCampaignEmailService.setEmailData.next(true);
        }
      } else {
        this.campaignCategoryList = res.data;
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
    this.sendLoaderState.emit(this.loaderSpinner)
    this.createCampaignService.createCampaignCategory(request).subscribe((res: any) => {
      if (res['success']) {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner)
        this.getCategory(res);
        // this.common.openSnackBar(res['message'], 'success');
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner)
        this.common.openSnackBar(res['message'], 'error');
      }
    },
      err => {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner)
        this.common.openSnackBar(err['error']['data']['errors']['name'], 'error');
      })
  }

  selectActionRecive(item, key, defaultSender?, isEdit = false, ddChangedFromUi = false) {
    if (key == 'campaignCategory') {
      this.categorySelectText = item.name ? item.name : this.translatedObj['campaign.select-text'];
      this.parametersForm.get(key).setValue(item._id ? item._id : '');
      this.sendCategory.emit(this.categorySelectText);
      this.ajaxItem = {};
      if (item.ajax) {
        this.ajaxItem = item
        item = this.ajaxItem.item
      }
      if (this.ajaxItem.ajax) this.getCategory('', '',);

    }
    else if (key == 'senderId') {
      // comments for bug - INF-2820
      // let items=item;

      // if(item.ajax){
      //   item=item.item;
      //   this.updateSenderList(items.search,items.senders);
      // }
      this.ajaxItem = {};
      if (item.ajax) {
        this.ajaxItem = item
        item = this.ajaxItem.item
      }
      if (this.parametersForm.get('senderId').value) {
        let existingSenderId = this.senderId.find(e => {
          if (e.sender == this.parametersForm.get('senderId').value) {
            return e
          }
        })
        if (this.isDltUser || (this.config && this.config.workflow)) {
          if (item) {
            if ((item.id == existingSenderId && existingSenderId.id)) {
              return
            }
            else {
              this.openDialog(`${this.dltSenderIdChanged}`, `${this.commonConfirmText}`, 'confirm', (e) => {
                if (e) {
                  let data = {
                    type: 'senderName',
                    action: 'senderPopUpEvent',
                    value: this.senderName,
                    data: item
                  }
                  this.sendParametersData.emit(data)
                  this.updateMessageValues(item, key);
                }
                else {
                  this.updateMessageValues(existingSenderId, key);
                  return
                }
              })
            }
          }
          else {
            let data = {
              type: 'senderName',
              action: 'senderPopUpEvent',
              value: this.senderName,
              data: item,
              param: 'no-validate'
            }
            this.sendParametersData.emit(data)
            this.updateMessageValues(item, key);
          }
        }
        else {
          if (existingSenderId && existingSenderId['type'] != item['type']) {
            if (item && !defaultSender) {
              let changeSenderIdText = '';
              var mapObj = {
                '{{existingSenderType}}': existingSenderId['type'],
                '{{updatedSenderType}}': item['type']
              };
              changeSenderIdText = this.common.getUpdatedTranslatedVariables(this.changeSenderPopupText1, /{{updatedSenderType}}|{{existingSenderType}}/gi, mapObj)
              this.openDialog(`${changeSenderIdText}`, `${this.commonConfirmText}`, 'confirm', (e) => {
                if (e) {
                  let data = {
                    type: 'senderName',
                    action: 'senderPopUpEvent',
                    value: this.senderName,
                    data: item
                  }
                  this.sendParametersData.emit(data)
                  this.updateMessageValues(item, key);
                }
                else {
                  this.updateMessageValues(existingSenderId, key);
                  return
                }
              })
            }
            if (item && defaultSender) {
              let data = {
                type: 'senderName',
                action: 'senderPopUpEvent',
                value: this.senderName,
                data: item
              }
              this.sendParametersData.emit(data)
              this.updateMessageValues(item, key);
            }
            else {
              let data = {
                type: 'senderName',
                action: 'senderPopUpEvent',
                value: this.senderName,
                data: item,
                param: 'no-validate'
              }
              this.sendParametersData.emit(data)
              this.updateMessageValues(item, key);
            }
          }
          else {
            let data = {
              type: 'senderName',
              action: 'senderPopUpEvent',
              value: this.senderName,
              data: item
            }
            this.sendParametersData.emit(data)
            this.updateMessageValues(item, key);
          }
        }
      }
      else {
        let data = {
          type: 'senderName',
          action: 'senderPopUpEvent',
          value: this.senderName,
          data: item
        }
        this.sendParametersData.emit(data)
        this.updateMessageValues(item, key);
      }
      let data = {
        type: 'senderName',
        action: 'dropDownEvent',
        value: this.senderName,
        data: item
      }
      this.sendParametersData.emit(data)
      this.updateMessageValues(item, key);
      if (this.ajaxItem.ajax) this.updateSenderList('', '', '', false, 'noCall');
      if (this.config && this.config.workflow) {
        let data = {
          name: item.sender,
          type: item.type
        }
        this.createCampaignService.setInsertTemplate(data);
      }
      this.createCampaignService.senderId.next(data);
    }
    else if (key == 'whatsappBusinessNumber') {
      if (!item) {
        this.noMessageQuotaEvent.emit(true)
      }
      this.whatsAppBusinessNumberText = item.waba_number ? item.waba_number : this.translatedObj['campaign.select-text'];
      this.parametersForm.get(key).setValue(item.waba_number ? item.waba_number : '');
      this.sendWhatsappBusinessNumber.emit(item);
    } else if (key == 'callerId') {
      this.callerIdText = item.name ? item.name : this.translatedObj['campaign.select-text'];
      this.parametersForm.get(key).setValue(item.value ? item.value : '');
    } else if (key == 'type') {
      if (this.config?.email) {
        if (this.disable_open_tracking && this.disable_click_tracking && item.value != 'regular') {
          this.common.openSnackBar("You don't have permission to create split campaigns", "error")
          return;
        }
      }
      if (this.config?.voice) {
        this.typeSelectText = item.label ? item.label : this.translatedObj['campaign.select-text'];
        this.parametersForm.get(key).setValue(item.key ? item.key : '');
      }
      else {
        this.typeSelectText = item.name ? item.name : this.translatedObj['campaign.select-text'];
        this.parametersForm.get(key).setValue(item.value ? item.value : '');
      }
      if (this.config?.email) {
        if (this.campaignData?.content) {
          this.campaignData.content = [];
        }
        this.showDdForEmailVarient = item.show_variant;
        this.parametersForm.get('variation').setValue(null);
        this.testEmailVarientForSelectText = null;
        if (item.show_variant) {
          this.parametersForm.get('variation').setValidators([Validators.required]);
        } else {
          this.parametersForm.get('variation').clearValidators();
        }
        this.parametersForm.get('variation').updateValueAndValidity();
        this.sendEmailType.emit({ text: this.typeSelectText, show_variant: this.showDdForEmailVarient })
        this.createCampaignEmailService.emailCampaignType.next(item);
      }
    }
    else if (key == 'rbmAgent') {
      this.rbmSelectText = item.label ? item.label : this.translatedObj['campaign.select-text'];
      this.parametersForm.get(key).setValue(item.id ? item.id : '');
      let data = {
        type: key,
        data: item
      }
      this.sendParametersData.emit(data)
      this.createRcsCampaignService.setRbmData.next(item ? item : { name: '' });
    }
    else if (key == 'variation') {
      if (this.campaignData?.content) {
        this.campaignData.content = [];
      }
      this.testEmailVarientForSelectText = item.name ? item.name : this.translatedObj['campaign.select-text'];
      this.parametersForm.get(key).setValue(item.value ? item.value : '');
      this.createCampaignEmailService.emailCampaignVariation.next(item);
      this.sendEmailTestVarientFor.emit(this.testEmailVarientForSelectText)
    } else if (key == 'pri_number') {
      this.PRINumSelectText = item?.number ?? this.editCampaignData?.pri_number;
      this.parametersForm.get('pri_number').setValue(item?.number ?? this.editCampaignData?.pri_number);
      this.parametersForm.get('did_number').setValue('');
      this.DidNumSelectText = ''
      this.fetchDidNumberList(this.PRINumSelectText, this.isEdit, ddChangedFromUi);
    } else if (key == 'did_number') {
      this.DidNumSelectText = ddChangedFromUi ? (item?.did_number ?? "") : (item?.did_number ?? this.editCampaignData?.did_number);
      this.didNumberId = item?.id
      this.parametersForm.get(key).setValue(ddChangedFromUi ? (item?.did_number ?? "") : (item?.did_number ?? this.editCampaignData?.did_number));
      if (item?.id) {
        this._missedCallCampaignService.userDidExpiryDate(item?.id).subscribe((res: any) => {
          if (res['data']?.[0]?.expiry_date) {
            this._missedCallCampaignService.setExpiryDate(res['data'][0]['expiry_date'])
          }
        })
      }
      this.fetchVMNTollfreeNumberList('VMN', this.isEdit)
    } else if (key == 'misscall_duration') {
      this.callDurationSelectText = item && item[key];
      this.parametersForm.get(key).setValue(item && item[key]);
    } else if (key == 'vmn_tollfree') {
      this.VMNTFNSelectText = item?.number ?? this.editCampaignData?.vmn_tollfree;
      this.parametersForm.get(key).setValue(item?.number ?? this.editCampaignData?.vmn_tollfree);
    } else if (key == 'tc_number') {
      this.tcSelectText = item.tc_number;
      this.parametersForm.get(key).setValue(item.tc_number);
      this.sendTcNumber.emit(item);
    } else if (key == 'messagecategory') {
      this.messageCategorySelectText = item.name;
      this.parametersForm.get(key).setValue(item.value);
    }
    this.selectorInputValue[key] = this.parametersForm?.value[key];
    this.sendSelectorInputValue.emit(this.selectorInputValue)
  }

  // comments for bug - INF-2820
  // getSenderId(type?) {
  //   this.createCampaignService.getSenderId(type).subscribe((res: any) => {
  //     this.senderId = res.data
  //     if (this.senderId && this.senderId.length > 0) {
  //       this.senderId.forEach(e => {
  //         if (e.is_default == 1) {
  //           this.selectActionRecive(e, 'senderId', 'defaultSender');
  //         }
  //       })
  //     }
  //   })
  // }

  updateSenderList(search?, senders?, type?, eventFromSearchAjax = false, noCall?) {
    this.createCampaignService.getSenderIdAjax(25, search, 1, senders, type ? type : this.senderType).subscribe((res: any) => {
      if (!eventFromSearchAjax) {
        this.senderId = res.data;
        if (!this.smsWorkflowData?.sender_id && !noCall && this.senderId && this.senderId.length > 0) {
          this.senderId.forEach(e => {
            if (e.is_default == 1) {
              this.selectActionRecive(e, 'senderId', 'defaultSender');
            }
          })
        }
      } else {
        this.senderId = res.data;
        // this.createCampaignService.setUpdateAjaxData(res);
      }
      if (this.config && this.config.workflow) {
        this.setWorkflowData(this.smsWorkflowData, eventFromSearchAjax)
      }
    })
  }

  updateMessageValues(item, key) {
    this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
    this.parametersForm.get(key).setValue(item.id ? item.id : '');
    if (!this.parametersForm.get(key).value) {
      this.senderName = '';
      this.senderType = '';
      let data = {
        type: 'senderName',
        action: 'noValue',
        value: this.senderName
      }
      this.sendParametersData.emit(data)
    }
    if (this.senderId && this.senderId.length) {
      this.senderId.forEach(res => {
        if (res.id == this.parametersForm.get('senderId').value) {
          this.senderName = res.sender;
          this.senderType = res.type;
          let data = {
            type: this.senderType,
            action: 'messageValue',
            value: this.senderName
          }
          this.sendParametersData.emit(data)
        }
      })
    }
  }

  changeCampaignType(event) {
    let value = this.parametersForm.get('messageType').value;
    if (value) {
      if (event.target.value != this.parametersForm.get('messageType').value) {
        this.openDialog(`${this.changeCampaignTypeText}`, `${this.commonConfirmText}`, 'confirm', (e) => {
          if (e) {
            this.senderIdSelectText = '';
            this.parametersForm.get('senderId').setValue(null)
            let data = {
              type: 'campaignName',
              action: 'resetValues',
              value: event
            }
            this.sendParametersData.emit(data)
            this.parametersForm.get('messageType').setValue(event.target.value)
          }
          else {
            this.parametersForm.get('messageType').setValue(value);
            let data = {
              type: 'campaignType',
              action: 'resetValues',
              value: value
            }
            this.sendParametersData.emit(data)
          }
        })
      }
    }
  }

  getEvent() {
    let data = {
      type: 'messageType',
      action: 'messageTypeChanged',
      value: this.parametersForm.get('messageType').value
    }
    this.sendParametersData.emit(data)
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

  receivedLoaderState(value) {
    this.loaderSpinner = value;
  }

  validateText(event) {
    let campaignNameElement = this.parametersForm.get('campaignName');
    campaignNameElement.setValue(campaignNameElement.value.replace(/[,%\\\/\*\?"'`&<>|\.\[\]]/g, ''));
    this.selectorInputValue['campaignName'] = campaignNameElement.value.replace(/[,%\\\/\*\?"'`&<>|\.\[\]]/g, '');
    this.sendSelectorInputValue.emit(this.selectorInputValue);
  }

  clearValidator(key) {
    if (this.parametersForm.get(key)) {
      this.parametersForm.get(key).clearValidators();
      this.parametersForm.get(key).updateValueAndValidity();
    }
  }

  ngOnDestroy() {
    this.campaignData = null;
    this.stop.next();
    this.stop.complete();
  }

  setDataForInCaseOfEmail() {
    if (this.campaignData) {
      // Setting Category
      this.categorySelectText = this.campaignData?.category_name;
      this.parametersForm.get('campaignCategory').setValue(this.campaignCategoryList?.find(c => { if (c.name === this.campaignData?.category_name) { return c._id } }))

      // Setting Type
      let Type = this.emailCampaignType.find(c => (c.value === this.campaignData?.type));
      this.typeSelectText = Type ? Type.name : this.translatedObj['campaign.select-text'];
      this.parametersForm.get('type').setValue(this.campaignData?.type);
      if (Type) {
        this.createCampaignEmailService.emailCampaignType.next(Type);
      }
      this.showDdForEmailVarient = Type ? Type.show_variant : false;
      this.sendEmailType.emit({ text: this.typeSelectText, show_variant: this.showDdForEmailVarient });

      // Setting Variation
      if (Type && !Type.show_variant) {
        this.parametersForm.get('variation').setValue(null);
        this.testEmailVarientForSelectText = null;
        this.parametersForm.get('variation').clearValidators();
      } else {
        this.parametersForm.get('variation').setValidators([Validators.required]);
        this.parametersForm.get('variation').setValue(this.campaignData?.variation);
        let Variation;
        this.emailCampaignVarientTestFor.forEach(variation => {
          if (variation.value === this.campaignData.variation) {
            Variation = variation;
          }
        })
        this.testEmailVarientForSelectText = Variation?.name;
        this.createCampaignEmailService.emailCampaignVariation.next(Variation);
      }
      this.parametersForm.get('variation').updateValueAndValidity();
    } else {
      this.campaignData = this.campaignData
    }

  }

  setWorkflowData(data, eventFromSearchAjax) {
    if (data.sender_id) {
      let item = this.senderId.find(e => e.id == data.sender_id)
      // this.selectActionRecive(this.senderId.find(e => e.id == data.sender_id), 'senderId');
      if (item) {
        this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
        this.parametersForm.get('senderId').setValue(item.id ? item.id : '');
        this.senderName = item.sender ? item.sender : ''
      }
      else {
        this.senderIdSelectText = data.senderName
        this.parametersForm.get('senderId').setValue(data.sender_id);
        this.senderName = this.senderIdSelectText
        this.senderType = data.senderType
      }
      let obj = {
        type: 'senderName',
        action: 'noValue',
        value: this.senderName,
        data: item ? item : { id: this.parametersForm.get('senderId').value, sender: this.senderIdSelectText, type: this.senderType }
      }
      this.sendParametersData.emit(obj)
    }
    else {
      if (!eventFromSearchAjax) {
        this.senderIdSelectText = this.translatedObj['campaign.select-text'];
        this.parametersForm.get('senderId').setValue('');
        this.senderId.forEach(e => {
          if (e.is_default == 1) {
            this.senderIdSelectText = e.sender ? e.sender : this.translatedObj['campaign.select-text'];
            this.parametersForm.get('senderId').setValue(e.id ? e.id : '');
            let obj = {
              type: 'senderName',
              action: 'noValue',
              value: this.senderName,
              data: e
            }
            this.sendParametersData.emit(obj)
          }
        })
      }
    }

  }

  fetchDidNumberList(number, isEdit = false, ddChangedFromUi = false) {
    this._missedCallCampaignService.getDidNumberList(number).subscribe((res: any) => {
      if (res['success']) {
        this.DidNumData = res['data']['items'];
        if (isEdit) {
          let Data = this.DidNumData.find(x => x?.did_number == this.editCampaignData?.did_number)
          this.selectActionRecive(Data, 'did_number', '', isEdit, ddChangedFromUi)
        }
      }
    })
  }

  fetchPRINumberList(isEdit = false) {
    this._missedCallCampaignService.getPRINumberList().subscribe((res: any) => {
      if (res['success']) {
        this.PRINumData = res['data'];
        if (isEdit) {
          let Data = this.PRINumData.find(x => x?.number == this.editCampaignData?.pri_number)
          this.selectActionRecive(Data, 'pri_number', '', isEdit)
        }
      }
    })
  }

  fetchVMNTollfreeNumberList(type?, isEdit = false) {
    if (this.didNumberId) {
      this._missedCallCampaignService.getVmnTfnNumbersfromDID(this.didNumberId).subscribe((res: any) => {
        if (res['success']) {
          this.VMNTollfreeData = res['data'];
          let _Number = this.VMNTollfreeData?.[0]?.number ?? "";
          this.parametersForm.get('vmn_tollfree').setValue(_Number);
          this._missedCallCampaignService.setVMNTollFreeNumber(this.VMNTollfreeData[0])
          if (isEdit) {
            this.editCampaignData.vmn_tollfree = _Number;
            let Data = this.VMNTollfreeData.find(x => x.number == this.editCampaignData?.vmn_tollfree)
            this.selectActionRecive(Data, 'vmn_tollfree')
          }
        }
      })
    }
  }

  configureVMNTollfree(e) {
    this.showConfigureVMNTollfree = !this.showConfigureVMNTollfree;
    if (e.checked) {
      // this.parametersForm.get('pri_number').clearValidators()
      // this.parametersForm.get('pri_number').updateValueAndValidity();
      // this.parametersForm.get('did_number').clearValidators()
      // this.parametersForm.get('did_number').updateValueAndValidity();
      this.parametersForm.get('vmn_tollfree').setValidators([Validators.required]);
      this.parametersForm.get('vmn_tollfree').updateValueAndValidity();

    } else {
      this.VMNTFNSelectText = '';
      this.parametersForm.get('vmn_tollfree').setValue('');
      // this.parametersForm.get('did_number').setValidators(Validators.required)
      // this.parametersForm.get('pri_number').setValidators(Validators.required)
      this.parametersForm.get('vmn_tollfree').clearValidators();
      this.parametersForm.get('vmn_tollfree').updateValueAndValidity();
    }
    this.parametersForm.get('vmn_toll_free_flag').setValue(e.checked ? 1 : 0);
    this.fetchVMNTollfreeNumberList('VMN');
  }

  getTypeList() {
    this.createCampaignService.typeList('voice OBD').subscribe((res: any) => {
      this.typeList = res.data
    })
  }
  selectVMNTollfree(e: any) {
    this.VMNTFNSelectText = '';
    this.parametersForm.get('vmn_tollfree').setValue('');
    this.fetchVMNTollfreeNumberList(e['value']);
    this.vmnTfndropdownValue = e['value']
  }

}
