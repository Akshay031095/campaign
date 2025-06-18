import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';

@Component({
  selector: 'app-personalize-variabless',
  templateUrl: './personalize-variabless.component.html',
  styleUrls: ['./personalize-variabless.component.css']
})
export class PersonalizeVariablessComponent implements OnInit {

  @Output() close = new EventEmitter<any>();
  @Input() variables: any;
  @Input() showDrawer: any;
  @Input() personalizeOptions: any;
  @Output() sendFinalVariabledData = new EventEmitter<any>();
  @Input() finalVarData: any;
  variablesForm: FormGroup;
  stop = new Subject<void>();
  @Input() config: any;
  translatedObj: any;
  campaignType: any;
  variableCount: any;
  @Input() nextCardIndex: any;
  @Input() inputType: any;
  @Input() templateType: any;
  @Input() suggestions: any;
  personalisedData: any;
  @Input() id : any;
  @Input() clickedType: any;
  constructor(public common: CommonService, public createCampaignService: CreateCampaignService, public fb: FormBuilder) {
    this.variablesForm = this.fb.group({
      variablesArr: this.fb.array([])
    })

    this.common.translatedObj.subscribe((data:any)=> {
      if(data) {
        this.translatedObj = data.translations;
      }
    })
    this.createCampaignService.getTextMessage().pipe(takeUntil(this.stop)).subscribe((data: any) => {
      this.personalisedData = data;
      let res = data.variables ? data.variables : data;
      this.campaignType = data.campaignType ? data.campaignType : null;
      // if(!this.config.rcs) this.showDrawer = true;
      if(!this.personalisedData.hasOwnProperty('showDrawer')) {
      }
      if(this.config && this.config.rcs) {
        this.variables = data && data.activeVariables ? data.activeVariables : []
        if(this.variables && this.variables.length) {
          let arr = res && res.variablesArr ? res.variablesArr : res
          this.variables = arr.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.variable === obj.variable);
          });
        }
      }
      else {
        this.variables = res['variablesArr'] ? res['variablesArr'] : res;
      }
      this.variablesForm = this.fb.group({
        variablesArr: this.fb.array([])
      })
      this.variables.forEach(e => {
        this.variablesArr.push(this.newVariable(e));
      })

    })
    this.createCampaignService.getClosePopupEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      if(res) this.closeDrawer('personalise-variables');
    })
  }

  get variablesArr(): FormArray {
    return this.variablesForm.get('variablesArr') as FormArray;
  }

  newVariable(data): FormGroup {
    return this.fb.group({
      text: data.text ? data.text : '',
      columnListText: data.columnListText ? data.columnListText : '',
      columnListValue: data.columnListValue ? data.columnListValue : '',
      variable: data.variable,
      varTextSeq: data.varTextSeq,
      columnList: [data.columnList],
      configColumnList: {...data.configColumnList},
      urlValue: data.urlValue ? data.urlValue : ''
    })
  }

  ngOnInit(): void {
    let key = '';
    if(this.config && this.config.sms) {
      key = 'sms';
    }
    else if(this.config && this.config.whatsapp) {
      key = 'whatsapp';
    }
    else {
      key = ''
    }
    let obj = JSON.parse(localStorage.getItem('template_variable_length'))
    this.variableCount = key ? obj[key] : 0;
  }

  closeDrawer(id) {
    // this.showDrawer = false;
    this.close.emit(id);
  }

  flipPositions(item) {
    item.get('varTextSeq').setValue(!item.get('varTextSeq').value);
  }

  selectActionRecive(event, item) {
    if (this.config && this.config.whatsapp) {
      item.get('columnListText').setValue(event.header ? event.header : this.translatedObj['campaign.select-text']);
      item.get('columnListValue').setValue(event.header ? event.header : '');
    }
    else {
      item.get('columnListText').setValue(event.headerName ? event.headerName : this.translatedObj['campaign.select-text']);
      item.get('columnListValue').setValue(event.headerName ? event.headerName : '');
    }
  }

  showErrors(fieldName, errorType, form?) {
    // if (form.controls[fieldName].errors && form.controls[fieldName].errors[errorType]) {
    //   return this.sendVariablesData && form.controls[fieldName].errors[errorType];
    // } else {
    //   return false;
    // }
  }

  sendPersonalizedVariables(noClose?) {
    const setValues = (e, text, varTextSeq) => {
      if (!e.value.columnListValue) {
        if (text) {
          e.value['PersonalizedValue'] = `${e.value.text}`
        }
        else {
          e.get('text').setValue('');
          e.value['PersonalizedValue'] = this.config && this.config.whatsapp ? '{{' + e.value.variable + '}}' : (this.config && this.config.rcs ? (this.config.configureSms ? '{' + e.value.variable + '}' : '[' + e.value.variable + ']') : '{' + e.value.variable + '}')
        }
      }
      else {
        if (text) {
          e.value['PersonalizedValue'] = varTextSeq ? `<<${e.value.columnListValue}>>${e.value.text}` : `${e.value.text}<<${e.value.columnListValue}>>`
        }
        else {
          e.get('text').setValue('');
          e.value['PersonalizedValue'] = `<<${e.value.columnListValue}>>`
        }
      }
    }
    this.variablesForm.get('variablesArr')['controls'].forEach(e => {
      let text = e.value.text.replace(/\s/g, '');
      setValues(e, text, e.value.varTextSeq ? true : false);
      if (e.value.text == '' && !e.value.columnListValue) {
        e.value.PersonalizedValue = this.config && this.config.whatsapp ? '{{' + e.value.variable + '}}' : (this.config && this.config.rcs ? (this.config.configureSms ? '{' + e.value.variable + '}' : '[' + e.value.variable + ']') : '{' + e.value.variable + '}');
      }
    });
    this.sendFinalVariabledData.emit(this.variablesForm.value);
    this.variables = [];
    this.closeDrawer(this.id ? this.id : 'personalise-variables');
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
