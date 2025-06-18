import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService as createSMSCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';

@Component({
  selector: 'app-multiple-suggestions',
  templateUrl: './multiple-suggestions.component.html',
  styleUrls: ['./multiple-suggestions.component.css']
})
export class MultipleSuggestionsComponent implements OnInit {

  // suggestionsForm: FormGroup;
  suggestion: any;
  buttonCount: any = 0;
  actionCount: any = 0;
  @Input() activeIndex: any;
  @Input() activeType: any;
  actionType = [
    { key: 'Dial', value: 'Dial' },
    // {key: 'View Location', value: 'View Location'},
    // {key: 'Create Calendar', value: 'Create Calendar'},
    { key: 'Open URL', value: 'Open URL' },
    // {key: 'Share Location', value: 'Share Location'},
    // {key: 'Payment Request', value: 'Payment Request'}
  ];
  configActionType = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false,
    createNew: false
  };
  @Input() actionTypeSelectText: any;
  translatedObj: any;
  phoneNumberControl: boolean = false;
  stop = new Subject<any>();
  @Output() sendFormData = new EventEmitter<any>();
  @Output() sendFormDataSingle = new EventEmitter<any>();
  @Input() sendMessageData: any;
  @Input() suggestionsArr: any;
  @Input() suggestionData: any;
  @Input() suggestionsForm: any;
  // @Output() sendFormDataSingleCard = new EventEmitter<any>();
  locationBy = [
    { key: 'By Query', value: 'By Query' },
    { key: 'By latitude and longitude', value: 'By latitude and longitude' }
  ];
  configLocationBy = {
    image: false,
    title: '',
    key: 'key',
    search: false,
    open: false,
    createNew: false
  };
  @Input() locationBySelectText: any;

  datePickerConfig = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1,
    minDate: moment(new Date()).format()
  }
  datePickerConfig2 = {
    showSpinners: true,
    showSeconds: false,
    touchUi: false,
    enableMeridian: false,
    hideTime: false,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1,
    minDate: moment(new Date()).format()
  }
  @Input() datePickerObj = {
    type: "dateTimePicker",
    dateObj: ""
  }
  datePickerObj2 = {
    type: "dateTimePicker",
    dateObj: ""
  }
  @Output() resetSuggestionsArr = new EventEmitter<any>();
  @ViewChild('suggestionText') suggestionText: ElementRef;
  @ViewChild('postBackData') postBackData: ElementRef;
  @ViewChild('fallBackUrl') fallBackUrl: ElementRef;
  @ViewChild('suggestionLabel') suggestionLabel: ElementRef;
  @ViewChild('calendarTitle') calendarTitle: ElementRef;
  @ViewChild('calendarDescription') calendarDescription: ElementRef;
  @ViewChild('suggestionUrl') suggestionUrl: ElementRef;
  @ViewChild('suggestionPhoneNumber') suggestionPhoneNumber: ElementRef;
  showContextMenu = true;
  contextMenuPosition = { x: '0px', y: '0px' };
  @Input() personalizeOptions: any
  @Input() contactCount: any;
  disablePersonalise: boolean = false;
  select: Selection;
  range: Range;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  showTextValue: boolean;
  showPostBack: boolean;
  showFallBackUrl: boolean;
  showLabel: boolean;
  showSuggestionUrl: boolean;
  showCalendarTitle: boolean;
  showCalendarDescription: boolean;
  copySuggestionText: any;
  @Output() sendPersonalisedEvent = new EventEmitter<any>();
  clickedType: any;
  showVariables: boolean = false;
  variables = [];
  varData: any[];
  clickedElement: any;
  suggestedResponseData: any;
  showDrawer: boolean;
  clickedText: string;
  clickedVar: any;
  currentActiveType: any;
  suggestionsConfig: any;
  messageType: any;
  fromBody = false;

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:click', ['$event'])
  onScrollEvent($event) {
    this.showContextMenu = false;
    setTimeout(() => {
      this.showContextMenu = true;
    }, 0);
  }

  @Output() activeTypeEvent = new EventEmitter<any>();
  @ViewChild('labelText') labelText: ElementRef;
  @ViewChild('elRef') elRef: ElementRef;
  showReset: boolean = false;
  finalVarData: any;
  headerValues: any;
  @Input() config: any;
  showPersonalizeOptions: boolean;
  @Input() campaignId: any;
  @ViewChild('url') url: ElementRef;
  @ViewChild('phoneNumber') phoneNumber: ElementRef;
  showTextContext: boolean;
  showUrlContext: boolean;
  showPhoneNumberContext: boolean;
  @Output() sendActiveIndex = new EventEmitter<any>();
  showPersonaliseVariables = false;

  constructor(public fb: FormBuilder, public common: CommonService, public createRcsCampaignService: CreateCampaignService, public createSMSCampaignService: createSMSCampaignService) {

    // this.suggestionsForm = this.fb.group({
    //   suggestions: this.fb.array([]),
    //   text: ['', []],
    //   postBackData: ['', []],
    //   fallBackUrl: ['', []],
    //   actionType: ['', []],
    //   phoneNumber: ['', []]
    // })

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        this.configActionType.title = this.translatedObj['campaign.select-text']
      }
    })

    this.common.getEventToGetSuggestionsValue().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (this.suggestionsForm.value.suggestions && this.suggestionsForm.value.suggestions.length) {
        this.suggestionsForm.get('suggestions').controls.forEach((e, index) => {
          let obj = e.get('buttonText').value ? e.get('buttonText').value : e.get('actionButtonText').value
          e.get('text').setValue(this.suggestedResponseData[index][obj.toLowerCase()].labelInnerText)
          if (obj.toLowerCase() == 'action') {
            e.get('url').setValue(this.suggestedResponseData[index][obj.toLowerCase()].urlInnerText)
            e.get('phoneNumber').setValue(this.suggestedResponseData[index][obj.toLowerCase()].phoneNumberInnerText)
          }
        })
      }
      this.sendFormData.emit({ ...this.suggestionsForm.value, ...res, ...{ variablesData: this.suggestedResponseData } })
    })

    this.common.getEventToGetSuggestionsValueSingle().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      this.sendFormDataSingle.emit({ ...this.suggestionsForm.value })
    })

    // this.common.getCardSuggestionValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
    //   this.sendFormDataSingleCard.emit({...this.suggestionsForm.value})
    // })

    // this.common.getSuggestionValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
    //   if(res) {
    //     this.setValues(res);
    //   }
    // })

    this.createRcsCampaignService.getSuggestedVariablesEvent().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        this.messageType = res?.type
        this.activeIndex = res.activeIndex > -1 ? res.activeIndex : 0
        if (this.messageType == 3) {
          this.suggestedResponseData = res.cards.value[res.activeCardIndex].suggestions
        }
        else {
          this.suggestedResponseData = res.suggestions
        }
        this.selectSuggestion({ index: this.activeIndex }, 'switch')
      }
      // if(res) {
      //   this.activeIndex = 0;
      //   if(res.card) {
      //     this.suggestedResponseData = res.suggestions
      //     this.setVariableValues(res.suggestions, this.labelText);
      //     if(this.activeType.toLowerCase() == 'action') {
      //       this.setVariableValues(res.suggestions, this.url, this.activeType.toLowerCase());
      //     }
      //     // this.selectSuggestion({index: this.activeIndex})
      //   }
      //   else {
      //     setTimeout(() => {
      //       this.suggestedResponseData = res.suggestions
      //       this.setVariableValues(res.suggestions, this.labelText);
      //       if(this.activeType.toLowerCase() == 'action') {
      //         this.setVariableValues(res.suggestions, this.url, this.activeType.toLowerCase());
      //       }
      //       this.selectSuggestion({index: this.activeIndex})
      //     }, 100);
      //   }
      // }
    })

    this.createRcsCampaignService.getSuggestionsVariableData().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        // this.fromBody = true
        this.messageType = res?.type
        this.getFinalVariabledData(res?.data, '', 'non-suggested');
      }
    })

    this.createRcsCampaignService.getResetSuggestionsVariable().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (res) {
        this.showVariables = true
        this.clickedVar = res.clickedVar
        this.clickedText = res.clickedText
        if (this.messageType != 3) {
          this.clickedType = 'labelText'
          this.clickedElement = this.labelText
          this.resetVariable(res, this.clickedType, true);
        }
        else {
          this.resetCardsVariable(res);
        }
      }
    })

    this.createRcsCampaignService.setRCSSuggestionsData.subscribe(res => {
      if (res && res.hasOwnProperty('variablesData') && res.variablesData.length && (res.templateType != "rich_carousel_card")) {
        this.activeIndex = 0;
        this.suggestedResponseData = res.variablesData
        setTimeout(() => {
          this.selectSuggestion({ index: this.activeIndex }, 'switch')
        });
      }
    })
  }

  ngOnChanges() {
    if (this.suggestionsForm.get('actionType').value) {
      if (this.suggestionsForm.get('startDateTime').value) {
        this.datePickerObj = {
          dateObj: moment(new Date(this.suggestionsForm.get('startDateTime').value)).format(),
          type: "dateTimePicker"
        }
      }
      if (this.suggestionsForm.get('endDateTime').value) {
        this.datePickerObj2 = {
          dateObj: moment(new Date(this.suggestionsForm.get('endDateTime').value)).format(),
          type: "dateTimePicker"
        }
      }
    }

    // if(this.activeIndex > -1) {
    //   this.selectSuggestion({index: this.activeIndex})
    // }
    //  if(this.suggestionData) {
    //   this.setValues(this.suggestionData);
    //  }
  }

  ngOnInit(): void {
    this.suggestionsConfig = JSON.parse(JSON.stringify(this.config))
    this.suggestion = <FormArray>this.suggestionsForm.controls["suggestions"];
    // this.suggestion.push(this.actionRows(this.suggestion));
  }

  suggestionType(event, val) {
    if (val == 'Reply') {
      this.buttonCount += 1;
    }
    else {
      this.actionCount += 1;
    }
    this.suggestion.push(this.actionRows(val));
    this.selectSuggestion(val);
    if (this.sendMessageData) {
      this.resetSuggestionsArr.emit(this.suggestionsForm.get('suggestions')['controls']);
    }
  }

  public actionRows(value?) {
    return this.fb.group({
      buttonText: [value && value == 'Reply' ? value : ''],
      text: ['', []],
      postBackText: ['', []],
      actionButtonText: [value && value == 'Action' ? value : ''],
      buttonCount: [this.buttonCount],
      actionCount: [this.actionCount],
      active: [false, []],
      postBackData: ['', []],
      fallBackUrl: ['', []],
      actionType: ['', []],
      actionTypeSelectText: ['', []],
      phoneNumber: ['', []],

      locationBy: ['', []],
      label: ['', []],
      latitude: ['', []],
      longitude: ['', []],
      query: ['', []],
      url: ['', []],
      calendarTitle: ['', []],
      calendardescription: ['', []],
      startDateTime: ['', []],
      endDateTime: ['', []],
      locationBySelectText: ['', []],
      datePickerObj: [{
        type: "dateTimePicker",
        dateObj: ""
      }, []],
      datePickerObj2: [{
        type: "dateTimePicker",
        dateObj: ""
      }, []]
    });
  }

  checkEnter(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 13) {
      return false;
    }
    return true;
  }

  updateContent(e?: any, i?) {
    // if (e.target.value != '') {
    //   this.previewQuickBtnList[i] = e.target.value;
    //   let ob: any = {
    //     previewQuickBtnList: this.previewQuickBtnList,
    //     value: e?.target?.value?.length > 0 ? e?.target?.value : '',
    //     key: 'text',
    //     index: i,
    //     type: 'quick'
    //   }
    //   this.ctaPreviewObj.emit(ob)
    // }
  }

  removeQuickBtnRow(index) {
    if (this.suggestion && this.suggestion.controls.length > 0) {
      this.suggestion.controls[index].get('text').setValue('');
      this.suggestionsForm.get('text').setValue('');
      if (this.suggestionText) {
        this.suggestionText.nativeElement.innerText = '';
      }
    }
  }

  removeSuggestionType(i, data, item) {
    if (data == 'Reply') {
      this.buttonCount -= 1;
    }
    else {
      this.actionCount -= 1;
    }
    this.suggestion.removeAt(i);
    if (item.value.active) {
      this.selectSuggestion(data);
    }
    this.resetSuggestionsArr.emit(this.suggestionsForm.get('suggestions')['controls']);
  }

  selectSuggestion(event, type?, fromUI = false) {
    // this.activeType = data;
    let i = -1
    if (event && event.index > -1) {
      i = event.index
      if (fromUI) this.sendActiveIndex.emit(i);
    }
    let data = this.suggestion?.controls[i]?.value?.buttonText ? this.suggestion?.controls[i]?.value?.buttonText : this.suggestion?.controls[i]?.value?.actionButtonText
    this.currentActiveType = data
    this.activeTypeEvent.emit(data);
    // this.activeIndex = i;
    this.suggestionsForm.get('text').setValue('');
    this.suggestionsForm.get('postBackData').setValue('');
    if (data == 'Action') {
      this.suggestionsForm.get('fallBackUrl').setValue('');
      this.suggestionsForm.get('actionType').setValue('');
      this.suggestionsForm.get('actionTypeSelectText').setValue('');
      this.suggestionsForm.get('phoneNumber').setValue('');
      this.suggestionsForm.get('locationBy').setValue('');
      this.suggestionsForm.get('locationBySelectText').setValue('');
      this.suggestionsForm.get('calendarTitle').setValue('');
      this.suggestionsForm.get('calendardescription').setValue('');
      this.suggestionsForm.get('url').setValue('');
      this.suggestionsForm.get('startDateTime').setValue('');
      this.suggestionsForm.get('endDateTime').setValue('');
      this.suggestionsForm.get('query').setValue('');
      this.suggestionsForm.get('label').setValue('');
      this.suggestionsForm.get('longitude').setValue('');
      this.suggestionsForm.get('latitude').setValue('');
      this.actionTypeSelectText = this.translatedObj['campaign.select-text']
      this.locationBySelectText = this.translatedObj['campaign.select-text']
    }
    this.setEditorValue();
    if (this.suggestion && this.suggestion.controls && this.suggestion.controls.length > 0) {
      if (i > -1) {
        this.activeIndex = i;
      }
      else {
        this.activeIndex = 0
      }
      this.suggestion.controls.forEach((e, index) => {
        if (i > -1) {
          if (i == index) {
            this.activeTypeEvent.emit(e.get('buttonText').value ? e.get('buttonText').value : e.get('actionButtonText').value);
            e.get('active').setValue(true);
            this.suggestionsForm.get('text').setValue(e.get('text').value)
            this.suggestionsForm.get('active').setValue(true)
            this.suggestionsForm.get('postBackData').setValue(e.get('postBackData').value)
            if (data == 'Action') {
              this.suggestionsForm.get('fallBackUrl').setValue(e.get('fallBackUrl').value);
              this.suggestionsForm.get('actionType').setValue(e.get('actionType').value);
              this.actionTypeSelectText = e.get('actionTypeSelectText').value;
              this.suggestionsForm.get('actionTypeSelectText').setValue(this.actionTypeSelectText);



              if ((e.get('actionType').value).toLowerCase() == 'dial') {
                this.suggestionsForm.get('phoneNumber').setValue(e.get('phoneNumber').value)
              }

              if ((e.get('actionType').value).toLowerCase() == 'view location') {
                this.suggestionsForm.get('locationBy').setValue(e.get('locationBy').value)
                this.suggestionsForm.get('locationBySelectText').setValue(e.get('locationBySelectText').value)
                this.locationBySelectText = e.get('locationBySelectText').value

                if (e.get('locationBy').value && e.get('locationBy').value == 'By Query') {
                  this.suggestionsForm.get('query').setValue(e.get('query').value)
                }
                else {
                  this.suggestionsForm.get('latitude').setValue(e.get('action').value?.latitude)
                  this.suggestionsForm.get('longitude').setValue(e.get('action').value?.longitude)
                  this.suggestionsForm.get('query').setValue(e.get('action').value?.query)
                  if (e.get('label').value) {
                    this.suggestionsForm.get('label').setValue(e.get('label').value)
                  }
                }
              }
              if ((e.get('actionType').value).toLowerCase() == 'share location') {
                // this.suggestionsForm.get('query').setValue(e.get('text')?.value)
              }

              if ((e.get('actionType').value).toLowerCase() == 'open url') {

                this.suggestionsForm.get('url').setValue(e.get('url').value)
              }

              if ((e.get('actionType').value).toLowerCase() == 'create calendar') {
                this.suggestionsForm.get('startDateTime').setValue(e.get('action')?.startDateTime)
                this.suggestionsForm.get('endDateTime').setValue(e.get('action').value?.endDateTime)
                this.suggestionsForm.get('calendarTitle').setValue(e.get('action').value?.calendarTitle)
                this.suggestionsForm.get('calendardescription').setValue(e.get('action').value?.calendardescription)

                this.suggestionsForm.get('datePickerObj').setValue({
                  dateObj: moment(new Date(e.get('action').value?.startDateTime)).format(),
                  type: "dateTimePicker"
                })

                this.suggestionsForm.get('datePickerObj2').setValue({
                  dateObj: moment(new Date(e.get('action').value?.endDateTime)).format(),
                  type: "dateTimePicker"
                })

              }







              this.actionTypeSelectText = e.get('actionTypeSelectText').value
            }
            this.setEditorValue(true, e);
          }
          else {
            e.get('active').setValue(false)
            this.suggestionsForm.get('active').setValue(false)
          }
        }
        else {
          if (index == 0) {
            // this.activeType = e.get('buttonText').value ? e.get('buttonText').value : e.get('actionButtonText').value
            this.activeTypeEvent.emit(e.get('buttonText').value ? e.get('buttonText').value : e.get('actionButtonText').value);
            e.get('active').setValue(true)
            this.suggestionsForm.get('active').setValue(true)
            this.suggestionsForm.get('text').setValue(e.get('text').value ? e.get('text').value : '')
            this.suggestionsForm.get('postBackData').setValue(e.get('postBackData').value ? e.get('postBackData').value : '')
            if (data == 'Action') {
              this.suggestionsForm.get('fallBackUrl').setValue(e.get('fallBackUrl').value ? e.get('fallBackUrl').value : '');
              this.suggestionsForm.get('actionType').setValue(e.get('actionType').value ? e.get('actionType').value : '');
              this.actionTypeSelectText = e.get('actionTypeSelectText').value;
              this.suggestionsForm.get('actionTypeSelectText').setValue(this.actionTypeSelectText);


              if ((e.get('actionType').value).toLowerCase() == 'dial') {
                this.suggestionsForm.get('phoneNumber').setValue(e.get('phoneNumber').value)
              }

              if ((e.get('actionType').value).toLowerCase() == 'view location') {
                this.suggestionsForm.get('locationBy').setValue(e.get('locationBy').value)
                this.suggestionsForm.get('locationBySelectText').setValue(e.get('locationBySelectText').value)
                this.locationBySelectText = e.get('locationBySelectText').value

                if (e.get('locationBy').value && e.get('locationBy').value == 'By Query') {
                  this.suggestionsForm.get('query').setValue(e.get('query').value)
                }
                else {
                  this.suggestionsForm.get('latitude').setValue(e.get('latitude').value)
                  this.suggestionsForm.get('longitude').setValue(e.get('longitude').value)
                  if (e.get('label').value) {
                    this.suggestionsForm.get('label').setValue(e.get('label').value)
                  }
                }
              }

              if ((e.get('actionType').value).toLowerCase() == 'open url') {

                this.suggestionsForm.get('url').setValue(e.get('url').value)
              }

              if ((e.get('actionType').value).toLowerCase() == 'create calendar') {
                this.suggestionsForm.get('startDateTime').setValue(e.get('startDateTime').value)
                this.suggestionsForm.get('endDateTime').setValue(e.get('endDateTime').value)
                this.suggestionsForm.get('calendarTitle').setValue(e.get('calendarTitle').value)
                this.suggestionsForm.get('calendardescription').setValue(e.get('calendardescription').value)

                this.suggestionsForm.get('datePickerObj').setValue({
                  dateObj: moment(new Date(e.get('startDateTime').value)).format(),
                  type: "dateTimePicker"
                })

                this.suggestionsForm.get('datePickerObj2').setValue({
                  dateObj: moment(new Date(e.get('endDateTime').value)).format(),
                  type: "dateTimePicker"
                })

              }






              this.actionTypeSelectText = e.get('actionTypeSelectText').value
            }
            this.setEditorValue(true, e);
          }
          else {
            e.get('active').setValue(false)
            this.suggestionsForm.get('active').setValue(false)
          }
        }
      })
    }
    this.clickedType = 'labelText'
    this.clickedElement = this.labelText
    setTimeout(() => {
      this.setVariableValues(this.suggestedResponseData, this.labelText);
      this.getFinalVariabledData(this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.textFinalVarData, type, 'non-suggested');
      if (this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].hasOwnProperty('openUrlAction') && this.activeType.toLowerCase() == 'action') {
        setTimeout(() => {
          this.clickedType = 'url'
          this.clickedElement = this.url
          this.setVariableValues(this.suggestedResponseData, this.url, { is_url: true, is_dial: false });
          this.getFinalVariabledData(this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.urlFinalVarData, type, 'non-suggested');
        });
      }
      if (this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].hasOwnProperty('dialAction') && this.activeType.toLowerCase() == 'action') {
        setTimeout(() => {
          this.clickedType = 'phoneNumber'
          this.clickedElement = this.phoneNumber
          this.setVariableValues(this.suggestedResponseData, this.phoneNumber, { is_url: false, is_dial: true });
          this.getFinalVariabledData(this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.phoneNumberFinalVarData, type, 'non-suggested');
        });
      }
    });
  }

  getTextData(key, element?) {
    if (element) {
      this.suggestionsForm.get(key).setValue(element ? this.common.getReplacedJunkCharacter(element.value) : '');
    }
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        e.get(key).setValue(this.suggestionsForm.get(key).value)
      }
    })
  }

  selectActionRecive(item, key) {
    this.resetActionTypes();
    // this.resetLocationBy();
    if (key == 'actionType') {
      this.actionTypeSelectText = item.key ? item.key : this.translatedObj['campaign.select-text'];
      this.suggestionsForm.get(key).setValue(item.value ? item.value : '');
      this.suggestionsForm.get('actionTypeSelectText').setValue(this.actionTypeSelectText);
      this.suggestion.controls.forEach(e => {
        if (e.get('active').value) {
          e.get(key).setValue(this.suggestionsForm.get(key).value)
          e.get('actionTypeSelectText').setValue(this.actionTypeSelectText)
        }
      })
      if (this.actionTypeSelectText == 'Dial') {
        this.phoneNumberControl = true;
      }
    }
    if (key == 'locationBy') {
      this.locationBySelectText = item.key ? item.key : this.translatedObj['campaign.select-text'];
      this.suggestionsForm.get(key).setValue(item.value ? item.value : '');
      this.suggestionsForm.get('locationBySelectText').setValue(this.locationBySelectText);
      this.suggestion.controls.forEach(e => {
        if (e.get('active').value) {
          e.get(key).setValue(this.suggestionsForm.get(key).value)
          e.get('locationBySelectText').setValue(this.locationBySelectText)
        }
      })
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.suggestionsForm.controls[fieldName].errors && this.suggestionsForm.controls[fieldName].errors[errorType]) {
      return this.sendMessageData && this.suggestionsForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  receiveDate(e) {
    this.suggestionsForm.get('startDateTime').setValue(e);
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        e.get('startDateTime').setValue(this.suggestionsForm.get('startDateTime').value);
        this.datePickerConfig2.minDate = moment(this.suggestionsForm.get('startDateTime').value).format()
      }
    })
  }

  receiveDate2(e) {
    this.suggestionsForm.get('endDateTime').setValue(e);
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        e.get('endDateTime').setValue(this.suggestionsForm.get('endDateTime').value);
      }
    })
  }

  resetActionTypes() {
    this.suggestionsForm.get('phoneNumber').setValue('');
    this.suggestionsForm.get('locationBy').setValue('');
    this.suggestionsForm.get('locationBySelectText').setValue('');
    this.suggestionsForm.get('calendarTitle').setValue('');
    this.suggestionsForm.get('calendardescription').setValue('');
    this.suggestionsForm.get('url').setValue('');
    this.suggestionsForm.get('startDateTime').setValue('');
    this.suggestionsForm.get('endDateTime').setValue('');
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        e.get('phoneNumber').setValue('');
        e.get('locationBy').setValue('');
        e.get('locationBySelectText').setValue(this.translatedObj['campaign.select-text']);
        e.get('calendarTitle').setValue('');
        e.get('calendardescription').setValue('');
        e.get('url').setValue('');
        e.get('startDateTime').setValue('');
        e.get('endDateTime').setValue('');
        this.datePickerObj = {
          type: "dateTimePicker",
          dateObj: ""
        }
        this.datePickerObj2 = {
          type: "dateTimePicker",
          dateObj: ""
        }
      }
    })
    this.resetLocationBy();
  }

  resetLocationBy() {
    this.suggestionsForm.get('query').setValue('');
    this.suggestionsForm.get('label').setValue('');
    this.suggestionsForm.get('latitude').setValue('');
    this.suggestionsForm.get('longitude').setValue('');
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        e.get('query').setValue('');
        e.get('label').setValue('');
        e.get('latitude').setValue('');
        e.get('longitude').setValue('');
      }
    })
  }

  PosEnd(end) {
    var range = document.createRange()
    var sel = window.getSelection()
    range.setStart(end.childNodes[0], end.innerText?.length)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  getValue(key?) {
    if (this.suggestionText && this.suggestionText.nativeElement.innerText == '\n') {
      this.suggestionText.nativeElement.innerText = '';
    }
    this.suggestion.controls.forEach(e => {
      if (e.get('active').value) {
        if (key == 'text') {
          ;
          if (this.suggestionText.nativeElement.innerText && this.suggestionText.nativeElement.innerText?.length > 25 && this.copySuggestionText) {
            this.suggestionText.nativeElement.innerText = this.common.getReplacedJunkCharacter(JSON.parse(JSON.stringify(this.copySuggestionText)));
            let id = document.getElementById('suggestionText')
            this.PosEnd(id)
          }
          e.get(key).setValue(this.suggestionText ? this.common.getReplacedJunkCharacter(this.suggestionText.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.suggestionText ? this.common.getReplacedJunkCharacter(this.suggestionText.nativeElement.innerText) : '');
          this.copySuggestionText = '';
        }
        if (key == 'postBackData') {
          e.get(key).setValue(this.postBackData ? this.common.getReplacedJunkCharacter(this.postBackData.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.postBackData ? this.common.getReplacedJunkCharacter(this.postBackData.nativeElement.innerText) : '');
        }
        if (key == 'fallBackUrl') {
          e.get(key).setValue(this.fallBackUrl ? this.common.getReplacedJunkCharacter(this.fallBackUrl.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.fallBackUrl ? this.common.getReplacedJunkCharacter(this.fallBackUrl.nativeElement.innerText) : '');
        }
        if (key == 'label') {
          e.get(key).setValue(this.suggestionLabel ? this.common.getReplacedJunkCharacter(this.suggestionLabel.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.suggestionLabel ? this.common.getReplacedJunkCharacter(this.suggestionLabel.nativeElement.innerText) : '');
        }
        if (key == 'latitude') {
          e.get(key).setValue(this.common.getReplacedJunkCharacter(this.suggestionsForm.get(key).value));
        }
        if (key == 'longitude') {
          e.get(key).setValue(this.common.getReplacedJunkCharacter(this.suggestionsForm.get(key).value));
        }
        if (key == 'url') {
          e.get(key).setValue(this.suggestionUrl ? this.common.getReplacedJunkCharacter(this.suggestionUrl.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.suggestionUrl ? this.common.getReplacedJunkCharacter(this.suggestionUrl.nativeElement.innerText) : '');
        }
        if (key == 'calendarTitle') {
          e.get(key).setValue(this.calendarTitle ? this.common.getReplacedJunkCharacter(this.calendarTitle.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.calendarTitle ? this.common.getReplacedJunkCharacter(this.calendarTitle.nativeElement.innerText) : '');
        }
        if (key == 'calendardescription') {
          e.get(key).setValue(this.calendarDescription ? this.common.getReplacedJunkCharacter(this.calendarDescription.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.calendarDescription ? this.common.getReplacedJunkCharacter(this.calendarDescription.nativeElement.innerText) : '');
        }
        if (key == 'phoneNumber') {
          e.get(key).setValue(this.suggestionPhoneNumber ? this.common.getReplacedJunkCharacter(this.suggestionPhoneNumber.nativeElement.innerText) : '');
          this.suggestionsForm.get(key).setValue(this.suggestionPhoneNumber ? this.common.getReplacedJunkCharacter(this.suggestionPhoneNumber.nativeElement.innerText) : '');
        }
        if (key == 'query') {
          e.get(key).setValue(this.common.getReplacedJunkCharacter(this.suggestionsForm.get(key).value));
        }
      }
    })
  }

  insertPersonalizeItem(item, type) {
    this.copySuggestionText = JSON.parse(JSON.stringify(this.suggestionText.nativeElement.innerText));
    let personalizeItem = `<<${item.headerName}>>`;
    if (type == 'text') {
      if ((this.labelText.nativeElement.innerText == null)) {
        // this.messageForm.get('textMessage').setValue('');
        this.labelText.nativeElement.innerText = '';
        this.elRef.nativeElement.innerText = '';
      }
    }
    var html = personalizeItem
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
    if (type == 'text') {
      if (this.clickedType == 'url') {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlActualHtml = this.labelText.nativeElement.innerHTML;
      } else if (this.clickedType == 'phoneNumber') {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberActualHtml = this.labelText.nativeElement.innerHTML;
      }
      else {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textActualHtml = this.labelText.nativeElement.innerHTML;
      }
    }
    this.sendPersonalisedEvent.emit(true);
    this.getTextEvent(type);
  }

  setEditorValue(data?, e?) {
    setTimeout(() => {
      if (this.suggestionText) {
        this.suggestionText.nativeElement.innerText = data ? (e.get('text').value ? e.get('text').value : '') : '';
      }
      if (this.postBackData) {
        this.postBackData.nativeElement.innerText = data ? (e.get('postBackData').value ? e.get('postBackData').value : '') : '';
      }
      if (this.fallBackUrl) {
        this.fallBackUrl.nativeElement.innerText = data ? (e.get('fallBackUrl').value ? e.get('fallBackUrl').value : '') : '';
      }
      if (this.suggestionLabel) {
        this.suggestionLabel.nativeElement.innerText = data ? (e.get('label').value ? e.get('label').value : '') : '';
      }
      if (this.suggestionUrl) {
        this.suggestionUrl.nativeElement.innerText = data ? (e.get('url').value ? e.get('url').value : '') : '';
      }
      if (this.suggestionPhoneNumber) {
        this.suggestionPhoneNumber.nativeElement.innerText = data ? (e.get('phoneNumber').value ? e.get('phoneNumber').value : '') : '';
      }
      if (this.calendarTitle) {
        this.calendarTitle.nativeElement.innerText = data ? (e.get('calendarTitle').value ? e.get('calendarTitle').value : '') : '';
      }
      if (this.calendarDescription) {
        this.calendarDescription.nativeElement.innerText = data ? (e.get('calendardescription').value ? e.get('calendardescription').value : '') : '';
      }
    }, 100);
  }

  selectItemEvent(data) {
    this.insertPersonalizeItem(data.item, data.key);
  }

  checkCount(event) {
    this.copySuggestionText = JSON.parse(JSON.stringify(this.suggestionText.nativeElement.innerText));
    if (this.suggestionText && this.suggestionText.nativeElement.innerText.length > 24) {
      event.preventDefault();
      return;
    }
  }

  setData(input, data, key) {
    if (((key == 'text') && (this.suggestionsForm.get(key).value + '<<' + data.headerName + '>>').length <= 25) || (key != 'text')) {
      this.suggestionsForm.get(key).setValue(this.common.getValueAsPerPointer(input, this.suggestionsForm.get(key).value, data.headerName));
      this.getTextData(key);
    }
  }

  getTextEvent(event?) {
    if (this.labelText && this.labelText.nativeElement.innerText == '\n') {
      this.labelText.nativeElement.innerText = '';
      this.elRef.nativeElement.innerText = '';
    }
    if (this.labelText && this.labelText.nativeElement) {
      this.elRef.nativeElement.innerHTML = this.labelText.nativeElement.innerHTML.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ')
      this.elRef.nativeElement.innerText = this.common.getReplacedJunkCharacter(this.elRef.nativeElement.innerText)
    }
  }

  getMenuEvent(event: MouseEvent, variable?) {
    this.clickedType = variable;
    this.showTextContext = false;
    this.showUrlContext = false;
    this.showPhoneNumberContext = false;
    if (variable == 'labelText') {
      this.showTextContext = true;
    }
    if (variable == 'url') {
      this.showUrlContext = true;
    }
    if (variable == 'phoneNumber') {
      this.showPhoneNumberContext = true;
    }
    // if((this.messageForm.get('messageType').value == 2) || (this.messageForm.get('messageType').value == 3))
    setTimeout(() => {
      let obj = {
        key: variable,
        event: event
      }
      this.common.setContextEvent(obj);
    }, 0);
    let hasClass = event.target['classList'].contains('variable-text');
    if (hasClass) {
      this.showVariables = true;
    }
    else {
      this.showVariables = false;
    }
    event.preventDefault();
    var selection;
    selection = window.getSelection();
    var range = selection?.getRangeAt(0);
    var node = selection?.anchorNode;
    // if (!this.personalizeOptions || (this.personalizeOptions && this.personalizeOptions.length == 0)) {
    //   return
    // }
    var tag = false;
    if (this.showVariables) {
      this.clickedVar = event.target['classList'].item(1);
      this.clickedText = '>' + event.target['innerText']
    }

    if (window.getSelection) {
      // IE9 and non-IE
      this.select = window.getSelection();
      if (this.select.getRangeAt && this.select.rangeCount) {
        this.range = this.select.getRangeAt(0);
      }
    } else if (document['selection'] && document['selection'].type != "Control") {
      // IE < 9
      // document['selection'].createRange().pasteHTML(html);
    }
    // this.showPersonalize();
    if (this.showVariables) {
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu?.menu?.focusFirstItem('mouse');
      this.contextMenu?.openMenu();
    }
  }

  showAllVariablesPersonalisation(id, type, clickedText?) {
    this.variables = [];
    // if(this.activeType.toLowerCase() == 'reply') {
    if (this.clickedType == 'url') {
      this.variables = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()]['urlVariables'];
    } else if (this.clickedType == 'phoneNumber') {
      this.variables = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()]['phoneNumberVariables'];
    }
    else {
      this.variables = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()]['textVariables'];
    }
    this.clickedElement = ''
    if (type == 'labelText') {
      this.clickedElement = this.labelText
      this.getActiveVariables('', '', 'all-variables', id);
    }
    else if (type == 'url') {
      this.clickedElement = this.url
      this.getActiveVariables('', '', '', '', { is_url: true, is_dial: false });
    }
    else if (type == 'phoneNumber') {
      this.clickedElement = this.phoneNumber
      this.getActiveVariables('', '', 'all-variables', id, { is_url: false, is_dial: true });
    }
    let obj2: any = {};
    if (type == 'labelText') {
      obj2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textFinalVarData
    }
    else if (type == 'url') {
      obj2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlFinalVarData
    }
    else if (type == 'phoneNumber') {
      obj2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberFinalVarData
    }
    this.showPersonaliseVariables = true;
    if (obj2 && obj2.variablesArr && obj2.variablesArr.length > 0) {
      this.showPersonalize('all-variables', id, '', true, obj2)
      this.varData=obj2;
    }
    else {
      this.variables = [];
      // this.specificVarClicked = false;
      if (type == 'labelText') {
        this.getActiveVariables(this.suggestedResponseData, type, 'all-variables', id);
      }
      else {
        if (type == 'url') {
          this.getActiveVariables(this.suggestedResponseData, type, 'all-variables', id, { is_url: true, is_dial: false });
        } else if (type == 'phoneNumber') {
          this.getActiveVariables(this.suggestedResponseData, type, 'all-variables', id, { is_url: false, is_dial: true });
        }
      }
    }
  }

  resetVariable(event: MouseEvent, type, fromBody = false) {
    // this.inputType = type;
    this.fromBody = fromBody;
    this.common.setPersonalizeHeader([]);



    this.suggestion.value.forEach((e, index) => {
      this.clickedType = 'labelText'
      this.clickedElement = this.labelText
      this.activeTypeEvent.emit(e.buttonText ? e.buttonText : e.actionButtonText);
      this.resetVariablesForAll(e.buttonText == 'Reply' ? 'reply' : 'action', index);
      if ((e.buttonText == 'Action') || e.actionButtonText) {
        // this.activeTypeEvent.emit(e.buttonText ? e.buttonText : e.actionButtonText);
        console.log(e.actionType)
        setTimeout(() => {
          if (e.actionType.toLowerCase() == 'open url') {
            this.clickedType = 'url'
            this.clickedElement = this.url
            this.resetVariablesForAll(e.buttonText == 'Reply' ? 'reply' : 'action', index);
          }
          if (e.actionType.toLowerCase() == 'dial') {
            this.clickedType = 'phoneNumber'
            this.clickedElement = this.phoneNumber
            this.resetVariablesForAll(e.buttonText == 'Reply' ? 'reply' : 'action', index);
          }
        });
      }
    })
    if (this.messageType != 3) this.selectSuggestion({ index: this.activeIndex }, 'switch')

    if (this.clickedType == 'url') {
      this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlInnerText = this.url ? this.url.nativeElement.innerText : ''
    }
    else if (this.clickedType == 'phoneNumber') {
      this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberInnerText = this.phoneNumber ? this.phoneNumber.nativeElement.innerText : ''
    }
    else {
      this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].labelInnerText = this.labelText.nativeElement.innerText
    }

    // this.updateVariableValues();
    if (!this.fromBody) this.createRcsCampaignService.resetMessageVariables.next({ ...this.suggestedResponseData, ...{ clickedText: this.clickedText, clickedVar: this.clickedVar } })
  }

  setVariableValues(data, element, inputFieldObj?) {
    // this.suggestedResponseData = data
    // this.templateData = '';
    // this.messageForm.get('textMessage').setValue(null)
    if (!element) return;
    element.nativeElement.innerText = null;
    if (inputFieldObj?.is_url) {
      element.nativeElement.innerText = this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.['openUrlAction']?.['url']
    }
    else if (inputFieldObj?.is_dial) {
      element.nativeElement.innerText = this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.['dialAction']?.['phoneNumber']
    }
    else {
      element.nativeElement.innerText = this.suggestedResponseData[this.activeIndex][this.activeType?.toLowerCase()]?.['text']
    }
    this.updateVariables(data, element, inputFieldObj);
  }

  updateVariables(data, element, inputFieldObj?) {
    this.getActiveVariables(data, element, '', '', inputFieldObj);
    this.highlightVariables(data, element, inputFieldObj);
  }

  getActiveVariables(data?, element?, allVar?, id?, inputFieldObj?) {
    let regex;
    let arr = [];
    // if(this.activeType.toLowerCase() == 'reply') {
    if (inputFieldObj?.is_url) {
      arr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlVariables;
    }
    else if (inputFieldObj?.is_dial) {
      arr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberVariables;
    }
    else {
      arr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textVariables;
    }
    if (arr && arr.length > 0) {
      if ((this.variables && this.variables.length == 0) || !this.variables) {
        this.variables = [];
        this.varData = []
        arr.forEach(e => {
          this.varData.push({
            'variable': e.replace(/\{|\}/g, ''),
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
        this.variables = [...this.varData]
      }
      let arr2 = []
      // if(this.activeType.toLowerCase() == 'reply') {
      if (inputFieldObj?.is_url) {
        arr2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlVariablesDetails;
      }
      else if (inputFieldObj?.is_dial) {
        arr2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberVariablesDetails;
      }
      else {
        arr2 = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textVariablesDetails
      }
      if (allVar) {
        this.showPersonalize(allVar, id);
      }
    }
  }

  highlightVariables(data, element, inputFieldObj?) {
    let variablesArr = [];
    // if(this.activeType.toLowerCase() == 'reply') {
    if (inputFieldObj?.is_url) {
      variablesArr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlVariables;
    }
    else if (inputFieldObj?.is_dial) {
      variablesArr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberVariables;
    }
    else {
      variablesArr = this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textVariables;
    }
    if (variablesArr.length > 0) {
      const uniqueVariableArray = new Set(variablesArr);
      uniqueVariableArray.forEach(ev => {
        element.nativeElement.innerHTML = element.nativeElement.innerHTML.replaceAll(`[${ev}]`, function (m) {
          let regexVar = `[${ev}]`
          return `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${regexVar}" title="Right click...">${regexVar}</a>`
        });
      });
      if (inputFieldObj?.is_url) {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].urlActualHtml = element.nativeElement.innerHTML;
      }
      else if (inputFieldObj?.is_dial) {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].phoneNumberActualHtml = element.nativeElement.innerHTML;
      }
      else {
        this.suggestedResponseData[this.activeIndex][this.activeType.toLowerCase()].textActualHtml = element.nativeElement.innerHTML;
      }
    }
  }

  openDrawer(id) {
    this.showDrawer = true;
    this.suggestionsConfig['showDrawer'] = true;
    setTimeout(() => {
      this.common.open('personalise-variables-suggestions');
    });
  }

  closeDrawer(id) {
    if (this.suggestionsConfig['showDrawer']) {
      this.showTextContext = false;
      this.showUrlContext = false;
      this.showPhoneNumberContext = false;
      this.suggestionsConfig['showDrawer'] = false;
      this.showDrawer = false;
      this.showPersonaliseVariables = false;
      this.common.close(id)
    }
  }

  getFinalVariabledData(data?, type?, nonSuggested?) {
    if (!nonSuggested) this.createRcsCampaignService.setTemplateVariablesValue.next(data)
    // if(type) {
    this.clickedType = 'labelText'
    this.clickedElement = this.labelText
    this.getVariabledData(data, this.activeIndex);
    if ((this.activeType.toLowerCase() == 'action') && (this.actionTypeSelectText?.toLowerCase() == 'open url')) {
      this.clickedType = 'url'
      this.clickedElement = this.url
      this.getVariabledData(data, this.activeIndex);
    }
    if ((this.activeType.toLowerCase() == 'action') && (this.actionTypeSelectText?.toLowerCase() == 'dial')) {
      this.clickedType = 'phoneNumber'
      this.clickedElement = this.phoneNumber
      this.getVariabledData(data, this.activeIndex);
    }
    setTimeout(() => {
      this.createRcsCampaignService.setPreviewData(this.suggestedResponseData)
    });
    if (!nonSuggested) {
      this.fromBody = false;
    }
  }

  getVariabledData(data?, sugIndex?, type?) {
    // if(this.messageForm.get('messageType').value != 3){
    //   this.common.setPersonalizeHeader([])
    // } 
    let variableDetails = this.clickedType == 'url' ? 'urlVariablesDetails' : (this.clickedType == 'phoneNumber' ? 'phoneNumberVariablesDetails' : 'textVariablesDetails')
    let finalVariData = this.clickedType == 'url' ? 'urlFinalVarData' : (this.clickedType == 'phoneNumber' ? 'phoneNumberFinalVarData' : 'textFinalVarData')
    let variables = this.clickedType == 'url' ? 'urlVariables' : (this.clickedType == 'phoneNumber' ? 'phoneNumberVariables' : 'textVariables')
    if (this.messageType != 3) {
      if (data && data.variablesArr && data.variablesArr.length) {

        if (this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails] && this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails].length) {
          let arr = []
          if (!this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData] || ((this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData] && !this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData].variablesArr) || (this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData] && this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData].variablesArr && !this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData].variablesArr.length))) {
            this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variables].forEach(res => {
              let obj = {
                'variable': res.replace(/\>\{|\}/g, ''),
                'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
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
                'varTextSeq': false,
                'PersonalizedValue': '',
                'text': ''
              }
              arr.push(obj)
            })
            this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData] = { variablesArr: arr }
          }
        }


        let mappArr = data.variablesArr.map(e => '[' + e.variable + ']')
        let hasSameVar = false

        if (this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails] && this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails].length && mappArr && mappArr.length) {
          for (let index = 0; index < this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails].length; index++) {
            for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
              if (this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails][index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
                hasSameVar = true
              }
            }
          }
        }


        if (hasSameVar || (this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails] && this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails].length)) {
          let variablesArr = []
          for (let index = 0; index < this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails].length; index++) {
            for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
              if ('[' + data.variablesArr[varrIndex].variable + ']' == this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][variableDetails][index].actualVar) {
                let PersonalizedValue = ''
                if (data.variablesArr[varrIndex].varTextSeq) {
                  if (!data.variablesArr[varrIndex].columnListValue) {
                    if (data.variablesArr[varrIndex].text) {
                      PersonalizedValue = `${data.variablesArr[varrIndex].text}`
                    }
                    else {
                      PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
                    }
                  }
                  else {
                    if (data.variablesArr[varrIndex].text) {
                      PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
                    }
                    else {
                      PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
                    }
                  }
                }
                else {
                  if (!data.variablesArr[varrIndex].columnListValue) {
                    if (data.variablesArr[varrIndex].text) {
                      PersonalizedValue = `${data.variablesArr[varrIndex].text}`
                    }
                    else {
                      PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
                    }
                  }
                  else {
                    if (data.variablesArr[varrIndex].text) {
                      PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
                    }
                    else {
                      PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
                    }
                  }
                }
                let obj = this.suggestedResponseData[sugIndex][type ? type : this.activeType.toLowerCase()][finalVariData]
                obj.variablesArr[index].text = data.variablesArr[varrIndex].text
                obj.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
                obj.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
                obj.variablesArr[index].variable = data.variablesArr[varrIndex].variable
                obj.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
                obj.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
                obj.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
                obj.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
                obj.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
              }
            }
          }
        }


        hasSameVar = false
      }
    }
    this.updateVariablesForAll(this.suggestedResponseData[sugIndex][type ? type : this.activeType?.toLowerCase()][finalVariData], sugIndex, type);
    // this.inputType = this.clickedType;
    if (!type) {
      if (this.clickedType == 'url') {
        this.suggestedResponseData[sugIndex][type ? type : this.activeType?.toLowerCase()].urlInnerText = this.url ? this.url.nativeElement.innerText : ''
      }
      else if (this.clickedType == 'phoneNumber') {
        this.suggestedResponseData[sugIndex][type ? type : this.activeType?.toLowerCase()].phoneNumberInnerText = this.phoneNumber ? this.phoneNumber.nativeElement.innerText : ''
      }
      else {
        this.suggestedResponseData[sugIndex][type ? type : this.activeType?.toLowerCase()].labelInnerText = this.labelText.nativeElement.innerText
      }
    }
  }

  updateVariablesForAll(data, indexx?, type?) {
    let arr2 = []
    // if(this.activeType.toLowerCase() == 'reply') {
    if (this.clickedType == 'url') {
      arr2 = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlVariablesDetails
    }
    else if (this.clickedType == 'phoneNumber') {
      arr2 = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberVariablesDetails
    }
    else {
      arr2 = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textVariablesDetails
    }
    let obj: any = {};
    if (this.clickedType == 'url') {
      if (data) {
        this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlFinalVarData = data;
      }
      obj = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlFinalVarData
    }
    else if (this.clickedType == 'phoneNumber') {
      if (data) {
        this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberFinalVarData = data;
      }
      obj = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberFinalVarData
    }
    else {
      if (data) {
        this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textFinalVarData = data;
      }
      obj = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textFinalVarData
    }

    if (arr2 && arr2.length > 0) {
      this.setActualHtml(indexx, type);
      if (obj && obj.variablesArr && obj.variablesArr.length > 0) {
        for (let varDIndex = 0; varDIndex < arr2.length; varDIndex++) {
          for (let varArrIndex = 0; varArrIndex < obj.variablesArr.length; varArrIndex++) {
            if (arr2[varDIndex]['actualVar'] == '[' + obj.variablesArr[varArrIndex]['variable'] + ']') {
              if (obj.variablesArr[varArrIndex]['PersonalizedValue'] && !(obj.variablesArr[varArrIndex]['PersonalizedValue'].match(/\[(.*?)\]/g))) {
                arr2[varDIndex]['personalizedVar'] = obj.variablesArr[varArrIndex]['PersonalizedValue']
                break
              }
            }
          }
        }
      }

    }
    let regex;
    let arr = [];
    if (this.clickedType == 'url') {
      arr = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlVariables;
    }
    else if (this.clickedType == 'phoneNumber') {
      arr = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberVariables;
    }
    else {
      arr = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textVariables;
    }
    let objVar = {};
    if (this.clickedType == 'url') {
      objVar = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlFinalVarData
    }
    else if (this.clickedType == 'phoneNumber') {
      objVar = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberFinalVarData
    }
    else {
      objVar = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textFinalVarData
    }
    //   }
    // }
    let dataValue = data ? this.resetDataValue(objVar, arr, indexx, type) : objVar;
    if (arr && arr.length > 0 && dataValue && dataValue.variablesArr) {

      for (let index = 0; index < arr.length; index++) {

        // if(dataValue['variablesArr'][index]['PersonalizedValue'].match(this.textVnFormatRegex)) {
        //   arr2[index]['personalizedVar'] = ''
        // }
        if (dataValue['variablesArr'][index]['urlValue']) {
          arr2[index]['personalizedVar'] = ''
          arr2[index]['personalizedUrl'] = dataValue['variablesArr'][index]['urlValue'];
          break
        }
        if (dataValue['variablesArr'][index]['PersonalizedValue']) {
          arr2[index]['personalizedVar'] = dataValue['variablesArr'][index]['PersonalizedValue']
          arr2[index]['personalizedUrl'] = '';
          break
        }
      }
      let index = 0;
      let innerHtml: any;
      let count = 1;
      arr2.forEach(ev => {
        regex = `>${ev.actualVar}`
        if (count == 1) {
          if (this.clickedType == 'url') {
            innerHtml = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].urlActualHtml
          }
          else if (this.clickedType == 'phoneNumber') {
            innerHtml = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml
          }
          else {
            innerHtml = this.suggestedResponseData[indexx][type ? type : this.activeType.toLowerCase()].textActualHtml
          }
        }
        else {
          innerHtml = this.clickedElement.nativeElement.innerHTML
        }
        this.clickedElement.nativeElement.innerHTML = innerHtml.replace(regex, function (m) {
          let value;
          let text = dataValue['variablesArr'][index]['PersonalizedValue'].replace(/</g, '&lt;');
          if (text) {
            value = dataValue['variablesArr'][index]['urlValue'] ? '>' + dataValue['variablesArr'][index]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
            index++;
            return value;
          }
          else {
            index++;
            return regex
          }
        });
        count++
      })
    }
    if (obj && obj.variablesArr && obj.variablesArr.length > 0) {
      obj.variablesArr.forEach(e => {
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
      })
    }
    // if(obj && obj.variablesArr && obj.variablesArr.length > 0) {
    //   this.hasPersonalisedColumn = obj.variablesArr.some(e => {
    //     if(e.columnListValue || this.hasColumnValue(e)) {
    //       return true
    //     }
    //   })
    // }
    // else {
    //   this.hasPersonalisedColumn = false;
    // }
    // this.checkCount();
    // console.log("obj.variablesArr",obj.variablesArr);
    // this.setPersonalizedVariables(obj.variablesArr)
    this.getTextEvent('personalised');
  }

  setActualHtml(sugIndex?, type?) {
    let arr = []
    if (this.clickedType == 'url') {
      arr = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlVariablesDetails
    }
    else if (this.clickedType == 'phoneNumber') {
      arr = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberVariablesDetails
    }
    else if (this.clickedType == 'labelText') {
      arr = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textVariablesDetails
    }
    let count = 1;
    let innerHtml: any;
    if (arr && arr.length > 0) {
      for (let index = 0; index < arr.length; index++) {
        if (count == 1) {
          innerHtml = this.clickedElement.nativeElement.innerHTML.replace(/&amp;/g, '&')
          if (this.clickedType == 'url') {
            this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlActualHtml = innerHtml;
          }
          else if (this.clickedType == 'phoneNumber') {
            this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml = innerHtml;
          }
          else if (this.clickedType == 'labelText') {
            this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textActualHtml = innerHtml;
          }
        }
        else {
          if (this.clickedType == 'url') {
            innerHtml = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlActualHtml
          }
          else if (this.clickedType == 'phoneNumber') {
            innerHtml = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml
          }
          else if (this.clickedType == 'labelText') {
            innerHtml = this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textActualHtml
          }
        }

        if (arr[index].personalizedVar) {
          let varText = arr[index].personalizedVar.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          let replace = `${arr[index].actualVar}" title="Right click...">`
          let replace2 = `${arr[index].actualVar}" title="Right click..." contenteditable="false">`
          let replaceFrom = replace + varText.replace(/>/g, '&gt;').replace(/&amp;/g, '&') + '</a>'
          let replaceFrom2 = replace2 + varText.replace(/>/g, '&gt;').replace(/&amp;/g, '&') + '</a>'
          let replaceWith = replace + arr[index].actualVar + '</a>'
          let replaceWith2 = replace2 + arr[index].actualVar + '</a>'
          if (innerHtml.replace(/&nbsp;/g, ' ').includes(replaceFrom2)) {
            if (this.clickedType == 'url') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom2, replaceWith2)
            }
            else if (this.clickedType == 'phoneNumber') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom2, replaceWith2)
            }
            else if (this.clickedType == 'labelText') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom2, replaceWith2)
            }
          }
          else {
            if (this.clickedType == 'url') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
            }
            else if (this.clickedType == 'phoneNumber') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
            }
            else if (this.clickedType == 'labelText') {
              this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textActualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
            }
          }
        }
        count++
      }
    }
    else {
      if (this.clickedType == 'url') {
        this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlActualHtml = this.clickedElement.nativeElement.innerHTML.replace(/&amp;/g, '&');
      }
      else if (this.clickedType == 'phoneNumber') {
        this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberActualHtml = this.clickedElement.nativeElement.innerHTML.replace(/&amp;/g, '&');
      }
      else if (this.clickedType == 'labelText') {
        this.suggestedResponseData[sugIndex > -1 ? sugIndex : this.activeIndex][type ? type : this.activeType.toLowerCase()].textActualHtml = this.clickedElement.nativeElement.innerHTML.replace(/&amp;/g, '&');
      }
    }
  }

  resetDataValue(data, arr, index?, type?) {
    let obj = { ...data }
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

    if (varArr && varArr.length > 0 && obj && obj.variablesArr && obj.variablesArr.length) {
      for (let index = 0; index < varArr.length; index++) {
        for (let finalVarIndex = 0; finalVarIndex < obj.variablesArr.length; finalVarIndex++) {
          varArr[index]['PersonalizedValue'] = ''
          varArr[index]['columnList'] = obj.variablesArr[finalVarIndex].columnList
          varArr[index]['columnListText'] = this.translatedObj['campaign.select-text']
          varArr[index]['columnListValue'] = ''
          varArr[index]['text'] = ''
          varArr[index]['urlValue'] = ''
          if (obj.variablesArr[finalVarIndex].variable == varArr[index].variable) {
            varArr[index]['PersonalizedValue'] = obj.variablesArr[finalVarIndex].PersonalizedValue
            varArr[index]['columnListText'] = obj.variablesArr[finalVarIndex].columnListText
            varArr[index]['columnListValue'] = obj.variablesArr[finalVarIndex].columnListValue
            varArr[index]['text'] = obj.variablesArr[finalVarIndex].text
            varArr[index]['varTextSeq'] = obj.variablesArr[finalVarIndex].varTextSeq
            break
          }
        }
      }
      obj.variablesArr = varArr
    }

    let arr2 = []
    if (this.clickedType == 'url') {
      arr2 = this.suggestedResponseData[index > -1 ? index : this.activeIndex][type ? type : this.activeType.toLowerCase()].urlVariablesDetails
    }
    else if (this.clickedType == 'phoneNumber') {
      arr2 = this.suggestedResponseData[index > -1 ? index : this.activeIndex][type ? type : this.activeType.toLowerCase()].phoneNumberVariablesDetails
    }
    else {
      arr2 = this.suggestedResponseData[index > -1 ? index : this.activeIndex][type ? type : this.activeType.toLowerCase()].textVariablesDetails
    }

    if (arr2 && arr2.length > 0 && obj && obj.variablesArr && obj.variablesArr.length) {
      for (let varDetailsIndex = 0; varDetailsIndex < arr2.length; varDetailsIndex++) {
        for (let dataIndex = 0; dataIndex < obj.variablesArr.length; dataIndex++) {
          if ('{' + obj.variablesArr[dataIndex].variable + '}' == arr2[varDetailsIndex].actualVar) {
            obj.variablesArr[dataIndex]['urlValue'] = arr2[varDetailsIndex]['personalizedUrl']
            break
          }
        }
      }
    }
    return obj;
  }

  showPersonalize(data?, id?, type?, EditCase = false, obj2?) {
    this.showPersonalizeOptions = !this.showPersonalizeOptions;
    let serviceCall: any;
    if (this.config?.workflow) {
      serviceCall = this.createRcsCampaignService.getWorkflowPersonalize(this.campaignId)
    }
    else {
      serviceCall = this.createRcsCampaignService.getPersonalize(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      let val = this.config && this.config.workflow ? (res.data && res.data.common_headers && res.data.common_headers.length ? res.data.common_headers : []) : ((res.data && res.data.length > 0) ? res.data : []);
      this.personalizeOptions = [];
      if (val && val.length > 0) {
        val.forEach(e => {
          this.personalizeOptions.push({
            headerName: e
          });
        })
      }
      if (!EditCase) {
        this.varData.map(e => {
          e['columnList'] = this.personalizeOptions
        })
        this.variables = [...this.varData];
        if (data) {
          let obj = {
            campaignType: this.personalizeOptions && this.personalizeOptions.length ? 'Personalised' : 'Common',
            variables: this.variables,
            inputType: type,
            activeVariables: this.variables,
            id: 'personalise-variables-suggestions',
            showDrawer: true
          }
          setTimeout(() => {
            this.openDrawer(id);
            setTimeout(() => {
              this.createSMSCampaignService.setTextMessage(obj);
            });
          }, 0);
        }
      } else {
        if (this.personalizeOptions?.length) {
          obj2.variablesArr.forEach(e => {
            e['columnList'] = this.personalizeOptions
            e['configColumnList']['open'] = false;
          })
        }
        let obj = {
          campaignType: this.personalizeOptions && this.personalizeOptions.length ? 'Personalised' : 'Common',
          variables: obj2,
          activeVariables: this.variables,
          id: 'personalise-variables-suggestions',
          showDrawer: true
        }
        setTimeout(() => {
          this.openDrawer(id);
          setTimeout(() => {
            this.createSMSCampaignService.setTextMessage(obj);
          });
        }, 0);
      }
      // this.getHeaderValues();
    }, err => {
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  resetVariablesForAll(type, indexx?) {
    if (!this.clickedElement || !this.clickedElement.nativeElement) {
      return;
    }
    if (!this.showVariables) {
      let text = this.clickedElement.nativeElement.getElementsByClassName('link-text')
      while (text[0]) {
        text[0].parentNode.removeChild(text[0]);
      }
    }
    else {
      let text = this.clickedText.replace('>', '');
      this.setActualHtml(indexx, type);
      if (this.clickedType == 'url') {
        this.clickedElement.nativeElement.innerHTML = this.suggestedResponseData[indexx][type].urlActualHtml;
      }
      else if (this.clickedType == 'phoneNumber') {
        this.clickedElement.nativeElement.innerHTML = this.suggestedResponseData[indexx][type].phoneNumberActualHtml;
      }
      else {
        this.clickedElement.nativeElement.innerHTML = this.suggestedResponseData[indexx][type].textActualHtml;
      }
      let arr = []
      // if(type == 'reply') {
      if (this.clickedType == 'url') {
        arr = this.suggestedResponseData[indexx][type].urlVariablesDetails
      }
      else if (this.clickedType == 'phoneNumber') {
        arr = this.suggestedResponseData[indexx][type].phoneNumberVariablesDetails
      }
      else {
        arr = this.suggestedResponseData[indexx][type].textVariablesDetails
      }
      for (let index = 0; index < arr.length; index++) {
        if (arr[index]['personalizedUrl'] || arr[index]['personalizedVar']) {
          if ((this.clickedVar == arr[index]['actualVar']) && (text == arr[index]['personalizedUrl'] || ((text == arr[index]['personalizedVar']) || (text.replace(/\s/g, '') == arr[index]['personalizedVar'].replace(/\s/g, ''))))) {
            arr[index]['personalizedUrl'] = '';
            arr[index]['personalizedVar'] = '';
            this.resetFinalVarData('validCheck', index, 'data', indexx, type);
            this.disablePersonalise = false;
            this.suggestedResponseData[indexx][type].labelInnerText = this.suggestedResponseData[indexx][type].labelInnerText.replace(text, arr[index]['actualVar'])
            // this.disableAddLink = false;
          }
          else {
            let text = arr[index]['personalizedVar'].replace(/&/g, '&amp;').replace(/</g, '&lt;');
            let url = arr[index]['personalizedUrl'].replace(/</g, '&lt;');
            let reg = '>' + arr[index]['actualVar'];
            let replaceTo = '>' + (arr[index]['personalizedUrl'] ? url.replace(/>/g, '&gt;') : text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'))
            this.clickedElement.nativeElement.innerHTML = this.clickedElement.nativeElement.innerHTML.replace(reg, replaceTo)
          }
        }
      }
      if (arr && arr.length > 0) {
        for (let index = 0; index < arr.length; index++) {
          if (arr[index].personalizedVar) {
            if (this.clickedType == 'url') {
              this.suggestedResponseData[indexx][type].urlActualHtml = this.suggestedResponseData[indexx][type].urlActualHtml.replace(arr[index].personalizedVar, arr[index].actualVar)
            }
            else if (this.clickedType == 'phoneNumber') {
              this.suggestedResponseData[indexx][type].phoneNumberActualHtml = this.suggestedResponseData[indexx][type].phoneNumberActualHtml.replace(arr[index].personalizedVar, arr[index].actualVar)
            }
            else {
              this.suggestedResponseData[indexx][type].textActualHtml = this.suggestedResponseData[indexx][type].textActualHtml.replace(arr[index].personalizedVar, arr[index].actualVar)
            }
          }
        }
      }

      // this.resetFinalVarData('validCheck');
    }

    let obj: any = {};
    if (this.clickedType == 'url') {
      obj = this.suggestedResponseData[indexx][type].urlFinalVarData
    }
    else if (this.clickedType == 'phoneNumber') {
      obj = this.suggestedResponseData[indexx][type].phoneNumberFinalVarData
    }
    else {
      obj = this.suggestedResponseData[indexx][type].textFinalVarData
    }

    if (obj && obj.variablesArr && obj.variablesArr.length > 0) {
      obj.variablesArr.forEach(e => {
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
      })
    }
    this.getTextEvent();
  }

  resetFinalVarData(validCheck?, i?, data?, suggIndex?, type?) {
    let arr = [];
    if (this.clickedType == 'url') {
      arr = this.suggestedResponseData[suggIndex][type]['urlVariables'];
    }
    else if (this.clickedType == 'phoneNumber') {
      arr = this.suggestedResponseData[suggIndex][type]['phoneNumberVariables'];
    }
    else {
      arr = this.suggestedResponseData[suggIndex][type]['textVariables'];
    }
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
    let obj: any = {}
    if (this.clickedType == 'url') {
      obj = this.suggestedResponseData[suggIndex][type].urlFinalVarData
    }
    else if (this.clickedType == 'phoneNumber') {
      obj = this.suggestedResponseData[suggIndex][type].phoneNumberFinalVarData
    }
    else {
      obj = this.suggestedResponseData[suggIndex][type].textFinalVarData
    }

    if (obj && obj['variablesArr'] && obj['variablesArr'].length > 0) {
      if (varArr && varArr.length > 0) {
        for (let index = 0; index < varArr.length; index++) {
          for (let finalVarIndex = 0; finalVarIndex < obj.variablesArr.length; finalVarIndex++) {
            varArr[index]['PersonalizedValue'] = ''
            varArr[index]['columnList'] = obj.variablesArr[finalVarIndex].columnList
            varArr[index]['columnListText'] = this.translatedObj['campaign.select-text']
            varArr[index]['columnListValue'] = '',
              varArr[index]['text'] = ''
            if (obj.variablesArr[finalVarIndex].variable == varArr[index].variable) {
              varArr[index]['PersonalizedValue'] = obj.variablesArr[finalVarIndex].PersonalizedValue
              varArr[index]['columnListText'] = obj.variablesArr[finalVarIndex].columnListText
              varArr[index]['columnListValue'] = obj.variablesArr[finalVarIndex].columnListValue
              varArr[index]['text'] = obj.variablesArr[finalVarIndex].text
              varArr[index]['varTextSeq'] = obj.variablesArr[finalVarIndex].varTextSeq
              break
            }
          }
        }
        obj.variablesArr = varArr

      }
    }
    if (data) {
      if (obj && obj['variablesArr'] && obj['variablesArr'].length > 0 && obj['variablesArr'][i]) {
        obj['variablesArr'][i]['urlValue'] = '';
        obj['variablesArr'][i]['PersonalizedValue'] = '';
        obj['variablesArr'][i]['text'] = '';
        obj['variablesArr'][i]['columnListText'] = this.translatedObj['campaign.select-text'];
        obj['variablesArr'][i]['columnListValue'] = '';
        obj['variablesArr'][i]['varTextSeq'] = false;
        let a = { ...obj };
        obj = {};
        obj = a;
      }
    }
    let arr2 = []
    if (this.clickedType == 'url') {
      arr = this.suggestedResponseData[suggIndex][type].urlVariablesDetails
    }
    else if (this.clickedType == 'phoneNumber') {
      arr = this.suggestedResponseData[suggIndex][type].phoneNumberVariablesDetails
    }
    else {
      arr = this.suggestedResponseData[suggIndex][type].textVariablesDetails
    }
    if (arr2 && arr2.length > 0) {
      if (obj && obj.variablesArr && obj.variablesArr.length > 0) {
        let urlVar: any;
        arr2.forEach(e => {
          if (e.personalizedUrl) {
            urlVar = e.actualVar
          }
        })
        if (urlVar) {
          let index = obj.variablesArr.findIndex(e => { return '{' + e.variable + '}' == urlVar })
          obj.variablesArr.splice(index, 1)
        }
      }
    }
  }

  updateVariableValues() {
    if (this.suggestedResponseData && this.suggestedResponseData.length) {
      this.suggestedResponseData.forEach((e, index) => {
        let type = e.reply ? 'reply' : 'action'
        e[type].text = e[type].labelInnerText
        if (type == 'action' && e[type].openUrlAction) {
          e[type].openUrlAction.url = e[type].urlInnerText
        }
        if (type == 'action' && e[type].dialAction) {
          e[type].dialAction.phoneNumber = e[type].phoneNumberInnerText
        }
      })
    }
  }

  resetCardsVariable(data) {
    if (data.cards && data.cards.value && data.cards.value.length) {
      data.cards.value.forEach(e => {
        this.suggestedResponseData = e.suggestions
        this.resetVariable(e, this.clickedType, true);
      })
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
