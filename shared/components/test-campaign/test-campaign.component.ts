import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as VoiceCreateCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as CreateRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CreateCampaignService as CreateTruecallerCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';

const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);

@Component({
  selector: 'app-test-campaign',
  templateUrl: './test-campaign.component.html',
  styleUrls: ['./test-campaign.component.css']
})
export class TestCampaignComponent implements OnInit, OnChanges, OnDestroy {

  hasTestData: boolean = false;
  @Input() isKsaUser: any;
  testCampaignForm: FormGroup;
  @Input() sendCampaignData: any;
  invalidTestSmsEntry: boolean = false;
  invalidTestSmsEntryInput: boolean = false;
  testMessage: any = '';
  validateFormText: any;
  @Input() campaignId: any;
  invalidNumberRegex = /^[\+]?(\d\-?){8,15}\d$/;
  @Input() isDltUser: any;
  loaderSpinner: boolean = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  @Input() senderType: any;
  @Input() messageType: any;
  campaignName: any;
  senderId: any;
  IsNonEnglish: any;
  textMessage: any;
  @Input() templateId: any;
  @Input() contentType: any;
  @Input() dltTemplateId: any;
  @Input() urlFormValue: any;
  @Input() urlType: any;
  @Input() messageClassification: any;
  @Output() sendCampaignDataVar = new EventEmitter<any>();
  stop = new Subject<void>();
  textVnFormatRegex = new RegExp(/\{[V][0-9]*\}/g);
  @Input() config: any
  parametersRes: any;
  @Input() contactCount: any;
  translatedObj: any;
  allPersonalisedRequired: any;
  uploadMediaError: any;
  @Input() rbmAgentList: any;
  @Input() createData: any;
  hasPermissions = permissions;
  @Input() isExcludeFreqCappingChecked: any
  templateType;
  variableArray;
  templateTypeFromJson;
  @Input() selectorData: any;
  @Input() stepCount: any;
  carouselCardMediaUploadError;
  @Input() mediaTypeAndLangData: any;

