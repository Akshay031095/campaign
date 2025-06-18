import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import * as timezone from 'src/app/shared/mock-data/timezone';
import moment from 'moment';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-view-schedule',
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css']
})
export class ViewScheduleComponent implements OnInit {
  public modalType = 'view-schedule';
  messageClassificationType: any = null;
  loaderSpinner: boolean = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  @Output() updateSchedule = new EventEmitter<void>();
  stop = new Subject<void>();
  messageStartTime: any;
  messageEndTime: any;
  invalidSlotTimeText: any;
  invalidSlotTime: boolean = false;
  scheduleCampaignError: any;
  @Input() config:any;
  @Input() scheduleDataPreview:any;
  translatedObj:any;


  constructor(
    private common: CommonService,
    public translate: TranslateService,
    public fb: FormBuilder,
    public voiceCampaignListService: VoiceCampaignListService,
    public createCampaignService: CreateCampaignService,


  ) {

    translate.stream(['campaign.select-text', 'campaign.schedule-campaign-error']).pipe(takeUntil(this.stop)).subscribe((text) => {
      this.scheduleCampaignError = text['campaign.schedule-campaign-error']
    });
    this.common.translatedObj.pipe(takeUntil(this.stop)).subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations;
      }
    })




  }//end of class


  ngOnInit(): void {

  }

  public closeModal(id: string) {
    this.common.close(id);
  }
  public scheduleCampaign() {
    this.updateSchedule.emit();
  }



  OnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
