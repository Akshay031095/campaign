import { Component, Input, OnInit } from '@angular/core';
import { flowBuilderInitialConfig } from 'src/app/chatbot-callflowbuilder/config/initial.config';
import { CommonService } from 'src/app/chatbot-callflowbuilder/shared/services/common.service';

@Component({
  selector: 'app-compose-call-preview',
  templateUrl: './compose-call-preview.component.html',
  styleUrls: ['./compose-call-preview.component.css']
})
export class ComposeCallPreviewComponent implements OnInit {

  public flowBuilderData: any;
  flowLoader = false;
  @Input() flowBuilderPreview: any;
  view: boolean = false;

  constructor(public botCommonService: CommonService) { }

  ngOnInit(): void {
    // this.getFlowBuilderData(); //Get Flow builder saved data
  }

  ngOnChanges() {
    if(this.flowBuilderPreview) {
      this.getFlowBuilderData(); //Get Flow builder saved data
    }
    else {
      this.view = false;
    }
  }

  getFlowBuilderData() {
    setTimeout(() => {
      this.flowLoader = true;
      this.botCommonService.noOfConnections.next(0)
      this.loadflowBuilderData(this.flowBuilderPreview ? this.flowBuilderPreview : null)
    },200)
  }

  loadflowBuilderData(data) {
    if (!data) {
      this.flowBuilderData = JSON.parse(JSON.stringify(flowBuilderInitialConfig));
      return;
    }
    this.flowBuilderData = data;
    this.view = true;
  }

}