  constructor(public createCampaignService: CreateCampaignService, public fb: FormBuilder, public common: CommonService, public translate: TranslateService, public createWhatsappCampaignService: WACreateCampaignService, public createRcsCampaignService: CreateRcsCampaignService, public createVoiceCampaignService: VoiceCreateCampaignService,
    public truecallerCampaignService: CreateTruecallerCampaignService
  ) {

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        if (this.translatedObj) {
          this.allPersonalisedRequired = this.translatedObj['campaign.personalise-msg-error'];
          this.uploadMediaError = this.translatedObj['campaign.upload-media-error'];
          this.carouselCardMediaUploadError = this.translatedObj['campaign.whatsapp-carousel-card-media-upload-error'];
        }
      }
    })

    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {

      this.testCampaignForm.reset();
      this.hasTestData = false;
      this.testMessage = '';
    })

    this.testCampaignForm = this.fb.group({
      typedContacts: ['', [Validators.maxLength(100)]]
    });

    this.createCampaignService.getValidateCampaignData().pipe(takeUntil(this.stop)).subscribe(res => {

      this.testCampaignForm.get('typedContacts').clearValidators();
      this.testCampaignForm.get('typedContacts').updateValueAndValidity();
    })

    translate.stream(['campaigns.change-sender-popup-prompt-message1', 'campaigns.change-campaign-type-popup-message', 'common.please-confirm-text', 'campaign.validate-slot-time-schedule-text1', 'campaign.validate-slot-time-schedule-text2', 'campaign.personal-message-classification-text1', 'campaign.validate-slot-time-send-text1', 'common.validate-form-text', 'campaign.sender-id-text', 'campaign.default-text-preview', 'campaign.select-text', 'campaign.message-classification-type-promotional-blacklist', 'campaign.message-classification-type-awareness', 'campaign.message-classification-type-service', 'campaign.message-classification-type-warning', 'campaign.message-classification-type-personal', 'campaign.message-classification-type-transactional-whitelist', 'campaign.validate-slot-time-no-schedule-rights-text']).subscribe((text) => {
      this.validateFormText = text['common.validate-form-text']
    });

    this.createCampaignService.getParametersValue().pipe(takeUntil(this.stop)).subscribe((res: any) => {

      this.parametersRes = res;
      this.campaignName = res['campaignName']
      this.senderId = res['senderId']
      this.createCampaignService.setEventToGetTextMessage({ test: true });
    })
    this.createCampaignService.getTextMessageValue().pipe(takeUntil(this.stop)).subscribe(res => {
      this.IsNonEnglish = res['IsNonEnglish'];
      this.textMessage = res['text']
      this.CheckTestMessage(res);
    })

    this.createWhatsappCampaignService.getTextMessageValue().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.IsNonEnglish = res['IsNonEnglish'];
      this.textMessage = res['body']
      this.CheckTestMessage(res);
    });

    this.createRcsCampaignService.getTextMessageValue().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.IsNonEnglish = res['IsNonEnglish'];
      this.textMessage = res['text'];
      this.CheckTestMessage(res);
    });

    this.truecallerCampaignService.getTextMessageValue().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        this.IsNonEnglish = res['IsNonEnglish'];
        this.textMessage = res['text'];
        this.CheckTestMessage(res);
      }
    });
    this.createCampaignService.getTemplateDetails().pipe().subscribe((res) => {
      this.templateTypeFromJson = res;
    });
  }

  ngOnInit(): void {
  }

  testCampaign(event) {
    if (event.target.value == '') {
      this.hasTestData = false;
    }
    else {
      this.hasTestData = true;
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.testCampaignForm.controls[fieldName].errors && this.testCampaignForm.controls[fieldName].errors[errorType]) {
      return this.sendCampaignData && this.testCampaignForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  sendTestCampaign() {
    this.createCampaignService.setTestCampaignEvent(true);
    this.testMessage = '';
    this.testCampaignForm.get('typedContacts').setValidators([Validators.required]);
    this.testCampaignForm.get('typedContacts').updateValueAndValidity();
    this.sendCampaignData = true;
    this.sendCampaignDataVar.emit(this.sendCampaignData);
    if (this.testCampaignForm.invalid) {
      this.common.openSnackBar(this.validateFormText, 'error');
      return;
    }
    this.createCampaignService.setEventToGetParametersFormValue(true);
  }

  CheckTestMessage(data?) {


    if (!this.campaignName || (this.campaignName && this.campaignName.length < 6 || this.campaignName.length > 100)
      || !this.parametersRes['campaignCategory']
      || (this.config && !this.config.voice && !this.contactCount)
      || (this.config && this.config.whatsapp && (!this.parametersRes['whatsappBusinessNumber'] || !data['body']))
      || ((!this.config || (this.config && this.config.sms)) && (!this.parametersRes['senderId'] || !this.parametersRes['messageType'] || !data['text']))
      || (this.config && this.config.rcs && ((!this.parametersRes['rbmAgent']) || (data.fallback_enabled && (!data.fallback_config.sender_id || !data.fallback_config.template_id || !data.fallback_config.text))))
      || (this.config && this.config.voice && (!this.parametersRes['type'] || !this.parametersRes['callerId'] || (!data || (data && !data.selectedTemplate))))
      || (this.config && this.config.truecaller && (!this.parametersRes['messagecategory'] || !this.parametersRes['tc_number'] || !data['text'] || data['invalid_action_data']))) {
      this.common.openSnackBar(this.validateFormText, 'error');
      return;
    }

    if (this.config && this.config.voice) {
      let incompleteWidgets = this.createVoiceCampaignService.validateDataBeforeSubmitting(data);
      if (incompleteWidgets.length) {
        let txt = '';
        incompleteWidgets.forEach((e, i) => {
          txt += e.id + ((i == (incompleteWidgets.length - 1)) ? '' : ' ,');
        })
        if (incompleteWidgets.length == 1) {
          this.common.openSnackBar(`Widget id(s):- ${txt} is missing`, 'error');
        } else {
          this.common.openSnackBar(`Widget id(s):- ${txt} are incomplete`, 'error');
        }
        return;
      }
    }

    let request: any;
    if (this.config && this.config.whatsapp) {
      if (this.checkButtonsVariables(data.variables, data.button_info).length && data.notAllVariablesPersonalised) {
        this.common.openSnackBar(this.allPersonalisedRequired, 'error');
        return;
      }

      if (data.hasMedia && !data.hasMediaUploaded) {
        this.common.openSnackBar(this.uploadMediaError, 'error');
        return;
      }

      if (!data?.media_uploaded_for_all_card && this.mediaTypeAndLangData.media_type === 'carousel') {
        this.common.openSnackBar(this.carouselCardMediaUploadError, 'error');
        return;
      }

      request = {
        "campaign_id": this.campaignId,
        "campaign_name": this.campaignName,
        "country_code": this.parametersRes.whatsappBusinessNumber.split('-')[0].replace('+', ''),
        "waba_number": this.parametersRes.whatsappBusinessNumber.split('-')[1],
        "template_id": data.templateId ? data.templateId : '',
        "service_template_id": data.service_template_id ? data.service_template_id : '',
        "content_type": data.content_type ? data.content_type : null,
        "header_text": data.headerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(data.headerText, textHnFormatRegex)), data.IsNonEnglish ? true : false) : null,
        "footer_text": data.footerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(data.footerText, textFnFormatRegex)), data.IsNonEnglish ? true : false) : null,
        "body": data.body ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeVarFormText(data.body, textVnFormatRegex)), data.IsNonEnglish ? true : false) : null,
        "url": data.uploadFromUrl ? data.uploadFromUrl : (data.columnUrl ? data.columnUrl : null),
        "url_type": data.uploadFromUrl ? 'text' : (data.columnUrl ? 'column' : null),
        "media_id": data.mediaId ? data.mediaId : null,
        "button_info": (data.button_info && data.button_info.length > 0) ? this.reformatButtonsArr(data.button_info) : null,
        "is_unicode": data ? data.IsNonEnglish : [],
        "type": (data.personalisedHeader || data.personalisedButton || data.personalisedBody) ? 'personalised' : 'common',
        "header_text_personalised": data.personalisedHeader,
        // "button_info_personalised": data.personalisedButton,
        "media_type": data.media ? data.media : null,
        "header_type": data.header,
        "language": data.language ? data.language : null,
        "template_name": data.templateName ? data.templateName : null,
        "category_name": this.parametersRes && this.parametersRes.categorySelectText ? this.parametersRes.categorySelectText : null,
        "exclude_frequncy_capping": this.isExcludeFreqCappingChecked ? this.isExcludeFreqCappingChecked : false,
        "buttons_info": data.buttons_info
      }
      if (data.fileName) {
        request['file_name'] = data.fileName;
      }
      let obj = {};
      if (data.variablesDetails && data.variablesDetails.length) {
        data.variablesDetails.forEach(e => {
          if (/\{\{[V][0-9]*\}\}/g.test(e.actualVar)) {
            obj[e.actualVar.replace(/\{\{|\}\}/g, '')] = e.personalizedUrl ? (this.urlType == 'text' ? (e.personalizedUrl.includes('##') ? e.personalizedUrl : '##' + e.personalizedUrl + '##') : e.personalizedUrl) : e.personalizedVar
          }
        })
      }
      // if (data.variablesData && data.variablesData.length > 0) {
      //   data.variablesData.forEach(e => {
      //     obj[e.variable] = e.urlValue ? (this.urlType == 'text' ? (e.urlValue.includes('##') ? e.urlValue : '##'+e.urlValue+'##') : e.urlValue) : e.PersonalizedValue
      //   })
      // }
      request['personalized_column'] = obj
      if (data && data.urlFormValue && data.urlFormValue.selectedForm) {
        request['form_id'] = data.urlFormValue.selectedForm
      }
      if (data?.carousel?.length) {
        request['carousel'] = data.carousel;
      }
    }
    else if (this.config && this.config.rcs) {
      request = {
        "campaign_id": this.campaignId,
        "campaign_name": this.campaignName,
        "agent_id": this.parametersRes['rbmAgent'],
        "agent_name": this.getRbmAgentId(this.rbmAgentList, 'name'),
        "rbm_agent_id": this.getRbmAgentId(this.rbmAgentList),
        "message": {},
        "is_unicode": data ? data.IsNonEnglish : false,
        // "type": data.personalised ? 'Personalised' : 'Common',
        "exclude_frequncy_capping": this.isExcludeFreqCappingChecked ? this.isExcludeFreqCappingChecked : false,
        "template_name": data['template_name'] ? data['template_name'] : '',
        "category_name": this.parametersRes['categorySelectText'],
        "variables_name": data['variablesName'],
        fallback_enabled: data['fallback_enabled'],
        fallback_config: data['fallback_config'],
        fallback_channel: data['fallback_channel']
      }
    }

    /////Voice Part//////
    else if (this.config && this.config.voice) {
      if (data["is_only_latching"] == 1) this.setSourceDestinationInSmsInCaseOfOnlyLatching(data);
      request = {
        campaign_id: this.campaignId,
        name: this.parametersRes["campaignName"],
        category_name: this.parametersRes["categorySelectText"],
        campaign_type: this.parametersRes["type"],
        caller_id: this.parametersRes["callerId"],
        template_id: data["templateId"],
        template_name: data["templateName"],
        clip_id: data["clip_id"],
        clip_name: data["clip_name"],
        meta_data: data["meta_data"] ? data["meta_data"] : null,
        tts_schema: data["tts_schema"] ? data["tts_schema"] : null,
        tts_headers: data["tts_headers"],
        sms_headers: data["sms_headers"],
        is_unicode: data ? data.IsNonEnglish : [],
        type: data["type"],
        language: data.language ? data.language : null,
        is_only_latching: data["is_only_latching"],
        is_recipient_first: data["is_recipient_first"],
        sms_success_configuration: (data["sms_success_configuration"]) ? data["sms_success_configuration"] : "",
        sms_failure_configuration: (data["sms_failure_configuration"]) ? data["sms_failure_configuration"] : "",
        send_msg_flag: data["send_msg_flag"],
        call_latching: !data["selectedTemplate"].call_flow_type ? 0 : 1,
        is_tts_exist: data["selectedTemplate"]["is_tts_exist"],
        exclude_frequncy_capping: this.isExcludeFreqCappingChecked ? this.isExcludeFreqCappingChecked : false,
        is_tts_first: data["is_tts_first"],
      };
      if (data['call_center_number_type'] == '1') {
        if (data['call_center_number']) {
          request['call_center_number'] = data['call_center_number']
        }
      }
      if (data['call_center_number_type'] == '2') {
        if (data['call_center_column_name']) {
          request['call_center_column_name'] = data['call_center_column_name']
        }
      }
      if (data["additionalConfiguration"]) {
        if (data['additionalConfiguration']?.pause_stop_campaign_config?.buffer_stop_campaign >= 0) {
          data['additionalConfiguration'].pause_stop_campaign_config = { ...data['additionalConfiguration']?.pause_stop_campaign_config, ...event };
        } else {
          data['additionalConfiguration'].pause_stop_campaign_config = null;
        }
        request = { ...request, ...data["additionalConfiguration"] };
      }
      if (!data["additionalConfiguration"]?.call_retry) {
        request = { ...request, ...{ "call_retry": { no_of_Retry: 0, switch_off: '5', user_busy: '5', no_answer: '5', out_of_network: '5', network_cong: '5', network_busy: '5' } } }
      }
      /* 
      Here change the datatype
      */
      request['meta_data'].forEach(node => {
        if (node.data[0].hasOwnProperty('RepeatNoKeyPrompt') || node.data[0].hasOwnProperty('RepeatInvalidKeyPrompt')) {
          node.data[0].RepeatNoKeyPrompt = node.data[0].RepeatNoKeyPrompt || null;
          node.data[0].RepeatInvalidKeyPrompt = node.data[0].RepeatInvalidKeyPrompt || null;
        } else if (node.data[0].hasOwnProperty('Keypress')) {
          node.data[0].hasOwnProperty('Keypress').forEach(keypress => {
            keypress.value = keypress.value || null;
          })
        }
      })

      if (data?.is_only_voice_clip_flow) {
        let TotalDuration = 0;
        let TotalNodesLength = data["meta_data"].length;
        for (let i = 0; i < TotalNodesLength; i++) {
          if (data["meta_data"][i].widgetType == "voiceclip") {
            if (data["meta_data"][i].data[0].duration != null && data["meta_data"][i].data[0].duration !== '' && data["meta_data"][i].data[0].duration > 0 && data["meta_data"][i].data[0].duration !== undefined) {
              TotalDuration += +data["meta_data"][i].data[0].duration;
            } else {
              break;
            }
          }
        }
        if (request['additionalConfiguration']) {
          request['additionalConfiguration']['max_call_duration'] = (data['additionalConfiguration']['max_call_duration']) ? data['additionalConfiguration']['max_call_duration'] : (TotalDuration > 0 ? TotalDuration : null);
        } else {
          request['additionalConfiguration'] = {};
          request['additionalConfiguration']['max_call_duration'] = TotalDuration > 0 ? TotalDuration : null;
        }
      }

    } else if (this.config && this.config.truecaller) {
      request = {
        "campaign_id": this.campaignId,
        "campaign_name": this.campaignName,
        "tc_number": this.parametersRes.tc_number,
        "category_name": this.parametersRes.categorySelectText,
        "type": this.parametersRes.messagecategory,
        "msgdata": this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeAnchorVarFromHtml()), this.IsNonEnglish ? true : false),
        "action_data": data.action_data,
        fallback_enabled: data['fallback_enabled'],
        fallback_config: data['fallback_config'],
        fallback_channel: data['fallback_channel'],
        "media_type": data?.media_type ? data?.media_type : null,
        "file_name": data?.file_name ? data?.file_name : null,
        "media_id": data?.media_id ? data?.media_id : null,
        "content_type": data?.content_type ? data?.content_type : null,
        is_unicode: data ? data.IsNonEnglish : []
      }
    } else {
      request = {
        "campaign_id": this.campaignId,
        "campaign_name": this.campaignName,
        "sender_id": this.senderId,
        "type": this.messageType,
        "text": this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeAnchorVarFromHtml()), this.IsNonEnglish ? true : false),
        "is_unicode": this.IsNonEnglish ? true : false,
        "max_allowed_length": data.templateLength ? data.templateLength : null,
        "category_name": this.parametersRes && this.parametersRes.categorySelectText ? this.parametersRes.categorySelectText : null
      }
    }
    if (this.config && this.config.sms) {
      request['message_length'] = data['previewValue'] ? data['actualCharacterCount'] : 0
      request['exclude_frequncy_capping'] = this.isExcludeFreqCappingChecked ? this.isExcludeFreqCappingChecked : false
      if (data && data.urlFormValue && data.urlFormValue.selectedForm) {
        request['form_id'] = data.urlFormValue.selectedForm
      }
    }
    let typedContactWithoutSpace: any;
    let finalTypedData: any;
    if (this.testCampaignForm.get('typedContacts').value) {
      if (this.testCampaignForm.get('typedContacts').value.endsWith('\n')) {
        // Remove the last character (newline)
        this.testCampaignForm.get('typedContacts').setValue(this.testCampaignForm.get('typedContacts').value.slice(0, -1))
      }

      typedContactWithoutSpace = (this.testCampaignForm.get('typedContacts').value).split(" ").join("");
      finalTypedData = typedContactWithoutSpace.split(",")
    }
    else {
      finalTypedData = [];
    }
    let arr = [];
    let emptyNumbers = []
    if (finalTypedData && finalTypedData.length > 0) {
      arr = finalTypedData.filter(e => e != '')
      emptyNumbers = finalTypedData.filter(e => e == '')
    }
    if (arr && arr.length == 0) {
      this.invalidTestSmsEntryInput = true;
      return
    }
    if (emptyNumbers && emptyNumbers.length > 0) {
      this.invalidTestSmsEntryInput = true;
      return
    }
    for (let index = 0; index < finalTypedData.length; index++) {
      if (!this.invalidNumberRegex.test(finalTypedData[index])) {
        this.invalidTestSmsEntryInput = true;
        break;
      }
      else {
        this.invalidTestSmsEntryInput = false;
      }
      if (this.invalidTestSmsEntryInput) {
        break
      }

    }
    if (this.invalidTestSmsEntryInput) {
      return
    }

    if (finalTypedData.length > 10) {
      this.invalidTestSmsEntryInput = false;
      this.invalidTestSmsEntry = true;
      return
    }
    else {
      this.invalidTestSmsEntryInput = false;
      this.invalidTestSmsEntry = false;
    }
    request["contacts"] = finalTypedData
    if (this.templateId) {
      request["template_id"] = this.templateId
      if (this.isDltUser) {
        request["content_type"] = this.contentType
        request["dlt_template_id"] = this.dltTemplateId;
      }
    }
    if (this.senderType) {
      request["campaign_type"] = this.senderType
    }
    if (this.isKsaUser) {
      request['message_classification_type'] = this.messageClassification;
    }
    if (this.urlFormValue && this.urlFormValue.domainName) {
      request["domain"] = this.urlFormValue.domainName
      if (this.config && (this.config.whatsapp || this.config?.truecaller)) {
        request["smart_url_type"] = this.urlType
      }
      else {
        request["url_type"] = this.urlType
      }
      let requestedUrl = '';
      if (this.urlType == 'column') {
        requestedUrl = this.urlFormValue.urlFromColumn
      }
      else {
        if (this.urlFormValue || this.urlFormValue.headerName) {
          requestedUrl = this.urlFormValue.originalUrl;
        }
      }
      if (this.config && (this.config.whatsapp || this.config?.truecaller)) {
        request["smart_url"] = requestedUrl
      }
      else {
        request["url"] = requestedUrl
      }
    }
    if (this.urlFormValue && this.urlFormValue.setValidity) {
      if (this.config && (this.config.whatsapp || this.config?.truecaller)) {
        request["smart_url_validity"] = this.common.getYMDDate(this.urlFormValue.urlDate) + ' 23:59:59'
      }
      else {
        request['url_validity'] = this.common.getYMDDate(this.urlFormValue.urlDate) + ' 23:59:59'
      }
    }

    if (this.config && this.config.rcs) {
      let hasOnlyVariable = false;
      let postDataObj = {};
      let personalized_labels = [];
      request.message = {};
      if (data.messageFormValue.messageType === 0) {
        request['message_type'] = 'text';
        if (data.text) {
          request.message['text'] = data.text
        }


        if (data && data.suggestions && data.suggestions.length > 0) {
          request.message['suggestions'] = [];
          data.suggestions.forEach(ev => {
            let postbackArr = ev.postBackData.match(/\[(.*?)\]/g)
            if (postbackArr && postbackArr.length) {
              postbackArr.forEach((postEvent, index) => {
                if (index == 0) {
                  postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = this.createRcsCampaignService.postDataInitial
                }
                else {
                  postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = ''
                }
              })
              // request['type'] = 'Personalised'
            }
            let obj = {}
            obj[ev['buttonText'] ? ev['buttonText'].toLowerCase() : ev['actionButtonText'].toLowerCase()] = {
              "text": ev.text,
              "postbackData": ev.postBackData
            }
            if (ev['actionButtonText']) {
              obj[ev['actionButtonText'].toLowerCase()]['fallBackUrl'] = ev.fallBackUrl
              if (ev['actionTypeSelectText'] == 'Dial') {
                if (ev.phoneNumber) {
                  obj[ev['actionButtonText'].toLowerCase()]['dialAction'] = {
                    "phoneNumber": ev.phoneNumber
                  }
                }
              }

              if (ev['actionTypeSelectText'] == 'View Location') {
                obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction'] = {
                }

                // if (ev.locationBy && ev.locationBy == 'By Query') {
                //   obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['query'] = ev.query
                // }
                // if (ev.locationBy && ev.locationBy == 'By latitude and longitude') {
                  obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['latLong'] = {
                    latitude: Number(ev.latitude),
                    longitude: Number(ev.longitude)
                  }
                  if (ev.label) {
                    obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['label'] = ev.label
                  }
                // }
              }

              if (ev['actionTypeSelectText'] == 'View Location') {
                obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction'] = {
                }
                obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['latLong'] = {
                  latitude: Number(ev?.action?.latitude),
                  longitude: Number(ev?.action?.longitude)
                }
              }

              if (ev['actionTypeSelectText'] == 'Share Location') {
                obj[ev['actionButtonText'].toLowerCase()]['shareLocationAction'] = {
                  'query': ev?.action?.query
                }
              }


              if (ev['actionTypeSelectText'] == 'Open URL') {

                if (ev.url) {
                  obj[ev['actionButtonText'].toLowerCase()]['openUrlAction'] = {
                    url: ev.url
                  }
                }
              }

              if (ev['actionTypeSelectText'] == 'Create Calendar') {
                obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction'] = {
                }
                if (ev?.action?.startDateTime) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['startTime'] = ev?.action?.startDateTime
                }
                if (ev?.action?.endDateTime) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['endTime'] = ev?.action?.endDateTime
                }
                if (ev?.action?.calendarTitle) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['title'] = ev?.action?.calendarTitle
                }
                if (ev?.action?.calendardescription) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['description'] = ev?.action?.calendardescription
                }
              }
            }
            request.message['suggestions'].push(obj)
          })
        }
        if (data.variablesData && data.variablesData.length) {
          data.variablesData.forEach(suggEvent => {
            let type = suggEvent.reply ? 'reply' : 'action'
            if (suggEvent[type] && suggEvent[type].textVariablesDetails && suggEvent[type].textVariablesDetails.length) {
              if (/^\[.*\]$/g.test(suggEvent[type].labelInnerText)) {
                if (!hasOnlyVariable && !this.checkPersonalisedValue(suggEvent, type)) {
                  hasOnlyVariable = true
                }
              }
              if (suggEvent[type].textFinalVarData && suggEvent[type].textFinalVarData.variablesArr) {
                suggEvent[type].textFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].textVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].textVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText, suggEvent, type)
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }
              })
            }
            if (suggEvent[type] && suggEvent[type].urlVariablesDetails && suggEvent[type].urlVariablesDetails.length) {
              if (suggEvent[type].urlFinalVarData && suggEvent[type].urlFinalVarData.variablesArr) {
                suggEvent[type].urlFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].urlVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].urlVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText, suggEvent, type, { is_url: true, is_dial: false })
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }
              })
            }
            if (suggEvent[type] && suggEvent[type].phoneNumberVariablesDetails && suggEvent[type].phoneNumberVariablesDetails.length) {
              if (suggEvent[type].phoneNumberFinalVarData && suggEvent[type].phoneNumberFinalVarData.variablesArr) {
                suggEvent[type].phoneNumberFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].phoneNumberVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].phoneNumberVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'DIAL') + suggEvent[type].phoneNumberInnerText, suggEvent, type, { is_url: false, is_dial: true })
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }
              })
            }
          })
        }

      }
      if (data.messageFormValue.messageType === 1) {
        request['message_type'] = 'Media';
        request['message']['contentInfo'] = {};
        request['message']['contentInfo']['forceRefresh'] = data.messageFormValue.autoRefresh
        if (data.uploadType == 'from url') {
          request['message']['contentInfo']['fileUrl'] = data.messageFormValue.imageUrl
          if (data.messageFormValue.thumbnailUrl) {
            request['message']['contentInfo']['thumbnailUrl'] = data.messageFormValue.thumbnailUrl
          }
        }
        else {
          request['message']['contentInfo']['fileUrl'] = data.uploadedFileData.url
        }
      }
      if (data.messageFormValue.messageType === 2) {
        request['message_type'] = 'rich_media';
        request['message']['richCard'] = {
          "standaloneCard":
          {
            "cardOrientation": data.messageFormValue.cardOrientation,
            "thumbnailImageAlignment": data.messageFormValue.thumbnailAlignment,
            "cardContent":
            {
              "title": data.messageFormValue.title,
              "description": data.descriptionText,
              "media":
              {
                "height": data.messageFormValue.mediaHeight,
                "contentInfo": {}
              }
              ,
              "suggestions": []
            }
          }
        }

        request['message']['richCard']['standaloneCard']['cardContent']['media']['contentInfo']['forceRefresh'] = data.messageFormValue.autoRefresh
        if (data.uploadType == 'from url') {
          request['message']['richCard']['standaloneCard']['cardContent']['media']['contentInfo']['fileUrl'] = data.messageFormValue.imageUrl
          if (data.messageFormValue.thumbnailUrl) {
            request['message']['richCard']['standaloneCard']['cardContent']['media']['contentInfo']['thumbnailUrl'] = data.messageFormValue.thumbnailUrl
          }
        }
        else {
          request['message']['richCard']['standaloneCard']['cardContent']['media']['contentInfo']['fileUrl'] = data.uploadedFileData.url
        }


        if (data && data.suggestions && data.suggestions.length > 0) {
          request.message['richCard']['standaloneCard']['cardContent']['suggestions'] = [];
          data.suggestions.forEach(ev => {
            let postbackArr = ev.postBackData.match(/\[(.*?)\]/g)
            if (postbackArr && postbackArr.length) {
              postbackArr.forEach((postEvent, index) => {
                if (index == 0) {
                  postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = this.createRcsCampaignService.postDataInitial
                }
                else {
                  postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = '';
                }
              })
              // request['type'] = 'Personalised'
            }
            let obj = {}
            obj[ev['buttonText'] ? ev['buttonText'].toLowerCase() : ev['actionButtonText'].toLowerCase()] = {
              "text": ev.text,
              "postbackData": ev.postBackData
            }
            if (ev['actionButtonText']) {
              obj[ev['actionButtonText'].toLowerCase()]['fallBackUrl'] = ev.fallBackUrl
              if (ev['actionTypeSelectText'] == 'Dial') {
                if (ev.phoneNumber) {
                  obj[ev['actionButtonText'].toLowerCase()]['dialAction'] = {
                    "phoneNumber": ev.phoneNumber
                  }
                }
              }

              if (ev['actionTypeSelectText'] == 'View Location') {
                obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction'] = {
                }

                if (ev.locationBy && ev.locationBy == 'By Query') {
                  obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['query'] = ev.query
                }
                if (ev.locationBy && ev.locationBy == 'By latitude and longitude') {
                  obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['latLong'] = {
                    latitude: Number(ev.latitude),
                    longitude: Number(ev.longitude)
                  }
                  if (ev.label) {
                    obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['label'] = ev.label
                  }
                }
              }


              if (ev['actionTypeSelectText'] == 'Open URL') {

                if (ev.url) {
                  obj[ev['actionButtonText'].toLowerCase()]['openUrlAction'] = {
                    url: ev.url
                  }
                }
              }

              if (ev['actionTypeSelectText'] == 'Create Calendar') {
                obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction'] = {
                }
                if (ev.startDateTime) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['startTime'] = ev.startDateTime
                }
                if (ev.endDateTime) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['endTime'] = ev.endDateTime
                }
                if (ev.calendarTitle) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['title'] = ev.calendarTitle
                }
                if (ev.calendardescription) {
                  obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['description'] = ev.calendardescription
                }
              }
            }
            request.message['richCard']['standaloneCard']['cardContent']['suggestions'].push(obj)
          })
        }
        if (data.variablesData && data.variablesData.length) {
          data.variablesData.forEach(suggEvent => {
            let type = suggEvent.reply ? 'reply' : 'action'
            if (suggEvent[type] && suggEvent[type].textVariablesDetails && suggEvent[type].textVariablesDetails.length) {
              if (/^\[.*\]$/g.test(suggEvent[type].labelInnerText)) {
                if (!hasOnlyVariable && !this.checkPersonalisedValue(suggEvent, type)) {
                  hasOnlyVariable = true
                }
              }
              if (suggEvent[type].textFinalVarData && suggEvent[type].textFinalVarData.variablesArr) {
                suggEvent[type].textFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].textVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].textVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText, suggEvent, type)
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }

                // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar 
                // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText)
              })
            }
            if (suggEvent[type] && suggEvent[type].urlVariablesDetails && suggEvent[type].urlVariablesDetails.length) {
              if (suggEvent[type].urlFinalVarData && suggEvent[type].urlFinalVarData.variablesArr) {
                suggEvent[type].urlFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].urlVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].urlVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText, suggEvent, type, { is_url: true, is_dial: false })
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }
                // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText)
              })
            }
            if (suggEvent[type] && suggEvent[type].phoneNumberVariablesDetails && suggEvent[type].phoneNumberVariablesDetails.length) {
              if (/^\[.*\]$/g.test(suggEvent[type]?.phoneNumberInnerText)) {
                if (!hasOnlyVariable && !this.checkPersonalisedValue(suggEvent, type, 'phoneNumberVariablesDetails')) {
                  hasOnlyVariable = true
                }
              }
              if (suggEvent[type].phoneNumberFinalVarData && suggEvent[type].phoneNumberFinalVarData.variablesArr) {
                suggEvent[type].phoneNumberFinalVarData.variablesArr.forEach((e, index) => {
                  if (e.text || e.columnListValue) {
                    if (!e.varTextSeq) {
                      postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                    }
                    else {
                      postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                    }
                  }
                  else {
                    suggEvent[type].phoneNumberVariablesDetails[index].personalizedVar = ''
                  }
                })

              }
              suggEvent[type].phoneNumberVariablesDetails.forEach(resp => {
                if (resp.personalizedVar) {
                  // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'DIAL') + suggEvent[type].phoneNumberInnerText, suggEvent, type, { is_url: false, is_dial: true })
                  if (!personalized_labels.includes(text)) {
                    personalized_labels.push(text)
                  }
                }
                // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'DIAL') + suggEvent[type].phoneNumberInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].phoneNumberInnerText)
              })
            }
          })
        }

      }



      if (data.messageFormValue.messageType === 3) {
        request['message_type'] = 'rich_media';
        request['message']['richCard'] = {
          "carouselCard":
          {
            "cardWidth": data.messageFormValue.cardWidth,
            "cardContents": []
          }
        }

        data.messageFormValue.cards.forEach((ev, index) => {
          request['message']['richCard']['carouselCard']['cardContents'].push({
            title: ev.titleText,
            description: ev.descriptionText,
            media:
            {
              "height": ev.mediaHeight,
              "contentInfo": {}
            }
          })
          request['message']['richCard']['carouselCard']['cardContents'][index]['media']['contentInfo']['forceRefresh'] = ev.autoRefresh
          if (ev.uploadType == 'from url') {
            request['message']['richCard']['carouselCard']['cardContents'][index]['media']['contentInfo']['fileUrl'] = ev.imageUrl
            if (ev.thumbnailUrl) {
              request['message']['richCard']['carouselCard']['cardContents'][index]['media']['contentInfo']['thumbnailUrl'] = ev.thumbnailUrl
            }
          }
          else {
            request['message']['richCard']['carouselCard']['cardContents'][index]['media']['contentInfo']['fileUrl'] = ev.fileUrl
          }



          if (ev.suggestions && ev.suggestions.length > 0) {
            request.message['richCard']['carouselCard']['cardContents'][index]['suggestions'] = [];
            ev.suggestions.forEach(res => {
              if (res.reply) {
                res.reply = { ...res.reply, ...res }
                delete res.reply.reply
              }
              if (res.action) {
                res.action = { ...res.action, ...res }
                delete res.action.action
              }
              let ev: any = res.reply ? res['reply'] : res['action']
              let postbackArr = ev.postbackData.match(/\[(.*?)\]/g)
              if (postbackArr && postbackArr.length) {
                postbackArr.forEach((postEvent, index) => {
                  if (index == 0) {
                    postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = this.createRcsCampaignService.postDataInitial
                  }
                  else {
                    postDataObj[postEvent.replace(/\]/g, '').replace(/\[/g, '')] = '';
                  }
                })
                // request['type'] = 'Personalised'
              }
              let obj = {}
              obj[ev['buttonText'] ? ev['buttonText'].toLowerCase() : ev['actionButtonText'].toLowerCase()] = {
                "text": ev.labelInnerText,
                "postbackData": ev.postbackData
              }
              if (ev['buttonText']) {
                if (ev['buttonText'].toLowerCase() == 'action') {
                  obj[ev['buttonText'].toLowerCase()]['fallBackUrl'] = ev.fallBackUrl
                }
                if (ev['actionTypeSelectText'] == 'Dial') {
                  // obj[ev['buttonText'].toLowerCase()]['dialAction'] = {
                  //   "phoneNumber": ev.phoneNumber
                  // }
                  if (ev.phoneNumberInnerText) {
                    obj[ev['buttonText'].toLowerCase()]['dialAction'] = {
                      url: ev.phoneNumberInnerText
                    }
                  }
                }

                if (ev['actionTypeSelectText'] == 'View Location') {
                  obj[ev['buttonText'].toLowerCase()]['viewLocationAction'] = {
                  }

                  if (ev.locationBy && ev.locationBy == 'By Query') {
                    obj[ev['buttonText'].toLowerCase()]['viewLocationAction']['query'] = ev.query
                  }
                  if (ev.locationBy && ev.locationBy == 'By latitude and longitude') {
                    obj[ev['buttonText'].toLowerCase()]['viewLocationAction']['latLong'] = {
                      latitude: Number(ev.latitude),
                      longitude: Number(ev.longitude)
                    }
                    if (ev.label) {
                      obj[ev['buttonText'].toLowerCase()]['viewLocationAction']['label'] = ev.label
                    }
                  }
                }


                if (ev['actionTypeSelectText'] == 'Open URL') {

                  if (ev.urlInnerText) {
                    obj[ev['buttonText'].toLowerCase()]['openUrlAction'] = {
                      url: ev.urlInnerText
                    }
                  }
                }

                if (ev['actionTypeSelectText'] == 'Create Calendar') {
                  obj[ev['buttonText'].toLowerCase()]['createCalendarEventAction'] = {
                  }
                  if (ev.startDateTime) {
                    obj[ev['buttonText'].toLowerCase()]['createCalendarEventAction']['startTime'] = ev.startDateTime
                  }
                  if (ev.endDateTime) {
                    obj[ev['buttonText'].toLowerCase()]['createCalendarEventAction']['endTime'] = ev.endDateTime
                  }
                  if (ev.calendarTitle) {
                    obj[ev['buttonText'].toLowerCase()]['createCalendarEventAction']['title'] = ev.calendarTitle
                  }
                  if (ev.calendardescription) {
                    obj[ev['buttonText'].toLowerCase()]['createCalendarEventAction']['description'] = ev.calendardescription
                  }
                }
              }
              request.message['richCard']['carouselCard']['cardContents'][index]['suggestions'].push(obj)
            })
          }

          if (ev.suggestions && ev.suggestions.length) {
            ev.suggestions.forEach(suggEvent => {
              let type = suggEvent.reply ? 'reply' : 'action'
              if (suggEvent[type] && suggEvent[type].textVariablesDetails && suggEvent[type].textVariablesDetails.length) {
                if (/^\[.*\]$/g.test(suggEvent[type].labelInnerText)) {
                  if (!hasOnlyVariable && !this.checkPersonalisedValue(suggEvent, type)) {
                    hasOnlyVariable = true
                  }
                }
                if (suggEvent[type].textFinalVarData && suggEvent[type].textFinalVarData.variablesArr) {
                  suggEvent[type].textFinalVarData.variablesArr.forEach((e, index) => {
                    if (e.text || e.columnListValue) {
                      if (!e.varTextSeq) {
                        postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                      }
                      else {
                        postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                      }
                    }
                    else {
                      suggEvent[type].textVariablesDetails[index].personalizedVar = ''
                    }
                  })

                }
                suggEvent[type].textVariablesDetails.forEach(resp => {
                  if (resp.personalizedVar) {
                    // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                    let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText, suggEvent, type)
                    if (!personalized_labels.includes(text)) {
                      personalized_labels.push(text)
                    }
                  }
                  // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar 
                  // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'LABEL') + suggEvent[type].labelInnerText)
                })
              }
              if (suggEvent[type] && suggEvent[type].urlVariablesDetails && suggEvent[type].urlVariablesDetails.length) {
                if (suggEvent[type].urlFinalVarData && suggEvent[type].urlFinalVarData.variablesArr) {
                  suggEvent[type].urlFinalVarData.variablesArr.forEach((e, index) => {
                    if (e.text || e.columnListValue) {
                      if (!e.varTextSeq) {
                        postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                      }
                      else {
                        postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                      }
                    }
                    else {
                      suggEvent[type].urlVariablesDetails[index].personalizedVar = ''
                    }
                  })

                }
                suggEvent[type].urlVariablesDetails.forEach(resp => {
                  if (resp.personalizedVar) {
                    // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                    let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText, suggEvent, type, { is_url: true, is_dial: false })
                    if (!personalized_labels.includes(text)) {
                      personalized_labels.push(text)
                    }
                  }
                  // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].urlInnerText)
                })
              }
              if (suggEvent[type] && suggEvent[type].phoneNumberVariablesDetails && suggEvent[type].phoneNumberVariablesDetails.length) {
                if (/^\[.*\]$/g.test(suggEvent[type]?.phoneNumberInnerText)) {
                  if (!hasOnlyVariable && !this.checkPersonalisedValue(suggEvent, type, 'phoneNumberVariablesDetails')) {
                    hasOnlyVariable = true
                  }
                }
                if (suggEvent[type].phoneNumberFinalVarData && suggEvent[type].phoneNumberFinalVarData.variablesArr) {
                  suggEvent[type].phoneNumberFinalVarData.variablesArr.forEach((e, index) => {
                    if (e.text || e.columnListValue) {
                      if (!e.varTextSeq) {
                        postDataObj[e.variable] = e.text + (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '')
                      }
                      else {
                        postDataObj[e.variable] = (e.columnListValue ? ('<<' + e.columnListValue + '>>') : '') + e.text
                      }
                    }
                    else {
                      suggEvent[type].phoneNumberVariablesDetails[index].personalizedVar = ''
                    }
                  })

                }
                suggEvent[type].phoneNumberVariablesDetails.forEach(resp => {
                  if (resp.personalizedVar) {
                    // postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                    let text = this.updateLabelValues(this.createRcsCampaignService.suggestionsInitial.replace('value', 'DIAL') + suggEvent[type].phoneNumberInnerText, suggEvent, type, { is_url: false, is_dial: true })
                    if (!personalized_labels.includes(text)) {
                      personalized_labels.push(text)
                    }
                  }
                  // if(resp.personalizedVar) postDataObj[resp.actualVar.replace(/\]/g, '').replace(/\[/g, '')] = resp.personalizedVar
                  // if(!personalized_labels.includes(this.createRcsCampaignService.suggestionsInitial.replace('value', 'DIAL') + suggEvent[type].phoneNumberInnerText)) personalized_labels.push(this.createRcsCampaignService.suggestionsInitial.replace('value', 'URL') + suggEvent[type].phoneNumberInnerText)
                })
              }
            })
          }
        })





      }








      // if(data.messageData && data.suggestions && data.suggestions.length > 0) {
      //   request['message']['suggestions'] = [];
      //   data.suggestions.forEach(ev => {
      //     let obj = {}
      //     obj[ev['buttonText'] ? ev['buttonText'].toLowerCase() : ev['actionButtonText'].toLowerCase()] = {
      //       "text": ev.text,
      //       "postbackData": ev.postBackData
      //     }
      //     if(ev['actionButtonText']) {
      //       obj[ev['actionButtonText'].toLowerCase()]['fallBackUrl'] = ev.fallBackUrl
      //       if(ev['actionTypeSelectText'] == 'Dial') {
      //       obj[ev['actionButtonText'].toLowerCase()]['dialAction'] = {
      //         "phoneNumber": ev.phoneNumber
      //       }
      //       }

      //       if (ev['actionTypeSelectText'] == 'View Location') {
      //         obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction'] = {
      //         }

      //         if(ev.locationBy && ev.locationBy == 'By Query') {
      //           obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['query'] = ev.query
      //         }
      //         if(ev.locationBy && ev.locationBy == 'By latitude and longitude') {
      //           obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['latLong'] = {
      //             latitude: Number(ev.latitude),
      //             longitude: Number(ev.longitude)
      //           }
      //           if(ev.label) {
      //             obj[ev['actionButtonText'].toLowerCase()]['viewLocationAction']['label'] = ev.label
      //           }
      //         }
      //       }


      //       if (ev['actionTypeSelectText'] == 'Open URL') {

      //         if(ev.url) {
      //           obj[ev['actionButtonText'].toLowerCase()]['openUrlAction'] = {
      //             url: ev.url
      //           }
      //         }
      //     }

      //     if (ev['actionTypeSelectText'] == 'Create Calendar') {
      //       obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction'] = {
      //       }
      //       if(ev.startDateTime) {
      //         obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['startTime'] = ev.startDateTime
      //       }
      //       if(ev.endDateTime) {
      //         obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['endTime'] = ev.endDateTime
      //       }
      //       if(ev.calendarTitle) {
      //         obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['title'] = ev.calendarTitle
      //       }
      //       if(ev.calendardescription) {
      //         obj[ev['actionButtonText'].toLowerCase()]['createCalendarEventAction']['description'] = ev.calendardescription
      //       }
      //     }
      //     }
      //     request.message['suggestions'].push(obj)
      //   })
      // }
      const obj: { [key: string]: string } = {};
      let variableData = [];
      variableData = this.common.getFormatted();

      // if (this.templateTypeFromJson.contentMessage && this.templateTypeFromJson.contentMessage.richCard && this.templateTypeFromJson.contentMessage.richCard.carouselCard){
      //   variableData = this.common.getFormatted();
      // } else {
      //   const title = this.common.getPersonalizeHeader()?.title;
      //   const des = this.common.getPersonalizeHeader()?.description;
      //   const text = this.common.getPersonalizeHeader()?.text;
      //   if (title){
      //     variableData = [...title]
      //   }
      //   if (des){
      //     variableData = [...variableData, ...des]
      //   }
      //   if (text){
      //     variableData = [...text]
      //   }
      // }
      if (variableData && variableData.length > 0) {
        request['personalized_column'] = {};
        variableData.forEach(e => {
          if (!obj.hasOwnProperty(e.variable) && (!e.PersonalizedValue.includes('[') || e.text.includes('['))) {
            obj[e.variable] = e.PersonalizedValue ? e.PersonalizedValue : ''
          }
        });
      }
      request['personalized_column'] = { ...obj, ...postDataObj };
      request['personalized_labels'] = personalized_labels
      // if(personalized_labels.length && (request['type'] == 'Common')) {
      //   request['type'] = 'Personalised'
      // }
      if (hasOnlyVariable) {
        this.common.openSnackBar(this.translatedObj['rcs.suggested-responses-not-personalised-error'], 'error')
        return
      }
    }
    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.testSms(request)
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.createVoiceCampaignService.testVoice(request)
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.testSms(request)
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this.truecallerCampaignService.testTruecallerCampaign(request)
    }
    else {
      serviceCall = this.createCampaignService.testSms(request)
    }
    serviceCall.subscribe((res: any) => {
      if (res['success']) {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.testMessage = res['message'];
        setTimeout(() => {
          this.testMessage = '';
        }, 10000);
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(res['message'], 'error');
      }
      this.testCampaignForm.get('typedContacts').clearValidators();
      this.testCampaignForm.get('typedContacts').updateValueAndValidity();
    }, err => {
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.common.openSnackBar(err['error']['message'], 'error');
      this.testCampaignForm.get('typedContacts').clearValidators();
      this.testCampaignForm.get('typedContacts').updateValueAndValidity();
    })
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

  removeAnchorVarFromHtml() {
    let regex = this.textVnFormatRegex;
    let arr = this.textMessage.match(regex)
    let index = 0;
    if (arr && arr.length > 0) {
      return this.textMessage.replace(regex, function (m) {
        let value = ''
        index++;
        return value;
      });
    }
    else {
      return this.textMessage
    }
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

  getRbmAgentId(list, name?) {
    if (list && list.length > 0) {
      let value = '';
      list.forEach(e => {
        if (this.parametersRes['rbmAgent'] == e.id) {
          if (name) {
            value = e.name;
          }
          else {
            value = e.rbm_agent_id
          }
        }
      })
      return value;
    }
  }

  updateLabelValues(text, suggEvent, type, inputTypeObj?) {
    if (inputTypeObj?.is_url) {
      suggEvent[type].urlVariablesDetails.forEach(dt => {
        if (suggEvent[type].urlInnerText.includes(dt.actualVar)) {
          text = text.replace(dt.actualVar, '')
        }
      })
    }
    else if (inputTypeObj?.is_dial) {
      suggEvent[type].phoneNumberVariablesDetails.forEach(dt => {
        if (suggEvent[type].phoneNumberInnerText.includes(dt.actualVar)) {
          text = text.replace(dt.actualVar, '')
        }
      })
    }
    else {
      suggEvent[type].textVariablesDetails.forEach(dt => {
        if (suggEvent[type].labelInnerText.includes(dt.actualVar)) {
          text = text.replace(dt.actualVar, '')
        }
      })
    }
    return text
  }

  checkPersonalisedValue(suggEvent, type, detail?) {
    let varDetail = detail ? detail : 'textVariablesDetails';
    let hasPersonalisedValue = false;
    suggEvent[type]?.[varDetail]?.forEach(e => {
      if (e.personalizedVar && !hasPersonalisedValue) {
        hasPersonalisedValue = true
      }
    })
    return hasPersonalisedValue
  }

  checkButtonsVariables(variables, buttons) {
    let arr = []
    if (variables && variables.length) {
      if (buttons && buttons.length) {
        let idSet = new Set(buttons.map(obj => {
          if (obj.type == "copy_code") {
            return obj.buttonText
          } else {
            return '>' + obj.buttonText
          }
        }));
        arr = variables.filter(obj => !idSet.has(obj.variable));
      }
      else {
        arr = variables
      }
    }
    return arr;
  }

  setSourceDestinationInSmsInCaseOfOnlyLatching(_Data) {
    let FirstCall = _Data["meta_data"][1].data[0].FirstCall; // 1 = Agent , 2 = User
    let SmsData = _Data["meta_data"].filter(x => x.widgetType == "sms");
    SmsData.forEach(node => {
      let RecipientType = node.data[0].recipient_type;
      if ((FirstCall == 1 && RecipientType === 'agent') || (FirstCall == 2 && RecipientType === 'user')) {
        node.data[0]['sms_recipient'] = 'source';
      } else {
        node.data[0]['sms_recipient'] = 'destination';
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stepCount = changes?.stepCount?.currentValue;
  }

}
