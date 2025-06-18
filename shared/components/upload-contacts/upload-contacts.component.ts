import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubscriberLimitComponent } from 'src/app/campaigns/shared/components/subscriber-limit/subscriber-limit.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as ECSS } from 'src/app/shared/services/email/campaigns/create-campaign.service';
import { permissions } from '../../../../shared/constants/teammate-permission.constrant';

@Component({
  selector: 'app-upload-contacts',
  templateUrl: './upload-contacts.component.html',
  styleUrls: ['./upload-contacts.component.css']
})
export class UploadContactsComponent implements OnInit, AfterContentInit {

  @Input() sendCampaignData: any;
  @Input() campaignData: any;
  @Input() isKsaUser: any;
  @Input() contactCount: any;
  @Input() messageType: any;
  uploadForm: FormGroup
  modalType: any;
  loaderSpinner: boolean = false;
  existingFilesArray: any;
  @Input() campaignId: any;
  stop = new Subject<void>();
  @Input() config: any;
  @Output() sendContactCount = new EventEmitter<any>();
  @Output() sendLoaderState = new EventEmitter<any>();
  @ViewChild(SubscriberLimitComponent) subscriberLimitComponent: SubscriberLimitComponent;
  subscriber_limit = {
    setSubscriberLimit: false,
    indexing_type: '',
    recipients: []
  };
  importRecipientsFromList = false;
  @Input() emailCampaignApproval: any;
  permissions = permissions;
  @Output() sendExcludeFreqCapping = new EventEmitter<any>()
  @Input() selectorData: any;

  constructor(public createCampaignService: CreateCampaignService, public common: CommonService, public fb: FormBuilder, public emailCreateCampaignService: ECSS) {
    this.uploadForm = this.fb.group({
      removeDuplicate: [false, []],
      removeFrequencyCapping: [false, []]
    });

    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.uploadForm.reset();
      this.uploadForm.get('removeDuplicate').setValue(false);
      this.uploadForm.get('removeFrequencyCapping').setValue(false);
    })

    this.emailCreateCampaignService.importRecipientsFromList.subscribe(data => {
      this.importRecipientsFromList = data;
    })

    this.createCampaignService.getEventToGetUploadContactsValues().pipe(takeUntil(this.stop)).subscribe((res: any) => {
      if (this.config?.email) {
        let data = {};
        data = { ...this.uploadForm.value, ...{ subscriber_limit: this.subscriber_limit }, ...res };
        // if(this.subscriber_limit){
        //   data = {...this.uploadForm.value,...{subscriber_limit:this.subscriber_limit},...res};
        // }else{
        //   data = {...this.uploadForm.value,...res};
        // }
        this.emailCreateCampaignService.setEventToGetSenderDetailsValues(data);
      } else if (this.config?.truecaller) {
        this.createCampaignService.setEventToGetTextMessage({ ...this.uploadForm.value, ...{ test: false }, ...res });
      } else {
        this.createCampaignService.setEventToGetMessageValues({ ...this.uploadForm.value, ...res });
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    if (this.campaignData && this.config?.email) {
      this.uploadForm.controls.removeDuplicate.setValue(this.campaignData.is_duplicate);
    }
  }

  import(id) {
    this.openModal(id);
    this.createCampaignService.setOpenModalState(id);
  }

  openModal(id: string) {
    this.common.open(id);
    this.modalType = id;
  }

  openSubsLimit(id: string) {
    if (!this.subscriber_limit?.indexing_type && !this.campaignData?.subscriber_limit_indexing_type) {
      this.subscriber_limit = {
        setSubscriberLimit: false,
        indexing_type: 'combined',
        recipients: []
      };
    } else if (!this.subscriber_limit?.indexing_type && this.campaignData?.subscriber_limit_indexing_type) {
      this.subscriber_limit['indexing_type'] = this.campaignData.subscriber_limit_indexing_type;
    }
    this.subscriberLimitComponent.showDrawerVal(true);
    this.openModal(id);
    // setTimeout(()=>{
    // })
  }

  getSubsLimitData(e) {
    this.subscriber_limit = e;
  }

  receivedLoaderState(value) {
    this.loaderSpinner = value;
    this.sendLoaderState.emit(this.loaderSpinner);
  }

  getContactCount(value) {
    this.sendContactCount.emit(value);
    this.contactCount = value
  }

  excludefreqMapping(event) {
    this.sendExcludeFreqCapping.emit(event)
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
