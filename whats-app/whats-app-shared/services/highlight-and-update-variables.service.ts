import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);
const htmlVnFormatRegex = new RegExp(/\>\{\{[V][0-9]*\}\}/g);
const htmlHnFormatRegex = new RegExp(/\>\{\{[H][0-9]*\}\}/g);
const htmlFnFormatRegex = new RegExp(/\>\{\{[F][0-9]*\}\}/g);
@Injectable({
  providedIn: 'root'
})
export class HighlightAndUpdateVariablesService {
  translatedObj: any;
  constructor(public createCampaignService: CreateCampaignService, public common: CommonService) {
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
      }
    })
  }
  updateVariables(comp, value1, value2?, is_carousel_section = false) {
    if (comp.buttons && comp.buttons.length) {
      comp.trackableLinks = comp.buttons.filter(e => e.is_trackable);
      if (comp.trackableLinks && comp.trackableLinks.length) {
        comp.trackableLinks.forEach(e => {
          if (comp[is_carousel_section && 'cardBtnText' || 'text3'] && (e.url == comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText) && !comp.urlClickedEditor1Regex) {
            comp.urlClickedEditor1Regex = this.setInnerTextAndRegexValue(comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText, TextVarRegex, 'F');
            e.url = comp.urlClickedEditor1Regex
          }
          if (comp[is_carousel_section && 'cardBtnText2' || 'text4'] && (e.url == comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText) && !comp.urlClickedEditor2Regex) {
            comp.urlClickedEditor2Regex = this.setInnerTextAndRegexValue(comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText, TextVarRegex, 'F', true);
            e.url = comp.urlClickedEditor2Regex
          }
        })
      }
    }
    comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerText = this.setInnerTextAndRegexValue(value1, TextVarRegex, 'V');
    if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
      comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText = this.setInnerTextAndRegexValue(comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText, TextVarRegex, 'F');
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText = this.setInnerTextAndRegexValue(comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText, TextVarRegex, 'F', true);
    }
    if (value2) {
      comp.text2.nativeElement.innerText = this.setInnerTextAndRegexValue(value2, TextVarRegex, 'H');
    }
    if (comp['text5']) {
      comp['text5'].nativeElement.innerText = this.setInnerTextAndRegexValue(comp['text5'].nativeElement.innerText, TextVarRegex, 'F');
    }
    let obj = this.highlightVariables(comp, comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerText, '', is_carousel_section);
    comp = this.setCompData(comp, obj);
    let obj2 = this.getActiveVariables(comp, comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerText, '', '', '', '', is_carousel_section);
    comp = this.setCompData(comp, obj2);
    this.setTemplateVariablesJson(comp, '', is_carousel_section);
  }
  setInnerTextAndRegexValue(value, regex, char, num?) {
    let index;
    let count = num ? 2 : 1;
    return value.replace(regex, function (m) {
      index = count;
      count++;
      return '{{' + char + index + '}}'
    });
  }
  highlightVariables(comp, data1, url?, is_carousel_section = false) {
    const updateContent = (reg, editor, url) => {
      let arr = []
      let regex = reg ? reg : comp[editor].nativeElement.innerText
      let text = `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${regex}" title="Right click...">`
      if (reg) arr = comp[editor].nativeElement.innerText.match(regex)
      if (editor != 'text5') {
        if ((reg && arr && arr.length > 0) || (!reg)) {
          comp[editor].nativeElement.innerHTML = comp[editor].nativeElement.innerHTML.replace(url ? text : regex, function (m) {
            let regexVar = url ? m.replace(/>/g, '') : m
            return `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${regexVar}" title="Right click...">${regexVar}</a>`
          });
        }
      } else {
        comp[editor].nativeElement.innerHTML = `<a href="javascript:void(0)" contenteditable="false" id="variable" class="variable-text ${comp[editor].nativeElement.innerText}" title="Right click...">${comp[editor].nativeElement.innerText}</a>`
      }
    }
    updateContent(textVnFormatRegex, is_carousel_section && 'cardtext' || 'text', url ? url : '');
    comp.actualHtml = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML;
    if (comp.text2 && comp.text2.nativeElement.innerText) {
      updateContent(textHnFormatRegex, 'text2', url ? url : '');
      comp.headerActualHtml = comp.text2.nativeElement.innerHTML;
    }
    if (comp[is_carousel_section && 'cardBtnText' || 'text3'] && comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText) {
      if (comp.urlClickedEditor1Regex) {
        updateContent('', is_carousel_section && 'cardBtnText' || 'text3', url ? url : '');
      }
      else {
        updateContent(textFnFormatRegex, is_carousel_section && 'cardBtnText' || 'text3', url ? url : '');
      }
      comp.footerActualHtml = comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML;
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4'] && comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText) {
      if (comp.urlClickedEditor2Regex) {
        updateContent('', is_carousel_section && 'cardBtnText2' || 'text4', url ? url : '');
      }
      else {
        updateContent(textFnFormatRegex, is_carousel_section && 'cardBtnText2' || 'text4', url ? url : '');
      }
      comp.footer2ActualHtml = comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML;
    }

    if (comp.text5 && comp.text5.nativeElement.innerText) {
      updateContent('', 'text5', '');
      comp.copyOfferCodeActualHtml = comp['text5'].nativeElement.innerHTML;
    }

    return this.sendReqData(comp, is_carousel_section)
  }
  getActiveVariables(comp, data, varr?, validCheck?, id?, allVar?, is_carousel_section = false) {
    let regex;
    let arr = [];
    if (validCheck) {
      regex = htmlVnFormatRegex;
      if (regex.test(comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML)) {
        arr = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML.match(regex);
      }
      if (comp.text2) {
        if (htmlHnFormatRegex.test(comp.text2.nativeElement.innerHTML)) {
          let arr2 = comp.text2.nativeElement.innerHTML.match(htmlHnFormatRegex)
          if (arr2 && arr2.length > 0) {
            arr.unshift(...arr2)
          }
        }
      }
      if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
        arr = this.setFooterArray(arr, comp.urlClickedEditor1Regex, htmlFnFormatRegex, comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML)
      }
      if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
        arr = this.setFooterArray(arr, comp.urlClickedEditor2Regex, htmlFnFormatRegex, comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML)
      }
      arr = this.setBtnArray(comp, arr);
    }
    else {
      regex = textVnFormatRegex;
      if (regex.test(data)) {
        arr = data.match(regex);
      }
      if (comp.text2) {
        if (textHnFormatRegex.test(comp.text2.nativeElement.innerText)) {
          let arr2 = comp.text2.nativeElement.innerText.match(textHnFormatRegex)
          if (arr2 && arr2.length > 0) {
            arr.unshift(...arr2)
          }
        }
      }
      if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
        arr = this.setFooterArray(arr, comp.urlClickedEditor1Regex, textFnFormatRegex, comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText)
      }
      if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
        arr = this.setFooterArray(arr, comp.urlClickedEditor2Regex, textFnFormatRegex, comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText)
      }
      arr = this.setBtnArray(comp, arr);
    }
    if (arr && arr.length > 0) {
      if ((comp.variables && comp.variables.length == 0) || !comp.variables) {
        comp.variables = [];
        comp.varData = []
        arr.forEach(e => {
          comp.varData.push(this.setPersonalisationStructure(comp, e, validCheck))
        })
        comp.variables = [...comp.varData];
      }
      if ((comp.variables && comp.variables.length > 0) && (comp.variablesDetails && comp.variablesDetails.length > 0)) {
        for (let index = 0; index < comp.variablesDetails.length; index++) {
          for (let varIndex = 0; varIndex < comp.variables.length; varIndex++) {
            if ((comp.variablesDetails[index]['actualVar'].replace(/\{|\}/g, '') == comp.variables[varIndex]['variable']) && comp.variablesDetails[index]['personalizedUrl']) {
              comp.variables[varIndex]['urlValue'] = comp.variablesDetails[index]['personalizedUrl']
            }
          }
        }
      }
      if (allVar) {
        this.createCampaignService.setTextMessage([...comp.variables]);
        // this.openDrawer(id);
        this.common.open(id);
      }
    }
    return this.sendReqData(comp, is_carousel_section)
  }
  setTemplateVariablesJson(comp, value?, is_carousel_section = false) {
    let regex = htmlVnFormatRegex;
    let arr = [];
    if (regex.test(comp.actualHtml)) {
      arr = comp.actualHtml.match(regex)
    }
    if (comp.text2) {
      if (htmlHnFormatRegex.test(comp.headerActualHtml)) {
        let arr2 = comp.headerActualHtml.match(htmlHnFormatRegex)
        if (arr2 && arr2.length > 0) {
          arr.unshift(...arr2)
        }
      }
    }
    if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
      arr = this.setFooterArray(arr, comp.urlClickedEditor1Regex, htmlFnFormatRegex, comp.footerActualHtml)
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      arr = this.setFooterArray(arr, comp.urlClickedEditor2Regex, htmlFnFormatRegex, comp.footer2ActualHtml)
    }
    comp.buttons.forEach(e => {
      if (e?.type.toLowerCase() == 'quick_reply' || e?.type.toLowerCase() == 'copy_code') {
        arr.push(`{{${e.buttonText}}}`)
      }
    })
    comp.variablesDetails = [];
    if (arr && arr.length > 0) {
      arr.map(e => {
        comp.variablesDetails.push({
          actualVar: e.replace('>', ''),
          personalizedVar: '',
          personalizedUrl: ''
        })
      })
    }
  }
  setFooterArray(arr, clickedEditorRegex, formatRegex, value) {
    if (clickedEditorRegex) {
      arr.push(`${clickedEditorRegex}`)
    }
    else {
      let regex3 = formatRegex;
      if (regex3.test(value)) {
        let arr3 = value.match(regex3)
        if (arr3 && arr3.length > 0) {
          arr.push(...arr3)
        }
      }
    }
    return arr
  }
  setBtnArray(comp, arr) {
    let count = 1;
    comp.buttons.forEach(e => {
      if (e?.type.toLowerCase() == 'quick_reply' || e?.type.toLowerCase() == 'copy_code') {
        arr.push(`>{{${e.buttonText}}}`)
      }
      if (e?.url_type && (e?.url_type == 'dynamic')) {
        e['variable'] = `F${count}`
        count++
      }
    })
    return arr
  }
  setPersonalisationStructure(comp, e, validCheck?) {
    let obj = {
      'variable': ((e == comp.urlClickedEditor1Regex) || (e == comp.urlClickedEditor2Regex)) ? e : (validCheck ? e.replace(/\>\{\{|\}\}/g, '') : e.replace(/\{\{|\}\}/g, '')),
      'columnList': comp.columnContainingUrlList,
      'configColumnList': {
        image: false,
        title: '',
        key: 'header',
        search: false,
        open: false,
        createNew: false
      },
      'columnListText': this.translatedObj['campaign.select-text'],
      'columnListValue': '',
      'varTextSeq': false,
      'urlValue': ((e == comp.urlClickedEditor1Regex) || (e == comp.urlClickedEditor2Regex)) ? e : ''
    }
    return obj
  }
  setButtonsArray(comp, is_carousel_section = false) {
    if (comp.buttons && comp.buttons.length) {
      let count = 1;
      comp.buttons.forEach((e) => {
        if (e?.url_type && e?.url_type == "dynamic") {
          e["variable"] = `F${count}`;
          count++;
        }
      });
      comp.buttons = this.setButtonsType(comp);
      let arr = [];
      comp.showQuickReplyPersonalisedButton = false;
      comp.showCopyOfferCodePersonalisedButton = false;
      comp.buttons.forEach((e, index) => {
        if (e.type.toLowerCase() == "quick_reply" || e.type.toLowerCase() == "copy_code") {
          e.type = e.type.toLowerCase();
          if (e.type.toLowerCase() == "quick_reply") {
            comp.showQuickReplyPersonalisedButton = true;
          } else {
            comp.showCopyOfferCodePersonalisedButton = true;
          }
        }
        arr.push({
          buttonText: e.text,
          index: index,
          type: e.type,
          ...e,
        });
      });
      comp.buttons = [...arr];
      count = 1;
      comp.buttons.forEach((e) => {
        if (e?.url_type && e?.url_type == "dynamic") {
          e["variable"] = `F${count}`;
          count++;
        }
      });
    }
    return { buttons: comp.buttons, showQuickReplyPersonalisedButton: comp.showQuickReplyPersonalisedButton, showCopyOfferCodePersonalisedButton: comp.showCopyOfferCodePersonalisedButton, is_carousel_section: is_carousel_section }
  }
  setButtonsType(comp) {
    comp.buttons.forEach(e => {
      if (!e.type) {
        e.type = 'quick_reply'
      }
    })
    return comp.buttons
  }
  getReqParams(comp, is_carousel_section = false) {
    comp.buttons = this.setDefaultUrl(comp, is_carousel_section);
    let arr = comp.buttons.filter(e => e.is_trackable)
    let urlClickedEditor1 = ''
    let urlClickedEditor2 = ''
    if (comp.urlClickedEditor1Regex) {
      urlClickedEditor1 = this.setInnerTextAndRegexValue(comp.urlClickedEditor1Regex, /\{\{[F][0-9]*\}\}/g, '');
    }
    if (comp.urlClickedEditor2Regex) {
      urlClickedEditor2 = this.setInnerTextAndRegexValue(comp.urlClickedEditor2Regex, /\{\{[F][0-9]*\}\}/g, '', true);
    }
    let obj = {
      arr: arr,
      urlClickedEditor1: urlClickedEditor1,
      urlClickedEditor2: urlClickedEditor2
    }
    return obj as any;
  }
  setDefaultUrl(comp, is_carousel_section?) {
    if ((comp?.messageForm?.get('language')?.value && comp?.selectedTemplate[comp.messageForm.get('language').value]?.button_info?.length) || is_carousel_section) {
      let trackableArr = is_carousel_section && comp.buttons.filter(e => e.is_trackable) || comp.selectedTemplate[comp.messageForm.get('language').value].button_info.filter(e => e.is_trackable)
      if (trackableArr && trackableArr.length) {
        let count = 1;
        comp.buttons.forEach((e) => {
          if (e.is_trackable) {
            if (e.variable == 'F2') count = 2;
            let index = trackableArr.findIndex(ev => ev.variable == e.variable)
            if (index > -1) {
              e.url = this.setInnerTextAndRegexValue(trackableArr[index].url, TextVarRegex, '', count == 2 ? true : false);
              trackableArr[index].url = e.url
            }
          }
        })
      }
    }
    return comp.buttons
  }
  sendReqData(comp, is_carousel_section = false) {
    let req;
    req = {
      trackableLinks: comp.trackableLinks,
      urlClickedEditor1Regex: comp.urlClickedEditor1Regex,
      urlClickedEditor2Regex: comp.urlClickedEditor2Regex,
      actualHtml: comp.actualHtml,
      headerActualHtml: comp.headerActualHtml,
      footerActualHtml: comp.footerActualHtml,
      footer2ActualHtml: comp.footer2ActualHtml,
      variables: comp.variables,
      varData: comp.varData,
      variablesDetails: comp.variablesDetails,
      buttons: comp.buttons
    }
    if (is_carousel_section) {
      req['cardtext'] = comp['cardtext'];
      req['cardBtnText'] = comp['cardBtnText'];
      req['cardBtnText2'] = comp['cardBtnText2'];
    } else {
      req['text'] = comp['text'];
      req['text2'] = comp.text2;
      req['text3'] = comp['text3'];
      req['text4'] = comp['text4'];
    }
    return req;
  }
  setCompData(comp, obj) {
    for (var item in obj) {
      comp[item] = obj[item]
    }
    return comp
  }
  getButtonsInfo(comp, is_carousel_section = false) {
    let arr = [];
    comp["buttons"].forEach(e => {
      if (e.PersonalizedValue || (e.url && e.is_trackable && e.smart_url)) {
        let obj = {
          name: e.buttonText,
          index: e.index,
          value: e.PersonalizedValue ? e.PersonalizedValue : '',
          type: e.type.toLowerCase() == 'quick_reply' ? e.type.toLowerCase() : (is_carousel_section && e.type == "URL" ? e.type : (e.type.toLowerCase() == "copy_code" ? e.type.toLowerCase() : 'call_to_action'))
        }
        if (e.form_id) obj['form_id'] = e.form_id
        if (e.smart_url) obj['smart_url'] = e.smart_url
        arr.push(obj)
      }
    })
    return arr
  }
  checkForPersonalisedValuesInButtons(comp) {
    comp.buttons.forEach(e => {
      if (!e.text && !e.columnListValue) {
        e.PersonalizedValue = ''
      }
    })
    return comp.buttons;
  }
  getFinalPreviewValueWitnVar(comp, is_carousel_section = false) {
    let reg = textVnFormatRegex;
    let i;
    let cnt = 1;
    return [is_carousel_section && 'cardtext' || 'text']['nativeElement']['innerText'].replace(reg, function (m) {
      i = cnt;
      cnt++;
      return '.*'
    });
  }
  getFinalPreviewValue(comp) {
    let reg = textVnFormatRegex;
    let i;
    let cnt = 1;
    return comp.previewValue.replace(reg, function (m) {
      i = cnt;
      cnt++;
      return ''
    });
  }
  getMediaUploadedStatus(comp) {
    if ((comp.messageForm.get('mediaType').value == 0) && comp.fileName) {
      return true;
    }
    else if ((comp.messageForm.get('mediaType').value == 1) && comp.typedUrl.nativeElement.value && comp.mediaId) {
      return true;
    }
    else if ((comp.messageForm.get('mediaType').value == 2) && comp.messageForm.get('columnUrl').value) {
      return true;
    }
    else {
      return false;
    }
  }
  hasPersonalisedValue(comp, is_carousel_section = false) {
    if (comp.buttons && comp.buttons.length) {
      let arr = comp.buttons.filter(e => (e.url_type && !e.is_trackable && e.url_type == 'dynamic'))
      if (arr.length) {
        let result = arr.every(obj => comp.finalVarData.variablesArr.some(obj2 => obj2.variable === obj.variable && (!obj2.PersonalizedValue || (obj2.PersonalizedValue == `{{${obj.variable}}}`))));
        if (result) return true
      }
      let trackArr = comp.buttons.filter(e => (e.url_type && e.is_trackable && e.url_type == 'dynamic'))
      if (trackArr.length) {
        let result = trackArr.some(e => !e.smart_url)
        if (result) return true
      }
      let copyOfferCodeArr = comp.buttons.filter(e => (e.type == "copy_code"))
      if (copyOfferCodeArr.length) {
        let result = copyOfferCodeArr.every(obj => comp.finalVarData.variablesArr.some(obj2 => obj2.variable === obj.variable && (!obj2.PersonalizedValue || (obj2.PersonalizedValue == `{{${obj.variable}}}`))));
        if (result) return true
      }
    }
    if (comp.finalVarData && comp.finalVarData.variablesArr && comp.finalVarData.variablesArr.length > 0) {
      let filteredArr = []
      filteredArr = comp.finalVarData.variablesArr.filter(ev => (/\{\{[H][0-9]*\}\}/g.test('{{' + ev.variable + '}}') || /\{\{[V][0-9]*\}\}/g.test('{{' + ev.variable + '}}')))
      if (filteredArr.length) {
        for (let index = 0; index < filteredArr.length; index++) {
          if ((!filteredArr[index].PersonalizedValue && !filteredArr[index].urlValue) || ((!filteredArr[index].urlValue && /\{\{[H][0-9]*\}\}/g.test(filteredArr[index].PersonalizedValue)) || (!filteredArr[index].urlValue && /\{\{[V][0-9]*\}\}/g.test(filteredArr[index].PersonalizedValue)))) {
            return true
          }
        }
      }
    }
  }
  setPersonalisedValue(comp, data) {
    comp.variablesDetails.forEach(e => {
      if ((comp.clickedText == '>' + e.actualVar) || (comp.clickedText == '>' + e.personalizedUrl)) {
        e.personalizedUrl = data['previewUrl']
        e.personalizedVar = ''
      }
    })
    return comp.variablesDetails
  }
}