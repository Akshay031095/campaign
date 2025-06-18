import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { environment } from 'src/environments/environment';
import { CreateCampaignService as createRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { CreateCampaignService as createTruecallerCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-configure-sms',
  templateUrl: './configure-sms.component.html',
  styleUrls: ['./configure-sms.component.css']
})
export class ConfigureSmsComponent implements OnInit {

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
  senderIdSelectText: any;
  @Input() config: any;
  @Input() sendCampaignData: any;
  messageForm: FormGroup;
  templateName: any;
  @Input() showDynamicError: any;
  showFooter = true;
  // isEditable = false;
  disableAddLink: boolean = false;
  IsNonEnglish = false;
  previewValue: any = '';
  hasPersonalisedColumn: any;
  variables = [];
  personalizeOptions: any;
  finalVarData: any;
  selectedCardTabIndex: any;
  inputType;
  templateType: any;
  senderName: any;
  translatedObj: any;
  senderText: any;
  defaultPreview: any;
  actualCharacterCount: number;
  reduceLength: any = 0;
  ajaxItem: any;
  @Input() isDltUser: any;
  commonConfirmText: any;
  dltSenderIdChanged: any;
  changeSenderPopupText1: any;
  hasTemplates: boolean = false;
  showDrawer: boolean = false;
  showInsertTemplate = false;
  templateTypeFromJson;
  urlFormValue: any;
  variablesName: any;
  selectedTemplateData: any;
  templateLength: any = 0;
  templateData: any;
  @ViewChild('text') text: ElementRef;
  @Input() existingTemplate: any;
  dotStarRegex = new RegExp(/[.][*]/g);
  templateId: any;
  contentType: any;
  dltTemplateId: any;
  @Output() sendTemplateData = new EventEmitter<any>();
  actualHtml: any;
  unicodeRegex = /[^\u0000-\u007F]/; // Small performance gain from pre-compiling the regex
  htmlVnFormatRegex = new RegExp(/\>\{[V][0-9]+\}/g);
  textVnFormatRegex = new RegExp(/\{[V][0-9]+\}/g);
  variablesDetails = [];
  messageCount: number;
  varData: any = [];
  templateActualHtml: any;
  showPersonalizeOptions: boolean;
  @Input() campaignId: any;
  @Input() messageType: any;
  headerValues: any;
  specificVarClicked: boolean = false;
  showPersonaliseVariables = false;
  showVariables: boolean = false;
  clickedText: any;
  personalised: boolean = false;
  urlType: string;
  @ViewChild('elRef') elRef: ElementRef;
  previewUrl: any;
  shortUrl: any = '';
  clickedUrl: any;
  noShortUrl: boolean = false;
  clickedVar: any;
  disablePersonalise: boolean = false;
  senderType: any = '';
  formId: any;
  textareaInputElement: ElementRef<any>;
  @ViewChild('textareaInput') textareaInput: ElementRef;
  urlFromText: boolean = false;
  urlChanged: boolean = false;
  messageTouched: boolean = false;
  @Input() contactCount: any;
  @Output() sendUrlFormValue = new EventEmitter<any>();
  insertShortUrl: boolean = false;
  urlPreview: any;
  showAddLink = false;
  select: Selection;
  range: Range;
  columnUrl: any;
  editableContent = environment.EDITABLE_CONTENT;
  // showPersonalise: any = false;
  hasEditingPermission = false;
  isPersonalised: boolean;
  // showSetValues: any = false;
  @Input() isKsaUser: any;
  stop = new Subject<void>();
  @Output() templateModalEvent = new EventEmitter<any>();
  @Output() setConfigEvent = new EventEmitter<any>();
  @Input() selectorData: any;
  @Input() enableSection: any;

