import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { HighlightAndUpdateVariablesService } from './highlight-and-update-variables.service';
import { UpdatePersonalisedValuesService } from './update-personalised-values.service';

const htmlVnFormatRegex = new RegExp(/\>\{\{[V][0-9]*\}\}/g);
const TextVarRegex = new RegExp(/\{\{[0-9]*\}\}/g);
const textHnFormatRegex = new RegExp(/\{\{[H][0-9]*\}\}/g);
const textVnFormatRegex = new RegExp(/\{\{[V][0-9]*\}\}/g);
const htmlHnFormatRegex = new RegExp(/\>\{\{[H][0-9]*\}\}/g);
const htmlFnFormatRegex = new RegExp(/\>\{\{[F][0-9]*\}\}/g);
const textFnFormatRegex = new RegExp(/\{\{[F][0-9]*\}\}/g);

@Injectable({
  providedIn: 'root'
})
export class ResetVariablesService {
  translatedObj: any;
  setValues = new Subject<any>();

  constructor(public highlightAndUpdateVariablesService: HighlightAndUpdateVariablesService, public updatePersonalisedValuesService: UpdatePersonalisedValuesService, public createCampaignService: CreateCampaignService, public common: CommonService) {
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
      }
    })
  }

  resetVariable(comp, is_carousel_section = false) {
    let linkFormObj: any = ''
    if (comp.urlClickedEditor == (is_carousel_section && 'cardtext' || 'text')) linkFormObj = comp.urlFormValue
    if (comp.buttons && comp.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(comp, is_carousel_section);
      obj.arr.forEach((e) => {
        if (((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText' || 'text3')) && (obj.urlClickedEditor1 == e.url)) || ((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText2' || 'text4')) && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
          delete e['smart_url']
        }
      })
    }
    comp.urlType = 'text';
    if (linkFormObj && linkFormObj.urlFromColumn) {
      comp.urlType = 'column';
    }
    let text = comp.clickedText.replace('>', '');
    this.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
    comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML = comp.actualHtml;
    if (comp.text2) {
      comp.text2.nativeElement.innerHTML = comp.headerActualHtml;
    }
    if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
      comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML = comp.footerActualHtml;
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML = comp.footer2ActualHtml;
    }
    for (let index = 0; index < comp.variablesDetails.length; index++) {
      if (comp.variablesDetails[index]['personalizedUrl'] || comp.variablesDetails[index]['personalizedVar']) {
        if ((comp.clickedVar == comp.variablesDetails[index]['actualVar']) && (text == comp.variablesDetails[index]['personalizedUrl'] || ((text == comp.variablesDetails[index]['personalizedVar']) || (text.replace(/\s/g, '') == comp.variablesDetails[index]['personalizedVar'].replace(/\s/g, ''))))) {
          if (comp.variablesDetails[index]['personalizedUrl']) {
            if (linkFormObj) {
              for (var item in linkFormObj) {
                linkFormObj[item] = ''
              }
              if (comp.urlClickedEditor == (is_carousel_section && 'cardBtnText' || 'text3') || comp.urlClickedEditor == (is_carousel_section && 'cardBtnText2' || 'text4')) {
                this.resetSelectedTemplateButtonSmartUrl(comp, comp.variablesDetails[index]['actualVar'], is_carousel_section);
              }
            }
            comp.shortUrl = ''
            this.createCampaignService.setUrlFormValue(linkFormObj)
          }
          comp.variablesDetails[index]['personalizedUrl'] = '';
          comp.variablesDetails[index]['personalizedVar'] = '';
          this.resetFinalVarData(comp, 'validCheck', index, 'data', is_carousel_section);
          comp.disablePersonalise = false;
          comp.disableAddLink = false;
        }
        else {
          let text = comp.variablesDetails[index]['personalizedVar'].replace(/&/g, '&amp;').replace(/</g, '&lt;');
          let url = comp.variablesDetails[index]['personalizedUrl'].replace(/</g, '&lt;');
          let reg = new RegExp('>' + comp.variablesDetails[index]['actualVar'], "g");
          let replaceTo = '>' + (comp.variablesDetails[index]['personalizedUrl'] ? url.replace(/>/g, '&gt;') : text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'))
          comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML.replace(reg, replaceTo)
          if (comp.text2) {
            comp.text2.nativeElement.innerHTML = comp.text2.nativeElement.innerHTML.replace(reg, replaceTo)
          }
          if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
            comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML = comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML.replace(reg, replaceTo)
          }
          if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
            comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML = comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML.replace(reg, replaceTo)
          }
        }
      }
    }

    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      for (let index = 0; index < comp.variablesDetails.length; index++) {
        if (comp.variablesDetails[index].personalizedUrl && this.checkForUrl(comp.variablesDetails[index].personalizedUrl)) {
          let text = comp.actualHtml.replace(/&gt;/g, '>')
          let innerHtml = text.replace(/&lt;/g, '<')
          if (innerHtml.includes(comp.variablesDetails[index].personalizedUrl)) {
            comp.actualHtml = innerHtml.replace(comp.variablesDetails[index].personalizedUrl, comp.variablesDetails[index].actualVar)
          }
          break
        }
        if (comp.variablesDetails[index].personalizedVar) {
          comp.actualHtml = comp.actualHtml.replace(comp.variablesDetails[index].personalizedVar, comp.variablesDetails[index].actualVar)
          comp.headerActualHtml = comp.headerActualHtml ? comp.headerActualHtml.replace(comp.variablesDetails[index].personalizedVar, comp.variablesDetails[index].actualVar) : ''
          comp.footerActualHtml = comp.footerActualHtml ? comp.footerActualHtml.replace(comp.variablesDetails[index].personalizedVar, comp.variablesDetails[index].actualVar) : ''
          comp.footer2ActualHtml = comp.footer2ActualHtml ? comp.footer2ActualHtml.replace(comp.variablesDetails[index].personalizedVar, comp.variablesDetails[index].actualVar) : ''
        }
      }
    }
    this.resetFinalVarData(comp, 'validCheck', '', '', is_carousel_section);
    this.setValues.next(this.updatePersonalisedValuesService.setPreview(comp, is_carousel_section));
  }

  resetFinalVarData(comp, validCheck?, i?, data?, is_carousel_section = false) {
    let regex = htmlVnFormatRegex;
    let arr = [];
    if (regex.test(comp.actualHtml)) {
      arr = comp.actualHtml.match(regex);
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
      arr = this.highlightAndUpdateVariablesService.setFooterArray(arr, comp.urlClickedEditor1Regex, htmlFnFormatRegex, comp.footerActualHtml)
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      arr = this.highlightAndUpdateVariablesService.setFooterArray(arr, comp.urlClickedEditor2Regex, htmlFnFormatRegex, comp.footer2ActualHtml)
    }
    arr = this.highlightAndUpdateVariablesService.setBtnArray(comp, arr);
    let varArr = [];
    if (arr && arr.length > 0) {
      if ((varArr && varArr.length == 0) || !varArr) {
        arr.forEach(e => {
          varArr.push(this.highlightAndUpdateVariablesService.setPersonalisationStructure(comp, e, validCheck));
        })
      }
    }

    if (comp.finalVarData && comp.finalVarData['variablesArr'] && comp.finalVarData['variablesArr'].length > 0) {
      if (varArr && varArr.length > 0) {
        for (let index = 0; index < varArr.length; index++) {
          for (let finalVarIndex = 0; finalVarIndex < comp.finalVarData.variablesArr.length; finalVarIndex++) {
            varArr[index]['PersonalizedValue'] = ''
            varArr[index]['columnList'] = comp.finalVarData.variablesArr[finalVarIndex].columnList
            varArr[index]['columnListText'] = this.translatedObj['campaign.select-text']
            varArr[index]['columnListValue'] = ''
            varArr[index]['text'] = ''
            if (comp.finalVarData.variablesArr[finalVarIndex].variable == varArr[index].variable) {
              varArr[index]['PersonalizedValue'] = comp.finalVarData.variablesArr[finalVarIndex].PersonalizedValue
              varArr[index]['columnListText'] = comp.finalVarData.variablesArr[finalVarIndex].columnListText
              varArr[index]['columnListValue'] = comp.finalVarData.variablesArr[finalVarIndex].columnListValue
              varArr[index]['text'] = comp.finalVarData.variablesArr[finalVarIndex].text
              varArr[index]['varTextSeq'] = comp.finalVarData.variablesArr[finalVarIndex].varTextSeq
              varArr[index]['urlValue'] = comp.finalVarData.variablesArr[finalVarIndex].urlValue
              break
            }
          }
        }
        comp.finalVarData.variablesArr = varArr
      }
    }
    if (data) {
      if (comp.finalVarData && comp.finalVarData['variablesArr'] && comp.finalVarData['variablesArr'].length > 0) {
        if ((comp.finalVarData['variablesArr'][i]['variable'] != comp.urlClickedEditor1Regex) && (comp.finalVarData['variablesArr'][i]['variable'] != comp.urlClickedEditor2Regex)) comp.finalVarData['variablesArr'][i]['urlValue'] = '';
        comp.finalVarData['variablesArr'][i]['PersonalizedValue'] = '';
        comp.finalVarData['variablesArr'][i]['text'] = '';
        comp.finalVarData['variablesArr'][i]['columnListText'] = this.translatedObj['campaign.select-text'];
        comp.finalVarData['variablesArr'][i]['columnListValue'] = '';
        comp.finalVarData['variablesArr'][i]['varTextSeq'] = false;
        let a = { ...comp.finalVarData };
        comp.finalVarData = {};
        comp.finalVarData = a;
      }
    }
  }

  resetSelectedTemplateButtonSmartUrl(comp, variable, is_carousel_section) {
    if (is_carousel_section || (comp.selectedTemplate && comp.selectedTemplate[comp.messageForm.get('language').value].button_info && comp.selectedTemplate[comp.messageForm.get('language').value].button_info.length)) {
      let arr = is_carousel_section && comp.buttons || comp.selectedTemplate[comp.messageForm.get('language').value].button_info.filter(e => e.is_trackable)
      if (arr.length) {
        arr.forEach(ev => {
          if (variable.includes(ev.variable)) {
            delete ev['smart_url']
          }
        })
      }
    }
  }

  checkForUrl(string) {
    var regex = this.common.detectUrlFromTextRegex;
    if (regex.test(string)) {
      return string.match(regex)[0];
    }
  }

  updateValues() {
    return this.setValues.asObservable();
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
}
