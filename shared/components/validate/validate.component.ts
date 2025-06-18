import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from "src/app/shared/services/create-campaign.service";
class data {
  data: any;
  type: string;
  is_schedule:boolean
}

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.css'],
})
export class ValidateComponent implements OnInit {

  modalType = 'validate';
  @Output() sendData = new EventEmitter<any>()
  @Input() validateDataPreview: any;
  @Input() config: any;
  @Input() workflowStatus: any;
  @Output() reExecuteWorkflow = new EventEmitter<any>()
  @Input() is_ta_changed: any;
  safeEmailTemplate: any;
  selectedPreviewTabIndex: any = 0;
  ampContent: any;
  plainTextContent:any
  htmlContent: any;
  @ViewChild('iframe') iframe: ElementRef;
  // @ViewChild('ampiframe') ampiframe: ElementRef;
  // @ViewChild('htmliframe') htmliframe: ElementRef;
  iframeContent:any;
  contentTypes = [];

  constructor(public common: CommonService, public createCampaignService : CreateCampaignService,private sanitizer: DomSanitizer) {
    this.createCampaignService.validatePreviewData.subscribe(res => {
      this.validateDataPreview = res;
      if(this.validateDataPreview && this.validateDataPreview['channel'] == 'email'){
        this.contentTypes = [];
        let ContentTypes = [{label:"AMP",type:"text/x-amp-html"},{label:"HTML",type:"text/html"},{label:"Plain Text",type:"text/plain"}];
        let PreviewContent:any = Object.values(this.validateDataPreview.previewData);
        this.contentTypes = ContentTypes.filter(x => PreviewContent.some(y => x.type == y.content_type));
        this.iframeContent = this.validateDataPreview.previewData[0]
        setTimeout(() => {
          this.common.setIframCss(this.iframe, this.iframeContent)
        }, 100)
      }
    })
  }

  ngOnInit(): void {
    this.validateDataPreview = '';
    
  }

  closeModal(id: string) {
    this.common.close(id);
  }

  updateCampaign(is_schedule = false) {

    let data: data = {
      data: '',
      type: 'validate',
      is_schedule:is_schedule
    }
    if(this.validateDataPreview && this.validateDataPreview['createCampaignForm'] && 
      this.validateDataPreview['createCampaignForm']['approval_status'] && 
      this.validateDataPreview['createCampaignForm']['approval_status'].toLowerCase() == "inactive") 
    {
      data['eventFromManageSchedule'] = true;
    }
    this.sendData.emit(data);
    this.closeModal('validate');
  }

  reexecuteWorkflow() {
    if(this.is_ta_changed)return;
    let data = {
      data: '',
      type: 'validate',
    }
    this.reExecuteWorkflow.emit(data);
    this.closeModal('validate');
  }

  previewTabChanged(textLabel, _Index?) {
    this.selectedPreviewTabIndex = _Index;
    this.iframeContent = this.validateDataPreview.previewData[_Index]
    setTimeout(() => {
      this.common.setIframCss(this.iframe, this.iframeContent)
    }, 100)
  }
}
