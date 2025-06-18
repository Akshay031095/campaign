import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { HighlightAndUpdateVariablesService } from './highlight-and-update-variables.service';

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
export class UpdatePersonalisedValuesService {
  translatedObj: any;

  constructor(public highlightAndUpdateVariablesService: HighlightAndUpdateVariablesService, public common: CommonService) {
    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
      }
    })
  }

  getFinalVariabledData(comp, data, is_carousel_section = false, GetButtonData = false) {
    if (comp.showVariables) {
      if (comp.variablesDetails && comp.variablesDetails.length > 0) {
        for (let index = 0; index < comp.variablesDetails.length; index++) {
          if (comp.clickedText == comp.variablesDetails[index]['personalizedUrl']) {
            comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML.replace(comp.clickedText, comp.variablesDetails[index]['actualVar'])
          }
        }
      }
    }
    let linkFormObj: any = ''
    if (comp.urlClickedEditor == (is_carousel_section && 'cardtext' || 'text')) linkFormObj = comp.urlFormValue
    if (comp.buttons && comp.buttons.length) {
      let obj = this.highlightAndUpdateVariablesService.getReqParams(comp, is_carousel_section);
      obj.arr.forEach((e) => {
        if (((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText' || 'text3')) && (obj.urlClickedEditor1 == e.url)) || ((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText2' || 'text4')) && (obj.urlClickedEditor2 == e.url))) {
          linkFormObj = e['urlFormValue']
        }
      })
    }

    comp.finalVarData = data;
    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      this.setActualHtml(comp, is_carousel_section);
      if (comp.finalVarData && comp.finalVarData.variablesArr && comp.finalVarData.variablesArr.length > 0) {
        for (let varDIndex = 0; varDIndex < comp.variablesDetails.length; varDIndex++) {
          for (let varArrIndex = 0; varArrIndex < comp.finalVarData.variablesArr.length; varArrIndex++) {
            if (comp.variablesDetails[varDIndex]['actualVar'] == '{{' + comp.finalVarData.variablesArr[varArrIndex]['variable'] + '}}') {

              if (comp.finalVarData.variablesArr[varArrIndex]['urlValue']) {
                if (!linkFormObj) {
                  comp.variablesDetails[varDIndex]['personalizedUrl'] = comp.finalVarData.variablesArr[varArrIndex]['urlValue'];
                }
                break
              }
              if (comp.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'] && (!comp.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'].match(textVnFormatRegex) && !comp.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'].match(textHnFormatRegex) && !comp.finalVarData.variablesArr[varArrIndex]['PersonalizedValue'].match(textFnFormatRegex))) {
                comp.variablesDetails[varDIndex]['personalizedVar'] = comp.finalVarData.variablesArr[varArrIndex]['PersonalizedValue']
                break
              }
            }
          }
        }
      }
    }
    let regex;
    let text2Regex;
    let text3Regex;
    let text4Regex;
    regex = htmlVnFormatRegex;
    if (comp.text2) {
      text2Regex = htmlHnFormatRegex;
    }
    if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
      text3Regex = htmlFnFormatRegex;
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      text4Regex = htmlFnFormatRegex;
    }
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
      arr = this.highlightAndUpdateVariablesService.setFooterArray(arr, comp.urlClickedEditor1Regex, htmlFnFormatRegex, comp.footerActualHtml)
    }
    if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
      arr = this.highlightAndUpdateVariablesService.setFooterArray(arr, comp.urlClickedEditor2Regex, htmlFnFormatRegex, comp.footer2ActualHtml)
    }
    arr = this.highlightAndUpdateVariablesService.setBtnArray(comp, arr);
    let dataValue = this.resetDataValue(comp, data, arr);
    if (arr && arr.length > 0) {
      for (let index = 0; index < arr.length; index++) {
        if (comp.variablesDetails[index].actualVar == '{{' + comp.variablesDetails[index].variable + '}}') {
          if (dataValue['variablesArr'][index]['PersonalizedValue'] && (dataValue['variablesArr'][index]['PersonalizedValue'].match(textVnFormatRegex) || dataValue['variablesArr'][index]['PersonalizedValue'].match(textHnFormatRegex) || dataValue['variablesArr'][index]['PersonalizedValue'].match(textFnFormatRegex))) {
            comp.variablesDetails[index]['personalizedVar'] = ''
          }
          if (dataValue['variablesArr'][index]['urlValue']) {
            comp.variablesDetails[index]['personalizedVar'] = ''
            comp.variablesDetails[index]['personalizedUrl'] = dataValue['variablesArr'][index]['urlValue'];
            break
          }
          if (dataValue['variablesArr'][index]['PersonalizedValue'] && (!dataValue['variablesArr'][index]['PersonalizedValue'].match(textVnFormatRegex) && !dataValue['variablesArr'][index]['PersonalizedValue'].match(textHnFormatRegex) && !dataValue['variablesArr'][index]['PersonalizedValue'].match(textFnFormatRegex))) {
            comp.variablesDetails[index]['personalizedVar'] = dataValue['variablesArr'][index]['PersonalizedValue']
            comp.variablesDetails[index]['personalizedUrl'] = '';
            break
          }
        }
      }

      comp.bodyVarCheckArr = [];
      comp.headerVarCheckArr = [];
      comp.footerVarCheckArr = [];
      dataValue['variablesArr'].forEach(dataValEvent => {
        if (/\>\{\{[V][0-9]*\}\}/g.test('>{{' + dataValEvent.variable + '}}')) {
          comp.bodyVarCheckArr.push(dataValEvent);
        }
        if (/\>\{\{[H][0-9]*\}\}/g.test('>{{' + dataValEvent.variable + '}}')) {
          comp.headerVarCheckArr.push(dataValEvent);
        }
        if (/\>\{\{[F][0-9]*\}\}/g.test('>{{' + dataValEvent.variable + '}}')) {
          comp.footerVarCheckArr.push(dataValEvent);
        }
      })

      if (comp.selectedTemplate || GetButtonData) {

        if (!GetButtonData) {
          comp.buttons = comp.selectedTemplate[comp.messageForm.get('language').value].button_info ? comp.selectedTemplate[comp.messageForm.get('language').value].button_info : [];
          comp = this.resetUpdatedValuesFromService(comp, this.highlightAndUpdateVariablesService.setButtonsArray(comp));
          for (let index = 0; index < dataValue['variablesArr'].length; index++) {
            for (let btnIndex = 0; btnIndex < comp.buttons.length; btnIndex++) {
              if ((comp.buttons[btnIndex].url_type && comp.buttons[btnIndex].url_type == 'dynamic' && (comp.buttons[btnIndex].variable == dataValue['variablesArr'][index].variable)) || ((comp.buttons[btnIndex].buttonText == dataValue['variablesArr'][index].variable) && (comp.buttons[btnIndex].type.toLowerCase() == 'quick_reply' || comp.buttons[btnIndex].type.toLowerCase() == 'copy_code'))) {
                comp.buttons[btnIndex] = { ...comp.buttons[btnIndex], ...dataValue['variablesArr'][index] }
              }
            }
          }
          let i = 0;
          comp.buttons.forEach(e => {
            if (e.url_type && (e.url_type == 'dynamic') && (e.type.toLowerCase() != 'quick_reply') && (e.type.toLowerCase() != "copy_code") && !e.is_trackable) {
              if (e['actualUrl']) {
                e.url = e['actualUrl']
              }
              e['actualUrl'] = e.url
              let count: any;
              let footerVarArr = comp.footerVarCheckArr
              e.url = e.url.replace(TextVarRegex, function (m) {
                count = i;
                i++;
                return footerVarArr[count].PersonalizedValue
              })
            }
          })
        } else {
          // comp.buttons = [];
          comp.buttons = JSON.parse(JSON.stringify(comp.buttons ?? []));
          comp = this.resetUpdatedValuesFromService(comp, this.highlightAndUpdateVariablesService.setButtonsArray(comp));
          for (let index = 0; index < dataValue['variablesArr'].length; index++) {
            for (let btnIndex = 0; btnIndex < comp.buttons.length; btnIndex++) {
              if ((comp.buttons[btnIndex].url_type && comp.buttons[btnIndex].url_type == 'dynamic' && (comp.buttons[btnIndex].variable == dataValue['variablesArr'][index].variable)) || ((comp.buttons[btnIndex].buttonText == dataValue['variablesArr'][index].variable) && (comp.buttons[btnIndex].type.toLowerCase() == 'quick_reply' || comp.buttons[btnIndex].type.toLowerCase() == "copy_code"))) {
                comp.buttons[btnIndex] = { ...comp.buttons[btnIndex], ...dataValue['variablesArr'][index] }
              }
            }
          }
          let i = 0;
          comp.buttons.forEach(e => {
            if (e.url_type && (e.url_type == 'dynamic') && (e.type.toLowerCase() != 'quick_reply') && (e.type.toLowerCase() != "copy_code") && !e.is_trackable) {
              if (e['actualUrl']) {
                e.url = e['actualUrl']
              }
              e['actualUrl'] = e.url
              let count: any;
              let footerVarArr = comp.footerVarCheckArr
              e.url = e.url.replace(TextVarRegex, function (m) {
                count = i;
                i++;
                return footerVarArr[count]?.PersonalizedValue
              })
            }
          })
        }
      }
      let dataVal = comp.bodyVarCheckArr
      let index = 0;
      comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML = comp.actualHtml.replace(regex, function (m) {
        let value;
        let text = dataVal[index]['PersonalizedValue'] ? dataVal[index]['PersonalizedValue'].replace(/</g, '&lt;') : `{{${dataVal[index]['variable']}}}`;
        value = dataVal[index]['urlValue'] ? '>' + dataVal[index]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
        index++;
        return value;
      });
      if (comp.text2) {
        let headerDataVal = comp.headerVarCheckArr
        let headerIndex = 0;
        comp.text2.nativeElement.innerHTML = comp.headerActualHtml.replace(text2Regex, function (m) {
          let value;
          let text = headerDataVal[headerIndex]['PersonalizedValue'] ? headerDataVal[headerIndex]['PersonalizedValue'].replace(/</g, '&lt;') : `{{${headerDataVal[headerIndex]['variable']}}}`;
          value = headerDataVal[headerIndex]['urlValue'] ? '>' + headerDataVal[headerIndex]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
          headerIndex++;
          return value;
        });
      }

      if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
        if (comp.urlClickedEditor1Regex) {
          if (comp.footerVarCheckArr.length && (comp.footerVarCheckArr[0].variable == comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText)) {
            let footerDataVal = comp.footerVarCheckArr
            let footerIndex = 0;
            comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML = comp.footerActualHtml.replace(`>${comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerText}`, function (m) {
              let value;
              let text = footerDataVal[footerIndex]['PersonalizedValue'] ? footerDataVal[footerIndex]['PersonalizedValue'].replace(/</g, '&lt;') : `{{${footerDataVal[footerIndex]['variable']}}}`;
              value = footerDataVal[footerIndex]['urlValue'] ? '>' + footerDataVal[footerIndex]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
              footerIndex++;
              return value;
            });
          }
        }
        else {
          let footerDataVal = comp.footerVarCheckArr
          let footerIndex = 0;
          comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML = comp.footerActualHtml.replace(text3Regex, function (m) {
            let value;
            let text = footerDataVal[footerIndex]['PersonalizedValue'] ? footerDataVal[footerIndex]['PersonalizedValue'].replace(/</g, '&lt;') : `{{${footerDataVal[footerIndex]['variable']}}}`;
            value = footerDataVal[footerIndex]['urlValue'] ? '>' + footerDataVal[footerIndex]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
            footerIndex++;
            return value;
          });
        }
      }
      if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
        if (comp.urlClickedEditor2Regex) {
          if (comp.footerVarCheckArr.length && comp.footerVarCheckArr.length > 1 && (comp.footerVarCheckArr[1].variable == comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText)) {
            let footerDataVal = comp.footerVarCheckArr
            let footerIndex = 0;
            comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML = comp.footer2ActualHtml.replace(`>${comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerText}`, function (m) {
              let value;
              let text = footerDataVal[footerIndex]['PersonalizedValue'] ? footerDataVal[footerIndex]['PersonalizedValue'].replace(/</g, '&lt;') : `{{${footerDataVal[footerIndex]['variable']}}}`;
              value = footerDataVal[footerIndex]['urlValue'] ? '>' + footerDataVal[footerIndex]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
              footerIndex++;
              return value;
            });
          }
        }
        else {
          let footerDataVal = comp.footerVarCheckArr
          let footerIndex = 0;
          comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML = comp.footer2ActualHtml.replace(text4Regex, function (m) {
            let value;
            let val = footerDataVal[footerIndex]['PersonalizedValue'] ? footerDataVal[footerIndex]['PersonalizedValue'] : `{{${footerDataVal[footerIndex]['variable']}}}`;
            let text = val ? val.replace(/</g, '&lt;') : '';
            value = footerDataVal[footerIndex]['urlValue'] ? '>' + footerDataVal[footerIndex]['urlValue'].replace(/</g, '&lt;').replace(/>/g, '&gt;') : `>${text.replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')}</a>`
            footerIndex++;
            return value;
          });
        }
      }
      comp.personalised = true;
    }
    comp = this.resetUpdatedValuesFromService(comp, this.setPreview(comp, is_carousel_section));
    let obj = {
      urlFormValue: comp.urlFormValue,
      finalVarData: comp.finalVarData,
      variablesDetails: comp.variablesDetails,
      bodyVarCheckArr: comp.bodyVarCheckArr,
      headerVarCheckArr: comp.headerVarCheckArr,
      footerVarCheckArr: comp.footerVarCheckArr,
      buttons: comp.buttons,
      personalised: comp.personalised,
      is_carousel_section: is_carousel_section
    }
    if (is_carousel_section) {
      obj['cardtext'] = comp['cardtext'];
      obj['text2'] = comp.text2;
      obj['cardBtnText'] = comp['cardBtnText'];
      obj['cardBtnText2'] = comp['cardBtnText2'];
    } else {
      obj['text'] = comp['text'];
      obj['text2'] = comp.text2;
      obj['text3'] = comp['text3'];
      obj['text4'] = comp['text4'];

    }
    return obj
  }

  setActualHtml(comp, is_carousel_section = false) {
    let count = 1;
    let innerHtml: any;
    let headerInnerHtml: any;
    let footerInnerHtml: any;
    let footer2InnerHtml: any;
    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      for (let index = 0; index < comp.variablesDetails.length; index++) {
        if (count == 1) {
          innerHtml = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML
          comp.actualHtml = innerHtml;
          if (comp.text2) {
            headerInnerHtml = comp.text2.nativeElement.innerHTML
            comp.headerActualHtml = headerInnerHtml;
          }
          if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
            footerInnerHtml = comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML
            comp.footerActualHtml = footerInnerHtml;
          }
          if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
            footer2InnerHtml = comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML
            comp.footer2ActualHtml = footer2InnerHtml;
          }
        }
        else {
          innerHtml = comp.actualHtml
          if (comp.text2) {
            headerInnerHtml = comp.headerActualHtml;
          }
          if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
            footerInnerHtml = comp.footerActualHtml;
          }
          if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
            footer2InnerHtml = comp.footer2ActualHtml;
          }
        }
        count++
        if (comp.variablesDetails[index].personalizedUrl) {
          if ((/\{\{[V][0-9]*\}\}/g.test(comp.variablesDetails[index].actualVar)) && innerHtml.includes(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
            comp.actualHtml = innerHtml.replace(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>', comp.variablesDetails[index].actualVar + '</a>')
            innerHtml = comp.actualHtml
          }
          if ((comp.urlClickedEditor1Regex ? comp.clickedVar == comp.urlClickedEditor1Regex : true) && (comp.clickedVar == comp.variablesDetails[index].actualVar) && comp[is_carousel_section && 'cardBtnText' || 'text3'] && footerInnerHtml.includes(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
            comp.footerActualHtml = footerInnerHtml.replace(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>', comp.variablesDetails[index].actualVar + '</a>')
            footerInnerHtml = comp.footerActualHtml
          }
          if ((comp.urlClickedEditor2Regex ? comp.clickedVar == comp.urlClickedEditor2Regex : true) && (comp.clickedVar == comp.variablesDetails[index].actualVar) && comp[is_carousel_section && 'cardBtnText2' || 'text4'] && footer2InnerHtml.includes(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
            comp.footer2ActualHtml = footer2InnerHtml.replace(comp.variablesDetails[index].personalizedUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>', comp.variablesDetails[index].actualVar + '</a>')
            footer2InnerHtml = comp.footer2ActualHtml
          }
        }
        if (comp.variablesDetails[index].personalizedVar) {
          let varText = comp.variablesDetails[index].personalizedVar.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          let replace = `${comp.variablesDetails[index].actualVar}" title="Right click...">`
          let replaceFrom = replace + varText.replace(/>/g, '&gt;') + '</a>'
          let replaceWith = replace + comp.variablesDetails[index].actualVar + '</a>'
          comp.actualHtml = innerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
          if (comp.text2) {
            comp.headerActualHtml = headerInnerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
          }
          if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
            comp.footerActualHtml = footerInnerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
          }
          if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
            comp.footer2ActualHtml = footer2InnerHtml.replace(/&nbsp;/g, ' ').replace(replaceFrom, replaceWith)
          }
        }
      }
    }
    else {
      comp.actualHtml = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML;
      if (comp.text2) {
        comp.headerActualHtml = comp.text2.nativeElement.innerHTML;
      }
      if (comp[is_carousel_section && 'cardBtnText' || 'text3']) {
        comp.footerActualHtml = comp[is_carousel_section && 'cardBtnText' || 'text3'].nativeElement.innerHTML;
      }
      if (comp[is_carousel_section && 'cardBtnText2' || 'text4']) {
        comp.footer2ActualHtml = comp[is_carousel_section && 'cardBtnText2' || 'text4'].nativeElement.innerHTML;
      }
    }
    return { actualHtml: comp.actualHtml, headerActualHtml: comp.headerActualHtml, footerActualHtml: comp.footerActualHtml, footer2ActualHtml: comp.footer2ActualHtml, is_carousel_section: is_carousel_section }
  }

  resetDataValue(comp, data, arr) {
    let varArr = [];
    if (arr && arr.length > 0) {
      if ((varArr && varArr.length == 0) || !varArr) {
        arr.forEach(e => {
          varArr.push(this.highlightAndUpdateVariablesService.setPersonalisationStructure(comp, e, true));
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
          if ((varArr[index]['variable'] != comp.urlClickedEditor1Regex) && (varArr[index]['variable'] != comp.urlClickedEditor2Regex)) varArr[index]['urlValue'] = ''
          if (data.variablesArr[finalVarIndex].variable == varArr[index].variable) {
            varArr[index]['PersonalizedValue'] = data.variablesArr[finalVarIndex].PersonalizedValue
            varArr[index]['columnListText'] = data.variablesArr[finalVarIndex].columnListText
            varArr[index]['columnListValue'] = data.variablesArr[finalVarIndex].columnListValue
            varArr[index]['text'] = data.variablesArr[finalVarIndex].text
            varArr[index]['varTextSeq'] = data.variablesArr[finalVarIndex].varTextSeq
            varArr[index]['urlValue'] = data.variablesArr[finalVarIndex].urlValue
            break
          }
        }
      }
      data.variablesArr = varArr
    }

    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      for (let varDetailsIndex = 0; varDetailsIndex < comp.variablesDetails.length; varDetailsIndex++) {
        for (let dataIndex = 0; dataIndex < data.variablesArr.length; dataIndex++) {
          if ('{{' + data.variablesArr[dataIndex].variable + '}}' == comp.variablesDetails[varDetailsIndex].actualVar) {
            data.variablesArr[dataIndex]['urlValue'] = comp.variablesDetails[varDetailsIndex]['personalizedUrl']
            break
          }
        }
      }
    }
    return data;
  }

  resetUpdatedValuesFromService(comp, obj) {
    for (var item in obj) {
      comp[item] = obj[item]
    }
    return comp
  }

  setPreview(comp, is_carousel_section = false) {
    comp[is_carousel_section && 'cardElement1' || 'element1'].nativeElement.innerHTML = comp.actualHtml.replace(/<br>/gi, "\n").replace(/ /g, '&nbsp;');
    let text = comp[is_carousel_section && 'cardElement1' || 'element1'].nativeElement.innerText
    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      for (let index = 0; index < comp.variablesDetails.length; index++) {
        text = text.replace(comp.variablesDetails[index]['actualVar'], comp.variablesDetails[index]['personalizedUrl'] ? comp.shortUrl : (comp.variablesDetails[index]['personalizedVar'] ? this.getFinalDynamicValue(comp, comp.variablesDetails[index]['personalizedVar'], index, comp.variablesDetails[index]) : comp.variablesDetails[index]['actualVar'].replace('V', '')))

      }
    }
    if (comp.text2) {
      comp[is_carousel_section && 'cardElement1' || 'element2'].nativeElement.innerHTML = comp.headerActualHtml.replace(/<br>/gi, "\n").replace(/ /g, '&nbsp;');
      let value = comp[is_carousel_section && 'cardElement1' || 'element2'].nativeElement.innerText
      if (comp.variablesDetails && comp.variablesDetails.length > 0) {
        for (let index = 0; index < comp.variablesDetails.length; index++) {
          value = value.replace(comp.variablesDetails[index]['actualVar'], comp.variablesDetails[index]['personalizedUrl'] ? comp.shortUrl : (comp.variablesDetails[index]['personalizedVar'] ? this.getFinalDynamicValue(comp, comp.variablesDetails[index]['personalizedVar'], index, comp.variablesDetails[index]) : comp.variablesDetails[index]['actualVar'].replace('H', '')))
        }
      }
      comp.headerTextPreview = value;
    }
    comp.bodyTextPreview = text;
    return { element1: comp[is_carousel_section && 'cardElement1' || 'element1'], element2: comp[is_carousel_section && 'cardElement1' || 'element2'], headerTextPreview: comp.headerTextPreview, bodyTextPreview: comp.bodyTextPreview, is_carousel_section: is_carousel_section }
  }

  getFinalDynamicValue(comp, text, index, data?) {
    if (comp.headerValues) {
      let obj = comp.finalVarData.variablesArr.find(e => '{{' + e.variable + '}}' == data.actualVar)
      if (obj) {
        if (obj.varTextSeq) {
          return (obj.columnListValue ? (comp.headerValues[obj.columnListText] ? comp.headerValues[obj.columnListText] : '') : '') + obj.text
        }
        else {
          return obj.text + (obj.columnListValue ? (comp.headerValues[obj.columnListText] ? comp.headerValues[obj.columnListText] : '') : '')
        }
      }
    }
    else {
      return text
    }
  }

  getPersonalisedValues(comp, value) {
    if (comp.finalVarData && comp.finalVarData.variablesArr && comp.finalVarData.variablesArr.length > 0) {
      if (value == 'header') {
        let headerPersonalisedObj = comp.finalVarData.variablesArr.find(e => {
          if (/\{\{[H][0-9]*\}\}/g.test('{{' + e.variable + '}}')) {
            return e
          }
        })
        let data = headerPersonalisedObj ? headerPersonalisedObj.PersonalizedValue : ''
        return data
      }
      if (value == 'footer') {
        let footerPersonalisedObj = comp.finalVarData.variablesArr.find(e => {
          if (/\{\{[F][0-9]*\}\}/g.test('{{' + e.variable + '}}')) {
            return e
          }
        })
        let data = footerPersonalisedObj ? footerPersonalisedObj.PersonalizedValue : ''
        return data
      }
    }
    else {
      return null;
    }
  }
}
