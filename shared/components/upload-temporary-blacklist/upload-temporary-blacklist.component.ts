import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';

@Component({
  selector: 'app-upload-temporary-blacklist',
  templateUrl: './upload-temporary-blacklist.component.html',
  styleUrls: ['./upload-temporary-blacklist.component.css','../upload-contacts/upload-contacts.component.css']
})
export class UploadTemporaryBlacklistComponent implements OnInit {

  @Input() sendCampaignData: any;
  @Input() isKsaUser: any;
  @Input() contactCount: any;
  @Input() messageType: any;
  // uploadForm: FormGroup
  modalType: any;
  loaderSpinner: boolean = false;
  existingFilesArray: any;
  @Input() campaignId: any;
  stop = new Subject<void>();
  @Input() config: any;
  @Output() sendContactCount = new EventEmitter<any>();
  @Output() sendLoaderState = new EventEmitter<any>();
  @Input() blacklistConfig: any;
  @Input() id: any;
  @Input() selectorData: any;

  constructor(public createCampaignService: CreateCampaignService, public common: CommonService, public fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.createCampaignService.getOpenModalState().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.modalType = this.id;
      }
    });
    
  }

  import(id) {
    this.openModal(id);
    this.createCampaignService.setBlacklistModal('importBlacklist');
  }

  openModal(id: string) {
    this.common.open(id);
    this.modalType = id;
  }

  receivedLoaderState(value) {
    this.loaderSpinner = value;
    this.sendLoaderState.emit(this.loaderSpinner);
  }

  getContactCount(value) {
    this.sendContactCount.emit(value);
    this.contactCount = value
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

}
