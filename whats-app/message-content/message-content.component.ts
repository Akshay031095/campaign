import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { WorkflowBuilderService } from 'src/app/workflow/workflow-builder/builder/workflow-builder.service';
import { InsertTemplateComponent } from '../../shared/components/insert-template/insert-template.component';
import { PersonalizeVariablessComponent } from '../../shared/components/personalize-variabless/personalize-variabless.component';
import { HighlightAndUpdateVariablesService } from '../whats-app-shared/services/highlight-and-update-variables.service';
import { ResetVariablesService } from '../whats-app-shared/services/reset-variables.service';
import { UpdatePersonalisedValuesService } from '../whats-app-shared/services/update-personalised-values.service';
import { UpdateShortUrlVariablesService } from '../whats-app-shared/services/update-short-url-variables.service';
import { CarouselConfigurationComponent } from '../carousel-configuration/carousel-configuration.component';
// import { UpdateShortUrlVariablesService } from '../../../../assets/images/';

const htmlVnFormatRegex = new RegExp(/\>\{\{[V][0-9]*\}\}/g);
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);
const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const htmlHnFormatRegex = new RegExp(/\>\{\{[H][0-9]*\}\}/g);
const htmlFnFormatRegex = new RegExp(/\>\{\{[F][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.css']
})
export class MessageContentComponent implements OnInit {
  messageForm: FormGroup;
  @Input() isKsaUser: any;
  @Input() isDltUser: any;
  @Input() senderType: any;
  @Input() templateName: any;
  @Input() sendCampaignData: any;
  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  disablePersonalise: boolean = false;
  @Input() contactCount: any;
  personalizeOptions: any = [];
  disableAddLink: boolean = false;
  showVariables: boolean = false;
  showReset: boolean = false;
  IsNonEnglish: boolean = false;
  previewValue: any = '';
  actualCharacterCount: number;
  @Input() senderName: any;
  @ViewChild('text') text: ElementRef;
  languageList = [];
  configLanguageList = {
    image: false,
    title: '',
    key: 'value',
    search: false,
    open: false
  };
  languageSelectText: any;
  sendFileToUpload: any = null;
  fileName: any = '';
  stop = new Subject<void>();
  urlFormValue: any;
  @Input() config: any;
  selectedTemplate: any;
  isHeaderText: boolean = false;
  isMedia: boolean = false;
  @ViewChild('text2') text2: ElementRef;
  progress: number = 0;
  @ViewChild('fileInput') fileInput: any;
  columnContainingUrlList = [];
  configColumnContainingUrlList = {
    image: false,
    title: '',
    key: 'header',
    search: false,
    open: false
  };
  columnContainingUrlText: any;
  templateMediaType: any;
  uploadedFileData: any;
  bodyTextPreview: any;
  @Input() campaignId: any;
  translatedObj: any;
  footerTextPreview: any;
  buttons = [];
  headerTextPreview: any;
  loaderSpinner: boolean = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  urlUploaded: boolean = false;
  clickedVar: any;
  urlType: string;
  clickedUrl: any;
  variablesDetails = [];
  clickedText: any;
  finalVarData: any = {};
  select: Selection;
  range: Range;
  varData: any = [];
  variables = [];
  actualHtml: any;
  personalised: boolean = false;
  headerActualHtml: any;
  headerVarCheckArr = [];
  bodyVarCheckArr = []
  footerVarCheckArr = [];
  @ViewChild('typedUrl') typedUrl: ElementRef;
  @ViewChild('text3') text3: ElementRef;
  showDynamicUrlEditor: boolean = false;
  dynamicButton: any;
  footerActualHtml: any;
  footer2ActualHtml: any;
  @ViewChild('element1') element1: ElementRef;
  unicodeRegex = /[^\u0000-\u007F]/; // Small performance gain from pre-compiling the regex
  @ViewChild('element2') element2: ElementRef;
  showContextMenu: boolean = true;
  fileType: any;
  @Input() wabaNumber: any;
  mediaId: any;
  imageUploadType = ["image/jpeg", "image/png"];
  videoUploadType = ["video/mp4", "video/3gpp"];
  correctImageType: any;
  correctVideoType: any;
  urlFileName: any;
  correctDocumentType: any;
  newFileName: any;
  @Input() wabaNumberObj;
  headerValues: any;
  hasPermissions = permissions;
  whatsAppWorkflowData: any;
  uploadFromUrlData: any;
  @ViewChild(PersonalizeVariablessComponent) personalizeVariablessComponent: PersonalizeVariablessComponent
  @ViewChild(InsertTemplateComponent) insertTemplateComponent: InsertTemplateComponent
  urlChanged: boolean = false;
  textareaInputElement: ElementRef<any>;
  @ViewChild('textareaInput') textareaInput: ElementRef;
  @Output() sendUrlFormValue = new EventEmitter<any>();
  previewUrl: any;
  shortUrl: any = '';
  columnUrl: any;
  @Output() sendUrlType = new EventEmitter<any>();
  @ViewChild('elRef') elRef: ElementRef;
  hideAllLink: boolean = true;
  showInsertTemplate = false;
  showPersonaliseVariables = false;
  showAddLink = false;
  dynamicBtnArray = [];
  dynamicButton2: any;
  @ViewChild('text4') text4: ElementRef;
  showQuickReplyPersonalisedButton: boolean;
  showDynamicUrlEditor2: boolean = false;
  trackableLinks = [];
  urlClickedEditor: any;
  urlClickedEditor1Regex: any;
  urlClickedEditor2Regex: any;
  hidePersonaliseOption: boolean;
  hideDropdown = false;
  hideForm = false;
  @Output() getMediaTypeAndLangData = new EventEmitter<any>();
  stepNumber;
  @Output() getSelectedLanguage = new EventEmitter<any>();
  @Input() langSelectedCardsButtons;
  @Input() carouselConfigurationComponentRef: any;
  showCopyOfferCodePersonalisedButton: boolean;
  @ViewChild('text5') text5: ElementRef;
  copyCodeBtn = [];
  hideResetBtnInCopyOfferCode = false;
  copyOfferCodeActualHtml = '';

  constructor(public fb: FormBuilder, public translate: TranslateService, public createCampaignService: CreateCampaignService, public createWhatsappCampaignService: WACreateCampaignService, public common: CommonService, public _workflowBuilderService: WorkflowBuilderService, public highlightAndUpdateVariablesService: HighlightAndUpdateVariablesService, public updatePersonalisedValuesService: UpdatePersonalisedValuesService, public resetVariablesService: ResetVariablesService, public updateShortUrlVariablesService: UpdateShortUrlVariablesService) {
    this.messageForm = this.fb.group({
      textMessage: [null, []],
      language: ['', [Validators.required]],
      mediaType: [0, []],
      columnUrl: ['', []],
      uploadFromUrl: ['', []],
      messageType: ['Common', []]
    });
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        if (this.translatedObj) {
          this.configLanguageList.title = this.translatedObj['campaign.select-text']
          this.languageSelectText = this.translatedObj['campaign.select-text']
          this.columnContainingUrlText = this.translatedObj['campaign.select-text']
          this.correctImageType = this.translatedObj['whatsapp.campaign-upload-correct-file-error'];
          this.correctVideoType = this.translatedObj['whatsapp.campaign-upload-correct-video-file-error'];
          this.correctDocumentType = this.translatedObj['whatsapp.campaign-upload-correct-document-file-error'];
        }
      }
    })

    this.createCampaignService.getContactCount().pipe(takeUntil(this.stop)).subscribe(res => {
      this.contactCount = res;
      this.messageForm.get('messageType').setValue('Common')
      if (this.contactCount) {
        this.getUrlColumns(this.campaignId);
      }
    })
    this.createCampaignService.getEventToGetMessageValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.elRef.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
      if (this.previewUrl) {
        let shortenUrl = '';
        if (this.urlType == 'text') {
          shortenUrl = `##${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}##`
        }
        else {
          shortenUrl = `${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`
        }
        this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
          `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
          `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${shortenUrl}</a>`
        )
        if (this.variablesDetails && this.variablesDetails.length > 0) {
          for (let index = 0; index < this.variablesDetails.length; index++) {
            if (this.variablesDetails[index].personalizedUrl) {
              this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
                ` ${this.variablesDetails[index].actualVar}" title="Right click...">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
                ` ${this.variablesDetails[index].actualVar}" title="Right click...">${shortenUrl}</a>`
              )
              this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
                ` ${this.variablesDetails[index].actualVar}" title="Right click..." contenteditable="false">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
                ` ${this.variablesDetails[index].actualVar}" title="Right click..." contenteditable="false">${shortenUrl}</a>`
              )
              break
            }
          }
        }
      }
      let data: any = {
        previewValue: this.previewValue,
        actualCharacterCount: this.actualCharacterCount,
        IsNonEnglish: this.IsNonEnglish,
        urlFormValue: this.urlFormValue,
        body: this.common.getReplacedJunkCharacter(this.setFormattedData('text1')),
        headerText: this.text2 ? this.setFormattedData('text2') : null,
        footerText: this.footerTextPreview,
        button_info: (!this.buttons.length) ? null : this.buttons,
        templateId: this.selectedTemplate ? this.selectedTemplate.id : '',
        templateName: this.selectedTemplate ? this.selectedTemplate.name : '',
        service_template_id: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].service_template_id : '',
        content_type: this.fileType ? this.fileType : '',
        media: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].media_type : '',
        header: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].header_type : '',
        notAllVariablesPersonalised: this.checkForPersonalization(),
        variablesData: this.bodyVarCheckArr,
        bodyTextPreview: this.bodyTextPreview ? this.bodyTextPreview : '',
        templateCategory: this.selectedTemplate ? this.selectedTemplate.category : '',
        buttonVariablesData: this.highlightAndUpdateVariablesService.checkForPersonalisedValuesInButtons(this),
        variablesDetails: this.variablesDetails
      }
      let arr = this.highlightAndUpdateVariablesService.getButtonsInfo(this);
      data['buttons_info'] = arr.length ? [...arr] : []
      if ((this.messageForm.get('mediaType').value == 0) || (this.messageForm.get('mediaType').value == 1)) {
        data['fileName'] = (this.messageForm.get('mediaType').value == 1) ? this.urlFileName : this.fileName
      }
      if (this.mediaId) {
        data['mediaId'] = this.mediaId
      }
      if (this.newFileName) {
        data['newFileName'] = this.newFileName
      }
      data['personalisedHeader'] = this.updatePersonalisedValuesService.getPersonalisedValues(this, 'header');
      data['personalisedButton'] = this.updatePersonalisedValuesService.getPersonalisedValues(this, 'footer');
      data['personalisedBody'] = false;
      data['variables'] = this.variables;
      if (this.templateMediaType && this.templateMediaType !== 'carousel') {
        data['hasMedia'] = true;
        data['hasMediaUploaded'] = this.highlightAndUpdateVariablesService.getMediaUploadedStatus(this);
      }
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        for (let index = 0; index < this.finalVarData.variablesArr.length; index++) {
          if (/\{\{[V][0-9]*\}\}/g.test('{{' + this.finalVarData.variablesArr[index].variable + '}}')) {
            if (this.finalVarData.variablesArr[index].PersonalizedValue && !(/\{\{[V][0-9]*\}\}/g.test(this.finalVarData.variablesArr[index].PersonalizedValue))) {
              data['personalisedBody'] = true;
              break
            }
          }
        }
      }

      if (this.config && this.config.workflow) {
        data['languages'] = this.languageList
        data['language'] = this.messageForm.get('language').value
        data['country_code'] = res.whatsappBusinessNumber.split('-')[0].replace('+', '')
        data['waba_number'] = res.whatsappBusinessNumber.split('-')[1]
        data['template_id'] = data.templateId ? data.templateId : ''
        data['header_text'] = data.headerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.resetVariablesService.removeVarFormText(data.headerText, textHnFormatRegex)), data.IsNonEnglish ? true : false) : null
        data['footer_text'] = data.footerText ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.resetVariablesService.removeVarFormText(data.footerText, textFnFormatRegex)), data.IsNonEnglish ? true : false) : null
        data.body = data.body ? this.common.getCorrectAsciiString(this.common.removeEndWhitespace(this.resetVariablesService.removeVarFormText(data.body, textVnFormatRegex)), data.IsNonEnglish ? true : false) : null
        data['url'] = this.messageForm.value.uploadFromUrl ? this.messageForm.value.uploadFromUrl : (this.messageForm.value.columnUrl ? this.messageForm.value.columnUrl : null)
        data['url_type'] = this.messageForm.value.uploadFromUrl ? 'text' : (this.messageForm.value.columnUrl ? 'column' : null)
        data['media_id'] = data.mediaId ? data.mediaId : null
        data['is_unicode'] = data ? data.IsNonEnglish : []
        data['type'] = (data.personalisedHeader || data.personalisedButton || data.personalisedBody) ? 'personalised' : 'common'
        data['header_text_personalised'] = data.personalisedHeader
        data['media_type'] = data.media ? data.media : null
        data['header_type'] = data.header
        data['template_name'] = data.templateName ? data.templateName : null
        data['bodyHtml'] = this.text ? this.text.nativeElement.innerHTML : ''
        data['bodyActualHtml'] = this.actualHtml
        data['headerHtml'] = this.text2 ? this.text2.nativeElement.innerHTML : ''
        data['headerActualHtml'] = this.headerActualHtml
        data['footerHtml'] = this.text3 ? this.text3.nativeElement.innerHTML : ''
        data['footerActualHtml'] = this.footerActualHtml
        data['footer2Html'] = this.text4 ? this.text4.nativeElement.innerHTML : ''
        data['footer2ActualHtml'] = this.footer2ActualHtml
        data['finalVarData'] = this.finalVarData
        data['variables'] = this.variables
        data['variablesDetails'] = this.variablesDetails
        data['templateMediaType'] = this.templateMediaType;
        data['headerValues'] = this.headerValues ? this.headerValues : ''
        data['shortUrl'] = this.shortUrl
        data['clickedUrl'] = this.clickedUrl
        data['urlType'] = this.urlType
        data['buttons'] = this.buttons
        data['buttonType'] = this.selectedTemplate[this.messageForm.get('language').value]['button_type']
        data['copyOfferCodeActualHtml'] = this.copyOfferCodeActualHtml
        let arr = this.highlightAndUpdateVariablesService.getButtonsInfo(this);
        data['buttons_info'] = arr.length ? [...arr] : []
        if (this.isMedia) {
          if (this.messageForm.get('mediaType').value == 0) {
            data['uploadedFileData'] = this.uploadedFileData
          }
          else if (this.messageForm.get('mediaType').value == 1) {
            data['uploadFromUrlData'] = this.uploadFromUrlData
          }
        }
        if ((this.messageForm.get('mediaType').value == 0) || (this.messageForm.get('mediaType').value == 1)) {
          data['file_name'] = (this.messageForm.get('mediaType').value == 1) ? this.urlFileName : this.fileName
        }
        if (this.newFileName) {
          data['new_filename'] = this.newFileName;
        }

        let obj = {};
        if (this.variablesDetails && this.variablesDetails.length) {
          this.variablesDetails.forEach(e => {
            if (/\{\{[V][0-9]*\}\}/g.test(e.actualVar)) {
              obj[e.actualVar.replace(/\{\{|\}\}/g, '')] = e.personalizedUrl ? (this.urlType == 'text' ? (e.personalizedUrl.includes('##') ? e.personalizedUrl : '##' + e.personalizedUrl + '##') : e.personalizedUrl) : e.personalizedVar
            }
          })
        }
        data['personalized_column'] = obj

        if (this.urlFormValue) {
          data['urlFormValue'] = this.urlFormValue
          data['form_id'] = '';
          if (this.urlFormValue && this.urlFormValue.domainName) {
            if (this.urlFormValue.selectedForm) {
              data['form_id'] = this.urlFormValue.selectedForm
            }
            data['smart_url'] = {
              url: this.urlFormValue.originalUrl ? this.urlFormValue.originalUrl : this.urlFormValue.urlFromColumn,
              domain: this.urlFormValue.domainName,
              url_type: this.urlFormValue.urlFromColumn ? 'column' : 'text',
              validity: this.urlFormValue.urlDate ? this.common.getYMDDate(this.urlFormValue.urlDate) + ' 23:59:59' : null
            }
          }
        }
        this._workflowBuilderService.setWhatsAppCampaignContent({ ...this.messageForm.value, ...res, ...data })
      }
      else {
        if (this.templateMediaType === 'carousel') {
          this.createWhatsappCampaignService.setEventToGetCarouselCardValues({ ...this.messageForm.value, ...res, ...data, ...{ type: 'send' } });
        } else {
          this.createWhatsappCampaignService.setEventToGetSendMessagePanelValues({ ...this.messageForm.value, ...res, ...data });
        }
      }
    })
    this.createCampaignService.getEventToGetTextMessage().pipe(takeUntil(this.stop)).subscribe(res => {
      this.elRef.nativeElement.innerHTML = this.text.nativeElement.innerHTML.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
      if (this.previewUrl) {
        let shortenUrl = '';
        if (this.urlType == 'text') {
          shortenUrl = `##${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}##`
        }
        else {
          shortenUrl = `${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`
        }
        this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
          `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
          `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${shortenUrl}</a>`
        )
        if (this.variablesDetails && this.variablesDetails.length > 0) {
          for (let index = 0; index < this.variablesDetails.length; index++) {
            if (this.variablesDetails[index].personalizedUrl) {
              this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
                ` ${this.variablesDetails[index].actualVar}" title="Right click...">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
                ` ${this.variablesDetails[index].actualVar}" title="Right click...">${shortenUrl}</a>`
              )
              this.elRef.nativeElement.innerHTML = this.elRef.nativeElement.innerHTML.replace(/&amp;/g, '&').replace(
                ` ${this.variablesDetails[index].actualVar}" title="Right click..." contenteditable="false">${this.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`,
                ` ${this.variablesDetails[index].actualVar}" title="Right click..." contenteditable="false">${shortenUrl}</a>`
              )
              break
            }
          }
        }
      }
      let data = {
        templateId: this.selectedTemplate ? this.selectedTemplate.id : '',
        templateName: this.selectedTemplate ? this.selectedTemplate.name : '',
        service_template_id: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].service_template_id : '',
        content_type: this.fileType ? this.fileType : '',
        body: this.common.getReplacedJunkCharacter(this.setFormattedData('text1')),
        headerText: this.text2 ? this.setFormattedData('text2') : null,
        footerText: this.footerTextPreview,
        button_info: (!this.buttons.length) ? null : this.buttons,
        IsNonEnglish: this.IsNonEnglish,
        media: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].media_type : '',
        header: this.selectedTemplate ? this.selectedTemplate[this.messageForm.get('language').value].header_type : '',
        language: this.messageForm.get('language').value ? this.messageForm.get('language').value : '',
        notAllVariablesPersonalised: this.checkForPersonalization(),
        variablesData: this.bodyVarCheckArr,
        urlFormValue: this.urlFormValue,
        buttonVariablesData: this.highlightAndUpdateVariablesService.checkForPersonalisedValuesInButtons(this),
        variablesDetails: this.variablesDetails
      }
      let arr = this.highlightAndUpdateVariablesService.getButtonsInfo(this);
      data['buttons_info'] = arr.length ? [...arr] : []
      if ((this.messageForm.get('mediaType').value == 0) || (this.messageForm.get('mediaType').value == 1)) {
        data['fileName'] = (this.messageForm.get('mediaType').value == 1) ? this.urlFileName : this.fileName
      }
      if (this.mediaId) {
        data['mediaId'] = this.mediaId
      }
      data['personalisedHeader'] = this.updatePersonalisedValuesService.getPersonalisedValues(this, 'header');
      data['personalisedButton'] = this.updatePersonalisedValuesService.getPersonalisedValues(this, 'footer');
      data['personalisedBody'] = false;
      data['variables'] = this.variables;
      if (this.templateMediaType && this.templateMediaType !== 'carousel') {
        data['hasMedia'] = true;
        data['hasMediaUploaded'] = this.highlightAndUpdateVariablesService.getMediaUploadedStatus(this);
      }
      if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
        for (let index = 0; index < this.finalVarData.variablesArr.length; index++) {
          if (/\{\{[V][0-9]*\}\}/g.test('{{' + this.finalVarData.variablesArr[index].variable + '}}')) {
            if (this.finalVarData.variablesArr[index].PersonalizedValue && !(/\{\{[V][0-9]*\}\}/g.test(this.finalVarData.variablesArr[index].PersonalizedValue))) {
              data['personalisedBody'] = true;
              break
            }
          }
        }
      }
      if (this.templateMediaType === 'carousel') {
        this.createWhatsappCampaignService.setEventToGetCarouselCardValues({ ...this.messageForm.value, ...data, ...{ type: 'test' } });
      } else {
        this.createWhatsappCampaignService.setTextMessageValue({ ...this.messageForm.value, ...data });
      }
    })

    this.createCampaignService.getEventtoResetText().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.removeSelectedTemplate();
      }
    })

    this.createCampaignService.getWhatsAppData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.getUrlColumns(this.campaignId);
        this.whatsAppWorkflowData = res
        this.removeSelectedTemplate();
        this.setWorkflowData(this.whatsAppWorkflowData);
      }
    })

    this.createWhatsappCampaignService.closeAllDrawers.subscribe(res => {
      if (res) {
        if (this.personalizeVariablessComponent) this.personalizeVariablessComponent.closeDrawer('personalise-variables');
        if (this.insertTemplateComponent) this.insertTemplateComponent.closeDrawer('insert-template')
      }
    })

    this.createCampaignService.getParametersForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.resetUpdatedValuesFromService(this.updatePersonalisedValuesService.setActualHtml(this));
      let data = { ...res, ...this.messageForm.value }
      data['actualHtml'] = this.actualHtml
      data['columnContainingUrlList'] = []
      if (this.columnContainingUrlList && this.columnContainingUrlList.length) {
        this.columnContainingUrlList.forEach(e => {
          data['columnContainingUrlList'].push({
            headerName: e.header
          })
        })
      }
      if (this.buttons && this.buttons.length) {
        let obj = this.highlightAndUpdateVariablesService.getReqParams(this);
        obj.arr.forEach((e) => {
          if (((this.urlClickedEditor == 'text3') && (obj.urlClickedEditor1 == e.url)) || ((this.urlClickedEditor == 'text4') && (obj.urlClickedEditor2 == e.url))) {
            data['domainName'] = e['domainSelectText']
          }
        })
      }
      if (!res?.is_carousel_section) {
        this.createCampaignService.setCampaignFormValue(data);
      } else {
        this.createWhatsappCampaignService.setMsgContentForCarousel(data);
      }
    })

    // Finding the step number so in case carousel template is selected the we can set card section step and so on
    this.stepNumber = this.isKsaUser && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['WhatsAppCampaigns'], this.hasPermissions.permissionName['temporary_blacklist'], false) ? 5 : (!this.isKsaUser && common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['WhatsAppCampaigns'], this.hasPermissions.permissionName['temporary_blacklist'], false) ? 4 : (this.isKsaUser && !common.checkUserPermissionWithoutTeammate(this.hasPermissions.permissionsTag['WhatsAppCampaigns'], this.hasPermissions.permissionName['temporary_blacklist'], false) ? 4 : 3))
    this.resetVariablesService.updateValues().pipe(takeUntil(this.stop)).subscribe(e => {
      if (e && !e?.is_carousel_section) {
        if (e.type && (e.type == 'urlType')) {
          this.sendUrlType.emit(e.data)
        }
        else {
          this.resetUpdatedValuesFromService(e);
        }
      }
    })
  }

  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    this.showContextMenu = false;
    setTimeout(() => {
      this.showContextMenu = true;
    }, 0);
  }

  ngOnInit(): void {
  }

  getMediaUploadedStatus() {
    if ((this.messageForm.get('mediaType').value == 0) && this.fileName) {
      return true;
    }
    else if ((this.messageForm.get('mediaType').value == 1) && this.typedUrl.nativeElement.value && this.mediaId) {
      return true;
    }
    else if ((this.messageForm.get('mediaType').value == 2) && this.messageForm.get('columnUrl').value) {
      return true;
    }
    else {
      return false;
    }
  }

  insertTemplateModal(id) {
    this.showInsertTemplate = true;
    this.createCampaignService.setInsertTemplate(true);
    this.createCampaignService.setTemplateFormEvent(id);
    this.openDrawer(id);
  }

  showErrors(fieldName, errorType, formName) {
    if (this.messageForm.controls[fieldName].errors && this.messageForm.controls[fieldName].errors[errorType]) {
      return this.sendCampaignData && this.messageForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  getEvent(event: MouseEvent, variable?) {
    this.hidePersonaliseOption = false;
    this.hideAllLink = true;
    this.urlClickedEditor = '';
    this.hideDropdown = false;
    this.hideResetBtnInCopyOfferCode = false
    if (variable) {
      this.urlClickedEditor = variable
      if (((this.urlClickedEditor == 'text3') && this.urlClickedEditor1Regex) || ((this.urlClickedEditor == 'text4') && this.urlClickedEditor2Regex)) {
        this.hidePersonaliseOption = true;
        this.hideDropdown = true;
      }
      this.hideAllLink = false;
      if (((this.urlClickedEditor == 'text3') && (!this.urlClickedEditor1Regex)) || ((this.urlClickedEditor == 'text4') && (!this.urlClickedEditor2Regex))) {
        this.hideAllLink = true;
      }
      if (this.urlClickedEditor == 'text5') {
        this.hideAllLink = true;
        this.hideResetBtnInCopyOfferCode = true;
      }
    }
    let linkFormObj: any = ''
    if (this.urlClickedEditor == 'text' || this.urlClickedEditor == 'text5') linkFormObj = this.urlFormValue
    if (this.buttons && this.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(this);
      obj.arr.forEach((e) => {
        if (((this.urlClickedEditor == 'text3') && (obj.urlClickedEditor1 == e.url)) || ((this.urlClickedEditor == 'text4') && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }
    this.urlType = 'text';
    if (linkFormObj && linkFormObj.urlFromColumn) {
      this.urlType = 'column';
    }
    let hasClass = event.target['classList'].contains('variable-text');
    if (hasClass) {
      this.showVariables = true;
    }
    else {
      this.showVariables = false;
    }
    event.preventDefault();
    // var selection;
    // selection = window.getSelection();
    // var range = selection.getRangeAt(0);
    // var node = selection.anchorNode;
    if ((this.config?.workflow && !this.showVariables) || (!this.config?.workflow && ((!this.showVariables && this.isDltUser) || (!this.showVariables && !this.isDltUser) || !(this.contactCount)))) {
      return
    }
    if (!this.columnContainingUrlList || (this.columnContainingUrlList && this.columnContainingUrlList.length == 0)) {
      return
    }
    var tag = false;
    if (this.showVariables) {
      this.clickedVar = event.target['classList'].item(1);
      if (linkFormObj && linkFormObj.domainName) {
        let isUrl: any;
        if (this.urlType == 'text') {
          isUrl = this.resetVariablesService.checkForUrl(this[this.urlClickedEditor].nativeElement.innerText)
          this.clickedUrl = linkFormObj.originalUrl
        }
        else {
          isUrl = `##${linkFormObj.urlFromColumn}##`
        }
        for (let index = 0; index < this.variablesDetails.length; index++) {
          if (this.variablesDetails[index].personalizedUrl && isUrl && (event.target['innerText'] == this.variablesDetails[index].personalizedUrl) && (this.clickedVar == this.variablesDetails[index].actualVar)) {
            this.disableAddLink = false;
            this.disablePersonalise = true;
            break
          }
          else {
            this.disableAddLink = true;
            this.disablePersonalise = false;
          }

        }
      }
      else {
        this.clickedUrl = ''
        for (let index = 0; index < this.variablesDetails.length; index++) {
          if (this.variablesDetails[index].personalizedVar && (!this.hideAllLink ? !textVnFormatRegex.test(this.variablesDetails[index].personalizedVar) : true) && ((event.target['innerText'] == this.variablesDetails[index].personalizedVar) || (event.target['innerText'].replace(/\s/g, '') == this.variablesDetails[index].personalizedVar.replace(/\s/g, '')))) {
            this.disableAddLink = true;
            this.disablePersonalise = false;
            break
          }
          else {
            this.disableAddLink = false;
            this.disablePersonalise = false;
          }
        }
      }
      this.clickedText = '>' + event.target['innerText']
    }
    else {
      this.disableAddLink = false;
      this.disablePersonalise = false;
      this.showReset = false;
      if (linkFormObj && linkFormObj.domainName) {
        let hasClass = event.target['classList'].contains('link-text');
        if (hasClass) {
          this.disablePersonalise = true;
          if (linkFormObj.originalUrl) {
            this.clickedUrl = linkFormObj.originalUrl
          }
          else {
            this.clickedUrl = `##${linkFormObj.urlFromColumn}##`
          }
          this.disableAddLink = false;
          this.showReset = true;
        }
        else {
          this.disablePersonalise = false;
          this.clickedUrl = '';
          this.disableAddLink = true;
        }
      }
      else {
        this.clickedUrl = '';
      }
    }

    if (this.showVariables && this.finalVarData && this.finalVarData['variablesArr'] && this.finalVarData['variablesArr'].length > 0) {
      this.finalVarData['variablesArr'].forEach(e => {
        if (e.variable == this.clickedText.replace(/\>\{|\}/g, '')) {
          e.text = '';
          e.columnListText = this.translatedObj['campaign.select-text'];
          e.columnListValue = '',
            e.PersonalizedValue = '';
        }
      })
    }
    if (window.getSelection) {
      // IE9 and non-IE
      this.select = window.getSelection();
      if (this.select.getRangeAt && this.select.rangeCount) {
        this.range = this.select.getRangeAt(0);
        // this.range.deleteContents();
      }
    } else if (document['selection'] && document['selection'].type != "Control") {
      // IE < 9
      // document['selection'].createRange().pasteHTML(html);
    }
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  resetVariable(event: MouseEvent) {
    this.resetVariablesService.resetVariable(this)
  }

  showAllVariablesPersonalisation(id, clickedText?) {
    if (!this.columnContainingUrlList || (this.columnContainingUrlList && this.columnContainingUrlList.length == 0)) {
      return
    }
    this.showPersonaliseVariables = true;
    if (this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length > 0) {
      if (this.columnContainingUrlList.length) {
        this.finalVarData.variablesArr.forEach(e => {
          e['columnList'] = this.columnContainingUrlList
        })
      }
      this.createCampaignService.setTextMessage(this.finalVarData);
      this.openDrawer(id);
    }
    else {
      this.variables = [];
      let obj = this.highlightAndUpdateVariablesService.getActiveVariables(this, this.text.nativeElement.innerText, null, 'validCheck', id, 'all-variables');
      this.resetUpdatedValuesFromService(obj);
    }
  }

  selectActionRecive(item, key, defaultSender?) {
    if (key == 'language') {
      this.totalCards = 0;
      this.slctdCardIndex = 0;
      this.showQuickReplyPersonalisedButton = false;
      this.showCopyOfferCodePersonalisedButton = false;
      if (this.sendFileToUpload) {
        this.sendFileToUpload.unsubscribe();
        this.progress = 0;
      }
      if (this.text2) {
        this.text2.nativeElement.innerText = '';
      }
      if (this.text3) {
        this.text3.nativeElement.innerText = '';
      }
      if (this.text4) {
        this.text4.nativeElement.innerText = '';
      }
      this.messageForm.get('mediaType').setValue(0);
      this.text.nativeElement.innerText = '';
      this.languageSelectText = item.value ? item.value : this.translatedObj['campaign.select-text'];
      this.messageForm.get(key).setValue(item.value ? item.value : '');
      this.isHeaderText = false;
      this.isMedia = false;
      this.showDynamicUrlEditor = false;
      this.showDynamicUrlEditor2 = false;
      this.dynamicButton = '';
      this.dynamicButton2 = '';
      if (item) {
        this.checkSelectedTemplateParams(item);
      }
      this.finalVarData = {};
      this.bodyVarCheckArr = [];
    }
    if (key == 'columnUrl') {
      this.columnContainingUrlText = item.header ? item.header : this.translatedObj['campaign.select-text'];
      this.messageForm.get(key).setValue(item.header ? item.header : '');
    }
    this.getSelectedLanguage.emit(this.languageSelectText)
  }

  mediaType(data) {
    if (this.sendFileToUpload) {
      this.sendFileToUpload.unsubscribe();
      this.progress = 0;
    }
    this.messageForm.get('uploadFromUrl').setValue(null)
    if (this.typedUrl) {
      this.typedUrl.nativeElement.value = null;
    }
    this.messageForm.get('columnUrl').setValue(null)
    this.columnContainingUrlText = this.translatedObj['campaign.select-text']
    this.fileName = '';
    this.fileType = '';
    this.urlFileName = '';
    this.mediaId = '';
    this.newFileName = '';
    this.uploadedFileData = '';
    this.progress = 0;
    this.urlUploaded = false;
    this.messageForm.get('mediaType').setValue(data.value)
    this.uploadFromUrlData = ''
  }

  uploadFile(file) {
    if (file && file.length > 0) {
      if (this.sendFileToUpload) {
        this.sendFileToUpload.unsubscribe();
      }
      let uploadType = (this.templateMediaType == 'image') ? this.imageUploadType : this.videoUploadType
      let errorMessage = (this.templateMediaType == 'image') ? this.correctImageType : ((this.templateMediaType == 'video') ? this.correctVideoType : this.correctDocumentType)
      this.showFormatError(file, this.templateMediaType, uploadType, errorMessage, (this.templateMediaType == 'document') ? true : false)
      this.progress = 0;
      const formData = new FormData();
      formData.append('file', file[0]);
      formData.append('waba_number', this.wabaNumber ? this.wabaNumber.split('-')[1] : '');
      formData.append('country_code', this.wabaNumber ? this.wabaNumber.split('-')[0].replace('+', '') : '');
      if (this.selectedTemplate && this.selectedTemplate[this.messageForm.get('language').value].media_type) {
        formData.append('type', this.selectedTemplate[this.messageForm.get('language').value].media_type.toLowerCase());
      }

      this.sendFileToUpload = this.createWhatsappCampaignService.templateUploadFile(formData).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round(event.loaded / event.total * 50);
            break;
          case HttpEventType.Response:
            if (event['body']['success']) {
              this.progress = 100;
              this.common.openSnackBar(event['body']['message'], 'success');
              setTimeout(() => {
                this.uploadedFileData = event.body.data
                this.uploadedFileData['url'] = '/assets/cb' + this.uploadedFileData['url'];
                this.fileName = event.body['data'].file_name;
                this.fileType = event.body['data'].content_type;
                this.mediaId = event.body['data'].media_id;
                this.newFileName = event.body['data'].new_filename;
              }, 500);
            }
            else {
              this.progress = 0;
              this.fileInput['nativeElement']['value'] = '';
              this.common.openSnackBar(event['body']['message'], 'error');
            }
        }
      }, (err: HttpErrorResponse) => {
        this.progress = 0;
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  removeUploadedMediaFile() {
    this.fileName = '';
    this.fileType = '';
    this.urlFileName = '';
    this.mediaId = '';
    this.newFileName = '';
    this.progress = 0;
    this.uploadedFileData = '';
    this.uploadFromUrlData = ''
    this.urlClickedEditor1Regex = ''
    this.urlClickedEditor2Regex = ''
    this.urlFormValue = ''
  }

  openDrawer(id) {
    this.common.open(id);
  }

  closeDrawer(id) {
    if (id == 'insert-template') {
      let data = {
        name: this.senderName,
        type: this.senderType
      }
      this.createCampaignService.setInsertTemplate(data);
    }
    this.showInsertTemplate = false;
    this.showPersonaliseVariables = false;
    this.showAddLink = false;
    this.common.close(id)
  }

  recievedDataTemplate(data) {
    this.selectActionRecive('', 'language');
    this.selectedTemplate = data.data;
    this.languageList = this.selectedTemplate.language;
  }

  checkSelectedTemplateParams(item) {
    this.isHeaderText = false;
    this.isMedia = false;
    this.templateMediaType = null;
    this.variables = [];
    if (this.selectedTemplate[item.value].media_type && (this.selectedTemplate[item.value].media_type == 'text')) {
      this.selectedTemplate[item.value].media_type = ''
    }
    if (!this.selectedTemplate[item.value].media_type) {
      if (this.selectedTemplate[item.value].header_text) {
        this.isHeaderText = true;
      }
      setTimeout(() => {
        if (this.text2) {
          this.text2.nativeElement.innerText = this.selectedTemplate[item.value].header_text
        }
      }, 0)
    }
    else {
      this.templateMediaType = this.selectedTemplate[item.value].media_type.toLowerCase();
      if (this.templateMediaType === 'carousel') {
        this.isMedia = false;
      } else {
        this.isMedia = true;
      }
    }

    this.getMediaTypeAndLangData.emit({ media_type: this.templateMediaType, lang_data: this.selectedTemplate[item.value], step_number: this.stepNumber });

    this.buttons = this.selectedTemplate[this.messageForm.get('language').value].button_info ? this.selectedTemplate[this.messageForm.get('language').value].button_info : [];
    if (this.buttons && this.buttons.length > 0) {
      this.resetUpdatedValuesFromService(this.highlightAndUpdateVariablesService.setButtonsArray(this));
      this.dynamicBtnArray = this.buttons.filter(e => e.url_type && (e.url_type == 'dynamic'))
      this.copyCodeBtn = this.buttons.filter(e => e.type && (e.type == 'copy_code'))
      if (this.dynamicBtnArray?.length) {
        this.dynamicBtnArray.forEach((e, i) => {
          let variable = 'dynamicButton' + (i ? i + 1 : '')
          this[variable] = e
        })
      }
      if (this.dynamicButton && Object.keys(this.dynamicButton)) {
        this.showDynamicUrlEditor = true;
        setTimeout(() => {
          this.text3.nativeElement.innerText = this.dynamicButton.url
        }, 0)
      }
      if (this.dynamicButton2 && Object.keys(this.dynamicButton2)) {
        this.showDynamicUrlEditor2 = true;
        setTimeout(() => {
          this.text4.nativeElement.innerText = this.dynamicButton2.url
        }, 0)
      }
      if (this.copyCodeBtn.length) {
        this.showCopyOfferCodePersonalisedButton = true;
        setTimeout(() => {
          this.text5.nativeElement.innerText = this.copyCodeBtn[0].text;
        }, 0)
      }
    }
    this.element1.nativeElement.innerHTML = this.selectedTemplate[item.value].body.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/ /g, '&nbsp;');
    this.text.nativeElement.innerText = this.element1.nativeElement.innerText;
    let text = this.text.nativeElement.innerText.split(/\s/).join('');
    this.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(text))
    this.updateShortUrlVariablesService.setPreviewValue(this, item);
    setTimeout(() => {
      if (this.text2) {
        this.highlightAndUpdateVariablesService.updateVariables(this, this.text.nativeElement.innerText, this.text2.nativeElement.innerText);
      }
      else {
        this.highlightAndUpdateVariablesService.updateVariables(this, this.text.nativeElement.innerText);
      }
      this.updateShortUrlVariablesService.setFinalVarData(this);
    }, 1)
  }

  getUrlColumns(id) {
    let serviceCall: any;
    if (this.config?.workflow) {
      serviceCall = this.createWhatsappCampaignService.getWorkflowHeaders(id)
    }
    else {
      serviceCall = this.createWhatsappCampaignService.getHeaders(id)
    }
    serviceCall.subscribe((res: any) => {
      let val = this.config && this.config.workflow ? (res.data && res.data.common_headers && res.data.common_headers.length ? res.data.common_headers : []) : ((res.data && res.data.length > 0) ? res.data : []);
      this.columnContainingUrlList = [];
      if (val && val.length > 0) {
        val.forEach(e => {
          this.columnContainingUrlList.push({
            header: e
          });
        })
        this.messageForm.get('messageType').setValue('Personalised')
        this.getHeaderValues();
      }
    }, err => {
    })
  }

  removeSelectedTemplate() {
    this.showQuickReplyPersonalisedButton = false;
    if (this.sendFileToUpload) {
      this.sendFileToUpload.unsubscribe();
      this.progress = 0;
    }
    this.bodyVarCheckArr = [];
    this.resetTemplateSelection();
    if (this.config?.workflow && this.personalizeVariablessComponent) this.personalizeVariablessComponent.closeDrawer('personalise-variables');
    if (this.config?.workflow && this.insertTemplateComponent) this.insertTemplateComponent.closeDrawer('insert-template')
  }

  resetTemplateSelection() {
    this.selectedTemplate = '';
    this.urlFormValue = ''
    this.messageForm.get('language').setValue(null);
    this.languageSelectText = this.translatedObj['campaign.select-text'];
    if (this.text2) {
      this.text2.nativeElement.innerText = '';
    }
    this.text.nativeElement.innerText = '';
    this.fileName = '';
    this.fileType = '';
    this.urlFileName = '';
    this.mediaId = '';
    this.newFileName = '';
    this.uploadedFileData = '';
    this.progress = 0;
    this.messageForm.get('uploadFromUrl').setValue(null)
    this.urlClickedEditor1Regex = ''
    this.urlClickedEditor2Regex = ''
    if (this.typedUrl) {
      this.typedUrl.nativeElement.value = null;
    }
    this.messageForm.get('columnUrl').setValue(null)
    this.columnContainingUrlText = this.translatedObj['campaign.select-text']
    this.languageList = [];
    this.urlUploaded = false;
    this.finalVarData = {};
    this.uploadFromUrlData = ''
    let linkFormObj: any = ''
    if (this.urlClickedEditor == 'text') linkFormObj = this.urlFormValue
    if (this.buttons && this.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(this);
      obj.arr.forEach((e) => {
        if (((this.urlClickedEditor == 'text3') && (obj.urlClickedEditor1 == e.url)) || ((this.urlClickedEditor == 'text4') && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }
    if (linkFormObj) {
      if (this.config?.workflow) {
        linkFormObj = '';
      }
      else {
        for (var item in linkFormObj) {
          linkFormObj[item] = ''
        }
      }
    }
    this.shortUrl = ''
    this.createCampaignService.setUrlFormValue(linkFormObj)
    this.buttons = [];
    this.templateMediaType = null;
    this.totalCards = 0;
    this.slctdCardIndex = 0;
    this.getMediaTypeAndLangData.emit({ media_type: this.templateMediaType, lang_data: this.selectedTemplate, step_number: this.stepNumber });
  }

  UploadUrl() {
    if (!this.typedUrl.nativeElement.value) {
      return
    }

    this.loaderSpinner = true;
    this.sendLoaderState.emit(this.loaderSpinner);
    let request = {
      "url": this.typedUrl.nativeElement.value,
      "waba_number": this.wabaNumber ? this.wabaNumber.split('-')[1] : null,
      "country_code": this.wabaNumber ? this.wabaNumber.split('-')[0].replace('+', '') : null,
      "type": this.templateMediaType
    }
    this.createWhatsappCampaignService.uploadMediaFromUrl(request).subscribe((res: any) => {
      if (res['success']) {
        this.fileType = res.data.content_type;
        this.urlFileName = res.data.file_name;
        this.mediaId = res.data.media_id;
        this.newFileName = res?.data?.new_filename;
        this.messageForm.get('uploadFromUrl').setValue(this.typedUrl.nativeElement.value)
        this.urlUploaded = true;
        this.uploadFromUrlData = { ...res.data, ...{ urlText: this.messageForm.get('uploadFromUrl').value } }
        this.uploadFromUrlData['url'] = '/assets/cb' + this.uploadFromUrlData['url'];
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
      }
      else {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(res['message'], 'error');
      }
    }, err => {
      this.loaderSpinner = false;
      this.sendLoaderState.emit(this.loaderSpinner);
      if (err['error'].status_code == 422) {
        if (err['error']['data']['errors']['wabaNumber']) {
          this.common.openSnackBar(err['error']['data']['errors']['wabaNumber'], 'error');
        }
      }
      else {
        this.common.openSnackBar(err['error']['message'], 'error');
      }
    })
  }

  removeUploadedUrl() {
    this.urlFileName = '';
    this.mediaId = '';
    this.urlUploaded = false;
    this.messageForm.get('uploadFromUrl').setValue(null)
    this.typedUrl.nativeElement.value = null;
    this.uploadFromUrlData = '';
  }

  showPersonalize(data?, id?) {
    this.createCampaignService.getPersonalize(this.campaignId).subscribe((res: any) => {
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
        this.createCampaignService.setTextMessage([...this.variables]);
        this.openDrawer(id);
      }
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  getFinalVariabledData(data) {
    this.resetUpdatedValuesFromService(this.updatePersonalisedValuesService.getFinalVariabledData(this, data))
  }

  checkForPersonalization() {
    if (!this.finalVarData || !this.finalVarData.variablesArr || !this.finalVarData.variablesArr.length || this.highlightAndUpdateVariablesService.hasPersonalisedValue(this)) {
      return true;
    }
  }

  setFormattedData(ele) {
    if (ele == 'text1') {
      return this.elRef.nativeElement.textContent;
    }
    else {
      this.element2.nativeElement.innerHTML = this.text2.nativeElement.innerHTML.replace(/<br>/g, '\n')
      this.element2.nativeElement.innerHTML = this.element2.nativeElement.innerHTML.replace(/&nbsp;/g, ' ');
      return this.element2.nativeElement.textContent;
    }
  }

  getHeaderValues() {
    let serviceCall: any;
    if (this.config?.workflow) {
      serviceCall = this.createWhatsappCampaignService.getWorkflowHeaderValues(this.campaignId)
    }
    else {
      serviceCall = this.createWhatsappCampaignService.getHeaderValues(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      this.headerValues = res.data[0]
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  setWorkflowData(data) {
    if (data.templateName) {
      this.shortUrl = data['shortUrl']
      this.clickedUrl = data['clickedUrl']
      this.urlType = data['urlType'];
      this.selectedTemplate = {
        name: data.templateName,
        language: data.languages,
        id: data.template_id,
        category: data.templateCategory,
        [data.language]: {
          body: data.body,
          header_text: data.headerText,
          footer_text: data.footerText,
          media_type: data.media,
          header_type: data.header,
          button_info: data.button_info,
          service_template_id: data.service_template_id,
          button_type: data.buttonType
        },
      };
      this.isHeaderText = false;
      this.isMedia = false;
      this.urlUploaded = false;
      this.templateMediaType = data.templateMediaType
      this.uploadedFileData = ''
      this.fileName = ''
      this.fileType = ''
      this.mediaId = ''
      this.newFileName = ''
      this.uploadFromUrlData = ''
      this.urlFileName = ''
      this.headerValues = data.headerValues
      if (data.urlFormValue && data.urlFormValue.domainName) {
        this.urlFormValue = data.urlFormValue
      }
      if (data.uploadedFileData && (data.mediaType == 0)) {
        this.isMedia = true;
        setTimeout(() => {
          this.uploadedFileData = data.uploadedFileData
          this.messageForm.get('mediaType').setValue(0)
          this.fileName = this.uploadedFileData.file_name;
          this.fileType = this.uploadedFileData.content_type;
          this.mediaId = this.uploadedFileData.media_id;
          this.newFileName = this.uploadedFileData.new_filename;
        });
      }
      else if (data.uploadFromUrlData && (data.mediaType == 1)) {
        this.isMedia = true;
        setTimeout(() => {
          this.uploadFromUrlData = data.uploadFromUrlData
          this.messageForm.get('mediaType').setValue(1)
          this.fileType = this.uploadFromUrlData.content_type;
          this.urlFileName = this.uploadFromUrlData.file_name;
          this.mediaId = this.uploadFromUrlData.media_id;
          this.newFileName = this.uploadFromUrlData?.new_filename;
          setTimeout(() => {
            this.typedUrl.nativeElement.value = this.uploadFromUrlData.urlText
          });
          this.messageForm.get('uploadFromUrl').setValue(this.uploadFromUrlData.urlText)
          this.urlUploaded = true;
        });
      }
      else if (data.columnUrl && (data.mediaType == 2)) {
        this.isMedia = true;
        setTimeout(() => {
          this.messageForm.get('mediaType').setValue(2)
          this.columnContainingUrlText = data.columnUrl;
          this.messageForm.get('columnUrl').setValue(data.columnUrl);
        });
      }
      this.selectActionRecive({ value: data.language }, 'language');
      setTimeout(() => {
        this.buttons = data['buttons']
        let count = 1;
        this.buttons.forEach(e => {
          if (e?.url_type && (e?.url_type == 'dynamic')) {
            e['variable'] = `F${count}`
            count++
          }
        })
        if (this.text) {
          this.text.nativeElement.innerHTML = data.bodyHtml
          this.actualHtml = data.bodyActualHtml
        }
        if (this.text2) {
          this.text2.nativeElement.innerHTML = data.headerHtml
          this.headerActualHtml = data.headerActualHtml
        }
        if (this.text3) {
          this.text3.nativeElement.innerHTML = data.footerHtml
          this.footerActualHtml = data.footerActualHtml
        }
        if (this.text4) {
          this.text4.nativeElement.innerHTML = data.footer2Html
          this.footer2ActualHtml = data.footer2ActualHtml
        }
        if (this.text5) {
          this.text5.nativeElement.innerHTML = data.copyOfferCodeActualHtml;
          this.copyOfferCodeActualHtml = data.copyOfferCodeActualHtml;
        }
        this.languageList = this.selectedTemplate.language;
        this.variablesDetails = data.variablesDetails
        this.variables = data.variables
        this.finalVarData = data.finalVarData
        this.resetUpdatedValuesFromService(this.updatePersonalisedValuesService.setPreview(this));
      }, 10);
    }
  }

  insertLink(id) {
    let linkFormObj: any = ''
    this.hideForm = true;
    if (this.urlClickedEditor == 'text') {
      linkFormObj = this.urlFormValue
      this.hideForm = false;
    }
    if (this.buttons && this.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(this);
      obj.arr.forEach((e) => {
        if (((this.urlClickedEditor == 'text3') && (obj.urlClickedEditor1 == e.url)) || ((this.urlClickedEditor == 'text4') && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }
    this.urlChanged = false;
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
    this.createCampaignService.setUrlFormValue(linkFormObj)
    this.messageForm.get('textMessage').setValue(this.text.nativeElement.innerText)
    this.messageForm.value['clickedUrl'] = this.clickedUrl
    if (this.showVariables && (!linkFormObj || (linkFormObj && !linkFormObj.domainName))) {
      this.messageForm.value['varClicked'] = true;
    }
    else {
      this.messageForm.value['varClicked'] = false;
    }
    this.createCampaignService.setAllFormValue(true);
    this.textareaInputElement = this.textareaInput;
  }

  urlFormText(value) {
    // this.urlFromText = value;
  }

  getUrlFormValue(event) {
    let arr = [];
    if (this.buttons && this.buttons.length && this.templateMediaType != 'carousel') {
      arr = this.selectedTemplate[this.messageForm.get('language').value]?.button_info?.filter(e => e.is_trackable)
    }
    if (arr.length && ((this.urlClickedEditor == 'text3') || (this.urlClickedEditor == 'text4'))) {
      let urlClickedEditor1 = ''
      let urlClickedEditor2 = ''
      let index;
      let count = 1;
      if (this.urlClickedEditor1Regex) {
        urlClickedEditor1 = this.highlightAndUpdateVariablesService.setInnerTextAndRegexValue(this.urlClickedEditor1Regex, /\{\{[F][0-9]*\}\}/, '');
      }
      if (this.urlClickedEditor2Regex) {
        urlClickedEditor2 = this.highlightAndUpdateVariablesService.setInnerTextAndRegexValue(this.urlClickedEditor2Regex, /\{\{[F][0-9]*\}\}/g, '', true);
      }
      arr.forEach((e, i) => {
        if (((this.urlClickedEditor == 'text3') && (urlClickedEditor1 == e.url)) || ((this.urlClickedEditor == 'text4') && (urlClickedEditor2 == e.url))) {
          e['urlFormValue'] = event
          e['form_id'] = '';
          if (event && event.domainName) {
            if (event.selectedForm) {
              e['form_id'] = event.selectedForm
            }
            e['smart_url'] = {
              url: event.originalUrl ? event.originalUrl : event.urlFromColumn,
              domain: event.domainName,
              url_type: event.urlFromColumn ? 'column' : 'text',
              validity: event.urlDate ? this.common.getYMDDate(event.urlDate) + ' 23:59:59' : null
            }
          }
        }
      })
    }
    else {
      this.urlFormValue = event;
      this.sendUrlFormValue.emit(this.urlFormValue);
    }
  }

  recievedData(data) {
    this.updateShortUrlVariablesService.recievedData(this, data)
  }

  showFormatError(file, mediaType, uploadType, errorMessage, doc) {
    let type = file[0]['type'];
    if (this.templateMediaType == mediaType) {
      if (doc) {
        if (type != 'application/pdf') {
          this.common.openSnackBar(errorMessage, 'error')
          return;
        }
      }
      else {
        if (!uploadType.some(e => e == type)) {
          this.common.openSnackBar(errorMessage, 'error');
          return;
        }
      }
    }
  }

  resetUpdatedValuesFromService(obj) {
    for (var item in obj) {
      this[item] = obj[item]
    }
  }

  slctdCardIndex = 0
  totalCards
  activeCard(type?, TriggerCarouselComponent = true) {
    if (this.langSelectedCardsButtons?.total_cards > 0) {
      this.totalCards = this.langSelectedCardsButtons?.total_cards;
    }
    if (TriggerCarouselComponent) {
      type == 'next' ? this.slctdCardIndex++ : this.slctdCardIndex--;
      if (this.slctdCardIndex < 0) {
        this.slctdCardIndex = 0;
        return;
      }
      if (this.slctdCardIndex > this.totalCards) {
        this.slctdCardIndex = this.totalCards;
        return;
      }
      this.createWhatsappCampaignService.changeCarouselCard.next(this.slctdCardIndex);
    } else {
      this.slctdCardIndex = this.langSelectedCardsButtons?.index;
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
    if (this.sendFileToUpload) {
      this.sendFileToUpload.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.langSelectedCardsButtons?.currentValue) {
      this.slctdCardIndex = changes?.langSelectedCardsButtons?.currentValue.index
      this.totalCards = changes?.langSelectedCardsButtons?.currentValue.total_cards
    }
    if (this.langSelectedCardsButtons?.triggered_from_ui) {
      this.activeCard(this.langSelectedCardsButtons.index, false)
    }
  }

}
