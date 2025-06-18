import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CampaignService } from 'src/app/shared/services/campaign.service';
import { CampaignListService as WhatsappCampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';

import { CampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';
import { CampaignListService as RcsCampaignListService } from 'src/app/shared/services/rcs/campaigns/campaign-list.service';
import { CreateCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import { CampaignListService as TruecallerCampaignListService } from '../../../../shared/services/truecaller/campaigns/campaign-list.service'
@Component({
  selector: 'app-view-campaign',
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.css']
})
export class ViewCampaignComponent implements OnInit {

  @Input() viewCampaignData: any;
  @Input() hasApprovalPermission: any;
  @Input() forApprovalTab: any;
  @Output() sendLoaderState = new EventEmitter<any>();
  @Output() approveRejectAction = new EventEmitter<any>();
  @ViewChild('textMessage') textMessage: ElementRef;
  @Input() isKsaUser: any;
  @Input() config: any;
  @ViewChild('textRemark') textRemark: ElementRef;
  hasRemarks: boolean = true;
  isTeammate: any;
  @Output() sendManagScheduleData = new EventEmitter<any>();
  flowBuilderPreview: any
  selectedTabIndex: any;
  category: any = 'callRetry';
  @Input() tableConfig:any

  constructor(
    public common: CommonService,
    public campaignService: CampaignService,
    public whatsappCampaignListService: WhatsappCampaignListService,
    private voiceCampaignListService: VoiceCampaignListService,
    public campaignListService: CampaignListService,
    public rcsCampaignListService: RcsCampaignListService,
    private createVoiceCampaignService: CreateCampaignService,
    private truecallerCampaignListService:TruecallerCampaignListService) {
  }

  ngOnInit(): void {
    this.isTeammate = parseInt(localStorage.getItem('is_team_mate'));
  }

  ngOnChanges(): void {
    
  }

  closeModal(id: string) {
    if (this.config?.show_call_flowbuilder) {
      this.flowBuilderPreview = '';
      this.createVoiceCampaignService.flowBuilderInCampaign.next(false);
    }
    this.common.close(id);
  }

  cancel(id) {
    this.closeModal(id);
  }

  approveCampaign() {
    if (this.viewCampaignData) {
      let id = this.viewCampaignData.data._id;
      this.sendLoaderState.emit(true);
      let serviceCall: any;
      if (this.config && this.config.whatsapp) {
        serviceCall = this.whatsappCampaignListService.approve(id)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.voiceCampaignListService.approve(id)
      }
      else if (this.config && this.config.truecaller) {
        serviceCall = this.truecallerCampaignListService.approve(id)
      }
      else if (this.config && this.config.rcs) {
        serviceCall = this.rcsCampaignListService.approve(id)
      }
      else {
        serviceCall = this.campaignService.approve(id)
      }
      serviceCall.subscribe((res: any) => {
        if (res['success']) {
          this.closeModal('view');
          this.sendLoaderState.emit(false);
          this.approveRejectAction.emit(true)
          // this.common.openSnackBar(res['message'], 'success');
        }
        else {
          this.sendLoaderState.emit(false);
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.sendLoaderState.emit(false);
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  rejectCampaign() {
    this.hasRemarks = true;
    if (this.textRemark && !this.textRemark.nativeElement.value) {
      this.hasRemarks = false;
      return;
    }
    if (this.viewCampaignData) {
      let request = {
        remark: this.textRemark ? this.textRemark.nativeElement.value : ''
      }
      let id = this.viewCampaignData.data._id;
      this.sendLoaderState.emit(true);
      let serviceCall: any;
      if (this.config && this.config.whatsapp) {
        serviceCall = this.whatsappCampaignListService.reject(id, request)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.voiceCampaignListService.reject(id)
      }
      else if (this.config && this.config.truecaller) {
        serviceCall = this.truecallerCampaignListService.reject(id, request)
      }
      else if (this.config && this.config.rcs) {
        serviceCall = this.rcsCampaignListService.reject(id, request)
      }
      else {
        serviceCall = this.campaignService.reject(id, request)
      }
      serviceCall.subscribe((res: any) => {
        if (res['success']) {
          this.closeModal('view');
          this.sendLoaderState.emit(false);
          this.approveRejectAction.emit(true)
          // this.common.openSnackBar(res['message'], 'success');
        }
        else {
          this.sendLoaderState.emit(false);
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.sendLoaderState.emit(false);
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  hasRemarksValue() {
    this.hasRemarks = true;
  }

  reSubmit(id) {
    this.common.close(id);
    this.sendManagScheduleData.emit(true)
  }

  getFlowBuilderData(flowId: string) {
    this.sendLoaderState.emit(true);
    this.createVoiceCampaignService.getFlowData(`call-flow-builder/${flowId}`)
      .subscribe((response: any) => {
        if (response['success']) {
          this.sendLoaderState.emit(false);
          this.flowBuilderPreview = response.data;
          this.createVoiceCampaignService.flowBuilderInCampaign.next(true);
        }
        else {
          this.sendLoaderState.emit(false);
          this.common.openSnackBar(response['message'], 'error');
        }
      },
        err => {
          this.common.openSnackBar(err['message'], 'error');
        });
  }

  tabChanged(index){
    this.selectedTabIndex = index
    if (this.viewCampaignData) {
      if (this.config?.show_call_flowbuilder) {
        this.getFlowBuilderData(this.viewCampaignData?.data?.template_id)
      }
      if (this.textMessage) {
        this.textMessage.nativeElement.scrollTo(0, 0);
      }
    }
  }

  switchButton(type){
    this.category = type

  }
}
