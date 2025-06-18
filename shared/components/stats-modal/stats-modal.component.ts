import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CustomizeBrandingService } from 'src/app/shared/services/customize-branding.service';
import { CampaignListService } from 'src/app/shared/services/voice/campaign-list.service';

@Component({
  selector: 'app-stats-modal',
  templateUrl: './stats-modal.component.html',
  styleUrls: ['./stats-modal.component.css']
})
export class StatsModalComponent implements OnInit {

  @Input() id: any;
  loader = false;
  selectedTabIndex:any = 0
  selectedRadio:any = '1'
  @Output() radiovValue = new EventEmitter()
  @Input() campaignStats:any
  @Input() tableActionData:any
  @Input() tableConfig:any
  @Input() popUpdata:any
  statsModalConfig = {
    hidepagination:true
  }
  @Output() tabIndexValue = new EventEmitter<any>();
  statsList: any;
  themes: any;

  
  constructor(private common: CommonService, campaignListService:CampaignListService, private customizeBrandingService:CustomizeBrandingService) { 
    campaignListService.getCampaignStatsData().subscribe((res:any) => {
      this.statsList = res?.['list']
    }) 
  }

  ngOnInit(): void {

    
  }
  
  tabChanged(event){
    this.selectedTabIndex = event
    this.tabIndexValue.emit(this.selectedTabIndex)
  }

  setOption(value){
    this.selectedRadio = value
    this.radiovValue.emit(this.selectedRadio)

  }
  
  closeModal(id){
    this.common.close(id);
    this.selectedTabIndex = 0
  }
}