  constructor(public fb: FormBuilder, public common: CommonService, public createCampaignService: CreateCampaignService, public matDialog: MatDialog, public createRcsCampaignService: createRcsCampaignService, public createTruecallerCampaignService: createTruecallerCampaignService) {

    this.messageForm = this.fb.group({
      textMessage: [null, [Validators.required]],
      templateName: ['', []],
      varData: [[], []],
      variables: [[], []],
      senderId: ['', []],
      configureSms: [false, []]
    });

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        this.senderText = this.translatedObj['campaign.sender-id-text']
        this.defaultPreview = this.translatedObj['campaign.default-text-preview']
        this.senderIdSelectText = this.translatedObj['campaign.select-text'];
        this.commonConfirmText = this.translatedObj['common.please-confirm-text']
        this.dltSenderIdChanged = this.translatedObj['campaign.dlt-sender-id-changed']
        this.changeSenderPopupText1 = this.translatedObj['campaigns.change-sender-popup-prompt-message1']
      }
    })

    this.createCampaignService.getSetMessageValuesEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        let obj = {
          fallback_enabled: this.messageForm.get('configureSms').value,
          fallback_config: {},
          fallback_channel: 'sms'
        }
        if (this.messageForm.get('configureSms').value) {
          this.isPersonalised = false;
          if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length) {
            for (let index = 0; index < this.finalVarData.variablesArr.length; index++) {
              if (/\{[V][0-9]*\}/g.test('{' + this.finalVarData.variablesArr[index].variable + '}')) {
                if (this.finalVarData.variablesArr[index].PersonalizedValue && !(/\{[V][0-9]*\}/g.test(this.finalVarData.variablesArr[index].PersonalizedValue))) {
                  this.isPersonalised = true;
                  break
                }
              }
            }
          }
          let textValue = this.text.nativeElement.innerText.split(/\s/).join('');
          this.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(textValue))
          obj.fallback_config['previewValue'] = this.previewValue
          obj.fallback_config['campaign_type'] = this.senderType,
            obj.fallback_config['content_type'] = this.contentType,
            obj.fallback_config['dlt_template_id'] = this.dltTemplateId,
            obj.fallback_config['is_unicode'] = this.IsNonEnglish,
            obj.fallback_config['sender_id'] = this.messageForm.get('senderId').value,
            obj.fallback_config['template_id'] = this.templateId,
            obj.fallback_config['template_name'] = this.templateName,
            obj.fallback_config['text'] = this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.removeAnchorVarFromHtml()), this.IsNonEnglish ? true : false),
            obj.fallback_config['type'] = this.isPersonalised ? 'Personalised' : 'Common'
          obj.fallback_config['addSignature'] = false
          obj.fallback_config['max_allowed_length'] = this.templateLength ? this.templateLength : null

          if (this.urlFormValue && this.urlFormValue.domainName) {
            obj.fallback_config["domain"] = this.urlFormValue.domainName
            obj.fallback_config["url_type"] = this.urlType
            let requestedUrl = '';
            if (this.urlType == 'column') {
              requestedUrl = this.urlFormValue.urlFromColumn
            }
            else {
              if (this.urlFormValue || this.urlFormValue.headerName) {
                requestedUrl = this.urlFormValue.originalUrl;
              }
            }
            obj.fallback_config["url"] = requestedUrl
            if (this.urlFormValue.selectedForm) {
              obj.fallback_config['form_id'] = this.urlFormValue.selectedForm
            }
          }
          if (this.urlFormValue && this.urlFormValue.setValidity) {
            obj.fallback_config['url_validity'] = this.common.getYMDDate(this.urlFormValue.urlDate) + ' 23:59:59'
          }
        }
        if (res.test) {
          if (this.config && this.config.truecaller) {
            this.createTruecallerCampaignService.setTextMessageValue({ ...res, ...obj })
          } else {
            this.createRcsCampaignService.setTextMessageValue({ ...res, ...obj })
          }
        }
        else {
          if (this.config && this.config.truecaller) {
            this.createTruecallerCampaignService.setEventToGetSendMessagePanelValues({ ...res, ...obj });
          } else {
            this.createRcsCampaignService.setEventToGetSendMessagePanelValues({ ...obj });
          }
        }
      }
    })

    this.common.getSearchAjaxData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res && res?.key == 'setParameter') { this.updateSenderList(res?.value, '', '', true); }
    })

    this.createCampaignService.getEventtoResetText().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.text.nativeElement.value = ''
        this.previewValue = '';
        this.removeUploadedFile();
      }
    })
  }

  ngOnInit(): void {
    // this.isEditable = this.checkIsEditableEditor();
    // this.showPersonalise = this.checkPersonalisePermission();
    // this.showSetValues = this.checkSetValuesPermission();
    this.updateSenderList();
  }

  selectActionRecive(item, key, defaultSender?) {
    if (key == 'senderId') {
      this.ajaxItem = {};
      if (item.ajax) {
        this.ajaxItem = item
        item = this.ajaxItem.item
      }
      if (this.messageForm.get('senderId').value) {
        let existingSenderId = this.senderId.find(e => {
          if (e.sender == this.messageForm.get('senderId').value) {
            return e
          }
        })
        if (this.isDltUser || (this.config && this.config.workflow)) {
          if (item) {
            if (existingSenderId && (item.id == existingSenderId.id)) {
              return
            }
            else {
              this.openDialog(`${this.dltSenderIdChanged}`, `${this.commonConfirmText}`, 'confirm', (e) => {
                if (e) {
                  this.messageForm.reset();
                  this.messageForm.get('configureSms').setValue(true);
                  this.senderName = item.id
                  this.senderType = item.type;
                  this.removeUploadedFile();
                  this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
                  this.messageForm.get(key).setValue(item.id ? item.id : '');
                  // let data = {
                  //   type: 'senderName',
                  //   action: 'senderPopUpEvent',
                  //   value: this.senderName,
                  //   data: item
                  // }
                  // this.sendParametersData.emit(data)
                  // this.updateMessageValues(item, key);
                }
                else {
                  this.senderName = existingSenderId.id
                  this.senderType = existingSenderId.type;
                  this.senderIdSelectText = existingSenderId.sender ? existingSenderId.sender : this.translatedObj['campaign.select-text'];
                  this.messageForm.get(key).setValue(existingSenderId.id ? existingSenderId.id : '');
                  // this.updateMessageValues(existingSenderId, key);
                  return
                }
              })
            }
          }
          else {
            // let data = {
            //   type: 'senderName',
            //   action: 'senderPopUpEvent',
            //   value: this.senderName,
            //   data: item,
            //   param: 'no-validate'
            // }
            // this.sendParametersData.emit(data)

            // this.updateMessageValues(item, key);
            this.senderIdSelectText = this.translatedObj['campaign.select-text'];
            this.messageForm.get(key).setValue('');
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
                  // let data = {
                  //   type: 'senderName',
                  //   action: 'senderPopUpEvent',
                  //   value: this.senderName,
                  //   data: item
                  // }
                  // this.sendParametersData.emit(data)
                  // this.updateMessageValues(item, key);
                  this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
                  this.messageForm.get(key).setValue(item.id ? item.id : '');
                }
                else {
                  // this.updateMessageValues(existingSenderId, key);
                  this.senderIdSelectText = existingSenderId.sender ? existingSenderId.sender : this.translatedObj['campaign.select-text'];
                  this.messageForm.get(key).setValue(existingSenderId.id ? existingSenderId.id : '');
                  return
                }
              })
            }
            else if (item && defaultSender) {
              // let data = {
              //   type: 'senderName',
              //   action: 'senderPopUpEvent',
              //   value: this.senderName,
              //   data: item
              // }
              // this.sendParametersData.emit(data)
              // this.updateMessageValues(item, key);
              this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
              this.messageForm.get(key).setValue(item.id ? item.id : '');
            }
            else {
              // let data = {
              //   type: 'senderName',
              //   action: 'senderPopUpEvent',
              //   value: this.senderName,
              //   data: item,
              //   param: 'no-validate'
              // }
              // this.sendParametersData.emit(data)

              // this.updateMessageValues(item, key);
              this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
              this.messageForm.get(key).setValue(item.id ? item.id : '');
            }
          }
          else {
            // let data = {
            //   type: 'senderName',
            //   action: 'senderPopUpEvent',
            //   value: this.senderName,
            //   data: item
            // }
            // this.sendParametersData.emit(data)
            // this.updateMessageValues(item, key);
            this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
            this.messageForm.get(key).setValue(item.id ? item.id : '');
          }
        }
      }
      else {
        // let data = {
        //   type: 'senderName',
        //   action: 'senderPopUpEvent',
        //   value: this.senderName,
        //   data: item
        // }
        // this.sendParametersData.emit(data)
        // this.updateMessageValues(item, key);
        this.senderIdSelectText = item.sender ? item.sender : this.translatedObj['campaign.select-text'];
        this.messageForm.get(key).setValue(item.id ? item.id : '');
      }
      // let data = {
      //   type: 'senderName',
      //   action: 'dropDownEvent',
      //   value: this.senderName,
      //   data: item
      // }
      // this.sendParametersData.emit(data)

      // this.updateMessageValues(item, key);
      if (this.ajaxItem.ajax) this.updateSenderList('', '', '', false, 'noCall');
      if (item?.id) {
        this.setConfigEvent.emit({ sms: true, configureSms: this.messageForm.get('configureSms').value });
        setTimeout(() => {
          this.senderName = item.id
          this.senderType = item.type;
          let data = {
            name: item.sender,
            type: item.type
          }
          // this.config['configureSms'] = true;
          this.createCampaignService.setInsertTemplate(data);
        });
      }
      this.createCampaignService.senderId.next(item);
    }
  }

  showErrors(fieldName, errorType, formName) {
    return false
    // if (this.parametersForm.controls[fieldName].errors && this.parametersForm.controls[fieldName].errors[errorType]) {
    //   return this.sendCampaignData && this.parametersForm.controls[fieldName].errors[errorType];
    // } else {
    //   return false;
    // }
  }

  insertTemplateModal(id) {
    this.setConfigEvent.emit({ sms: true, configureSms: this.messageForm.get('configureSms').value });
    setTimeout(() => {
      let data = {
        name: this.senderName,
        type: this.senderType
      }
      this.createCampaignService.setInsertTemplate(data);
      // this.config['configureSms'] = true;
      this.showInsertTemplate = true;
      this.showDrawer = true;
      setTimeout(() => {
        this.createCampaignService.setTemplateFormEvent(id);
        this.templateModalEvent.emit({ sms: true });
        // this.openDrawer(id);
      });
    });
  }

  removeUploadedFile() {
    this.setConfigEvent.emit({ sms: true, configureSms: this.messageForm.get('configureSms').value });
    setTimeout(() => {
      let data = {
        name: this.senderName,
        type: this.senderType,
        vertical: ''
      }
      this.createCampaignService.setInsertTemplate(data);
      this.templateName = '';
      this.templateId = ''
      this.contentType = ''
      this.dltTemplateId = ''
      this.templateLength = 0;
      this.sendTemplateData.emit({
        templateId: this.templateId,
        contentType: this.contentType,
        dltTemplateId: this.dltTemplateId
      })
      this.selectedTemplateData = '';
      this.messageForm.get('textMessage').setValue(null)
      this.text.nativeElement.innerText = null
      this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
      this.previewValue = '';
      this.finalVarData = '';
      this.existingTemplate = {}
      this.variables = [];
      if (this.urlFormValue) {
        if (this.config?.workflow) {
          this.urlFormValue = '';
        }
        else {
          this.urlFormValue['domainName'] = '';
          this.urlFormValue['headerName'] = '';
          this.urlFormValue['originalUrl'] = '';
          this.urlFormValue['setValidity'] = '';
          this.urlFormValue['urlDate'] = '';
          this.urlFormValue['urlFromColumn'] = '';
          this.urlFormValue['selectedForm'] = '';
        }
      }
      this.shortUrl = ''
      this.createCampaignService.setUrlFormValue(this.urlFormValue)
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        this.hasPersonalisedColumn = this.finalVarData.variablesArr.some(e => {
          if (e.columnListValue || this.hasColumnValue(e)) {
            return true
          }
        })
      }
      else {
        this.hasPersonalisedColumn = false;
      }
      this.reduceLength = 0;
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        this.finalVarData.variablesArr.forEach(e => {
          let val = 0
          let headerArr = [];
          if (e.text && e.columnList && e.columnList.length > 0) {
            let regex: any;
            e.columnList.forEach(ress => {
              let column = `<<${ress.headerName}>>`
              regex = new RegExp(column, 'g')
              if (regex.test(e.text)) headerArr.push(e.text.match(regex))
            })
          }
          if (headerArr && headerArr.length > 0) {
            headerArr.forEach(response => {
              response.forEach(resp => {
                val += this.headerValues[resp.replace(/\</g, '').replace(/\>/g, '')].length
              })
            })
          }
          this.reduceLength += e.columnListValue ? this.headerValues[e.columnListValue].length + val : val
        })
      }
      this.closeAllDrawers(false);
    });
  }


  // setAllPersonalization(obj) {
  //   this.variables = [];
  // if(this.clickedType == 'text' || (this.clickedType == 'title' && this.templateType == 'rich_standalone_card')) {
  //   this.variables = this.messageForm.get('varData').value;
  // }
  // else if(this.clickedType == 'description' && this.templateType == 'rich_standalone_card') {
  //   this.variables = this.messageForm.get('descriptionVarData').value;
  // }
  // else if(this.clickedType == 'mediaUrl' && this.templateType == 'rich_standalone_card') {
  //   this.variables = this.messageForm.get('mediaUrlVarData').value;
  // }
  // else if(this.templateType == 'rich_carousel_card') {
  //   if(this.clickedType == 'title' && (this.activeCardIndex > -1)) {
  //     this.variables = this.cards.controls[this.activeCardIndex].get('varData').value;
  //   }
  //   else if(this.clickedType == 'description') {
  //     this.variables = this.cards.controls[this.activeCardIndex].get('descriptionVarData').value;
  //   }
  //   else if(this.clickedType == 'mediaUrl') {
  //     this.variables = this.cards.controls[this.activeCardIndex].get('mediaUrlVarData').value;
  //   }
  // }
  // this.clickedElement = ''
  // if(obj.type == 'title') {
  //   this.clickedElement = this.textTitle
  //   this.getActiveVariables(obj.type);
  // }
  // else if(obj.type == 'text') {
  //   this.clickedElement = this.text
  // }
  // else if(obj.type == 'description') {
  //   this.getActiveVariables(obj.type);
  //   this.clickedElement = this.descriptionText
  // }
  // else if(obj.type == 'mediaUrl') {
  //   this.getActiveVariables(obj.type);
  //   this.clickedElement = this.textMediaUrl
  // }
  // let obj2: any = {};
  // if(obj.type == 'text' || (obj.type == 'title' && this.templateType == 'rich_standalone_card')) {
  //   obj2 = this.finalVarData
  // }
  // else if(obj.type == 'description' && this.templateType == 'rich_standalone_card') {
  //   obj2 = this.descriptionFinalVarData
  // }
  // else if(obj.type == 'mediaUrl' && this.templateType == 'rich_standalone_card') {
  //   obj2 = this.mediaUrlFinalVarData
  // }
  // else if(this.templateType == 'rich_carousel_card') {
  //   if(obj.type == 'title') {
  //     obj2 = this.cards.value[this.activeCardIndex].finalVarData
  //   }
  //   else if(obj.type == 'description') {
  //     obj2 = this.cards.value[this.activeCardIndex].descriptionFinalVarData
  //   }
  //   else if(obj.type == 'mediaUrl') {
  //     obj2 = this.cards.value[this.activeCardIndex].mediaUrlFinalVarData
  //   }
  // }
  // if (obj2 && obj2.variablesArr && obj2.variablesArr.length > 0) {
  //   if(this.personalizeOptions.length) {
  //     obj2.variablesArr.forEach(e => {
  //       e['columnList'] = this.personalizeOptions
  //       e['configColumnList']['open'] = false;
  //     })
  //   }
  //   let obj = {
  //     campaignType: this.personalizeOptions && this.personalizeOptions.length ? 'Personalised' : 'Common',
  //     variables: obj2,
  //     activeVariables: this.variables,
  //     id: 'personalise-variables',
  //     showDrawer: true
  //   }
  //   setTimeout(() => {
  //     this.openDrawer(obj.id);
  //     setTimeout(() => { 
  //       this.createCampaignService.setTextMessage(obj);
  //     });
  //   }, 0);
  // }
  // else {
  //   this.variables = [];
  //   // this.specificVarClicked = false;
  //   if (obj.clickedText) {
  //     // this.specificVarClicked = true;
  //     this.getActiveVariables(obj.type, 'validCheck', obj.id, 'all-variables');
  //   }
  //   else {
  //     this.getActiveVariables(obj.type, 'validCheck', obj.id, 'all-variables');
  //   }
  // }
  // }

  setAllPersonalization(data) {
    if (this.config && this.config.workflow) {
      this.createCampaignService.setClosePopupEvent.next(true);
    }
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      if (this.personalizeOptions.length) {
        this.finalVarData.variablesArr.forEach(e => {
          e['columnList'] = this.personalizeOptions
        })
      }
      this.showPersonaliseVariables = true;
      this.config['showDrawer'] = this.showPersonaliseVariables
      let obj = {
        campaignType: this.personalizeOptions?.length ? 'Personalised' : 'Common',
        variables: this.finalVarData,
        activeVariables: this.variables
      }
      this.createCampaignService.setTextMessage(obj);
      this.openDrawer(data.id);
    }
    else {
      this.variables = [];
      this.specificVarClicked = false;
      if (data.clickedText) {
        this.specificVarClicked = true;
        this.getActiveVariables(this.text.nativeElement.innerText, data.clickedText, 'validCheck', data.id, 'all-variables');
      }
      else {
        this.getActiveVariables(this.text.nativeElement.innerText, null, 'validCheck', data.id, 'all-variables');
      }
    }
  }

  // resetVariableEvent(obj) {
  // this.clickedText = obj.clickedText
  // this.resetVariable(obj, obj.type, obj.fromSuggested)
  // }

  resetVariableEvent(data) {
    if (this.config && this.config.workflow) {
      this.createCampaignService.setClosePopupEvent.next(true);
    }
    // let hasClass = event.target['classList'].contains('link-text');
    if (!this.showVariables) {
      this.previewValue = this.previewValue.replace(this.shortUrl, this.clickedUrl)
      let text = this.text.nativeElement.getElementsByClassName('link-text')
      while (text[0]) {
        text[0].parentNode.removeChild(text[0]);
      }
      this.placeValue(this.clickedUrl);
      this.clickedUrl = '';
      if (this.urlFormValue) {
        this.urlFormValue['domainName'] = '';
        this.urlFormValue['headerName'] = '';
        this.urlFormValue['originalUrl'] = '';
        this.urlFormValue['setValidity'] = '';
        this.urlFormValue['urlDate'] = '';
        this.urlFormValue['urlFromColumn'] = '';
        this.urlFormValue['selectedForm'] = '';
      }
      this.shortUrl = ''
      this.noShortUrl = true;
    }
    else {
      let text = this.clickedText.replace('>', '');
      this.setActualHtml();
      this.text.nativeElement.innerHTML = this.actualHtml;
      this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
      this.previewValue = this.text.nativeElement.innerText;
      for (let index = 0; index < this.variablesDetails.length; index++) {
        if (this.variablesDetails[index]['personalizedUrl'] || this.variablesDetails[index]['personalizedVar']) {
          if ((this.clickedVar == this.variablesDetails[index]['actualVar']) && (text == this.variablesDetails[index]['personalizedUrl'] || ((text == this.variablesDetails[index]['personalizedVar']) || (text.replace(/\s/g, '') == this.variablesDetails[index]['personalizedVar'].replace(/\s/g, ''))))) {
            if (this.variablesDetails[index]['personalizedUrl']) {
              if (this.urlFormValue) {
                this.urlFormValue['domainName'] = '';
                this.urlFormValue['headerName'] = '';
                this.urlFormValue['originalUrl'] = '';
                this.urlFormValue['setValidity'] = '';
                this.urlFormValue['urlDate'] = '';
                this.urlFormValue['urlFromColumn'] = '';
                this.urlFormValue['selectedForm'] = '';
              }
              this.shortUrl = ''
              this.createCampaignService.setUrlFormValue(this.urlFormValue)
            }
            this.variablesDetails[index]['personalizedUrl'] = '';
            this.variablesDetails[index]['personalizedVar'] = '';
            this.resetFinalVarData('validCheck', index, 'data');
            this.disablePersonalise = false;
            this.disableAddLink = false;
          }
          else {
            let text = this.variablesDetails[index]['personalizedVar'].replace(/&/g, '&amp;').replace(/</g, '&lt;');
            let url = this.variablesDetails[index]['personalizedUrl'].replace(/</g, '&lt;');
            let reg = new RegExp('>' + this.variablesDetails[index]['actualVar'], "g");
            let replaceTo = '>' + (this.variablesDetails[index]['personalizedUrl'] ? url.replace(/>/g, '&gt;') : text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'))
            this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(reg, replaceTo)
            this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
            this.previewValue = this.previewValue.replace(this.variablesDetails[index]['actualVar'], this.variablesDetails[index]['personalizedUrl'] ? this.shortUrl : this.variablesDetails[index]['personalizedVar'])
          }
        }
      }
      this.previewValue = this.setPreviewValue();
      this.previewValue = this.getFinalPreviewValue();
      this.actualCharacterCount = [...this.previewValue].length - (this.reduceLength ? this.reduceLength : 0);
      if (this.variablesDetails && this.variablesDetails.length > 0) {
        for (let index = 0; index < this.variablesDetails.length; index++) {
          if (this.variablesDetails[index].personalizedUrl && this.checkForUrl(this.variablesDetails[index].personalizedUrl)) {
            let text = this.actualHtml.replace(/&gt;/g, '>')
            let innerHtml = text.replace(/&lt;/g, '<')
            if (innerHtml.includes(this.variablesDetails[index].personalizedUrl)) {
              this.actualHtml = innerHtml.replace(this.variablesDetails[index].personalizedUrl, this.variablesDetails[index].actualVar)
            }
            break
          }
          if (this.variablesDetails[index].personalizedVar) {
            this.actualHtml = this.actualHtml.replace(this.variablesDetails[index].personalizedVar, this.variablesDetails[index].actualVar)
          }
        }
      }

      this.resetFinalVarData('validCheck');
    }
    this.reduceLength = 0;
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      this.finalVarData.variablesArr.forEach(e => {
        let val = 0
        let headerArr = [];
        if (e.text && e.columnList && e.columnList.length > 0) {
          let regex: any;
          e.columnList.forEach(ress => {
            let column = `<<${ress.headerName}>>`
            regex = new RegExp(column, 'g')
            if (regex.test(e.text)) headerArr.push(e.text.match(regex))
          })
        }
        if (headerArr && headerArr.length > 0) {
          headerArr.forEach(response => {
            response.forEach(resp => {
              val += this.headerValues[resp.replace(/\</g, '').replace(/\>/g, '')].length
            })
          })
        }
        this.reduceLength += e.columnListValue ? this.headerValues[e.columnListValue].length + val : val
      })
    }
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      this.hasPersonalisedColumn = this.finalVarData.variablesArr.some(e => {
        if (e.columnListValue || this.hasColumnValue(e)) {
          return true
        }
      })
    }
    else {
      this.hasPersonalisedColumn = false;
    }
    this.checkCount();
  }

  sendVarDetails(obj) {
    this.showPersonalize();
    this.showVariables = obj.showVariables
    this.clickedText = obj.clickedText
    this.clickedVar = obj.clickedVar
    this.clickedUrl = obj.clickedUrl
  }

  templateDataReceived(data) {
    if (data) {
      this.hasTemplates = true;
    }
    else {
      this.hasTemplates = false;
    }
    // this.showInsertTemplate = false
  }

  closeDrawer(id) {
    this.showInsertTemplate = false;
    // this.showTitleContext = false;
    // this.showDescriptionContext = false;
    // this.showMediaUrlContext = false;
    this.setConfigEvent.emit({ sms: true, configureSms: this.messageForm.get('configureSms').value });
    setTimeout(() => {
      if (id == 'configure-sms') {
      }
      let data = {
        name: this.senderName,
        type: this.senderType
      }
      this.createCampaignService.setInsertTemplate(data);
      this.config['showDrawer'] = false;
      this.showPersonaliseVariables = false;
      this.showAddLink = false;
      this.showDrawer = false;
      this.common.close(id)
    });
  }

  recievedDataTemplate(data) {
    this.urlFormValue = '';
    let res = data['data']
    this.templateName = res.name;
    this.selectedTemplateData = res;
    this.templateLength = res.length ? res.length : 0;
    let index;
    let count = 1;
    this.selectedTemplateData.content = this.selectedTemplateData.content.replace(this.dotStarRegex, function (m) {
      index = count;
      count++;
      return '{V' + index + '}'
    });
    this.templateData = '';
    this.messageForm.get('textMessage').setValue(null)
    this.text.nativeElement.innerText = null;
    this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
    this.previewValue = '';
    this.existingTemplate = {};
    if (this.selectedTemplateData) {
      if (this.existingTemplate && this.existingTemplate.content) {
        if (this.previewValue.includes(this.existingTemplate.content)) {
          this.previewValue = this.previewValue.replace(this.existingTemplate.content, this.selectedTemplateData.content);
          this.messageForm.get('textMessage').setValue(this.previewValue)
          this.text.nativeElement.innerText = this.previewValue
          this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
          this.updateVariables(this.previewValue);
          this.existingTemplate = { ...res };
        }
        else {
          this.previewValue += this.selectedTemplateData.content;
          this.messageForm.get('textMessage').setValue(this.previewValue)
          this.text.nativeElement.innerText = this.previewValue
          this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
          this.updateVariables(this.previewValue);
        }
      }
      else {
        this.existingTemplate = { ...res };
        this.previewValue += this.selectedTemplateData.content;
        this.messageForm.get('textMessage').setValue(this.previewValue)
        this.text.nativeElement.innerText = this.previewValue
        this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
        this.updateVariables(this.previewValue);
      }
      this.templateId = this.selectedTemplateData.id
      this.contentType = this.selectedTemplateData.content_type_original;
      this.dltTemplateId = this.selectedTemplateData.dlt_template_id;
      this.sendTemplateData.emit({
        templateId: this.templateId,
        template_name: this.templateName,
        contentType: this.contentType,
        dltTemplateId: this.dltTemplateId
      })
      this.selectedTemplateData = '';
    }
    if (this.actualHtml) {
      this.setTemplateVariablesJson(this.previewValue);
    }

    this.previewValue = this.getFinalPreviewValue();

    this.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(this.previewValue))
    this.checkCount();
  }

  getFinalVariabledData(data) {
    if (this.showVariables) {
      if (this.variablesDetails && this.variablesDetails.length > 0) {
        for (let index = 0; index < this.variablesDetails.length; index++) {
          if (this.clickedText == this.variablesDetails[index]['personalizedUrl']) {
            this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(this.clickedText, this.variablesDetails[index]['actualVar'])
            this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
          }
        }
      }

    }

    this.finalVarData = data;
    if (this.variablesDetails && this.variablesDetails.length > 0) {
      this.setActualHtml();
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        for (let varDIndex = 0; varDIndex < this.variablesDetails.length; varDIndex++) {
          for (let varArrIndex = 0; varArrIndex < this.finalVarData.variablesArr.length; varArrIndex++) {
            if (this.variablesDetails[varDIndex]['actualVar'] == '{' + this.finalVarData.variablesArr[varArrIndex]['variable'] + '}') {

              if (this.finalVarData.variablesArr[varArrIndex]['urlValue']) {
                if (!this.urlFormValue) {
                  this.variablesDetails[varDIndex]['personalizedUrl'] = this.finalVarData.variablesArr[varArrIndex]['urlValue'];
                }
                break
              }
              if (this.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'] && !(this.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'].match(this.textVnFormatRegex))) {
                this.variablesDetails[varDIndex]['personalizedVar'] = this.finalVarData.variablesArr[varArrIndex]['PersonalizedValue']
                break
              }
            }
          }
        }
      }
      this.previewValue = this.setPreviewValue();
      this.previewValue = this.getFinalPreviewValue();
      this.actualCharacterCount = [...this.previewValue].length - (this.reduceLength ? this.reduceLength : 0);

    }
    let regex;
    if (this.specificVarClicked) {
      regex = new RegExp('\>\{[' + this.clickedText + ']+\}');
    }
    else {
      regex = this.htmlVnFormatRegex;
    }
    let arr = this.actualHtml.match(regex)
    let dataValue = this.resetDataValue(data, arr);
    if (arr && arr.length > 0) {

      for (let index = 0; index < arr.length; index++) {

        if (dataValue['variablesArr'][index]['PersonalizedValue'].match(this.textVnFormatRegex)) {
          this.variablesDetails[index]['personalizedVar'] = ''
        }
        if (dataValue['variablesArr'][index]['urlValue']) {
          this.variablesDetails[index]['personalizedVar'] = ''
          this.variablesDetails[index]['personalizedUrl'] = dataValue['variablesArr'][index]['urlValue'];
          break
        }
        if (dataValue['variablesArr'][index]['PersonalizedValue']) {
          this.variablesDetails[index]['personalizedVar'] = dataValue['variablesArr'][index]['PersonalizedValue']
          this.variablesDetails[index]['personalizedUrl'] = '';
          break
        }
      }
      let index = 0;
      this.text.nativeElement.innerHTML = this.actualHtml.replace(regex, function (m) {
        let value;
        let text = dataValue['variablesArr'][index]['PersonalizedValue'].replace(/</g, '&lt;');
        value = dataValue['variablesArr'][index]['urlValue'] ? '>' + dataValue['variablesArr'][index]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
        index++;
        return value;
      });
      this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
      this.previewValue = this.setPreviewValue();
      this.previewValue = this.getFinalPreviewValue();
      this.personalised = true;
    }
    this.reduceLength = 0;
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      this.finalVarData.variablesArr.forEach(e => {
        let val = 0
        let headerArr = [];
        if (e.text && e.columnList && e.columnList.length > 0) {
          let regex: any;
          e.columnList.forEach(ress => {
            let column = `<<${ress.headerName}>>`
            regex = new RegExp(column, 'g')
            if (regex.test(e.text)) headerArr.push(e.text.match(regex))
          })
        }
        if (headerArr && headerArr.length > 0) {
          headerArr.forEach(response => {
            response.forEach(resp => {
              val += this.headerValues[resp.replace(/\</g, '').replace(/\>/g, '')].length
            })
          })
        }
        this.reduceLength += e.columnListValue && this.headerValues ? this.headerValues[e.columnListValue].length + val : val
      })
    }
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      this.hasPersonalisedColumn = this.finalVarData.variablesArr.some(e => {
        if (e.columnListValue || this.hasColumnValue(e)) {
          return true
        }
      })
    }
    else {
      this.hasPersonalisedColumn = false;
    }
    this.checkCount();
  }

  scheduleSwitch(event) {
    if (this.config?.truecaller && !this.enableSection) {
      this.messageForm.get('configureSms').setValue(!event.target.checked)
      return
    }
    let toggle = event.target.checked;
    this.sendCampaignData = !toggle;
    if (!toggle) {
      this.senderIdSelectText = this.translatedObj['campaign.select-text'];
      this.messageForm.get('senderId').setValue('');
      this.senderId.forEach(e => {
        if (e.is_default == 1) {
          this.selectActionRecive(e, 'senderId', 'defaultSender');
        }
      })
      this.removeUploadedFile();
    }
    else {
      this.setConfigEvent.emit({ sms: true, configureSms: this.messageForm.get('configureSms').value });
    }
    // this.config['configureSms'] = true;
    // this.sendCampaignData = false
    // this.createCampaignForm.get('scheduleType').setValue('oneTime');
    // this.resetReccurringElements();
    // if (toggle) {
    //   this.showSchedule = true;
    // }
    // else {
    //   this.showSchedule = false;
    //   this.clearReccurringElementsValidators();
    //   if (this.createCampaignForm.get('dateTime').value) {
    //     this.createCampaignForm.get('dateTime').setValue('');
    //     this.datePickerObj = {
    //       type: "dateTimePicker",
    //       dateObj: ""
    //     }
    //   }
    //   if (!this.config.voice && this.createCampaignForm.get('timezone').value) {
    //     this.createCampaignForm.get('timezone').setValue('');
    //     this.timezoneSelectText = '';
    //     this.setTimezone();
    //   }
    //   this.createCampaignService.checkEventToSetScheduleValues('oneTime');
    // }
    // if (this.showSchedule) {
    //   this.setValidator('dateTime');
    //   this.setValidator('timezone');
    // }
    // else {
    //   this.clearValidator('dateTime');
    //   this.clearValidator('timezone');
    // }
    // this.createCampaignForm.get('showSchedule').setValue(this.showSchedule);
    // if(this.config && this.config.voice){
    //   this.getToggleValue.emit(this.showSchedule);
    // }
    // this.sendScheduleEvent.emit(this.createCampaignForm.get('showSchedule').value)

    // this.setInputValue();
  }

  updateSenderList(search?, senders?, type?, eventFromSearchAjax = false, noCall?) {
    this.createCampaignService.getSenderIdAjax(25, search, 1, senders, '').subscribe((res: any) => {
      if (!eventFromSearchAjax) {
        this.senderId = res.data;
        // if (!this.smsWorkflowData?.sender_id && !noCall && this.senderId && this.senderId.length > 0) {
        this.senderId.forEach(e => {
          if (e.is_default == 1) {
            this.selectActionRecive(e, 'senderId', 'defaultSender');
          }
        })
        // }
      } else {
        this.senderId = res.data;
      }
      // if(this.config && this.config.workflow) {
      //   this.setWorkflowData(this.smsWorkflowData, eventFromSearchAjax)
      // }
    })
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

  openDrawer(id) {
    this.showDrawer = true;
    this.common.open(id);
  }

  updateVariables(value) {
    let index;
    let count = 1;
    this.text.nativeElement.innerText = value.replace(this.dotStarRegex, function (m) {
      index = count;
      count++;
      return '{V' + index + '}'
    });
    this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
    this.getActiveVariables(this.text.nativeElement.innerText);

    this.highlightVariables(this.text.nativeElement.innerText);
  }

  setTemplateVariablesJson(value?) {
    let regex = this.htmlVnFormatRegex;
    let arr = this.actualHtml.match(regex)
    this.variablesDetails = [];
    if (arr && arr.length > 0) {
      arr.map(e => {
        this.variablesDetails.push({
          actualVar: e.replace('>', ''),
          personalizedVar: '',
          personalizedUrl: ''
        })
      })

    }
  }

  getFinalPreviewValue() {
    let reg = this.textVnFormatRegex;
    let i;
    let cnt = 1;
    return this.previewValue.replace(reg, function (m) {
      i = cnt;
      cnt++;
      return ''
    });
  }

  checkCount() {
    let number = 0
    let arr = this.common.gsmNongsmChar
    if (!this.IsNonEnglish) {
      for (let i in this.previewValue) {
        if (arr.includes(this.previewValue[i])) {
          number += 1
        }
      }
    }

    this.actualCharacterCount = ([...this.previewValue].length - (this.reduceLength ? this.reduceLength : 0)) + number;
    if (this.previewValue && this.previewValue.length) {
      if (this.IsNonEnglish) {
        this.messageCount = this.common.validateNonEnglishMessageCount(this.actualCharacterCount, this.hasPersonalisedColumn);
      }
      else {
        this.messageCount = this.common.validateEnglishMessageCount(this.actualCharacterCount, this.hasPersonalisedColumn);
      }
    }
  }

  getActiveVariables(data, varr?, validCheck?, id?, allVar?) {
    let regex;
    let arr;
    if (validCheck) {
      regex = this.htmlVnFormatRegex;
      arr = varr ? ['>{' + varr + '}'] : this.text.nativeElement.innerHTML.match(regex);
    }
    else {
      regex = this.textVnFormatRegex;
      arr = varr ? ['{' + varr + '}'] : data.match(regex);
    }
    if (arr && arr.length > 0) {
      if ((this.variables && this.variables.length == 0) || !this.variables) {
        this.variables = [];
        this.varData = []
        arr.forEach(e => {
          this.varData.push({
            'variable': validCheck ? e.replace(/\>\{|\}/g, '') : e.replace(/\{|\}/g, ''),
            'columnList': [],
            'configColumnList': {
              image: false,
              title: '',
              key: 'headerName',
              search: false,
              open: false,
              createNew: false
            },
            'columnListText': this.translatedObj['campaign.select-text'],
            'columnListValue': '',
            'varTextSeq': false
          })
        })
        this.variables = [...this.varData];
      }
      if ((this.variables && this.variables.length > 0) && (this.variablesDetails && this.variablesDetails.length > 0)) {
        for (let index = 0; index < this.variablesDetails.length; index++) {
          for (let varIndex = 0; varIndex < this.variables.length; varIndex++) {
            if ((this.variablesDetails[index]['actualVar'].replace(/\{|\}/g, '') == this.variables[varIndex]['variable']) && this.variablesDetails[index]['personalizedUrl']) {
              this.variables[varIndex]['urlValue'] = this.variablesDetails[index]['personalizedUrl']
            }
          }
        }
      }
      if (allVar) {
        this.showPersonalize(allVar, id);
      }
    }
  }

  highlightVariables(data, url?) {
    let regex = this.textVnFormatRegex;
    let replaceRegex = this.htmlVnFormatRegex;
    let text = `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${this.textVnFormatRegex}" title="Right click...">`
    let arr = data.match(regex)
    if (arr && arr.length > 0) {
      this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(url ? text : regex, function (m) {
        let regexVar = url ? m.replace(/>/g, '') : m
        return `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${regexVar}" title="Right click...">${regexVar}</a>`
      });
      this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
      this.actualHtml = this.text.nativeElement.innerHTML;
      if (!url && this.config && this.config.workflow) {
        this.templateActualHtml = this.text.nativeElement.innerHTML
      }
    }
  }

  showPersonalize(data?, id?) {
    this.showPersonalizeOptions = !this.showPersonalizeOptions;
    if (this.config && !this.config?.workflow) {
      let serviceCall: any;
      if (this.config.truecaller) {
        serviceCall = this.createTruecallerCampaignService.getCommonHeaders(this.campaignId)
      }
      else {
        serviceCall = this.createRcsCampaignService.getPersonalize(this.campaignId)
      }
      serviceCall.subscribe((res: any) => {
        let val = (res.data && res.data.length > 0) ? res.data : [];
        this.personalizeOptions = [];
        if (val && val.length > 0) {
          val.forEach(e => {
            this.personalizeOptions.push({
              headerName: e
            });
          })
        }
        this.varData.map(e => {
          e['columnList'] = this.personalizeOptions
        })
        this.variables = [...this.varData];
        if (data) {
          this.showPersonaliseVariables = true;
          this.config['showDrawer'] = this.showPersonaliseVariables
          let obj = {
            campaignType: this.personalizeOptions?.length ? 'Personalised' : 'Common',
            variables: this.variables,
            activeVariables: this.variables
          }
          this.createCampaignService.setTextMessage(obj);
          this.openDrawer(id);
        }
        this.getHeaderValues();
      }, err => {
        // this.common.openSnackBar(err['message'], 'error');
      })
    }
    else {
      this.varData.map(e => {
        e['columnList'] = this.personalizeOptions
      })
      this.variables = [...this.varData];
      if (data) {
        this.showPersonaliseVariables = true;
        this.config['showDrawer'] = this.showPersonaliseVariables
        let obj = {
          campaignType: this.personalizeOptions?.length ? 'Personalised' : 'Common',
          variables: this.variables
        }
        this.createCampaignService.setTextMessage(obj);
        this.openDrawer(id);
      }
      this.getHeaderValues();
    }
  }

  getHeaderValues() {
    let serviceCall: any;
    if (this.config.truecaller) {
      serviceCall = this.createTruecallerCampaignService.getHeaderValues(this.campaignId)
    }
    else {
      serviceCall = this.createRcsCampaignService.getHeaderValues(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      this.headerValues = res.data[0]
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  setActualHtml() {
    let count = 1;
    let innerHtml: any;
    if (this.variablesDetails && this.variablesDetails.length > 0) {
      for (let index = 0; index < this.variablesDetails.length; index++) {
        if (count == 1) {
          innerHtml = this.text.nativeElement.innerHTML.replace(/&amp;/g, '&')
          this.actualHtml = innerHtml;
        }
        else {
          innerHtml = this.actualHtml
        }
        if ((this.variablesDetails[index].personalizedUrl && this.checkForUrl(this.variablesDetails[index].personalizedUrl)) || ((this.urlType != 'text') && this.variablesDetails[index].personalizedUrl)) {
          if (innerHtml.includes(this.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
            this.actualHtml = innerHtml.replace(this.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>', this.variablesDetails[index].actualVar + '</a>')
            innerHtml = this.actualHtml
          }
        }
        if (this.variablesDetails[index].personalizedVar) {
          let varText = this.variablesDetails[index].personalizedVar.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          let replace = `${this.variablesDetails[index].actualVar}" title="Right click...">`
          let replace2 = `${this.variablesDetails[index].actualVar}" title="Right click..." contenteditable="false">`
          let replaceFrom = replace + varText.replace(/>/g, '&gt;').replace(/&amp;/g, '&') + '</a>'
          let replaceFrom2 = replace2 + varText.replace(/>/g, '&gt;').replace(/&amp;/g, '&') + '</a>'
          let replaceWith = replace + this.variablesDetails[index].actualVar + '</a>'
          let replaceWith2 = replace2 + this.variablesDetails[index].actualVar + '</a>'
          if (innerHtml.replace(/&nbsp;/g, ' ').includes(replaceFrom2)) {
            this.actualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom2, replaceWith2)
          }
          else {
            this.actualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
          }
        }
        count++
      }
    }
    else {
      this.actualHtml = this.text.nativeElement.innerHTML.replace(/&amp;/g, '&');
    }
  }

  setPreviewValue(url?) {
    if (this.variablesDetails && this.variablesDetails.length > 0) {
      let value: any;
      // elRef = {...this.text}
      this.elRef.nativeElement.innerHTML = this.actualHtml.replace(/<br>/gi, "\n");
      if (this.previewUrl) {
        this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/<br>/gi, "\n").replace(/&amp;/gi, "&").replace('>' + this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'), '>' + this.shortUrl);
      }
      // value = this.text.nativeElement.innerText;
      if (this.showVariables) {
        for (let index = 0; index < this.variablesDetails.length; index++) {
          let text = (index != 0) ? value : this.elRef.nativeElement.innerText
          value = text.replace(this.variablesDetails[index]['actualVar'], this.variablesDetails[index]['personalizedUrl'] ? this.shortUrl : (this.variablesDetails[index]['personalizedVar'] ? this.getFinalDynamicValue(this.variablesDetails[index]['personalizedVar'], index, this.variablesDetails[index]) : this.variablesDetails[index]['actualVar']))
        }
      }
      else {
        value = this.elRef.nativeElement.innerText.replace(url.replace(/&lt;/g, '<').replace(/&gt;/g, '>'), this.shortUrl)
        for (let index = 0; index < this.variablesDetails.length; index++) {
          let text = (index != 0) ? value : this.elRef.nativeElement.innerText
          value = text.replace(this.variablesDetails[index]['actualVar'], this.variablesDetails[index]['personalizedUrl'] ? this.shortUrl : (this.variablesDetails[index]['personalizedVar'] ? this.getFinalDynamicValue(this.variablesDetails[index]['personalizedVar'], index, this.variablesDetails[index]) : this.variablesDetails[index]['actualVar']))
        }
      }
      if (this.headerValues) {
        value = this.replacedRegexValue(value);
      }
      return value;
    }
    else {
      this.elRef.nativeElement.innerHTML = this.actualHtml.replace(/<br>/gi, "\n");
      return this.elRef.nativeElement.innerText.replace(/<br>/gi, "\n").replace(url.replace(/&lt;/g, '<').replace(/&gt;/g, '>'), this.shortUrl)
    }
  }

  resetDataValue(data, arr) {
    // let regex = this.htmlVnFormatRegex;
    // let arr = this.actualHtml.match(regex);
    let varArr = [];
    if (arr && arr.length > 0) {
      if ((varArr && varArr.length == 0) || !varArr) {
        arr.forEach(e => {
          varArr.push({
            'variable': true ? e.replace(/\>\{|\}/g, '') : e.replace(/\{|\}/g, ''),
            'columnList': [],
            'configColumnList': {
              image: false,
              title: '',
              key: 'headerName',
              search: false,
              open: false,
              createNew: false
            },
            'columnListText': this.translatedObj['campaign.select-text'],
            'columnListValue': '',
            'varTextSeq': false
          })
        })
      }
    }

    if (varArr && varArr.length > 0) {
      for (let index = 0; index < varArr.length; index++) {
        for (let finalVarIndex = 0; finalVarIndex < data.variablesArr.length; finalVarIndex++) {
          varArr[index]['PersonalizedValue'] = ''
          varArr[index]['columnList'] = data.variablesArr[finalVarIndex].columnList
          varArr[index]['columnListText'] = this.translatedObj['campaign.select-text']
          varArr[index]['columnListValue'] = ''
          varArr[index]['text'] = ''
          varArr[index]['urlValue'] = ''
          if (data.variablesArr[finalVarIndex].variable == varArr[index].variable) {
            varArr[index]['PersonalizedValue'] = data.variablesArr[finalVarIndex].PersonalizedValue
            varArr[index]['columnListText'] = data.variablesArr[finalVarIndex].columnListText
            varArr[index]['columnListValue'] = data.variablesArr[finalVarIndex].columnListValue
            varArr[index]['text'] = data.variablesArr[finalVarIndex].text
            varArr[index]['varTextSeq'] = data.variablesArr[finalVarIndex].varTextSeq
            break
          }
        }
      }
      data.variablesArr = varArr
    }

    if (this.variablesDetails && this.variablesDetails.length > 0) {
      for (let varDetailsIndex = 0; varDetailsIndex < this.variablesDetails.length; varDetailsIndex++) {
        for (let dataIndex = 0; dataIndex < data.variablesArr.length; dataIndex++) {
          if ('{' + data.variablesArr[dataIndex].variable + '}' == this.variablesDetails[varDetailsIndex].actualVar) {
            data.variablesArr[dataIndex]['urlValue'] = this.variablesDetails[varDetailsIndex]['personalizedUrl']
            break
          }
        }
      }
    }
    return data;
  }

  hasColumnValue(data) {
    if (this.personalizeOptions && this.personalizeOptions.length > 0) {
      return this.personalizeOptions.some(e => data.text.includes(`<<${e.headerName}>>`))
    }
    else {
      return false
    }
  }

  checkForUrl(string) {
    var regex = this.common.detectUrlFromTextRegex;
    if (regex.test(string)) {
      return string.match(regex)[0];
    }
  }

  replacedRegexValue(value) {
    let text = '';
    text = value
    if (this.headerValues) {
      let arr = Object.keys(this.headerValues)
      arr.forEach(e => {
        let data = `<<${e}>>`
        let regex = new RegExp(data, 'g');
        text = text.replace(regex, this.headerValues[e]);
      })
    }
    return text
  }

  getFinalDynamicValue(text, index, data?) {
    if (this.headerValues) {
      let obj = this.finalVarData.variablesArr.find(e => '{' + e.variable + '}' == data.actualVar)
      if (obj.varTextSeq) {
        return (obj.columnListValue ? (this.headerValues[obj.columnListText] ? this.headerValues[obj.columnListText] : '') : '') + obj.text
      }
      else {
        return obj.text + (obj.columnListValue ? (this.headerValues[obj.columnListText] ? this.headerValues[obj.columnListText] : '') : '')
      }
    }
    else {
      return text
    }
  }

  placeValue(data) {
    var html = data
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // non-standard and not supported in all browsers (IE9, for one)
        var el = document.createElement("div");
        el.innerText = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } else if (document['selection'] && document['selection'].type != "Control") {
      // IE < 9
      document['selection'].createRange().pasteHTML(html);
    }
  }

  resetFinalVarData(validCheck?, i?, data?) {
    let regex = this.htmlVnFormatRegex;
    let arr = this.actualHtml.match(regex);
    let varArr = [];
    if (arr && arr.length > 0) {
      if ((varArr && varArr.length == 0) || !varArr) {
        arr.forEach(e => {
          varArr.push({
            'variable': validCheck ? e.replace(/\>\{|\}/g, '') : e.replace(/\{|\}/g, ''),
            'columnList': [],
            'configColumnList': {
              image: false,
              title: '',
              key: 'headerName',
              search: false,
              open: false,
              createNew: false
            },
            'columnListText': this.translatedObj['campaign.select-text'],
            'columnListValue': '',
            'varTextSeq': false
          })
        })
      }
    }

    if (this.finalVarData && this.finalVarData['variablesArr'] && this.finalVarData['variablesArr'].length > 0) {
      if (varArr && varArr.length > 0) {
        for (let index = 0; index < varArr.length; index++) {
          for (let finalVarIndex = 0; finalVarIndex < this.finalVarData.variablesArr.length; finalVarIndex++) {
            varArr[index]['PersonalizedValue'] = ''
            varArr[index]['columnList'] = this.finalVarData.variablesArr[finalVarIndex].columnList
            varArr[index]['columnListText'] = this.translatedObj['campaign.select-text']
            varArr[index]['columnListValue'] = '',
              varArr[index]['text'] = ''
            if (this.finalVarData.variablesArr[finalVarIndex].variable == varArr[index].variable) {
              varArr[index]['PersonalizedValue'] = this.finalVarData.variablesArr[finalVarIndex].PersonalizedValue
              varArr[index]['columnListText'] = this.finalVarData.variablesArr[finalVarIndex].columnListText
              varArr[index]['columnListValue'] = this.finalVarData.variablesArr[finalVarIndex].columnListValue
              varArr[index]['text'] = this.finalVarData.variablesArr[finalVarIndex].text
              varArr[index]['varTextSeq'] = this.finalVarData.variablesArr[finalVarIndex].varTextSeq
              break
            }
          }
        }
        this.finalVarData.variablesArr = varArr

      }
    }
    if (data) {
      if (this.finalVarData && this.finalVarData['variablesArr'] && this.finalVarData['variablesArr'].length > 0) {
        this.finalVarData['variablesArr'][i]['urlValue'] = '';
        this.finalVarData['variablesArr'][i]['PersonalizedValue'] = '';
        this.finalVarData['variablesArr'][i]['text'] = '';
        this.finalVarData['variablesArr'][i]['columnListText'] = this.translatedObj['campaign.select-text'];
        this.finalVarData['variablesArr'][i]['columnListValue'] = '';
        this.finalVarData['variablesArr'][i]['varTextSeq'] = false;
        let a = { ...this.finalVarData };
        this.finalVarData = {};
        this.finalVarData = a;
      }
    }
    if (this.variablesDetails && this.variablesDetails.length > 0) {
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        let urlVar: any;
        this.variablesDetails.forEach(e => {
          if (e.personalizedUrl) {
            urlVar = e.actualVar
          }
        })
        if (urlVar) {
          let index = this.finalVarData.variablesArr.findIndex(e => { return '{' + e.variable + '}' == urlVar })
          this.finalVarData.variablesArr.splice(index, 1)
        }
      }
    }

  }

  closeAllDrawers(_HideTemplateDrawer = true) {
    // if(_HideTemplateDrawer) this.insertTemplateComponent.closeDrawer(this.drawerId ? this.drawerId : 'insert-template')
    // this.personalizeVariablessComponent.closeDrawer('personalise-variables');
    // if(this.insertShortUrlComponent) this.insertShortUrlComponent.closeShortUrlModal();
    // this.saveTemplateComponent.closeModal('save-template');
    // this.saveTemplateComponent.saveTemplateForm.reset();
  }

  insertLink(id) {
    if (this.config && this.config.workflow) {
      this.createCampaignService.setClosePopupEvent.next(true);
    }
    if (!this.messageTouched) {
      this.urlChanged = false;
    }

    if (this.showVariables) {

    }
    else {
      // var html = personalizeItem
      var sel, range;
      if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
        }
      } else if (document['selection'] && document['selection'].type != "Control") {
        // IE < 9
        // document['selection'].createRange().pasteHTML(html);
      }
    }
    this.showAddLink = true;
    this.openDrawer(id);
    this.formId = '';
    if (this.urlFormValue && this.urlFormValue.selectedForm) {
      this.formId = this.urlFormValue.selectedForm
    }
    this.createCampaignService.setUrlFormValue(this.urlFormValue)
    this.messageForm.get('textMessage').setValue(this.text.nativeElement.innerText)
    this.messageForm.value['clickedUrl'] = this.clickedUrl
    if (this.showVariables && (!this.urlFormValue || (this.urlFormValue && !this.urlFormValue.domainName))) {
      this.messageForm.value['varClicked'] = true;
    }
    else {
      this.messageForm.value['varClicked'] = false;
    }
    this.setActualHtml();
    let data = { ...this.messageForm.value }
    data['messageType'] = this.personalizeOptions?.length ? 'Personalised' : 'Common'
    data['actualHtml'] = this.actualHtml
    if (this.config && this.config.workflow) {
      data['formId'] = this.formId
    }
    data['columnContainingUrlList'] = []
    if (this.personalizeOptions && this.personalizeOptions.length) {
      data['columnContainingUrlList'] = this.personalizeOptions
    }
    this.createCampaignService.setCampaignFormValue(data);
    this.textareaInputElement = this.textareaInput;
  }

  urlFormText(value) {
    this.urlFromText = value;
  }

  getUrlFormValue(event) {
    this.urlFormValue = event;
    this.sendUrlFormValue.emit(this.urlFormValue);
  }

  recievedData(data) {
    this.setActualHtml();
    this.previewUrl = data['previewUrl']
    if (data['urlType'] == 'text') {
      let hasUrl = this.clickedUrl ? this.clickedUrl : this.checkForUrl(this.text.nativeElement.innerText)
      if (this.showVariables && !this.shortUrl) {
        hasUrl = ''
      }
      if (!this.showVariables) {
        hasUrl = this.clickedUrl ? this.clickedUrl : this.checkForUrl(this.actualHtml.replace(/<br>/g, '\n'));
      }
      this.shortUrl = data.shortUrl;
      if (hasUrl) {
        this.messageForm.get('textMessage').setValue(data.data.textMessage);
        let url = data['previewUrl'].replace(/</g, '&lt;');
        if (this.showVariables) {
          let varText: any;
          if (this.urlFormValue) {
            if (this.variablesDetails && this.variablesDetails.length > 0) {
              let index = this.variablesDetails.findIndex(e => '>' + e.personalizedUrl == this.clickedText)
              varText = this.variablesDetails[index]['actualVar']
            }
          }
          else {
            varText = this.clickedText
          }
          this.setActualHtml();
          this.text.nativeElement.innerHTML = this.actualHtml;
          this.setPersonalisedValue(data);
          this.setMessageValue();
        }
        else {
          let text = this.text.nativeElement.innerHTML.replace(/&gt;/g, '>')
          let innerHtml = text.replace(/&lt;/g, '<')
          this.setActualHtml();
          this.text.nativeElement.innerHTML = this.actualHtml;
          this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(hasUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'), function (m) {
            return `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${url.replace(/>/g, '&gt;')}</a>`
          });
          this.setMessageValue();
        }
        this.setActualHtml();
        this.previewValue = this.setPreviewValue(data['previewUrl'].replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        this.previewValue = this.getFinalPreviewValue();
      }
      else {
        if (this.showVariables) {
          this.setActualHtml();
          this.text.nativeElement.innerHTML = this.actualHtml;
          this.setPersonalisedValue(data);
          this.setMessageValue();
        }
        else {
          var html = data['previewUrl']

          var el = document.createElement("div");

          el.innerText = html;
          el.innerHTML = `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`
          var frag = document.createDocumentFragment(), node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          this.range.insertNode(frag);
          if (lastNode) {
            this.range = this.range.cloneRange();
            this.range.setStartAfter(lastNode);
            this.range.collapse(true);
            this.select.removeAllRanges();
            this.select.addRange(this.range);
          }

          // let text = this.text.nativeElement.innerHTML.replace(/&gt;/g, '>')
          // let innerHtml = text.replace(/&lt;/g, '<')
          let url = data['previewUrl'].replace(/</g, '&lt;');
          // this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(url.replace(/>/g, '&gt;'), function (m) {
          //   return `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${m}</a>`
          // });
        }
        this.setActualHtml();
        this.previewValue = this.setPreviewValue(data['previewUrl'].replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        this.previewValue = this.getFinalPreviewValue();
      }


    }
    else {
      if (this.showVariables) {
        this.setActualHtml();
        this.text.nativeElement.innerHTML = this.actualHtml;
        this.setPersonalisedValue(data);
        this.setMessageValue();
      }
      else {
        let url = data['previewUrl'].replace(/</g, '&lt;');
        if (this.text.nativeElement.innerText.includes(data['previewUrl'])) {
          if (this.text.nativeElement.innerText.includes(this.columnUrl)) {
            this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(`<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${this.columnUrl}</a>`, this.columnUrl)
          }
          this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(data['previewUrl'], `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${data['previewUrl']}</a>`)
        }
        else {
          if (this.text.nativeElement.innerText.includes(this.columnUrl) && !this.noShortUrl) {
            this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace('>' + this.columnUrl, '>' + url.replace(/>/g, '&gt;'))
          }
          else {
            var html = data['previewUrl']

            var el = document.createElement("div");

            el.innerText = html;
            el.innerHTML = `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
              lastNode = frag.appendChild(node);
            }
            this.range.insertNode(frag);
            if (lastNode) {
              this.range = this.range.cloneRange();
              this.range.setStartAfter(lastNode);
              this.range.collapse(true);
              this.select.removeAllRanges();
              this.select.addRange(this.range);
            }
          }
        }
      }


      this.shortUrl = data.shortUrl;
      this.columnUrl = data['previewUrl'];
      this.setActualHtml();
      this.previewValue = this.setPreviewValue(data['previewUrl'].replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      this.previewValue = this.getFinalPreviewValue();
    }
    this.messageTouched = false;
    this.highlightVariables(this.text.nativeElement.innerText, 'url');
    this.insertShortUrl = true;
    this.urlType = data.urlType;
    // this.sendUrlType.emit(this.urlType)
    this.urlPreview = data.previewUrl
    this.noShortUrl = false;
    this.checkCount();
    if (this.showVariables) {
      this.updateFinalVarData();
    }
    this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
  }

  showGridPreview(value) {
    this.showDynamicError = false;
    this.messageForm.get('textMessage').setValue(this.text.nativeElement.innerText)
    if (value == 'html') {
      value = this.text.nativeElement.innerText
    }
    // this.blink = true;
    this.messageTouched = true;
    if (this.insertShortUrl) {
      let previewUrl = this.urlPreview ? this.urlPreview : this.checkForUrl(value)

      if (this.urlFormValue) {
        if (!this.urlFromText) {
          previewUrl = `##${this.urlFormValue.urlFromColumn}##`
        }
        else {
          previewUrl = this.urlPreview ? this.urlPreview : this.checkForUrl(value)
        }
        if (!value.includes(previewUrl)) {
          this.urlChanged = true;
        }
        else {
          this.urlChanged = false;
        }
      }

      if (previewUrl && this.urlFormValue.urlFromColumn) {
        previewUrl = `##${this.urlFormValue.urlFromColumn}##`
      }
      if (!previewUrl) {
        previewUrl = `##${this.urlFormValue.urlFromColumn}##`
      }
      this.setActualHtml();
      this.previewValue = this.setPreviewValue(this.previewUrl);
      if (this.shortUrl) {
        if (this.previewValue.includes(this.shortUrl)) {
          // value = value.replace(previewUrl, this.shortUrl);
          // this.previewValue = value;
        }
        else {
          // this.previewValue = value;
          this.insertShortUrl = false;
          this.urlChanged = true;
        }
      }
      else {
        // this.previewValue = value;
        this.insertShortUrl = false;
        this.urlChanged = true;
      }

    }
    else {
      let text = '';
      if (this.headerValues) {
        text = this.replacedRegexValue(value);
      }
      else {
        text = value
      }
      this.previewValue = text;
    }
    this.previewValue = this.getFinalPreviewValue();
    let text = this.text.nativeElement.innerText.split(/\s/).join('');
    this.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(text))
    this.checkCount();
    this.containsDoubleByte(this.previewValue);
  }

  containsDoubleByte(str) {
    if (!str.length) return false;
    if (str.charCodeAt(0) > 255) return true;
    // this.unicode = this.unicodeRegex.test(str);
    // this.unicodeEvent.emit(this.unicode);
  }

  setPersonalisedValue(data) {
    this.variablesDetails.forEach(e => {
      if ((this.clickedText == '>' + e.actualVar) || (this.clickedText == '>' + e.personalizedUrl)) {
        e.personalizedUrl = data['previewUrl']
        e.personalizedVar = ''
      }
    })
  }

  setMessageValue() {
    if (this.variablesDetails && this.variablesDetails.length > 0) {
      this.variablesDetails.forEach(e => {
        let reg = new RegExp('>' + e['actualVar'], "g");
        let replaceTo = e['personalizedUrl'] ? e['personalizedUrl'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : (e['personalizedVar'] ? e['personalizedVar'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : e['actualVar'])
        this.text.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(reg, '>' + replaceTo);
      })
    }
    this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
  }

  updateFinalVarData() {
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      this.finalVarData['variablesArr'] = this.finalVarData['variablesArr'].filter(e => { return '>{' + e.variable + '}' != this.clickedText })
    }
  }

  get isEditable() {
    this.hasEditingPermission = false;
    if (localStorage.getItem('features')) {
      let arr: any = JSON.parse(localStorage.getItem('features'))
      if (arr && arr.length > 0) {
        this.hasEditingPermission = arr.some(e => e == 'sms_content_editing_allowed_in_campaign')
      }
    }
    return (this.hasEditingPermission || (!this.isDltUser && ((this.editableContent) || !this.editableContent && (this.senderType != 'transactional'))))
    // return (hasEditingPermission || (!this.isDltUser && ((this.editableContent && ((this.userCategory == 6) || ((userCategory != 6) && (senderType != 'transactional')))) || !editableContent && (senderType != 'transactional'))))
  }

  get showPersonalise() {
    return (this.config && this.config.workflow)
      || ((this.contactCount > 0) && ((this.personalizeOptions && this.personalizeOptions.length > 0) && (this.isDltUser || (!this.isDltUser && (((this.senderType == 'transactional') && this.hasEditingPermission) || (this.senderType != 'transactional') || this.existingTemplate.length > 0))))
        || (this.config && this.config.truecaller && this.personalizeOptions && this.personalizeOptions.length > 0))
    // (config && config.workflow) || (messageType == 'Personalised' && (contactCount > 0) && (personalizeOptions && personalizeOptions.length > 0) && (isDltUser || (!isDltUser && (((senderType == 'transactional') && hasEditingPermission) || (senderType != 'transactional') || existingTemplate.length > 0))))
  }

  get showSetValues() {
    return this.showVariables && (this.contactCount > 0) && (this.isDltUser || (!this.isDltUser && ((this.senderType != 'transactional') || this.existingTemplate.length > 0)))
    // messageType == 'Common' && showVariables && (contactCount > 0) && (isDltUser || (!isDltUser && ((senderType != 'transactional') || existingTemplate.length > 0)))
  }


  removeAnchorVarFromHtml() {
    let regex = this.textVnFormatRegex;
    let textMessage = this.text.nativeElement.innerText
    let arr = textMessage.match(regex)
    let index = 0;
    if (arr && arr.length > 0) {
      return textMessage.replace(regex, function (m) {
        let value = ''
        index++;
        return value;
      });
    }
    else {
      return textMessage
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
