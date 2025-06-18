import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateCampaignService as createVoiceCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as createRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { MissedCallCampaignService } from 'src/app/shared/services/missed-call-campaign.service';
class data {
  data: any;
  type: string
}

@Component({
  selector: 'app-insert-template',
  templateUrl: './insert-template.component.html',
  styleUrls: ['./insert-template.component.css']
})
export class InsertTemplateComponent implements OnInit {
  modalType = 'insert-template';
  @Output() sendData = new EventEmitter<any>()
  tableData = [];
  templateLoaded = false;
  templatesTableConfig = {
    name: 'Templates',
    dataLength: 100,
    pageSize: 4,
    pageSizeOptions: [10, 25, 50, 100],
    quickFilter: false,
    isShowEntries: false,
    showFilter: false,
    filterOptions: true,
    searchFilter: true,
    showCreateButton: false,
    displayedColumns: [],
    fullInput: true,
    paginationArrow: true,
    minHeightSearch: true,
    radioColumnMaxWidth: true,
    isShowPagination: true,
    hasLanguageBadges: true,
    rowPositioning: true,
    hideTotalRecord: true
  }
  loading: boolean = false;
  selectedTemplate: any;

  senderType: any;
  search_text: any;
  tableActionData: any;
  searchedData: boolean = false;
  selectTemplate: any;
  stop = new Subject<void>();
  @Input() showDrawer: boolean;
  @Output() close = new EventEmitter<any>();
  @Output() dataReceived = new EventEmitter<any>();
  @Input() senderName: any;
  @Input() config: any;
  @Input() wabaNumberObj: any;
  verticalCategory: any;
  @Input() drawerId: any;

  constructor(public common: CommonService, public createCampaignService: CreateCampaignService, private cdr: ChangeDetectorRef, public translate: TranslateService, public createWhatsappCampaignService: WACreateCampaignService, public createVoiceCampaignService: createVoiceCampaignService, public createRcsCampaignService: createRcsCampaignService,
    private _missedCallCampaignService: MissedCallCampaignService) {
    this.createCampaignService.getTemplateFormEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      // this.showDrawer = true;
    })

    this.common.getOpenDrawerEvent().subscribe((res: any) => {
      if (res == this.drawerId) {
        // this.showDrawer = true;
      }
    })

    this.createCampaignService.getResetForm().pipe(takeUntil(this.stop)).subscribe(res => {
      this.tableData = [];
      this.dataReceived.emit(false);
    })
    this.createCampaignService.getTemplateData().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        this.loadData('', '', 1, this.templatesTableConfig.pageSize, this.modalType, this.senderType, this.senderName);
      }
    })
    this.createCampaignService.getInsertTemplate().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) {
        if (this.config && !this.config.whatsapp) {
          this.senderType = res['type'];
          this.senderName = res['name'];
        }
        if (res && res['vertical']) this.verticalCategory = res['vertical']
        this.loadData('', '', 1, this.templatesTableConfig.pageSize, this.modalType, this.senderType, this.senderName, this.wabaNumberObj?.waba_number_wc, this.wabaNumberObj?.country_code, true);
        let event = {
          page: 1,
          size: this.templatesTableConfig.pageSize,
          pagination: true
        }
        this.common.setPagination(event);
      }
    })
    translate.stream(['campaign.select-template']).subscribe((text) => {
      this.selectTemplate = text['campaign.select-template']
    });

    this.createCampaignService.getClosePopupEvent().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res) this.closeDrawer(this.drawerId ? this.drawerId : 'insert-template');
    })
  }

  ngOnInit(): void {
  }

  closeModal(id: string) {
    this.common.close(id);
  }

  loadData(filter?, search_text?, page?, size?, modalType?, type?, name?, wabaNum?, countryCode?, updatePagination = false) {
    if (modalType && (modalType == 'insert-template' || modalType == this.drawerId)) {
      this.loading = true;
      let serviceCall: any;
      if (this.config && this.config.whatsapp) {
        serviceCall = this.createWhatsappCampaignService.getTemplates(filter, search_text, page, size, type, name, wabaNum, countryCode, this.config.workflow)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.createVoiceCampaignService.getTemplates(filter, search_text, page, size, type, name)
      }
      else if (this.config && this.config.rcs) {
        if (this.config.configureSms) {
          serviceCall = this.createCampaignService.getTemplates(filter, search_text, page, size, type, name, this.verticalCategory)
        }
        else {
          serviceCall = this.createRcsCampaignService.getRcsTemplates(filter, search_text, page, size, type, name)
        }
      }
      else if (this.config && this.config.ibd) {
        serviceCall = this._missedCallCampaignService.getTemplates(filter, search_text, page, size, type, name)
      }
      else {
        serviceCall = this.createCampaignService.getTemplates(filter, search_text, page, size, type, name, this.verticalCategory, this.config)
      }
      serviceCall.subscribe(res => {
        this.loading = false;
        this.templateLoaded = true;
        this.tableData = this.config && this.config?.ibd ? res['data']['items'] : res['data']['docs'];
        this.templatesTableConfig.dataLength = this.config && this.config?.ibd ? res['data']['meta']['totalItems'] : res['data']['total'];
        this.templatesTableConfig.displayedColumns = res['config']['fields'];
        if (this.searchedData || this.senderType || updatePagination) {
          let event = {
            page: page,
            size: size,
            pagination: true
          }
          this.common.setPagination(event);
        }
        this.selectedTemplate = '';
        this.dataReceived.emit(true);
        this.cdr.detectChanges();
      }, err => {
        this.loading = false;
      })
    }
  }

  tableActionRecieve($event) {
    this.tableActionData = $event;
    if (this.searchedData) {
      this.tableActionData['search'] = this.search_text
    }
    this.loadData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.modalType, this.senderType, this.senderName, this.wabaNumberObj?.waba_number_wc, this.wabaNumberObj?.country_code);
  }

  getSelectedTemplate(event) {
    this.selectedTemplate = event;
  }

  insertTemplate() {
    if (!this.selectedTemplate) {
      this.common.openSnackBar(this.selectTemplate, 'error');
      return
    }
    this.closeModal(this.drawerId ? this.drawerId : 'insert-template');

    let data: data = {
      data: this.selectedTemplate,
      type: this.drawerId ? this.drawerId : 'insert-template'
    }
    data['tableData'] = this.tableData
    this.common.setPersonalizeHeader([]);
    this.sendData.emit(data);
    this.closeDrawer(this.drawerId ? this.drawerId : 'insert-template');
  }

  applySearch(event, action?) {
    if (((event.keyCode == 8) && !this.search_text) || action || (event.keyCode == 13)) {
      this.searchedData = true
      let obj = {
        search: this.search_text,
        pagination: {
          pageIndex: 1,
          pageSize: this.templatesTableConfig.pageSize
        },
        filters: ''
      }
      if (this.tableActionData) {
        this.tableActionData.pagination.pageIndex = 1;
      }
      this.tableActionRecieve(this.tableActionData ? this.tableActionData : obj);
    }
  }

  searchTemplate(event, action) {
    this.applySearch(event, action);

  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }

  closeDrawer(id) {
    // this.showDrawer = false;
    this.templateLoaded = false;
    if (!this.config?.workflow) {
      this.tableData = [];
    }
    this.close.emit(id);
    if (this.tableActionData) this.tableActionData.search = '';
    this.search_text = '';
  }

  ngDoCheck() {
    this.templateLoaded = this.showDrawer;
  }

}
