import { Injectable } from '@angular/core';
import { HighlightAndUpdateVariablesService } from './highlight-and-update-variables.service';
import { ResetVariablesService } from './reset-variables.service';
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
export class UpdateShortUrlVariablesService {
  constructor(public updatePersonalisedValuesService: UpdatePersonalisedValuesService, public resetVariablesService: ResetVariablesService, public highlightAndUpdateVariablesService: HighlightAndUpdateVariablesService) { }
  recievedData(comp, data, is_carousel_section = false) {
    this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
    comp.previewUrl = data['previewUrl']
    let actualHtml = comp.urlClickedEditor == (is_carousel_section && 'cardtext' || 'text') ? comp.actualHtml : (comp.urlClickedEditor == (is_carousel_section && 'cardBtnText' || 'text3') ? comp.footerActualHtml : comp.footer2ActualHtml)
    if (data['urlType'] == 'text') {
      let hasUrl = comp.clickedUrl ? comp.clickedUrl : this.resetVariablesService.checkForUrl(comp[comp.urlClickedEditor].nativeElement.innerText)
      if (comp.showVariables && !comp.shortUrl) {
        hasUrl = ''
      }
      if (!comp.showVariables) {
        hasUrl = comp.clickedUrl ? comp.clickedUrl : this.resetVariablesService.checkForUrl(actualHtml.replace(/<br>/g, '\n'));
      }
      comp.shortUrl = data.shortUrl;
      if (hasUrl) {
        if (!is_carousel_section) {
          comp.messageForm.get('textMessage').setValue(data.data.textMessage);
        }
        let url = data['previewUrl'].replace(/</g, '&lt;');
        if (comp.showVariables) {
          let varText: any;
          let linkFormObj: any = ''
          if (comp.urlClickedEditor == (is_carousel_section && 'cardtext' || 'text')) linkFormObj = comp.urlFormValue
          if (comp.buttons && comp.buttons.length) {
            let obj = this.highlightAndUpdateVariablesService.getReqParams(comp, is_carousel_section);
            obj.arr.forEach((e) => {
              if (((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText' || 'text3')) && (obj.urlClickedEditor1 == e.url)) || ((comp.urlClickedEditor == (is_carousel_section && 'cardBtnText2' || 'text4')) && (obj.urlClickedEditor2 == e.url))) {
                if (e['urlFormValue']) {
                  e['urlFormValue']['urlType'] = data['urlType'] ? data['urlType'] : 'text'
                }
                linkFormObj = e['urlFormValue']
              }
            })
          }
          if (linkFormObj) {
            if (comp.variablesDetails && comp.variablesDetails.length > 0) {
              let index = comp.variablesDetails.findIndex(e => '>' + e.personalizedUrl == comp.clickedText)
              varText = comp.variablesDetails[index]['actualVar']
            }
          }
          else {
            varText = comp.clickedText
          }
          this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
          comp[comp.urlClickedEditor].nativeElement.innerHTML = actualHtml;
          comp.variablesDetails = this.highlightAndUpdateVariablesService.setPersonalisedValue(comp, data);
          this.setMessageValue(comp);
        }
        else {
          let text = comp[comp.urlClickedEditor].nativeElement.innerHTML.replace(/&gt;/g, '>')
          let innerHtml = text.replace(/&lt;/g, '<')
          this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
          comp[comp.urlClickedEditor].nativeElement.innerHTML = actualHtml;
          comp[comp.urlClickedEditor].nativeElement.innerHTML = comp[comp.urlClickedEditor].nativeElement.innerHTML.replace(/&amp;/g, '&').replace(hasUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'), function (m) {
            return `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${url.replace(/>/g, '&gt;')}</a>`
          });
          this.setMessageValue(comp);
        }
        this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
        comp.previewValue = this.setPreviewValue(comp, '', is_carousel_section);
      }
      else {
        if (comp.showVariables) {
          this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
          comp[comp.urlClickedEditor].nativeElement.innerHTML = actualHtml;
          comp.variablesDetails = this.highlightAndUpdateVariablesService.setPersonalisedValue(comp, data);
          this.setMessageValue(comp);
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
          comp.range.insertNode(frag);
          if (lastNode) {
            comp.range = comp.range.cloneRange();
            comp.range.setStartAfter(lastNode);
            comp.range.collapse(true);
            comp.select.removeAllRanges();
            comp.select.addRange(comp.range);
          }
        }
        this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
        comp.previewValue = this.setPreviewValue(comp, '', is_carousel_section);
      }
    }
    else {
      if (comp.showVariables) {
        this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
        comp[comp.urlClickedEditor].nativeElement.innerHTML = actualHtml;
        comp.variablesDetails = this.highlightAndUpdateVariablesService.setPersonalisedValue(comp, data);
        this.setMessageValue(comp);
      }
      else {
        let url = data['previewUrl']?.replace(/</g, '&lt;');
        if (comp[comp.urlClickedEditor]?.nativeElement?.innerText.includes(data['previewUrl'])) {
          if (comp[comp.urlClickedEditor]?.nativeElement?.innerText.includes(comp.columnUrl)) {
            comp[comp.urlClickedEditor].nativeElement.innerHTML = comp[comp.urlClickedEditor]?.nativeElement?.innerHTML.replace(`<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${comp.columnUrl}</a>`, comp.columnUrl)
          }
          comp[comp.urlClickedEditor].nativeElement.innerHTML = comp[comp.urlClickedEditor]?.nativeElement?.innerHTML.replace(data['previewUrl'], `<a href="javascript:void(0)" id="variable" class="link-text" title="Right click...">${data['previewUrl']}</a>`)
        }
        else {
          if (comp[comp.urlClickedEditor]?.nativeElement?.innerText.includes(comp.columnUrl)) {
            comp[comp.urlClickedEditor].nativeElement.innerHTML = comp[comp.urlClickedEditor]?.nativeElement?.innerHTML.replace('>' + comp.columnUrl, '>' + url.replace(/>/g, '&gt;'))
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
            comp.range.insertNode(frag);
            if (lastNode) {
              comp.range = comp.range.cloneRange();
              comp.range.setStartAfter(lastNode);
              comp.range.collapse(true);
              comp.select.removeAllRanges();
              comp.select.addRange(comp.range);
            }
          }
        }
      }
      comp.shortUrl = data?.shortUrl;
      comp.columnUrl = data['previewUrl'];
      this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
      comp.previewValue = this.setPreviewValue(comp, '', is_carousel_section);
    }
    if (comp.urlClickedEditor == (is_carousel_section && 'cardtext' || 'text')) {
      comp.urlType = data.urlType;
      this.resetVariablesService.setValues.next({ type: 'urlType', data: comp.urlType, is_carousel_section: is_carousel_section });
    }
    let obj = this.highlightAndUpdateVariablesService.highlightVariables(comp, comp[comp.urlClickedEditor].nativeElement.innerText, 'url', is_carousel_section);
    obj.is_carousel_section = is_carousel_section;
    this.resetVariablesService.setValues.next(obj);
    if (comp.showVariables) {
      this.updateFinalVarData(comp);
      if (!comp.finalVarData || !comp.finalVarData.variablesArr || !comp.finalVarData.variablesArr.length) {
        this.setFinalVarData(comp);
      }
      else {
        if (comp.variablesDetails && comp.variablesDetails.length) {
          comp.variablesDetails.forEach(ev => {
            comp.finalVarData.variablesArr.forEach(e => {
              if (ev.actualVar == '{{' + e.variable + '}}') {
                e.urlValue = ev.personalizedUrl
              }
            })
          })
          for (let index = 0; index < comp.finalVarData['variablesArr'].length; index++) {
            for (let btnIndex = 0; btnIndex < comp.buttons.length; btnIndex++) {
              if ((comp.buttons[btnIndex].url_type && comp.buttons[btnIndex].url_type == 'dynamic' && (comp.buttons[btnIndex].variable == comp.finalVarData['variablesArr'][index].variable)) || ((comp.buttons[btnIndex].buttonText == comp.finalVarData['variablesArr'][index].variable) && (comp.buttons[btnIndex].type.toLowerCase() == 'quick_reply' || comp.buttons[btnIndex].type.toLowerCase() == "copy_code"))) {
                comp.buttons[btnIndex] = { ...comp.buttons[btnIndex], ...comp.finalVarData['variablesArr'][index] }
              }
            }
          }
          comp.bodyVarCheckArr = [];
          comp.headerVarCheckArr = [];
          comp.footerVarCheckArr = [];
          comp.finalVarData['variablesArr'].forEach(dataValEvent => {
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
        }
      }
    }
    if (comp.bodyTextPreview) {
      comp.bodyTextPreview = comp.bodyTextPreview.replace(textVnFormatRegex, (e) => {
        return e.replace('V', '')
      })
    }
    if (comp.headerTextPreview) {
      comp.headerTextPreview = comp.headerTextPreview.replace(textHnFormatRegex, (e) => {
        return e.replace('H', '')
      })
    }
    this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setActualHtml(comp, is_carousel_section));
    this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.setPreview(comp, is_carousel_section));
  }
  setMessageValue(comp) {
    if (comp.variablesDetails && comp.variablesDetails.length > 0) {
      comp.variablesDetails.forEach(e => {
        let reg = new RegExp('>' + e['actualVar'], "g");
        let replaceTo = e['personalizedUrl'] ? e['personalizedUrl'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : (e['personalizedVar'] ? e['personalizedVar'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : e['actualVar'])
        comp[comp.urlClickedEditor].nativeElement.innerHTML = comp[comp.urlClickedEditor].nativeElement.innerHTML.replace(reg, '>' + replaceTo);
      })
    }
  }
  setPreviewValue(comp, item?, is_carousel_section = false) {
    if (comp.shortUrl && comp.previewUrl) {
      comp[is_carousel_section && 'cardElement1' || 'element1'].nativeElement.innerHTML = comp[is_carousel_section && 'cardtext' || 'text'].nativeElement.innerHTML.replace(/<br>/gi, "\n").replace(/&amp;/gi, "&").replace('>' + comp.previewUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;'), '>' + comp.shortUrl);
    }
    comp.bodyTextPreview = comp[is_carousel_section && 'cardElement1' || 'element1'].nativeElement.innerText;
    if (!is_carousel_section) {
      comp.footerTextPreview = comp.selectedTemplate[item ? item.value : comp.languageSelectText].footer_text;
      comp.headerTextPreview = comp.selectedTemplate[item ? item.value : comp.languageSelectText].header_text;
      comp.buttons = comp.selectedTemplate[item ? item.value : comp.languageSelectText].button_info ? comp.selectedTemplate[item ? item.value : comp.languageSelectText].button_info : []
    }
    this.resetVariablesService.setValues.next(this.highlightAndUpdateVariablesService.setButtonsArray(comp, is_carousel_section));
  }
  updateFinalVarData(comp) {
    if (comp.finalVarData && comp.finalVarData.variablesArr && comp.finalVarData.variablesArr.length > 0) {
      comp.finalVarData['variablesArr'] = comp.finalVarData['variablesArr'].filter(e => { return '>{' + e.variable + '}' != comp.clickedText })
    }
  }
  setFinalVarData(comp, is_carousel_section = false, DonotSetValues = false) {
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
    let varArr = [];
    if (arr && arr.length > 0) {
      if ((varArr && varArr.length == 0) || !varArr) {
        arr.forEach(e => {
          varArr.push(this.highlightAndUpdateVariablesService.setPersonalisationStructure(comp, e, true));
        })
      }
    }
    comp.finalVarData['variablesArr'] = varArr;
    if (!DonotSetValues) {
      this.resetVariablesService.setValues.next(this.updatePersonalisedValuesService.getFinalVariabledData(comp, comp.finalVarData, is_carousel_section));
    }
  }
}