import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {

  @Input() showErrors: any;
  @Input() senderType: any;
  @ViewChild('text') text: ElementRef;
  showContextMenu = true;
  contextMenuPosition = { x: '0px', y: '0px' };
  disablePersonalise: boolean = false;
  @Input() showPersonalise: any;
  @Input() showSetValues: any;
  @Input() disableAddLink: any;
  showReset = true;
  showVariables: any = false;
  @Input() IsNonEnglish: any;
  @Input() previewValue: any;
  @Input() messageCount: any;
  @Input() actualCharacterCount: any;
  @Input() hasPersonalisedColumn: any;
  translatedObj: any;
  varLengthText: any;
  @Input() showFooter: any;
  @Input() isEditable: any;
  select: Selection;
  range: Range;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @Input() showAddLink: any;
  @Input() config: any;
  @Input() variables: any;
  @Input() personalizeOptions: any;
  @Input() finalVarData: any;
  @Input() selectedCardTabIndex: any;
  @Input() inputType: any;
  @Input() templateType: any;
  clickedType: any;
  @Input() editorType: any;
  @Output() setAllPersonalization = new EventEmitter<any>();
  @Output() resetVariableEvent = new EventEmitter<any>();
  @Output() sendVarDetails = new EventEmitter<any>();
  clickedText: string;
  clickedVar: any;
  @Output() insertLinkEvent = new EventEmitter<any>();
  @Output() showGridPreviewEvent = new EventEmitter<any>();
  @Input() urlFormValue: any;
  @Input() urlType: any;
  clickedUrl = '';
  @Input() variablesDetails: any;
  textVnFormatRegex = new RegExp(/\{[V][0-9]+\}/g);
  @Input() editorIsDisable: any;

  constructor(public common: CommonService, public createCampaignService: CreateCampaignService) {
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
        this.varLengthText = this.translatedObj['common.variable-length-text']
      }
    })
    this.common.setTextEditorData.subscribe(res => {
      if (res) {
        if (this.text) {
          this.text.nativeElement.innerHTML = res.html
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

  getEvent(event: MouseEvent) {
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
    // if(!this.showVariables && !this.hasEditingPermission && (this.isDltUser || (!this.isDltUser && (this.senderType == 'transactional') && (!this.userCategory || (this.userCategory != 6))))) {
    //   return
    // }
    var tag = false;
    if (this.showVariables) {
      this.clickedVar = event.target['classList'].item(1);
      if (this.urlFormValue && this.urlFormValue.domainName) {
        let isUrl: any;
        if (this.urlType == 'text') {
          isUrl = this.checkForUrl(this.text.nativeElement.innerText)
          this.clickedUrl = this.urlFormValue.originalUrl
        }
        else {
          isUrl = `##${this.urlFormValue.urlFromColumn}##`
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
          if (this.variablesDetails[index].personalizedVar && !this.textVnFormatRegex.test(this.variablesDetails[index].personalizedVar) && ((event.target['innerText'] == this.variablesDetails[index].personalizedVar) || (event.target['innerText'].replace(/\s/g, '') == this.variablesDetails[index].personalizedVar.replace(/\s/g, '')))) {
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
      if (this.urlFormValue && this.urlFormValue.domainName) {
        let hasClass = event.target['classList'].contains('link-text');
        if (hasClass) {
          this.disablePersonalise = true;
          if (this.urlFormValue.originalUrl) {
            this.clickedUrl = this.urlFormValue.originalUrl
          }
          else {
            this.clickedUrl = `##${this.urlFormValue.urlFromColumn}##`
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

    // var html = res['previewUrl']

    if (window.getSelection) {
      // IE9 and non-IE
      this.select = window.getSelection();
      if (this.select['focusNode'] && this.select['focusNode']['parentElement'] && this.select['focusNode']['parentElement']['classList'] && this.select['focusNode']['parentElement']['classList'].length > 0 && /\{[V][0-9]+\}/g.test(this.select['focusNode']['parentElement']['className'])) {
        this.text.nativeElement.focus();
        this.select = window.getSelection();
        this.select.selectAllChildren(this.text.nativeElement)
        this.select.collapseToEnd()
      }

      if (this.select.getRangeAt && this.select.rangeCount) {
        this.range = this.select.getRangeAt(0);
        // this.range.deleteContents();
      }
    } else if (document['selection'] && document['selection'].type != "Control") {
      // IE < 9
      // document['selection'].createRange().pasteHTML(html);
    }
    // this.showPersonalize();
    // this.clickedText = range.toString().trim().replace(/\{|\}/g, '');
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    // this.contextMenu.menuData = { 'item': 'SAMPLE' };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
    this.sendVarDetails.emit({ showVariables: this.showVariables, clickedText: this.clickedText, clickedVar: this.clickedVar, clickedUrl: this.clickedUrl })
  }

  resetVariable(event: MouseEvent) {
    this.clickedUrl = '';
    this.resetVariableEvent.emit({})
    // this.inputType = type;
    // this.common.setPersonalizeHeader([]);
    // if(this.messageForm.get('messageType').value == 0) {
    //   this.resetVariablesForAll(type);
    //   if(!fromSuggested) this.createRcsCampaignService.resetSuggestionsVariable.next({clickedVar: this.clickedVar, clickedText: this.clickedText})
    // }
    // else if(this.messageForm.get('messageType').value == 2) {
    //   this.clickedType = 'title';
    //   // this.clickedElement = this.textTitle
    //   this.resetVariablesForAll(this.clickedType);
    //   this.clickedType = 'description';
    //   // this.clickedElement = this.descriptionText
    //   this.resetVariablesForAll(this.clickedType);
    //   this.clickedType = 'mediaUrl';
    //   this.resetVariablesForAll(this.clickedType);
    //   if(!fromSuggested) this.createRcsCampaignService.resetSuggestionsVariable.next({clickedVar: this.clickedVar, clickedText: this.clickedText})
    // }
    // else if(this.messageForm.get('messageType').value == 3) {
    //   this.storeActiveCardIndex = JSON.parse(JSON.stringify(this.activeCardIndex))
    //   this.cards.controls.forEach((e, index) => {
    //     this.selectCard(index, '', 'add', true)
    //     this.clickedType = 'title';
    //     this.resetVariablesForAll(this.clickedType, index);
    //     this.clickedType = 'description';
    //     this.resetVariablesForAll(this.clickedType, index);
    //     this.clickedType = 'mediaUrl';
    //     this.resetVariablesForAll(this.clickedType, index);

    //     if(e.value.suggestions && e.value.suggestions.length) {
    //       e.value.suggestions && e.value.suggestions.forEach(ev => {
    //         this.resetSuggestionsData(ev, ev.reply ? 'reply' : 'action');
    //         if(ev.action && ev.action.hasOwnProperty('openUrlAction')) {
    //           this.resetSuggestionsData(ev, 'action', true);
    //         }
    //       })
    //     }
    //   })
    //     if(this.suggestion && this.suggestion.length && !fromSuggested) {
    //       // this.cards.controls.forEach((e: any, index) => {
    //       //   this.selectCard(index, '', 'add', true)
    //       //   // while (this.suggestion.length !== 0) {
    //       //   //   this.suggestion.removeAt(0);
    //       //   // }
    //       //   // this.suggestion.push(this.actionRows2(e.buttonText));
    //       // })
    //       // this.createRcsCampaignService.resetSuggestionsVariable.next({clickedVar: this.clickedVar, clickedText: this.clickedText, cards: this.cards})
    //     }
    //   this.selectCard(this.storeActiveCardIndex, '', 'add')
    // }
  }

  showAllVariablesPersonalisation(id, type, clickedText?) {
    this.setAllPersonalization.emit({ id: id, type: type, clickedText: clickedText ? clickedText : '' })
    this.variables = [];
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
    // if(type == 'title') {
    //   this.clickedElement = this.textTitle
    //   this.getActiveVariables(type);
    // }
    // else if(type == 'text') {
    //   this.clickedElement = this.text
    // }
    // else if(type == 'description') {
    //   this.getActiveVariables(type);
    //   this.clickedElement = this.descriptionText
    // }
    // else if(type == 'mediaUrl') {
    //   this.getActiveVariables(type);
    //   this.clickedElement = this.textMediaUrl
    // }
    let obj2: any = {};
    // if(type == 'text' || (type == 'title' && this.templateType == 'rich_standalone_card')) {
    //   obj2 = this.finalVarData
    // }
    // else if(type == 'description' && this.templateType == 'rich_standalone_card') {
    //   obj2 = this.descriptionFinalVarData
    // }
    // else if(type == 'mediaUrl' && this.templateType == 'rich_standalone_card') {
    //   obj2 = this.mediaUrlFinalVarData
    // }
    // else if(this.templateType == 'rich_carousel_card') {
    //   if(type == 'title') {
    //     obj2 = this.cards.value[this.activeCardIndex].finalVarData
    //   }
    //   else if(type == 'description') {
    //     obj2 = this.cards.value[this.activeCardIndex].descriptionFinalVarData
    //   }
    //   else if(type == 'mediaUrl') {
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
    //     this.openDrawer(id);
    //     setTimeout(() => { 
    //       this.createCampaignService.setTextMessage(obj);
    //     });
    //   }, 0);
    // }
    // else {
    //   this.variables = [];
    //   // this.specificVarClicked = false;
    //   if (clickedText) {
    //     // this.specificVarClicked = true;
    //     this.getActiveVariables(type, 'validCheck', id, 'all-variables');
    //   }
    //   else {
    //     this.getActiveVariables(type, 'validCheck', id, 'all-variables');
    //   }
    // }
  }

  insertPersonalizeItem(item, type) {
    let personalizeItem = `<<${item.headerName}>>`;
    if (type == 'text') {
      if ((this.text.nativeElement.innerText == null)) {
        // this.messageForm.get('textMessage').setValue('');
        this.text.nativeElement.innerText = '';
        this.common.setTextEditorData.next({ html: this.text.nativeElement.innerHTML })
        // this.elRef.nativeElement.innerText = '';
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
      // this.actualHtml = this.text.nativeElement.innerHTML;
    }
    // this.personalised = true;
    // this.getValue();
    // if((this.messageForm.get('messageType').value == 2) || (this.messageForm.get('messageType').value == 3)) {
    //   this.setTitle('title');
    // }
  }

  openDrawer(id, isTemplate = false) {
    if (!isTemplate) {
      this.config['showDrawer'] = true;
    }
    else {
      // this.showDrawer = true;
    }
    setTimeout(() => {
      this.common.open(isTemplate ? id : 'personalise-variables');
    });
  }

  // closeDrawer(id) {
  //   this.showTitleContext = false;
  //   this.showDescriptionContext = false;
  //   this.showMediaUrlContext = false;
  //   if(id == 'insert-template') {
  //     let data = {
  //       name: this.senderName,
  //       // type: this.senderType
  //     }
  //     this.createCampaignService.setInsertTemplate(data);
  //   }
  //   this.config['showDrawer'] = false;
  //   this.showDrawer = false;
  //   this.common.close(id)
  // }


  getActiveVariables(type, validCheck?, id?, allVar?) {
    let regex;
    let arr = [];
    // if(this.messageForm.get('messageType').value == 2) {
    //   if(type == 'title') {
    //     arr = this.existingTemplate.variables;
    //   }
    //   else if(type == 'description') {
    //     arr = this.existingTemplate.descriptionVariables;
    //   }
    //   else if(type == 'mediaUrl') {
    //     arr = this.existingTemplate.mediaUrlVariables;
    //   }
    // }
    // else if(this.messageForm.get('messageType').value == 3) {
    //   if(type == 'title') {
    //     arr = this.cards.value[this.activeCardIndex].variables;
    //   }
    //   else if(type == 'description') {
    //     arr = this.cards.value[this.activeCardIndex].descriptionVariables;
    //   }
    //   else if(type == 'mediaUrl') {
    //     arr = this.cards.value[this.activeCardIndex].mediaUrlVariables;
    //   }
    // }
    // else {
    //   if(type == 'text') {
    //     arr = this.existingTemplate.variables;
    //   }
    // }
    // if (arr && arr.length > 0) {
    //   if ((this.variables && this.variables.length == 0) || !this.variables) {
    //     this.variables = [];
    //     this.varData = []
    //     arr.forEach(e => {
    //       this.varData.push({
    //         'variable': validCheck ? e.replace(/\>\{|\}/g, '') : e.replace(/\{|\}/g, ''),
    //         'columnList': [],
    //         'configColumnList': this.configColumnList,
    //         'columnListText': this.translatedObj['campaign.select-text'],
    //         'columnListValue': '',
    //         'varTextSeq': false
    //       })
    //     })

    //     if(this.messageForm.get('messageType').value == 2) {
    //       if(type == 'title') {
    //         this.messageForm.get('varData').setValue([...this.varData])
    //         this.variables = this.messageForm.get('varData').value;
    //       }
    //       else if(type == 'description') {
    //         this.messageForm.get('descriptionVarData').setValue([...this.varData])
    //         this.variables = this.messageForm.get('descriptionVarData').value;
    //       }
    //       else if(type == 'mediaUrl') {
    //         this.messageForm.get('mediaUrlVarData').setValue([...this.varData])
    //         this.variables = this.messageForm.get('mediaUrlVarData').value;
    //         // arr = this.existingTemplate.mediaUrlVariables;
    //       }
    //     }
    //     else if(this.messageForm.get('messageType').value == 3) {
    //       if(type == 'title' && (this.activeCardIndex > -1)) {
    //         this.cards.controls[this.activeCardIndex].get('varData').setValue([...this.varData]);
    //         this.variables = this.cards.controls[this.activeCardIndex].get('varData').value;
    //       }
    //       else if(type == 'description') {
    //         this.cards.controls[this.activeCardIndex].get('descriptionVarData').setValue([...this.varData]);
    //         this.variables = this.cards.controls[this.activeCardIndex].get('descriptionVarData').value;
    //       }
    //       else if(type == 'mediaUrl') {
    //         this.cards.controls[this.activeCardIndex].get('mediaUrlVarData').setValue([...this.varData]);
    //         this.variables = this.cards.controls[this.activeCardIndex].get('mediaUrlVarData').value;
    //       }
    //     }
    //     else {
    //       if(type == 'text') {
    //         this.messageForm.get('varData').setValue([...this.varData])
    //         this.variables = this.messageForm.get('varData').value;
    //       }
    //     }
    //   }
    //   let arr2 = []
    //   if(this.clickedType == 'text' || (this.clickedType == 'title' && this.templateType == 'rich_standalone_card')) {
    //     arr2 = this.variablesDetails
    //   }
    //   else if(this.clickedType == 'description' && this.templateType == 'rich_standalone_card') {
    //     arr2 = this.descriptionVariablesDetails
    //   }
    //   else if(this.clickedType == 'mediaUrl' && this.templateType == 'rich_standalone_card') {
    //     arr2 = this.mediaUrlVariablesDetails
    //   }
    //   else if(this.templateType == 'rich_carousel_card') {
    //     if(this.clickedType == 'title') {
    //       arr2 = this.cards.value[this.activeCardIndex].variablesDetails
    //     }
    //     else if(this.clickedType == 'description') {
    //       arr2 = this.cards.value[this.activeCardIndex].descriptionVariablesDetails
    //     }
    //     else if(this.clickedType == 'mediaUrl') {
    //       arr2 = this.cards.value[this.activeCardIndex].mediaUrlVariablesDetails
    //     }
    //   }
    //   if ((this.variables && this.variables.length > 0) && (arr2 && arr2.length > 0)) {
    //     for (let index = 0; index < arr2.length; index++) {
    //       for (let varIndex = 0; varIndex < this.variables.length; varIndex++) {
    //         if ((arr2[index]['actualVar'].replace(/\{|\}/g, '') == this.variables[varIndex]['variable']) && arr2[index]['personalizedUrl']) {
    //           this.variables[varIndex]['urlValue'] = arr2[index]['personalizedUrl']
    //         }
    //       }
    //     }
    //   }
    //   if (allVar) {
    //     this.showPersonalize(allVar, id, type);
    //   }
    // }
  }

  closeDrawer(id) {
    // this.showTitleContext = false;
    // this.showDescriptionContext = false;
    // this.showMediaUrlContext = false;
    if (id == 'insert-template') {
      let data = {
        // name: this.senderName,
        // type: this.senderType
      }
      this.createCampaignService.setInsertTemplate(data);
    }
    this.config['showDrawer'] = false;
    // this.showDrawer = false;
    this.common.close(id)
  }

  getFinalVariabledData(data?, suggested?) {
    // if(this.messageForm.get('messageType').value != 3){
    //   this.common.setPersonalizeHeader([])
    // } 
    // if(data && data.variablesArr && data.variablesArr.length) {
    //   if(this.messageForm.get('messageType').value != 3) {
    //     if(this.suggestion && this.suggestion.length && !suggested) {
    //       let obj = {
    //         data: data,
    //         type: this.messageForm.get('messageType').value
    //       }
    //       // this.createRcsCampaignService.setSuggestionsVariableData.next(obj);
    //     }
    //   }


    //   if(this.variablesDetails && this.variablesDetails.length) {
    //     let arr = []
    //     if(!this.finalVarData || ((this.finalVarData && !this.finalVarData.variablesArr) || (this.finalVarData && this.finalVarData.variablesArr && !this.finalVarData.variablesArr.length))) {
    //       this.messageForm.get('variables').value.forEach(res => {
    //         let obj = {
    //           'variable': res.replace(/\>\{|\}/g, ''),
    //           'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //           'configColumnList': this.configColumnList,
    //           'columnListText': this.translatedObj['campaign.select-text'],
    //           'columnListValue': '',
    //           'varTextSeq': false,
    //           'PersonalizedValue': '',
    //           'text': ''
    //         }
    //         arr.push(obj)
    //       })
    //       this.finalVarData = {variablesArr: arr}
    //     }
    //   }


    //   if(this.descriptionVariablesDetails && this.descriptionVariablesDetails.length) {
    //     if(!this.descriptionFinalVarData || ((this.descriptionFinalVarData && !this.descriptionFinalVarData.variablesArr) || (this.descriptionFinalVarData && this.descriptionFinalVarData.variablesArr && !this.descriptionFinalVarData.variablesArr.length))) {
    //       let arr = []
    //       this.messageForm.get('descriptionVariables').value.forEach(res => {
    //         let obj = {
    //           'variable': res.replace(/\>\{|\}/g, ''),
    //           'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //           'configColumnList': this.configColumnList,
    //           'columnListText': this.translatedObj['campaign.select-text'],
    //           'columnListValue': '',
    //           'varTextSeq': false,
    //           'PersonalizedValue': '',
    //           'text': ''
    //         }
    //         arr.push(obj)
    //       })
    //       this.descriptionFinalVarData = {variablesArr: arr}
    //       // ev.get('descriptionFinalVarData').setValue({variablesArr: arr})
    //     }
    //   }

    //   if(this.mediaUrlVariablesDetails && this.mediaUrlVariablesDetails.length) {
    //     if(!this.mediaUrlFinalVarData || ((this.mediaUrlFinalVarData && !this.mediaUrlFinalVarData.variablesArr) || (this.mediaUrlFinalVarData && this.mediaUrlFinalVarData.variablesArr && !this.mediaUrlFinalVarData.variablesArr.length))) {
    //       let arr = []
    //       this.messageForm.get('mediaUrlVariables').value.forEach(res => {
    //         let obj = {
    //           'variable': res.replace(/\>\{|\}/g, ''),
    //           'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //           'configColumnList': this.configColumnList,
    //           'columnListText': this.translatedObj['campaign.select-text'],
    //           'columnListValue': '',
    //           'varTextSeq': false,
    //           'PersonalizedValue': '',
    //           'text': ''
    //         }
    //         arr.push(obj)
    //       })
    //       this.mediaUrlFinalVarData = {variablesArr: arr}
    //       // ev.get('descriptionFinalVarData').setValue({variablesArr: arr})
    //     }
    //   }




    //   let mappArr = data.variablesArr.map(e => '['+e.variable+']')

    //   let hasSameVar = false
    //   if(this.variablesDetails && this.variablesDetails.length && mappArr && mappArr.length) {
    //     for (let index = 0; index < this.variablesDetails.length; index++) {
    //       for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //         if(this.variablesDetails[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //           hasSameVar = true
    //         }
    //       }
    //     }
    //   }
    //   if(this.variablesDetails && this.variablesDetails.length && (this.clickedType == 'text' || this.clickedType == 'title' || hasSameVar)) {
    //     this.reformatVariableValues('variablesDetails', data, 'finalVarData')
    //   }

    //   hasSameVar = false
    //   if(this.descriptionVariablesDetails && this.descriptionVariablesDetails.length && mappArr && mappArr.length) {
    //     for (let index = 0; index < this.descriptionVariablesDetails.length; index++) {
    //       for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //         if(this.descriptionVariablesDetails[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //           hasSameVar = true
    //         }
    //       }
    //     }
    //   }
    //   if(this.descriptionVariablesDetails && this.descriptionVariablesDetails.length && (this.clickedType == 'description' || hasSameVar)) {
    //     this.reformatVariableValues('descriptionVariablesDetails', data, 'descriptionFinalVarData')
    //   }

    //   hasSameVar = false
    //   if(this.mediaUrlVariablesDetails && this.mediaUrlVariablesDetails.length && mappArr && mappArr.length) {
    //     for (let index = 0; index < this.mediaUrlVariablesDetails.length; index++) {
    //       for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //         if(this.mediaUrlVariablesDetails[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //           hasSameVar = true
    //         }
    //       }
    //     }
    //   }
    //   if(this.mediaUrlVariablesDetails && this.mediaUrlVariablesDetails.length && (this.clickedType == 'mediaUrl' || hasSameVar)) {
    //     this.reformatVariableValues('mediaUrlVariablesDetails', data, 'mediaUrlFinalVarData')
    //   }

    //   if(this.messageForm.get('messageType').value != 3) {
    //     if(this.suggestion.value && this.suggestion.value.length) {
    //       this.suggestion.value.forEach(dt => {
    //         if(dt.hasOwnProperty('reply')) {
    //           if(dt.reply.textVariablesDetails && dt.reply.textVariablesDetails.length) {
    //             let arr = []
    //             if(!dt.reply.textFinalVarData || !dt.reply.textFinalVarData.variablesArr || (dt.reply.textFinalVarData.variablesArr && !dt.reply.textFinalVarData.variablesArr.length)) {
    //               dt.textVariables.forEach(res => {
    //                 let obj = {
    //                   'variable': res.replace(/\>\{|\}/g, ''),
    //                   'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                   'configColumnList': this.configColumnList,
    //                   'columnListText': this.translatedObj['campaign.select-text'],
    //                   'columnListValue': '',
    //                   'varTextSeq': false,
    //                   'PersonalizedValue': '',
    //                   'text': ''
    //                 }
    //                 arr.push(obj)
    //               })
    //               dt.reply.textFinalVarData = {variablesArr: arr}
    //             }
    //           }



    //           if(dt.reply.textVariablesDetails && dt.reply.textVariablesDetails.length) {
    //             let variablesArr = []
    //             for (let index = 0; index < dt.reply.textVariablesDetails.length; index++) {
    //               for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                 if('['+data.variablesArr[varrIndex].variable+']' == dt.reply.textVariablesDetails[index].actualVar) {
    //                   let PersonalizedValue = ''
    //                   if (data.variablesArr[varrIndex].varTextSeq) {
    //                     if (!data.variablesArr[varrIndex].columnListValue) {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                       }
    //                     }
    //                     else {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                     }
    //                   }
    //                   else {
    //                     if (!data.variablesArr[varrIndex].columnListValue) {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                       }
    //                     }
    //                     else {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                       else {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                     }
    //                   }

    //                   dt.reply.textFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                   dt.reply.textFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                   dt.reply.textFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                   dt.reply.textFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                   dt.reply.textFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                   dt.reply.textFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                   dt.reply.textFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                   dt.reply.textFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                   dt.reply.textFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                 }
    //               }

    //             }
    //           }


    //           this.updateSuggestedVariablesForAll(dt, 'reply')
    //           dt.reply.labelInnerText = this.updateInnerText(dt, 'reply');
    //         }

    //         if(dt.hasOwnProperty('action')) {
    //           if(dt.action.textVariablesDetails && dt.action.textVariablesDetails.length) {
    //             let arr = []
    //             if(!dt.action.textFinalVarData || !dt.action.textFinalVarData.variablesArr || (dt.action.textFinalVarData.variablesArr && !dt.action.textFinalVarData.variablesArr.length)) {
    //               dt.action.textVariables.forEach(res => {
    //                 let obj = {
    //                   'variable': res.replace(/\>\{|\}/g, ''),
    //                   'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                   'configColumnList': this.configColumnList,
    //                   'columnListText': this.translatedObj['campaign.select-text'],
    //                   'columnListValue': '',
    //                   'varTextSeq': false,
    //                   'PersonalizedValue': '',
    //                   'text': ''
    //                 }
    //                 arr.push(obj)
    //               })
    //               dt.action.textFinalVarData = {variablesArr: arr}
    //             }
    //           }



    //           if(dt.action.textVariablesDetails && dt.action.textVariablesDetails.length) {
    //             let variablesArr = []
    //             for (let index = 0; index < dt.action.textVariablesDetails.length; index++) {
    //               for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                 if('['+data.variablesArr[varrIndex].variable+']' == dt.action.textVariablesDetails[index].actualVar) {
    //                   let PersonalizedValue = ''
    //                   if (data.variablesArr[varrIndex].varTextSeq) {
    //                     if (!data.variablesArr[varrIndex].columnListValue) {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                       }
    //                     }
    //                     else {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                     }
    //                   }
    //                   else {
    //                     if (!data.variablesArr[varrIndex].columnListValue) {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                       }
    //                       else {
    //                         PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                       }
    //                     }
    //                     else {
    //                       if (data.variablesArr[varrIndex].text) {
    //                         PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                       else {
    //                         PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                       }
    //                     }
    //                   }

    //                   dt.action.textFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                   dt.action.textFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                   dt.action.textFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                   dt.action.textFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                   dt.action.textFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                   dt.action.textFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                   dt.action.textFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                   dt.action.textFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                   dt.action.textFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                 }
    //               }

    //             }
    //           }
    //           this.updateSuggestedVariablesForAll(dt, 'action')
    //           dt.action.labelInnerText = this.updateInnerText(dt, 'action');


    //           if(dt.action.hasOwnProperty('openUrlAction')) {
    //             if(dt.action.urlVariablesDetails && dt.action.urlVariablesDetails.length) {
    //               let arr = []
    //               if(!dt.action.urlFinalVarData || !dt.action.urlFinalVarData.variablesArr || (dt.action.urlFinalVarData.variablesArr && !dt.action.urlFinalVarData.variablesArr.length)) {
    //                 dt.action.urlVariables.forEach(res => {
    //                   let obj = {
    //                     'variable': res.replace(/\>\{|\}/g, ''),
    //                     'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                     'configColumnList': this.configColumnList,
    //                     'columnListText': this.translatedObj['campaign.select-text'],
    //                     'columnListValue': '',
    //                     'varTextSeq': false,
    //                     'PersonalizedValue': '',
    //                     'text': ''
    //                   }
    //                   arr.push(obj)
    //                 })
    //                 dt.action.urlFinalVarData = {variablesArr: arr}
    //               }
    //             }



    //             if(dt.action.urlVariablesDetails && dt.action.urlVariablesDetails.length) {
    //               let variablesArr = []
    //               for (let index = 0; index < dt.action.urlVariablesDetails.length; index++) {
    //                 for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                   if('['+data.variablesArr[varrIndex].variable+']' == dt.action.urlVariablesDetails[index].actualVar) {
    //                     let PersonalizedValue = ''
    //                     if (data.variablesArr[varrIndex].varTextSeq) {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }
    //                     else {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }

    //                     dt.action.urlFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                     dt.action.urlFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                     dt.action.urlFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                     dt.action.urlFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                     dt.action.urlFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                     dt.action.urlFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                     dt.action.urlFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                     dt.action.urlFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                     dt.action.urlFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                   }
    //                 }

    //               }
    //             }
    //             this.updateSuggestedVariablesForAll(dt, 'action', true)
    //             dt.action.urlInnerText = this.updateInnerText(dt, 'action', true);
    //           }

    //         }
    //       })
    //     }
    //   }



    //   if(this.cards && this.cards.controls && this.cards.controls.length) {
    //     this.cards.controls.forEach(ev => {
    //       if(ev.get('variablesDetails').value && ev.get('variablesDetails').value.length) {
    //         let arr = []
    //         if(!ev.get('finalVarData').value.variablesArr || (ev.get('finalVarData').value.variablesArr && !ev.get('finalVarData').value.variablesArr.length)) {
    //           ev.get('variables').value.forEach(res => {
    //             let obj = {
    //               'variable': res.replace(/\>\{|\}/g, ''),
    //               'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //               'configColumnList': this.configColumnList,
    //               'columnListText': this.translatedObj['campaign.select-text'],
    //               'columnListValue': '',
    //               'varTextSeq': false,
    //               'PersonalizedValue': '',
    //               'text': ''
    //             }
    //             arr.push(obj)
    //           })
    //           ev.get('finalVarData').setValue({variablesArr: arr})
    //         }
    //       }


    //       if(ev.get('descriptionVariablesDetails').value && ev.get('descriptionVariablesDetails').value.length) {
    //         if(!ev.get('descriptionFinalVarData').value.variablesArr || (ev.get('descriptionFinalVarData').value.variablesArr && !ev.get('descriptionFinalVarData').value.variablesArr.length)) {
    //           let arr = []
    //           ev.get('descriptionVariables').value.forEach(res => {
    //             let obj = {
    //               'variable': res.replace(/\>\{|\}/g, ''),
    //               'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //               'configColumnList': this.configColumnList,
    //               'columnListText': this.translatedObj['campaign.select-text'],
    //               'columnListValue': '',
    //               'varTextSeq': false,
    //               'PersonalizedValue': '',
    //               'text': ''
    //             }
    //             arr.push(obj)
    //           })
    //           ev.get('descriptionFinalVarData').setValue({variablesArr: arr})
    //         }
    //       }

    //       if(ev.get('mediaUrlVariablesDetails').value && ev.get('mediaUrlVariablesDetails').value.length) {
    //         if(!ev.get('mediaUrlFinalVarData').value.variablesArr || (ev.get('mediaUrlFinalVarData').value.variablesArr && !ev.get('mediaUrlFinalVarData').value.variablesArr.length)) {
    //           let arr = []
    //           ev.get('mediaUrlVariables').value.forEach(res => {
    //             let obj = {
    //               'variable': res.replace(/\>\{|\}/g, ''),
    //               'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //               'configColumnList': this.configColumnList,
    //               'columnListText': this.translatedObj['campaign.select-text'],
    //               'columnListValue': '',
    //               'varTextSeq': false,
    //               'PersonalizedValue': '',
    //               'text': ''
    //             }
    //             arr.push(obj)
    //           })
    //           ev.get('mediaUrlFinalVarData').setValue({variablesArr: arr})
    //         }
    //       }






    //       let mappArr = data.variablesArr.map(e => '['+e.variable+']')
    //       let hasSameVar = false

    //       if(ev.get('variablesDetails').value && ev.get('variablesDetails').value.length && mappArr && mappArr.length) {
    //         for (let index = 0; index < ev.get('variablesDetails').value.length; index++) {
    //           for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //             if(ev.get('variablesDetails').value[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //               hasSameVar = true
    //             }
    //           }
    //         }
    //       }




    //       if(ev.get('variablesDetails').value && ev.get('variablesDetails').value.length && (this.clickedType == 'title' || hasSameVar)) {
    //         let variablesArr = []
    //         for (let index = 0; index < ev.get('variablesDetails').value.length; index++) {
    //           for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //             if('['+data.variablesArr[varrIndex].variable+']' == ev.get('variablesDetails').value[index].actualVar) {
    //               let PersonalizedValue = ''
    //               if (data.variablesArr[varrIndex].varTextSeq) {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }
    //               else {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }

    //               ev.value.finalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //               ev.value.finalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //               ev.value.finalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //               ev.value.finalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //               ev.value.finalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //               ev.value.finalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //               ev.value.finalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //               ev.value.finalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //               ev.value.finalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //             }
    //           }

    //         }
    //       }



    //       hasSameVar = false
    //       if(ev.get('descriptionVariablesDetails').value && ev.get('descriptionVariablesDetails').value.length && mappArr && mappArr.length) {
    //         for (let index = 0; index < ev.get('descriptionVariablesDetails').value.length; index++) {
    //           for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //             if(ev.get('descriptionVariablesDetails').value[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //               hasSameVar = true
    //             }
    //           }
    //         }
    //       }



    //       if(ev.get('descriptionVariablesDetails').value && ev.get('descriptionVariablesDetails').value.length && (this.clickedType == 'description' || hasSameVar)) {
    //         let variablesArr = []
    //         for (let index = 0; index < ev.get('descriptionVariablesDetails').value.length; index++) {
    //           for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //             if('['+data.variablesArr[varrIndex].variable+']' == ev.get('descriptionVariablesDetails').value[index].actualVar) {
    //               let PersonalizedValue = ''
    //               if (data.variablesArr[varrIndex].varTextSeq) {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }
    //               else {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }


    //               ev.value.descriptionFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //               ev.value.descriptionFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //               ev.value.descriptionFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //               ev.value.descriptionFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //               ev.value.descriptionFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //               ev.value.descriptionFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //               ev.value.descriptionFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //               ev.value.descriptionFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //               ev.value.descriptionFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //             }
    //           }
    //         }
    //       }


    //       hasSameVar = false
    //       if(ev.get('mediaUrlVariablesDetails').value && ev.get('mediaUrlVariablesDetails').value.length && mappArr && mappArr.length) {
    //         for (let index = 0; index < ev.get('mediaUrlVariablesDetails').value.length; index++) {
    //           for (let mappArrIndex = 0; mappArrIndex < mappArr.length; mappArrIndex++) {
    //             if(ev.get('mediaUrlVariablesDetails').value[index].actualVar == mappArr[mappArrIndex] && !hasSameVar) {
    //               hasSameVar = true
    //             }
    //           }
    //         }
    //       }



    //       if(ev.get('mediaUrlVariablesDetails').value && ev.get('mediaUrlVariablesDetails').value.length && (this.clickedType == 'mediaUrl' || hasSameVar)) {
    //         let variablesArr = []
    //         for (let index = 0; index < ev.get('mediaUrlVariablesDetails').value.length; index++) {
    //           for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //             if('['+data.variablesArr[varrIndex].variable+']' == ev.get('mediaUrlVariablesDetails').value[index].actualVar) {
    //               let PersonalizedValue = ''
    //               if (data.variablesArr[varrIndex].varTextSeq) {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }
    //               else {
    //                 if (!data.variablesArr[varrIndex].columnListValue) {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                   }
    //                   else {
    //                     PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                   }
    //                 }
    //                 else {
    //                   if (data.variablesArr[varrIndex].text) {
    //                     PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                   else {
    //                     PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                   }
    //                 }
    //               }


    //               ev.value.mediaUrlFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //               ev.value.mediaUrlFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //             }
    //           }
    //         }
    //       }



    //       if(ev.get('suggestions').value && ev.get('suggestions').value.length) {
    //         ev.get('suggestions').value.forEach(dt => {
    //           if(dt.hasOwnProperty('reply')) {
    //             if(dt.reply.textVariablesDetails && dt.reply.textVariablesDetails.length) {
    //               let arr = []
    //               if(!dt.reply.textFinalVarData || !dt.reply.textFinalVarData.variablesArr || (dt.reply.textFinalVarData.variablesArr && !dt.reply.textFinalVarData.variablesArr.length)) {
    //                 dt.reply.textVariables.forEach(res => {
    //                   let obj = {
    //                     'variable': res.replace(/\>\{|\}/g, ''),
    //                     'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                     'configColumnList': this.configColumnList,
    //                     'columnListText': this.translatedObj['campaign.select-text'],
    //                     'columnListValue': '',
    //                     'varTextSeq': false,
    //                     'PersonalizedValue': '',
    //                     'text': ''
    //                   }
    //                   arr.push(obj)
    //                 })
    //                 dt.reply.textFinalVarData = {variablesArr: arr}
    //               }
    //             }



    //             if(dt.reply.textVariablesDetails && dt.reply.textVariablesDetails.length) {
    //               let variablesArr = []
    //               for (let index = 0; index < dt.reply.textVariablesDetails.length; index++) {
    //                 for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                   if('['+data.variablesArr[varrIndex].variable+']' == dt.reply.textVariablesDetails[index].actualVar) {
    //                     let PersonalizedValue = ''
    //                     if (data.variablesArr[varrIndex].varTextSeq) {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }
    //                     else {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }

    //                     dt.reply.textFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                     dt.reply.textFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                     dt.reply.textFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                     dt.reply.textFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                     dt.reply.textFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                     dt.reply.textFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                     dt.reply.textFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                     dt.reply.textFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                     dt.reply.textFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                   }
    //                 }

    //               }
    //             }

    //             this.updateSuggestedVariablesForAll(dt, dt.reply ? 'reply' : 'action')
    //             dt.reply.labelInnerText = this.updateInnerText(dt, 'reply');
    //           }

    //           if(dt.hasOwnProperty('action')) {
    //             if(dt.action.textVariablesDetails && dt.action.textVariablesDetails.length) {
    //               let arr = []
    //               if(!dt.action.textFinalVarData || !dt.action.textFinalVarData.variablesArr || (dt.action.textFinalVarData.variablesArr && !dt.action.textFinalVarData.variablesArr.length)) {
    //                 dt.action.textVariables.forEach(res => {
    //                   let obj = {
    //                     'variable': res.replace(/\>\{|\}/g, ''),
    //                     'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                     'configColumnList': this.configColumnList,
    //                     'columnListText': this.translatedObj['campaign.select-text'],
    //                     'columnListValue': '',
    //                     'varTextSeq': false,
    //                     'PersonalizedValue': '',
    //                     'text': ''
    //                   }
    //                   arr.push(obj)
    //                 })
    //                 dt.action.textFinalVarData = {variablesArr: arr}
    //               }
    //             }



    //             if(dt.action.textVariablesDetails && dt.action.textVariablesDetails.length) {
    //               let variablesArr = []
    //               for (let index = 0; index < dt.action.textVariablesDetails.length; index++) {
    //                 for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                   if('['+data.variablesArr[varrIndex].variable+']' == dt.action.textVariablesDetails[index].actualVar) {
    //                     let PersonalizedValue = ''
    //                     if (data.variablesArr[varrIndex].varTextSeq) {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }
    //                     else {
    //                       if (!data.variablesArr[varrIndex].columnListValue) {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                         }
    //                         else {
    //                           PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                         }
    //                       }
    //                       else {
    //                         if (data.variablesArr[varrIndex].text) {
    //                           PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                         else {
    //                           PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                         }
    //                       }
    //                     }

    //                     dt.action.textFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                     dt.action.textFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                     dt.action.textFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                     dt.action.textFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                     dt.action.textFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                     dt.action.textFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                     dt.action.textFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                     dt.action.textFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                     dt.action.textFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                   }
    //                 }

    //               }
    //             }
    //             this.updateSuggestedVariablesForAll(dt, dt.reply ? 'reply' : 'action')
    //             dt.action.labelInnerText = this.updateInnerText(dt, 'action');


    //             if(dt.action.hasOwnProperty('openUrlAction')) {
    //               if(dt.action.urlVariablesDetails && dt.action.urlVariablesDetails.length) {
    //                 let arr = []
    //                 if(!dt.action.urlFinalVarData || !dt.action.urlFinalVarData.variablesArr || (dt.action.urlFinalVarData.variablesArr && !dt.action.urlFinalVarData.variablesArr.length)) {
    //                   dt.action.urlVariables.forEach(res => {
    //                     let obj = {
    //                       'variable': res.replace(/\>\{|\}/g, ''),
    //                       'columnList': this.personalizeOptions && this.personalizeOptions.length ? this.personalizeOptions : [],
    //                       'configColumnList': this.configColumnList,
    //                       'columnListText': this.translatedObj['campaign.select-text'],
    //                       'columnListValue': '',
    //                       'varTextSeq': false,
    //                       'PersonalizedValue': '',
    //                       'text': ''
    //                     }
    //                     arr.push(obj)
    //                   })
    //                   dt.action.urlFinalVarData = {variablesArr: arr}
    //                 }
    //               }



    //               if(dt.action.urlVariablesDetails && dt.action.urlVariablesDetails.length) {
    //                 let variablesArr = []
    //                 for (let index = 0; index < dt.action.urlVariablesDetails.length; index++) {
    //                   for (let varrIndex = 0; varrIndex < data.variablesArr.length; varrIndex++) {
    //                     if('['+data.variablesArr[varrIndex].variable+']' == dt.action.urlVariablesDetails[index].actualVar) {
    //                       let PersonalizedValue = ''
    //                       if (data.variablesArr[varrIndex].varTextSeq) {
    //                         if (!data.variablesArr[varrIndex].columnListValue) {
    //                           if (data.variablesArr[varrIndex].text) {
    //                             PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                           }
    //                           else {
    //                             PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                           }
    //                         }
    //                         else {
    //                           if (data.variablesArr[varrIndex].text) {
    //                             PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>${data.variablesArr[varrIndex].text}`
    //                           }
    //                           else {
    //                             PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                           }
    //                         }
    //                       }
    //                       else {
    //                         if (!data.variablesArr[varrIndex].columnListValue) {
    //                           if (data.variablesArr[varrIndex].text) {
    //                             PersonalizedValue = `${data.variablesArr[varrIndex].text}`
    //                           }
    //                           else {
    //                             PersonalizedValue = '[' + data.variablesArr[varrIndex].variable + ']'
    //                           }
    //                         }
    //                         else {
    //                           if (data.variablesArr[varrIndex].text) {
    //                             PersonalizedValue = `${data.variablesArr[varrIndex].text}<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                           }
    //                           else {
    //                             PersonalizedValue = `<<${data.variablesArr[varrIndex].columnListValue}>>`
    //                           }
    //                         }
    //                       }

    //                       dt.action.urlFinalVarData.variablesArr[index].text = data.variablesArr[varrIndex].text
    //                       dt.action.urlFinalVarData.variablesArr[index].columnListText = data.variablesArr[varrIndex].columnListText
    //                       dt.action.urlFinalVarData.variablesArr[index].columnListValue = data.variablesArr[varrIndex].columnListValue
    //                       dt.action.urlFinalVarData.variablesArr[index].variable = data.variablesArr[varrIndex].variable
    //                       dt.action.urlFinalVarData.variablesArr[index].varTextSeq = data.variablesArr[varrIndex].varTextSeq
    //                       dt.action.urlFinalVarData.variablesArr[index].columnList = data.variablesArr[varrIndex].columnList
    //                       dt.action.urlFinalVarData.variablesArr[index].configColumnList = data.variablesArr[varrIndex].configColumnList
    //                       dt.action.urlFinalVarData.variablesArr[index].urlValue = data.variablesArr[varrIndex].urlValue
    //                       dt.action.urlFinalVarData.variablesArr[index].PersonalizedValue = data.variablesArr[varrIndex].PersonalizedValue
    //                     }
    //                   }

    //                 }
    //               }
    //               this.updateSuggestedVariablesForAll(dt, dt.reply ? 'reply' : 'action', true)
    //               dt.action.urlInnerText = this.updateInnerText(dt, 'action', true);
    //             }

    //           }
    //         })
    //       }
    //     })
    //     this.storeActiveCardIndex = JSON.parse(JSON.stringify(this.activeCardIndex))
    //     // if(this.suggestion && this.suggestion.length && !suggested && data) {
    //     //   this.cards.controls.forEach((e, index) => {
    //     //     if(e.value.suggestions && e.value.suggestions.length) {
    //     //       this.selectCard(index, '', 'add', true)
    //     //       let obj = {
    //     //         suggestions: e.value.suggestions,
    //     //         card: true
    //     //       }
    //     //       this.createRcsCampaignService.setSuggestedVariables.next(obj);
    //     //       let obj2 = {
    //     //         data: data,
    //     //         type: this.messageForm.get('messageType').value,
    //     //         cards: this.cards
    //     //       }
    //     //       this.createRcsCampaignService.setSuggestionsVariableData.next(obj2);
    //     //     }
    //     //   })
    //     // }
    //   }









    // }
    // this.inputType = this.clickedType;
    // if(this.messageForm.get('messageType').value == 0) {
    //   if(this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, '', 'text');
    //   }
    //   if(this.suggestion && this.suggestion.length) {
    //     let obj = {
    //       suggestions: this.suggestion.value,
    //       card: false,
    //       type: this.messageForm.get('messageType').value,
    //       activeIndex: this.activeIndex
    //     }
    //     this.createRcsCampaignService.setSuggestedVariables.next(obj);
    //   }
    // }
    // else if(this.messageForm.get('messageType').value == 2) {
    //   // this.clickedType = 'title';
    //   // this.clickedElement = this.textTitle
    //   if(this.finalVarData && this.finalVarData.variablesArr && this.finalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, '', 'title');
    //   }
    //   // this.clickedType = 'description';
    //   // this.clickedElement = this.descriptionText
    //   if(this.descriptionFinalVarData && this.descriptionFinalVarData.variablesArr && this.descriptionFinalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, '', 'description');
    //   }
    //   if(this.mediaUrlFinalVarData && this.mediaUrlFinalVarData.variablesArr && this.mediaUrlFinalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, '', 'mediaUrl');
    //   }
    //   if(this.suggestion && this.suggestion.length) {
    //     let obj = {
    //       suggestions: this.suggestion.value,
    //       card: false,
    //       type: this.messageForm.get('messageType').value,
    //       activeIndex: this.activeIndex
    //     }
    //     this.createRcsCampaignService.setSuggestedVariables.next(obj);
    //   }
    // }
    // else if(this.messageForm.get('messageType').value == 3) {
    //   // this.updateVariablesForAll(data);

    //   // let storeActiveCardIndex = this.activeCardIndex
    //   this.cards.controls.forEach((e: any, index) => {
    //     // this.clickedType = 'title';
    //     // this.clickedElement = this.textTitle
    //   if(e.value.finalVarData && e.value.finalVarData.variablesArr && e.value.finalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, index, 'title');
    //   }
    //     // this.clickedType = 'description';
    //     // this.clickedElement = this.descriptionText
    //   if(e.value.descriptionFinalVarData && e.value.descriptionFinalVarData.variablesArr && e.value.descriptionFinalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, index, 'description');
    //   }
    //   if(e.value.mediaUrlFinalVarData && e.value.mediaUrlFinalVarData.variablesArr && e.value.mediaUrlFinalVarData.variablesArr.length) {
    //     this.updateVariablesForAll(data, index, 'mediaUrl');
    //   }
    //     if(data) this.selectCard(index, '', 'add')
    //   })
    //   if(data) {
    //     this.selectCard(this.storeActiveCardIndex, '', 'add', false, this.actualSuggIndex)
    //   }

    // }
  }

  insertLink(id) {
    this.insertLinkEvent.emit(id)
  }

  showGridPreview(value) {
    this.showGridPreviewEvent.emit(value)
  }

  checkForUrl(string) {
    var regex = this.common.detectUrlFromTextRegex;
    if (regex.test(string)) {
      return string.match(regex)[0];
    }
  }

}
