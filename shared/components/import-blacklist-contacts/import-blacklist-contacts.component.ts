import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-import-blacklist-contacts',
  templateUrl: './import-blacklist-contacts.component.html',
  styleUrls: ['./import-blacklist-contacts.component.css', '../import-contacts/import-contacts.component.css']
})
export class ImportBlacklistContactsComponent implements OnInit {
  @Input() messageType: any;
  modalType = 'import2';
  selectedTabIndex: number = 1;
  progress: number = 0;
  @Input() existingFilesArray: any;
  @Input() campaignId: any;
  @Output() sendData = new EventEmitter<any>()
  contactCount: any;
  @Output() sendLoaderState = new EventEmitter<any>();
  loaderSpinner: boolean = false;
  stop = new Subject<void>();
  @Input() config: any;
  @Input() blacklistConfig: any;
  @Input() id: any;
  @Output() scheduledAddContact = new EventEmitter<any>();
  modal: any;
  selectedTab: any;

  constructor(public common: CommonService, public fb: FormBuilder, public createCampaignService: CreateCampaignService, private cdr: ChangeDetectorRef) {

    this.createCampaignService.getBlacklistModal().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.modal = res
        this.modalType = this.id;
        if (this.config) this.config['segment'] = false
        setTimeout(() => {
          if (this.config && this.config?.email) {
            this.tabChanged({ index: 1, tab: { textLabel: createCampaignService.langWiseTabLabelVal.list } });
          } else {
            this.selectedTabIndex = 0;
          }
        }, 0);
      }
    });
  }

  ngOnInit(): void {
  }

  closeModal(id: string) {
    this.common.close(id);
    this.progress = 0;
    this.selectedTabIndex = 1;
    this.createCampaignService.setCloseEvent(true);
    this.modal = '';
  }

  tabChanged(event) {
    let index = event.index
    this.selectedTab = event.tab.textLabel.toLowerCase();
    this.selectedTabIndex = index;
    setTimeout(() => {
      this.createCampaignService.setBlacklistSelectedTabIndex(this.selectedTabIndex)
    });
  }

  getExistingFiles() {
    this.createCampaignService.getFiles().subscribe((res: any) => {
      this.existingFilesArray = res.data;
    })
  }

  receivedLoaderState(value) {
    this.common.setModalLoader(value);
    this.sendLoaderState.emit(this.loaderSpinner);
  }

  selectedTabIndexRecieved(index) {
    this.selectedTabIndex = 1;
    this.modal = '';
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
  public getScheduledAddContact(data: any) {
    this.scheduledAddContact.emit(data)
  }
}
