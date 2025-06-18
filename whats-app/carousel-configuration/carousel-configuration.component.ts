import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HighlightAndUpdateVariablesService } from '../whats-app-shared/services/highlight-and-update-variables.service';
import { ResetVariablesService } from '../whats-app-shared/services/reset-variables.service';
import { UpdatePersonalisedValuesService } from '../whats-app-shared/services/update-personalised-values.service';
import { UpdateShortUrlVariablesService } from '../whats-app-shared/services/update-short-url-variables.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
let defaultCardJson = {
  header: {
    type: "",
    media_id: "",
    new_filename: ""
  },
  body: {
    "parameters": []
  },
  button: []
}

const htmlVnFormatRegex = new RegExp(/\>\{\{[V][0-9]*\}\}/g);
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);
const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const htmlHnFormatRegex = new RegExp(/\>\{\{[H][0-9]*\}\}/g);
const htmlFnFormatRegex = new RegExp(/\>\{\{[F][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);

@Component({
  selector: 'app-carousel-configuration',
  templateUrl: './carousel-configuration.component.html',
  styleUrls: ['./carousel-configuration.component.css']
})
export class CarouselConfigurationComponent implements OnInit, AfterViewInit {
  @Input() config: any;
  @Input() mediaTypeAndLangData: any;
  @Input() wabaNumber: any;
  cards = [];
  activeCardIndex = 0;
  mediaUploadedForAllCard = false;
  @ViewChild('tabContainer') tabContainer!: ElementRef;
  showLeftButton = false;
  showRightButton = false;
  /*
    File uploader 
   */
  progress = 0;
  sendFileToUpload: any = null;
  @ViewChild('fileInput') fileInput: any;
  imageUploadingInProcess = false;
  stop = new Subject<void>();
  getLangFromStorage: any;
  mediaType = 0;
  @Output() sendLoaderState = new EventEmitter<any>();
  templateData = null;
  translatedObj;
  cardBody;
  cardButtons = [];
  @Input() campaignId: any;
  @Output() sendCarouselUrlType = new EventEmitter<any>();
  @Input() selectedLanguage: any;
  cardMediaType;
  /* 
  Upload media from url
   */
  clickedUrl;
  @Output() sendCardObj = new EventEmitter()

  constructor(private renderer: Renderer2, public createWhatsappCampaignService: WACreateCampaignService, public common: CommonService, public highlightAndUpdateVariablesService: HighlightAndUpdateVariablesService, public updatePersonalisedValuesService: UpdatePersonalisedValuesService, public resetVariablesService: ResetVariablesService, public updateShortUrlVariablesService: UpdateShortUrlVariablesService, public createCampaignService: CreateCampaignService) {
    this.createWhatsappCampaignService.getEventToGetCarouselCardValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      let carousel = [];
      let CardLength = this.cards.length;
      let PersonalizationNotDoneForCard = false;
      for (let i = 0; i < CardLength; i++) {
        // if (this.cards[i].buttons.length == this.cards[i].buttonsVarData.length) {
        let Obj = {};
        Obj['header'] = this.cards[i]?.header ?? null
        Obj['body'] = {};
        Obj['body']["parameters"] = [];
        let BodyVarDataLength = this.cards[i]?.bodyVarCheckArr?.length;
        if (BodyVarDataLength) {
          for (let j = 0; j < BodyVarDataLength; j++) {
            if (this.cards[i].bodyVarCheckArr[j].PersonalizedValue) {
              Obj['body']['parameters'].push({
                "type": "TEXT",
                "text": this.cards[i].bodyVarCheckArr[j].PersonalizedValue
              })
            }
          }
        }
        Obj['button'] = [];
        let ButtonVarDataLength = this.cards[i]?.buttonsVarData?.length;
        if (ButtonVarDataLength) {
          for (let j = 0; j < ButtonVarDataLength; j++) {
            if ((this.cards[i].buttonsVarData[j].smart_url) || (this.cards[i].buttonsVarData[j].value && !this.cards[i].buttonsVarData[j].value.includes("{{"))) {
              let req = {
                "name": this.cards[i].buttonsVarData[j].name,
                "index": this.cards[i].buttonsVarData[j].index,
                "value": this.cards[i].buttonsVarData[j].value,
                "type": this.cards[i].buttonsVarData[j].type
              }
              if (this.cards[i].buttonsVarData[j].smart_url) {
                req['smart_url'] = this.cards[i].buttonsVarData[j].smart_url;
              }
              Obj['button'].push(req)
            }
          }
        }
        carousel.push(JSON.parse(JSON.stringify(Obj)));
        // } else {
        //   PersonalizationNotDoneForCard = true;
        //   break;
        // }
      }
      if (res.type === 'send') {
        this.createWhatsappCampaignService.setEventToGetSendMessagePanelValues({ ...{ carousel: carousel, media_uploaded_for_all_card: this.mediaUploadedForAllCard, personalization_not_done_for_card: PersonalizationNotDoneForCard }, ...res });
      } else if (res.type === 'test') {
        this.createWhatsappCampaignService.setTextMessageValue({ ...{ carousel: carousel, media_uploaded_for_all_card: this.mediaUploadedForAllCard, personalization_not_done_for_card: PersonalizationNotDoneForCard }, ...res })
      }
    })
    this.getLangFromStorage = localStorage.getItem("lang");
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
      }
    })
    this.resetVariablesService.updateValues().pipe(takeUntil(this.stop)).subscribe(e => {
      if (e && e?.is_carousel_section) {
        if (e.type && (e.type == 'urlType')) {
          this.sendCarouselUrlType.emit(e.data)
        }
        else {
          this.resetUpdatedValuesFromService(e);
        }
      }
    })

    this.createWhatsappCampaignService.getMsgContentForCarousel().pipe(takeUntil(this.stop)).subscribe(res => {
      // this.resetUpdatedValuesFromService(this.updatePersonalisedValuesService.setActualHtml(this));
      let data = { ...res, ...this.cardObj }
      data['columnContainingUrlList'] = []
      if (this.cardObj.columnContainingUrlList && this.cardObj.columnContainingUrlList.length) {
        this.cardObj.columnContainingUrlList.forEach(e => {
          data['columnContainingUrlList'].push({
            headerName: e.header
          })
        })
      }
      if (this.cardObj.buttons && this.cardObj.buttons.length) {
        let obj = this.highlightAndUpdateVariablesService.getReqParams(this.cardObj, true);
        obj.arr.forEach((e) => {
          let _Url = JSON.parse(JSON.stringify(e.url));
          _Url = _Url.replace(/F/g, '');
          if (((this.cardObj.urlClickedEditor == 'cardBtnText') && (obj.urlClickedEditor1 == _Url)) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && (obj.urlClickedEditor2 == _Url))) {
            data['domainName'] = e['domainSelectText']
          }
        })
      }
      this.createCampaignService.setCampaignFormValue(data);
    })

    this.createWhatsappCampaignService.changeCarouselCard.subscribe(Index => {
      this.openSelectedCard(Index, this.cards[Index]);
    })

  }

  ngOnInit(): void {
    // let Index = this.mediaTypeAndLangData?.lang_data?.components.findIndex(item => item.hasOwnProperty('cards'));
    // if (Index > -1) {
    // let Length = this.mediaTypeAndLangData?.lang_data?.components[Index].cards.length;
    // this.templateData = this.mediaTypeAndLangData?.lang_data?.components[Index].cards;
    this.setDataOnInit();
    // }
  }

  openSelectedCard(_Index, card?, TriggeredFromUI = false) {
    let PreviousIndex = JSON.parse(JSON.stringify(this.activeCardIndex));
    this.activeCardIndex = _Index;
    this.progress = 0;
    this.mediaType = 0;
    this.cardButtons = [];
    this.cardBody = [];
    this.cardBody = this.templateData[this.activeCardIndex]['components'].find(component => component.type === "BODY").text;
    this.cardButtons = this.templateData[this.activeCardIndex]['components'].find(component => component.type === "BUTTONS").buttons;
    this.checkSelectedTemplateParams(PreviousIndex);
    this.sendCardObj.emit({ card: this.cardObj, index: _Index, total_cards: this.cards.length, triggered_from_ui: TriggeredFromUI, card_media_type: this.cardMediaType })
  }
  ngAfterViewInit() {
    this.setDataOnAfterViewInit();
  }
  scrollRight() {
    this.tabContainer.nativeElement.scrollLeft += 100; // Adjust as needed
    this.updateButtonVisibility();
  }
  scrollLeft() {
    this.tabContainer.nativeElement.scrollLeft -= 100; // Adjust as needed
    this.updateButtonVisibility();
  }
  updateButtonVisibility() {
    this.showLeftButton = this.tabContainer.nativeElement.scrollLeft > 0;
    this.showRightButton = this.tabContainer.nativeElement.scrollWidth >
      this.tabContainer.nativeElement.clientWidth +
      this.tabContainer.nativeElement.scrollLeft;
  }
  uploadFile(file) {
    this.imageUploadingInProcess = true;
    if (file && file.length > 0) {
      const fileType = file[0].type;
      if (!fileType.startsWith(this.cardMediaType == "VIDEO" ? 'video/' : 'image/')) {
        this.common.openSnackBar(`Unsupported file format. Supported file formats - ${this.cardMediaType == "VIDEO" ? 'mp4, 3pg' : 'jpg, jpeg or png'}`, 'error');
        this.fileInput['nativeElement']['value'] = ""; // Clear the input
        this.imageUploadingInProcess = false;
        return;
      }
      if (this.sendFileToUpload) {
        this.sendFileToUpload.unsubscribe();
      }
      this.progress = 2;
      const formData = new FormData();
      formData.append('file', file[0]);
      formData.append('waba_number', this.wabaNumber ? this.wabaNumber.split('-')[1] : '');
      formData.append('country_code', this.wabaNumber ? this.wabaNumber.split('-')[0].replace('+', '') : '');
      formData.append('type', this.cardMediaType.toLowerCase());
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
                this.cardObj.mediaType=this.mediaType;
                this.cardObj.enterUrl='';
                this.cardObj.urlUploaded = false;
                this.cardObj['header'] = { ...this.cardObj['header'], ...event.body.data };
                // this.cardObj['header']['url'] = reader.result as string;
                this.cardObj['header']['type'] = file[0].type.split('/')[0].toLowerCase();
                this.createObjectWithoutElementRef(this.activeCardIndex);
                this.sendCardObj.emit({ card: this.cardObj, index: this.activeCardIndex, total_cards: this.cards.length, card_media_type: this.cardMediaType })
                this.imageUploadingInProcess = false;
              }, 500);
            }
            else {
              this.progress = 0;
              this.imageUploadingInProcess = false;
              this.fileInput['nativeElement']['value'] = '';
              this.common.openSnackBar(event['body']['message'], 'error');
            }
        }
      }, (err: HttpErrorResponse) => {
        this.progress = 0;
        this.imageUploadingInProcess = false;
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    } else {
      this.imageUploadingInProcess = false;
    }
  }
  removeUploadedMediaFile() {
    this.progress = 0;
    this.cardObj['header'] = null;
  }
  checkAllCardMediaIdGenerated() {
    this.mediaUploadedForAllCard = false;
    let Length = this.cards.length;
    let count = 0;
    for (let i = 0; i < Length; i++) {
      if (this.cards[i]?.header?.media_id) {
        count++;
      } else {
        break;
      }
    }
    if (count == Length) {
      this.mediaUploadedForAllCard = true;
    }
  }
  ngOnDestroy() {
    this.cards = [];
    this.activeCardIndex = 0;
    this.mediaUploadedForAllCard = false;
    this.showLeftButton = false;
    this.showRightButton = false;
    this.progress = 0;
    this.stop.next();
    this.stop.complete();
    if (this.sendFileToUpload) {
      this.sendFileToUpload.unsubscribe();
    }
  }
  changeMediaType(event) {
    this.mediaType = event.value;
  }
  removeUploadedUrl() {
    this.cardObj.enterUrl = '';
    this.cardObj.urlUploaded = false;
    this.cardObj['header'] = null;
  }
  UploadUrl() {
    if (!this.cardObj.enterUrl) {
      return;
    }
    this.sendLoaderState.emit(true);
    let request = {
      "url": this.cardObj.enterUrl,
      "waba_number": this.wabaNumber ? this.wabaNumber.split('-')[1] : null,
      "country_code": this.wabaNumber ? this.wabaNumber.split('-')[0].replace('+', '') : null,
      "type": this.cardMediaType.toLowerCase(),
    }
    this.createWhatsappCampaignService.uploadMediaFromUrl(request).subscribe((res: any) => {
      if (res['success']) {
        this.cardObj['header'] = res.data;
        this.cardObj.urlUploaded = true;
        this.cardObj.mediaType=this.mediaType;
        this.sendLoaderState.emit(false);
        this.createObjectWithoutElementRef(this.activeCardIndex);
        this.sendCardObj.emit({ card: this.cardObj, index: this.activeCardIndex, total_cards: this.cards.length, card_media_type: this.cardMediaType })

      }
      else {
        this.sendLoaderState.emit(false);
        this.common.openSnackBar(res['message'], 'error');
      }
    }, err => {
      this.sendLoaderState.emit(false);
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
  /* Personalization Editor */
  @ViewChild('cardtext') cardtext: ElementRef;
  @ViewChild('textareaInput') textareaInput: ElementRef;
  @ViewChild('cardElement1') cardElement1: ElementRef;
  @ViewChild('cardElement2') cardElement2: ElementRef;
  @ViewChild('cardElRef') cardElRef: ElementRef;
  @ViewChild('cardBtnText') cardBtnText: ElementRef;
  @ViewChild('cardBtnText2') cardBtnText2: ElementRef;
  cardObj = {
    hidePersonaliseOption: false,
    hideAllLink: true,
    urlClickedEditor: "",
    hideDropdown: false,
    urlClickedEditor1Regex: "",
    urlClickedEditor2Regex: "",
    urlFormValue: "",
    buttons: [],
    urlType: "",
    showVariables: false,
    columnContainingUrlList: [],
    clickedVar: "",
    clickedUrl: "",
    variablesDetails: [],
    disableAddLink: false,
    disablePersonalise: false,
    clickedText: "",
    showReset: false,
    finalVarData: {},
    contextMenuPosition: { x: '0px', y: '0px' },
    showQuickReplyPersonalisedButton: false,
    showPersonaliseVariables: false,
    variables: [],
    hideForm: false,
    urlChanged: false,
    showAddLink: false,
    IsNonEnglish: false,
    personalizeOptions: [],
    varData: [],
    headerValues: [],
    dynamicBtnArray: [],
    dynamicButton: null,
    dynamicButton2: null,
    showDynamicUrlEditor: false,
    showDynamicUrlEditor2: false,
    cardtext: null as ElementRef | null,
    cardElement1: null as ElementRef | null,
    cardElement2: null as ElementRef | null,
    cardElRef: null as ElementRef | null,
    cardBtnText: null as ElementRef | null,
    cardBtnText2: null as ElementRef | null,
    textareaInputElement: null as ElementRef<any> | null,
    previewValue: '',
    header: {
      type: "",
      media_id: "",
      new_filename: ""
    },
    body: {
      "parameters": []
    },
    button: [],
    cardTextInnerHTML: "",
    cardTextInnerText: "",
    cardBody: "",
    selectedLanguage: "",
    buttons_info: null,
    buttonsVarData: [],
    urlDrawerFormValue: null,
    urlReceivedData: null,
    enterUrl:null,
    urlUploaded:false,
    mediaType:0
  }
  unicodeRegex = /[^\u0000-\u007F]/; // Small performance gain from pre-compiling the regex
  select: Selection;
  range: Range;
  @Input() isDltUser: any;
  @Input() contactCount: any;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger; showContextMenu: boolean = true;
  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    this.showContextMenu = false;
    setTimeout(() => {
      this.showContextMenu = true;
    }, 0);
  }
  @Output() sendCarouselUrlFormValue = new EventEmitter<any>();

  getEvent(event: MouseEvent, variable?) {
    // this.checkSelectedTemplateParams();
    this.cardObj.hidePersonaliseOption = false;
    this.cardObj.hideAllLink = true;
    this.cardObj.urlClickedEditor = '';
    this.cardObj.hideDropdown = false;
    if (variable) {
      this.cardObj.urlClickedEditor = variable;
      if (((this.cardObj.urlClickedEditor == 'cardBtnText') && this.cardObj.urlClickedEditor1Regex) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && this.cardObj.urlClickedEditor2Regex)) {
        this.cardObj.hidePersonaliseOption = true;
        this.cardObj.hideDropdown = true;
      }
      this.cardObj.hideAllLink = false;
      if (((this.cardObj.urlClickedEditor == 'cardBtnText') && (!this.cardObj.urlClickedEditor1Regex)) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && (!this.cardObj.urlClickedEditor2Regex))) {
        this.cardObj.hideAllLink = true;
      }
    }
    let linkFormObj: any = ''
    if (this.cardObj.urlClickedEditor == 'cardText') linkFormObj = this.cardObj.urlFormValue
    if (this.cardObj.buttons && this.cardObj.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(this.cardObj, true);
      obj.arr.forEach((e) => {
        if (((this.cardObj.urlClickedEditor == 'cardBtnText') && (obj.urlClickedEditor1 == e.url)) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }
    this.cardObj.urlType = 'text';
    if (linkFormObj && linkFormObj.urlFromColumn) {
      this.cardObj.urlType = 'column';
    }
    let hasClass = event.target['classList'].contains('variable-text');
    if (hasClass) {
      this.cardObj.showVariables = true;
    }
    else {
      this.cardObj.showVariables = false;
    }
    event.preventDefault();
    if (!this.cardObj.showVariables || !(this.contactCount)) {
      return
    }
    if (!this.cardObj.columnContainingUrlList || (this.cardObj.columnContainingUrlList && this.cardObj.columnContainingUrlList.length == 0)) {
      return
    }
    var tag = false;
    if (this.cardObj.showVariables) {
      this.cardObj.clickedVar = event.target['classList'].item(1);
      if (linkFormObj && linkFormObj.domainName) {
        let isUrl: any;
        if (this.cardObj.urlType == 'text') {
          isUrl = this.resetVariablesService.checkForUrl(this.cardObj[this.cardObj.urlClickedEditor].nativeElement.innerText)
          this.cardObj.clickedUrl = linkFormObj.originalUrl
        }
        else {
          isUrl = `##${linkFormObj.urlFromColumn}##`
        }
        for (let index = 0; index < this.cardObj.variablesDetails.length; index++) {
          if (this.cardObj.variablesDetails[index].personalizedUrl && isUrl && (event.target['innerText'] == this.cardObj.variablesDetails[index].personalizedUrl) && (this.cardObj.clickedVar == this.cardObj.variablesDetails[index].actualVar)) {
            this.cardObj.disableAddLink = false;
            this.cardObj.disablePersonalise = true;
            break
          }
          else {
            this.cardObj.disableAddLink = true;
            this.cardObj.disablePersonalise = false;
          }
        }
      }
      else {
        this.cardObj.clickedUrl = ''
        for (let index = 0; index < this.cardObj.variablesDetails.length; index++) {
          if (this.cardObj.variablesDetails[index].personalizedVar && (!this.cardObj.hideAllLink ? !textVnFormatRegex.test(this.cardObj.variablesDetails[index].personalizedVar) : true) && ((event.target['innerText'] == this.cardObj.variablesDetails[index].personalizedVar) || (event.target['innerText'].replace(/\s/g, '') == this.cardObj.variablesDetails[index].personalizedVar.replace(/\s/g, '')))) {
            this.cardObj.disableAddLink = true;
            this.cardObj.disablePersonalise = false;
            break
          }
          else {
            this.cardObj.disableAddLink = false;
            this.cardObj.disablePersonalise = false;
          }
        }
      }
      this.cardObj.clickedText = '>' + event.target['innerText']
    }
    else {
      this.cardObj.disableAddLink = false;
      this.cardObj.disablePersonalise = false;
      this.cardObj.showReset = false;
      if (linkFormObj && linkFormObj.domainName) {
        let hasClass = event.target['classList'].contains('link-text');
        if (hasClass) {
          this.cardObj.disablePersonalise = true;
          if (linkFormObj.originalUrl) {
            this.cardObj.clickedUrl = linkFormObj.originalUrl
          }
          else {
            this.cardObj.clickedUrl = `##${linkFormObj.urlFromColumn}##`
          }
          this.cardObj.disableAddLink = false;
          this.cardObj.showReset = true;
        }
        else {
          this.cardObj.disablePersonalise = false;
          this.cardObj.clickedUrl = '';
          this.cardObj.disableAddLink = true;
        }
      }
      else {
        this.cardObj.clickedUrl = '';
      }
    }
    if (this.cardObj.showVariables && this.cardObj.finalVarData && this.cardObj.finalVarData['variablesArr'] && this.cardObj.finalVarData['variablesArr'].length > 0) {
      this.cardObj.finalVarData['variablesArr'].forEach(e => {
        if (e.variable == this.cardObj.clickedText.replace(/\>\{|\}/g, '')) {
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
    this.cardObj.contextMenuPosition.x = event.clientX + 'px';
    this.cardObj.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  resetVariable(event: MouseEvent) {
    this.resetVariablesService.resetVariable(this.cardObj, true);
    this.getFinalVariabledData(this.cardObj.finalVarData, true);
  }
  showAllVariablesPersonalisation(id) {
    if (!this.cardObj.columnContainingUrlList || (this.cardObj.columnContainingUrlList && this.cardObj.columnContainingUrlList.length == 0)) {
      return
    }
    this.cardObj.showPersonaliseVariables = true;
    if (this.cardObj.finalVarData && this.cardObj.finalVarData['variablesArr'] && this.cardObj.finalVarData['variablesArr'].length > 0) {
      if (this.cardObj.columnContainingUrlList.length) {
        this.cardObj.finalVarData['variablesArr'].forEach(e => {
          e['columnList'] = this.cardObj.columnContainingUrlList
        })
      }
      this.createCampaignService.setTextMessage(this.cardObj.finalVarData);
      this.openDrawer(id);
    }
    else {
      this.cardObj.variables = [];
      let obj = JSON.stringify(JSON.parse(this.highlightAndUpdateVariablesService.getActiveVariables(this.cardObj, this.cardObj.cardtext.nativeElement.innerText, null, 'validCheck', id, 'all-variables', true)));
      this.resetUpdatedValuesFromService(obj);
    }
  }
  openDrawer(id) {
    this.common.open(id);
  }
  resetUpdatedValuesFromService(obj) {
    for (var item in obj) {
      this.cardObj[item] = obj[item]
    }
  }
  insertLink(id) {
    let linkFormObj: any = ''
    this.cardObj.hideForm = true;
    if (this.cardObj.urlClickedEditor == 'cardText') {
      linkFormObj = this.cardObj.urlFormValue
      this.cardObj.hideForm = false;
    }
    if (this.cardObj.buttons && this.cardObj.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(this.cardObj, true);
      obj.arr.forEach((e) => {
        if (((this.cardObj.urlClickedEditor == 'cardBtnText') && (obj.urlClickedEditor1 == e.url)) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }
    this.cardObj.urlChanged = false;
    if (this.cardObj.showVariables) {
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
    this.cardObj.showAddLink = true;
    this.openDrawer(id);
    this.createCampaignService.setUrlFormValue(linkFormObj)
    this.cardBody = this.cardObj.cardtext.nativeElement.innerText;
    this.clickedUrl = this.cardObj['clickedUrl'];
    if (this.cardObj.showVariables && (!linkFormObj || (linkFormObj && !linkFormObj.domainName))) {
      this.cardObj['varClicked'] = true;
    }
    else {
      this.cardObj['varClicked'] = false;
    }
    this.createCampaignService.setAllFormValue(true, true);
    this.cardObj.textareaInputElement = this.textareaInput;
  }
  checkSelectedTemplateParams(_Index) {
    this.createObjectWithoutElementRef(_Index);
    this.initializeObject();
    if (!this.cards[this.activeCardIndex]['cardObjSet']) {
      this.cardObj['cardObjSet'] = true;
      this.cardObj.variables = [];
      this.cardObj.buttons = this.cardButtons || [];
      this.cardObj.buttons_info = JSON.parse(JSON.stringify(this.cardButtons || []));
      this.performCommonActionForEditor();
      this.cardObj.cardBody = JSON.parse(JSON.stringify(this.cardBody));
      this.cardObj.cardElement1.nativeElement.innerHTML = this.cardBody.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/ /g, '&nbsp;');
      this.cardObj.cardtext.nativeElement.innerText = this.cardObj.cardElement1.nativeElement.innerText;
      let text = this.cardObj.cardtext.nativeElement.innerText.split(/\s/).join('');
      this.cardObj.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(text));
      this.cardObj.cardTextInnerHTML = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerHTML));
      this.cardObj.cardTextInnerText = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerText));
      // this.updateShortUrlVariablesService.setPreviewValue(this, item);
      setTimeout(() => {
        this.highlightAndUpdateVariablesService.updateVariables(this.cardObj, this.cardObj.cardtext.nativeElement.innerText, '', true);
        this.updateShortUrlVariablesService.setFinalVarData(this.cardObj, true, false);
        this.createObjectWithoutElementRef(this.activeCardIndex);
      }, 1)
    } else {
      this.creatObjectWithElementRef(this.activeCardIndex);
      this.performCommonActionForEditor();
      this.cardObj.cardElement1.nativeElement.innerHTML = this.cardObj.cardBody.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/ /g, '&nbsp;');
      this.cardObj.cardtext.nativeElement.innerText = this.cardObj.cardElement1.nativeElement.innerText;
      let text = this.cardObj.cardtext.nativeElement.innerText.split(/\s/).join('');
      this.cardObj.cardTextInnerHTML = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerHTML));
      this.cardObj.cardTextInnerText = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerText));
      this.cardObj.IsNonEnglish = this.unicodeRegex.test(this.common.getReplacedJunkCharacter(text));
      setTimeout(() => {
        this.highlightAndUpdateVariablesService.updateVariables(this.cardObj, this.cardObj.cardtext.nativeElement.innerText, '', true);
        if (this.cardObj?.finalVarData['variablesArr']?.length) {
          this.getFinalVariabledData(this.cardObj.finalVarData, true)
        }
        if (this.cardObj?.['trackableLinks']?.length) {
          this.getUrlFormValue(this.cardObj.urlDrawerFormValue);
          setTimeout(() => {
            this.recievedData({ ...this.cardObj.urlReceivedData, ...{ data: this.cardObj } });
          })
        }
        // this.updateShortUrlVariablesService.setFinalVarData(this.cardObj, true, true);
      }, 1)
    }
  }

  performCommonActionForEditor() {
    if (this.cardObj.buttons && this.cardObj.buttons.length > 0) {
      this.resetUpdatedValuesFromService(this.highlightAndUpdateVariablesService.setButtonsArray(this.cardObj, true));
      this.cardObj.dynamicBtnArray = JSON.parse(JSON.stringify(this.cardObj.buttons.filter(e => e.url_type && (e.url_type == 'dynamic'))))
      if (this.cardObj.dynamicBtnArray?.length) {
        this.cardObj.dynamicBtnArray.forEach((e, i) => {
          let variable = 'dynamicButton' + (i ? i + 1 : '')
          this.cardObj[variable] = JSON.parse(JSON.stringify(e));
        })
      }
      if (this.cardObj.dynamicButton && Object.keys(this.cardObj.dynamicButton)) {
        this.cardObj.showDynamicUrlEditor = true;
        setTimeout(() => {
          this.initializeElementRef();
          this.cardObj.cardBtnText.nativeElement.innerText = this.cardObj.dynamicButton.url
        }, 0)
      }
      if (this.cardObj.dynamicButton2 && Object.keys(this.cardObj.dynamicButton2)) {
        this.cardObj.showDynamicUrlEditor2 = true;
        setTimeout(() => {
          this.initializeElementRef();
          this.cardObj.cardBtnText2.nativeElement.innerText = this.cardObj.dynamicButton2.url
        }, 0)
      }

    }
  }

  showPersonalize(data?, id?) {
    this.createCampaignService.getPersonalize(this.campaignId).subscribe((res: any) => {
      let val = (res.data && res.data.length > 0) ? res.data : [];
      this.cardObj.personalizeOptions = [];
      if (val && val.length > 0) {
        val.forEach(e => {
          this.cardObj.personalizeOptions.push({
            headerName: e
          });
        })
      }
      this.cardObj.varData.map(e => {
        e['columnList'] = this.cardObj.personalizeOptions
      })
      this.cardObj.variables = JSON.parse(JSON.stringify(this.cardObj.varData));
      if (data) {
        this.createCampaignService.setTextMessage(JSON.parse(JSON.stringify(this.cardObj.variables)));
        this.openDrawer(id);
      }
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }
  getUrlColumns(id) {
    let serviceCall: any;
    serviceCall = this.createWhatsappCampaignService.getHeaders(id)
    serviceCall.subscribe((res: any) => {
      let val = (res.data && res.data.length > 0) ? res.data : [];
      this.cardObj.columnContainingUrlList = [];
      if (val && val.length > 0) {
        val.forEach(e => {
          this.cardObj.columnContainingUrlList.push({
            header: e
          });
        })
        this.getHeaderValues();
      }
    }, err => {
    })
  }
  getHeaderValues() {
    let serviceCall: any;
    serviceCall = this.createWhatsappCampaignService.getHeaderValues(this.campaignId)
    serviceCall.subscribe((res: any) => {
      this.cardObj.headerValues = res.data[0];
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }
  closeDrawer(id) {
    this.cardObj.showPersonaliseVariables = false;
    this.cardObj.showAddLink = false;
    this.cardObj.previewValue = "";
    this.common.close(id)
  }
  getFinalVariabledData(data, GetButtonData = false) {
    this.resetUpdatedValuesFromService(this.updatePersonalisedValuesService.getFinalVariabledData(this.cardObj, data, true, GetButtonData))
    this.cardObj.cardTextInnerHTML = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerHTML));
    this.cardObj.cardTextInnerText = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerText));
    //This method is to get only button with personalize values
    this.cardObj.buttonsVarData = this.highlightAndUpdateVariablesService.getButtonsInfo(this.cardObj, true);
    this.createObjectWithoutElementRef(this.activeCardIndex);
  }
  checkForPersonalization() {
    if (!this.cardObj.finalVarData || !this.cardObj.finalVarData['variablesArr'] || !this.cardObj.finalVarData['variablesArr'].length || this.highlightAndUpdateVariablesService.hasPersonalisedValue(this.cardObj, true)) {
      return true;
    }
  }
  urlFormText(value) {
    // this.urlFromText = value;
  }

  getUrlFormValue(event) {
    this.cardObj.urlDrawerFormValue = JSON.parse(JSON.stringify(event));
    let arr = [];
    if (this.cardObj.buttons && this.cardObj.buttons.length) {
      arr = this.cardObj.buttons.filter(e => e.is_trackable)
    }
    if (arr.length && ((this.cardObj.urlClickedEditor == 'cardBtnText') || (this.cardObj.urlClickedEditor == 'cardBtnText2'))) {
      let urlClickedEditor1 = ''
      let urlClickedEditor2 = ''
      let index;
      let count = 1;
      if (this.cardObj.urlClickedEditor1Regex) {
        urlClickedEditor1 = this.highlightAndUpdateVariablesService.setInnerTextAndRegexValue(this.cardObj.urlClickedEditor1Regex, /\{\{[F][0-9]*\}\}/, '');
      }
      if (this.cardObj.urlClickedEditor2Regex) {
        urlClickedEditor2 = this.highlightAndUpdateVariablesService.setInnerTextAndRegexValue(this.cardObj.urlClickedEditor2Regex, /\{\{[F][0-9]*\}\}/g, '', true);
      }
      arr.forEach((e, i) => {
        e.url = e.url.replace(/F/g, '');
        if (((this.cardObj.urlClickedEditor == 'cardBtnText') && (urlClickedEditor1 == e.url)) || ((this.cardObj.urlClickedEditor == 'cardBtnText2') && (urlClickedEditor2 == e.url))) {
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
      this.cardObj.urlFormValue = event;
      this.sendCarouselUrlFormValue.emit(this.cardObj.urlFormValue);
    }
    this.createObjectWithoutElementRef(this.activeCardIndex)
  }

  recievedData(data) {
    this.updateShortUrlVariablesService.recievedData(this.cardObj, data, true);
    this.cardObj.cardTextInnerHTML = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerHTML));
    this.cardObj.cardTextInnerText = JSON.parse(JSON.stringify(this.cardObj.cardtext.nativeElement.innerText));
    this.getFinalVariabledData(this.cardObj.finalVarData, true)
    delete data.data;
    let Data = JSON.parse(JSON.stringify(data));
    this.cardObj.urlReceivedData = Data
  }

  initializeObject() {
    // this.cardObj = defaultCardObj
    this.cardObj.header = {
      type: "",
      media_id: "",
      new_filename: ""
    };
    this.cardObj.body = {
      "parameters": []
    };
    this.cardObj.button = [];

    this.cardObj.varData = [];
    this.cardObj.variables = [];
    this.cardObj.variablesDetails = [];
    this.cardObj.button = [];
    this.cardObj.buttons = [];
    this.cardObj.buttonsVarData = [];
    this.cardObj.buttons_info = [];
    this.cardObj.urlDrawerFormValue = null;
    this.cardObj.urlReceivedData = null;
    this.cardObj['bodyVarCheckArr'] = "";
    this.cardObj['bodyTextPreview'] = "";
    this.cardObj['actualHtml'] = "";
    this.cardObj['cardBody'] = "";
    this.cardObj['cardTextInnerHTML'] = "";
    this.cardObj['cardTextInnerText'] = "";
    this.cardObj['dynamicBtnArray'] = [];
    this.cardObj['dynamicButton'] = null;
    this.cardObj['finalVarData']['variablesArr'] = null;
    this.cardObj['footerActualHtml'] = "";
    this.cardObj.hidePersonaliseOption = false;
    this.cardObj.hideAllLink = true;
    this.cardObj.hideDropdown = false;
    this.cardObj.showVariables = false;
    this.cardObj.disableAddLink = false;
    this.cardObj.disablePersonalise = false;
    this.cardObj.showReset = false;
    this.cardObj.showQuickReplyPersonalisedButton = false;
    this.cardObj.showPersonaliseVariables = false;
    this.cardObj.hideForm = false;
    this.cardObj.urlChanged = false;
    this.cardObj.showAddLink = false;
    this.cardObj.IsNonEnglish = false;
    this.cardObj.showDynamicUrlEditor = false;
    this.cardObj.showDynamicUrlEditor2 = false;
    this.cardObj.previewValue = '';
    this.cardObj['previewUrl'] = '';
    this.cardObj['shortUrl'] = '';
    this.cardObj.enterUrl=null;
    this.cardObj.urlUploaded=false;
    this.cardObj.mediaType=0;
    this.initializeElementRef();
  }

  initializeElementRef() {
    // Link the ViewChild to cardObj
    this.cardObj.cardtext = this.cardtext;
    this.cardObj.cardElement1 = this.cardElement1;
    this.cardObj.cardElement2 = this.cardElement2;
    this.cardObj.cardElRef = this.cardElRef;
    this.cardObj.cardBtnText = this.cardBtnText;
    this.cardObj.cardBtnText2 = this.cardBtnText2;
    // this.sendCardObj.emit({ card: this.cardObj, index: 0, total_cards: this.cards.length, card_media_type: this.cardMediaType })
  }

  createObjectWithoutElementRef(_Index) {
    let CardObj = {};
    let DeletionKey = ['cardtext', 'cardElement1', 'cardElement2', 'cardElRef', 'cardBtnText', 'cardBtnText2', 'textareaInputElement', 'element1', 'element2', 'text2', 'shortUrl'];
    for (let key in this.cardObj) {
      if (!DeletionKey.includes(key)) {
        if (this.cardObj[key] == undefined && this.cardObj[key] == null) {
          this.cardObj[key] = "";
        }
        CardObj[key] = JSON.parse(JSON.stringify(this.cardObj[key]));
      }
    }
    CardObj = { ...CardObj, ...{ selectedLanguage: this.selectedLanguage } }
    this.cards[_Index] = JSON.parse(JSON.stringify(CardObj));
    this.checkAllCardMediaIdGenerated();
  }

  creatObjectWithElementRef(_Index) {
    let CardObj = {};
    let KeysToIgnore = ['cardtext', 'cardElement1', 'cardElement2', 'cardElRef', 'cardBtnText', 'cardBtnText2', 'textareaInputElement', 'element1', 'element2', 'text2', 'shortUrl'];
    for (let key in this.cards[_Index]) {
      if (!KeysToIgnore.includes(key)) {
        CardObj[key] = JSON.parse(JSON.stringify(this.cards[_Index][key]));
      }
    }
    CardObj = { ...CardObj, ...{ selectedLanguage: this.selectedLanguage } }
    this.cardObj = JSON.parse(JSON.stringify(CardObj));
    this.mediaType=this.cardObj.mediaType;
    this.setElementRef()
  }

  setElementRef() {
    this.cardObj['cardtext'] = null as ElementRef | null;
    this.cardObj['cardElement1'] = null as ElementRef | null;
    this.cardObj['cardElement2'] = null as ElementRef | null;
    this.cardObj['cardElRef'] = null as ElementRef | null;
    this.cardObj['cardBtnText'] = null as ElementRef | null;
    this.cardObj['cardBtnText2'] = null as ElementRef | null;
    this.cardObj['textareaInputElement'] = null as ElementRef<any> | null;
    this.initializeElementRef();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.mediaTypeAndLangData.firstChange) {
      this.mediaTypeAndLangData = changes.mediaTypeAndLangData.currentValue;
      this.setDataOnInit();
      this.initializeObject();
      setTimeout(() => {
        this.setDataOnAfterViewInit(true);
      }, 100)
    }
  }

  setDataOnInit() {
    this.cards = [];
    let Length = this.mediaTypeAndLangData?.lang_data?.cards.length;
    this.templateData = this.mediaTypeAndLangData?.lang_data?.cards;
    this.cardMediaType = this.templateData[0].components[0].format;
    if (Length) {
      for (let i = 0; i < Length; i++) {
        this.cards.push(JSON.parse(JSON.stringify(defaultCardJson)));
      }
    }
  }

  setDataOnAfterViewInit(IsLangChanged = false) {
    this.updateButtonVisibility();
    if (this.cards.length) {
      this.initializeElementRef();
      if (IsLangChanged) {
        this.cardObj['cardObjSet'] = false;
      }
      this.openSelectedCard(0, this.cards[0]);
      this.getUrlColumns(this.campaignId);
    }
  }

}