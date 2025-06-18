import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { CampaignListService as VoiceCampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-import-contacts',
  templateUrl: './import-contacts.component.html',
  styleUrls: ['./import-contacts.component.css']
})
export class ImportContactsComponent implements OnInit {
  @Input() messageType: any;
  modalType = 'import';
  selectedTabIndex: number = 1;
  progress: number = 0;
  @Input() existingFilesArray: any;
  @Input() campaignId: any;
  @Output() sendData = new EventEmitter<any>();
  ///
  ///
  contactCount: any;
  @Output() sendLoaderState = new EventEmitter<any>();
  loaderSpinner: boolean = false;
  stop = new Subject<void>();
  @Input() config: any;
  @Output() sendContactCount = new EventEmitter<any>();
  @Output() scheduledAddContact = new EventEmitter<any>();
  public showingImportContactPara = new Observable<boolean>();
  @Input() addMoreContactAndScheduleData: any;
  @Input() blacklistConfig: any;
  @Input() id: any;
  @Output() sendListRecordStatus = new EventEmitter<any>();

  modal: any;
  selectedTab: any;
  hasSegmentPermission: boolean = true;
  constructor(
    public common: CommonService,
    public fb: FormBuilder,
    public createCampaignService: CreateCampaignService,
    private cdr: ChangeDetectorRef,
    private voiceCampaignListService: VoiceCampaignListService) {

    this.createCampaignService.getOpenModalState().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.modal = res
        this.modalType = this.id;
        // this.tabChanged(0);
        setTimeout(() => {
          this.selectedTabIndex = 0;
        }, 0);
      }
    });

    this.common.getOpenModalState().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.modal = res
      }
    })

    //showing import contact para only for add import contact.
    this.showingImportContactPara = this.voiceCampaignListService.showingImportContactPara;

  }

  ngOnInit(): void {
    this.hasSegmentPermission = false;
    if (localStorage.getItem('features')) {
      let arr: any = JSON.parse(localStorage.getItem('features'))
      if (arr && arr.length > 0) {
        this.hasSegmentPermission = arr.some(e => e == 'segmentation')
      }

    }
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
    this.config['segment'] = false;
    if (this.selectedTab == 'segment') {
      this.config['segment'] = true;
    }
    this.selectedTabIndex = index;
    setTimeout(() => {
      this.createCampaignService.setSelectedTabIndex(this.selectedTabIndex)
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
  public getScheduledAddContact(data: any) {
    this.scheduledAddContact.emit(data)
  }
  selectedTabIndexRecieved(index) {
    this.selectedTabIndex = 1;
    this.modal = '';
    // this.selectedTabIndex = index;
  }

  getContactCount(value) {
    this.sendContactCount.emit(value);
  }
  public downloadFile() {
    this.voiceCampaignListService.downloadFile(this.campaignId).subscribe((res) => {
      const contentDisposition = res.headers.get('content-disposition');
      const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim().replace(/['"]+/g, '').split('.')[0];
      const send_format = res.headers.get('content-type');
      const blobData = new Blob([res.body], { type: send_format });
      saveAs(blobData, filename);
    })

  }

  getListRecordStatus(e) {
    this.sendListRecordStatus.emit(e);
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
