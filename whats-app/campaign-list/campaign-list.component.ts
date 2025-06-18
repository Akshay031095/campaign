import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PERMISSION } from 'src/app/shared/constants/teammate-permission.constrant';
import { CommonService } from 'src/app/shared/services/common.service';
import { CampaignListService } from 'src/app/shared/services/whats-app/campaigns/campaign-list.service';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css']
})
export class CampaignListComponent implements OnInit {

  loaderSpinner: boolean = false;
  toggle: boolean = false;
  campaignId: any;
  data = [];
  tableConfig = {
    createNew: false,
    dataLength: 3,
    pageSize: 10,
    isShowEntries: true,
    pageSizeOptions: [10, 25, 50, 100],
    displayedColumns: [],
    name: 'Campaigns',
    campaignActions: false,
    schedule: true,
    CampaignDelete: true,
    tableActionVal: [
      {
        key: 'schedule',
        url: '',
        icon: 'schedule',
        label: 'Edit Schedule'
      },
      {
        key: 'delete',

        url: '',
        icon: 'delete',
        label: 'Delete'
      }
    ],
    viewAction: false,
    whatsapp: true
  }
  loading: boolean = false;
  loaded = false;
  hasData: boolean = false;
  currentFilter: any;
  searchedData: boolean = false;
  public selectedQuickFilter = 'all';
  hasApprovalPermission: boolean = false;
  selectedCampaignTabIndex = 0;
  public search_text;
  hasCreateAccess: boolean = false;
  tableActionData: any;
  showNoRecords: boolean = false;
  noCampaignsCreatedYet: boolean = false;
  forApprovalTab: boolean = false;
  permissions: any = [];
  isTeammate: any;
  scheduleData: any;
  modalType: string;
  viewCampaignData: any;
  isKsaUser: boolean = false;
  whatsAppConfig = {
    whatsapp: true
  }
  translatedObj: any;
  pausePlayCampaignError: any;
  resumeCampaignError: any;
  stopCampaignError: any;
  setParametersConfig = {
    campaign: true,
    category: true,
    sender: false,
    campaignType: false,
    WhatsappBusinessNumber: true,
    messageQuota: true,
    whatsapp: true,
    hideActionButtons: true
  }
  validateDataPreview = {};

  constructor(public common: CommonService, public campaignListService: CampaignListService, public router: Router, translate: TranslateService) {
    translate.stream(['campaign.pause-play-confirmation', 'campaign.resume-confirmation', 'campaign.stop-campaign-confirmation']).subscribe((text) => {
      this.pausePlayCampaignError = text['campaign.pause-play-confirmation']
      this.resumeCampaignError = text['campaign.resume-confirmation']
      this.stopCampaignError = text['campaign.stop-campaign-confirmation']
    });
    this.common.getSidebarStateData().subscribe(data => {
      this.toggle = data;
    })

    this.common.translatedObj.subscribe((data: any) => {
      if (data) {
        this.translatedObj = data.translations
        this.tableConfig.name = this.translatedObj['campaigns']
      }
    })



    this.campaignListService.getScheduleUpdateSuccess().subscribe(res => {
      if (res) {
        this.loadData('', '', 1, this.tableConfig.pageSize, '');
      }
    });
  }

  ngOnInit(): void {
    this.permissions = JSON.parse(localStorage.getItem('permissions'));
    this.isTeammate = parseInt(localStorage.getItem('is_team_mate'));
    this.validateApprovalPermission(PERMISSION.whatsappCampaignApproval);
    this.loadData('', '', 1, this.tableConfig.pageSize, '');
  }

  createButonActionRecieve() {
    this.campaignListService.createCampaign().subscribe((res: any) => {
      this.campaignId = res.data._id;
      this.router.navigate(['/campaigns/whatsapp/create', this.campaignId]);
    }, err => {
      this.common.openSnackBar(err['error']['message'], 'error');
    })
  }

  loadData(filter?, search_text?, page?, size?, sort?) {
    this.loading = true;
    this.common.setLoader(true);


    let payload = {
      name: search_text ? search_text : '',
      page: page,
      limit: size,
      sort: sort?.column ? sort.column : '',
      order: sort?.order ? sort.order : ''
    }

    if (filter && Object.keys(filter).length > 0) {
      var arr = Object.keys(filter);
      arr.forEach(data => {
        if (filter[data] != null) {
          if (data == 'form_created_at' || data == 'form_sent_at') {
            payload[data.replace('form_', '')] = filter[data].replace(/\%3A/gi, ':')
          } else {
            payload[data.replace('form_', '')] = decodeURIComponent(filter[data]).split(',')
          }
        }
      })
    }
    this.campaignListService.getallRecords(payload).subscribe(res => {
      this.common.setLoader(false);
      if (res['success']) {
        this.loading = false;
        this.loaded = true;
        this.data = res['data']['docs'];
        this.tableConfig.dataLength = res['data']['total'];
        this.tableConfig.displayedColumns = res['config']['fields'];
        this.hasData = true;
        if (this.currentFilter || this.searchedData) {
          let event = {
            page: page,
            size: size,
            pagination: true
          }
          this.common.setPagination(event);
        }
      }
      else {
        this.data = [];
      }
      if (!this.currentFilter && !this.searchedData && !this.data) {
        this.noCampaignsCreatedYet = true;
      }
      else {
        this.noCampaignsCreatedYet = false;
      }
    },
      error => {
        this.common.setLoader(false);
        this.common.openSnackBar(error['error']['message'], 'error');
      })
  }

  get quickFilterOption() {
    if (this.tableConfig.displayedColumns.filter(data => data.is_quick_filter == true).length > 0) {
      return this.tableConfig.displayedColumns.filter(data => data.is_quick_filter == true)[0].select_options;
    } else {
      return [];
    }
  }

  campaignTabChanged(data) {
    this.search_text = '';
    this.selectedCampaignTabIndex = data;
    this.searchedData = false;
    this.currentFilter = '';
    this.hasData = false;
    if (this.tableActionData) {
      this.tableActionData['search'] = ''
      this.tableActionData['filters'] = ''
    }
    if (this.selectedCampaignTabIndex == 0) {
      this.forApprovalTab = false;
      this.loadData('', '', 1, this.tableConfig.pageSize, '');
    }
    else {
      this.forApprovalTab = true;
      this.loadForApprovalData('', '', 1, this.tableConfig.pageSize, '');
    }
    let event = {
      page: 1,
      size: this.tableConfig.pageSize,
      pagination: true
    }
    this.common.setPagination(event);
  }

  searchCampaign(event, action) {
    this.applySearch(event, action);
  }

  applySearch(event, action?) {
    if (((event.keyCode == 8) && !this.search_text) || action || (event.keyCode == 13)) {
      this.searchedData = true
      let obj = {
        search: this.search_text,
        pagination: {
          pageIndex: 1,
          pageSize: this.tableConfig.pageSize
        },
        filters: ''
      }
      if (this.tableActionData) {
        this.tableActionData.pagination.pageIndex = 1
      }
      this.tableActionRecieve(this.tableActionData ? this.tableActionData : obj);
    }
  }

  filterActionRecieve(res) {
    this.currentFilter = res;
    if (res && res.filterAction) {
      this.showNoRecords = true
    }
    else {
      this.showNoRecords = false
    }
    if (this.tableActionData) {
      this.tableActionData.pagination.pageIndex = 1
    }
    this.tableActionRecieve(this.tableActionData ? this.tableActionData : res);
  }

  tableActionRecieve($event) {
    this.tableActionData = $event;
    if (this.currentFilter) {
      this.tableActionData['filters'] = this.currentFilter['filters']
    }
    if (this.searchedData) {
      this.tableActionData['search'] = this.search_text
    }
    if (this.selectedCampaignTabIndex == 0) {
      this.loadData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.tableActionData.sort);
    }
    else {
      this.loadForApprovalData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.tableActionData.sort);
    }
  }

  actioneEvent(action) {
    if (action.type == 'stop') {
      this.sendToStopCampaign(action.data);
    }
    if (action.type == 'playPause') {
      this.sendPlayPauseCampaign(action.data);
    }
    if (action.type == 'delete') {
      this.rowDeleteActionRecieve(action.rowId)
    }
    if (action.type == 'schedule') {
      this.scheduleAction(action)
    }
  }

  receivedLoaderState(value) {
    this.common.setLoader(value);
  }

  viewActionData(data) {
    if (this.hasApprovalPermission && this.selectedCampaignTabIndex == 1) {
      if (data) {
        let id = data._id
        this.common.setLoader(true);
        this.campaignListService.getCampaignViewData(id).subscribe((res: any) => {
          if (res['success']) {
            this.viewCampaignData = res;
            this.openModal('view');
            this.common.setLoader(false);
            // this.common.openSnackBar(res['message'], 'success');
          }
          else {
            this.common.setLoader(false);
            this.common.openSnackBar(res['message'], 'error');
          }
        }, err => {
          this.common.setLoader(false);
          this.common.openSnackBar(err['error']['message'], 'error');
        })
      }
    }
    else {
      this.validateDataPreview = data.campaign_summary
      this.openModal('validate');
    }
  }

  loadForApprovalData(filter?, search_text?, page?, size?, sort?) {
    this.loading = true;
    this.common.setLoader(true);

    let payload = {
      name: search_text ? search_text : '',
      page: page,
      limit: size,
      sort: sort?.column ? sort.column : '',
      order: sort?.order ? sort.order : ''
    }

    if (filter && Object.keys(filter).length > 0) {
      var arr = Object.keys(filter);
      arr.forEach(data => {
        if (filter[data] != null) {
          if (data == 'form_created_at' || data == 'form_sent_at') {
            payload[data.replace('form_', '')] = filter[data].replace(/\%3A/gi, ':')
          } else {
            payload[data.replace('form_', '')] = decodeURIComponent(filter[data]).split(',')
          }
        }
      })
    }

    this.campaignListService.getallApprovalRecords(payload).subscribe(res => {
      this.common.setLoader(false);
      if (res['success']) {
        this.loading = false;
        this.loaded = true;
        this.data = res['data']['docs'];
        this.tableConfig.dataLength = res['data']['total'];
        this.tableConfig.displayedColumns = res['config']['fields'];
        this.hasData = true;
        if (this.currentFilter || this.searchedData) {
          let event = {
            page: page,
            size: size,
            pagination: true
          }
          this.common.setPagination(event);
        }
      }
      else {
        this.data = [];
      }
    },
      error => {
        this.common.setLoader(false);
        this.common.openSnackBar(error['error']['message'], 'error');
      })
  }

  validateApprovalPermission(data) {
    for (let index = 0; index < this.permissions.length; index++) {
      if (this.permissions[index] === data) {
        this.hasApprovalPermission = true;
        break;
      }
      else {
        this.hasApprovalPermission = false;
      }
    }
    this.validateOtherActionPermissions();
  }

  validateOtherActionPermissions() {
    if (this.isTeammate == 0) {
      this.hasCreateAccess = true;
      // this.tableConfig.viewAction = false;
    }
    else {
      if (this.permissions.find(e => ((e === 'create_whatsapp_campaign_maker_checker') || (e === 'create_whatsapp_campaign_maker')))) {
        this.hasCreateAccess = true;
      }
      else {
        this.hasCreateAccess = false;
      }
    }
  }

  rowDeleteActionRecieve($event) {
    this.campaignListService.deleteCampaign($event).subscribe(res => {
      if (res['success']) {
        this.common.openSnackBar(res['message'], 'success');
        this.data = this.data.filter(data => data._id != $event);
      } else {
        this.common.openSnackBar(res['message'], 'error');
      }
    }, error => {
      this.common.openSnackBar(error['error']['message'], 'error');
    })
  }

  scheduleAction(data) {
    this.scheduleData = data.data
    this.campaignListService.setScheduleCampaignData(this.scheduleData);
    this.openModal(data.type);
  }

  openModal(id: string) {
    this.common.open(id);
    this.modalType = id;
  }

  approveRejectAction(event) {
    if (event) {
      this.campaignTabChanged(1);
    }
  }

  sendPlayPauseCampaign(data) {
    if (data && !data.pause) {
      let text = this.pausePlayCampaignError;
      let hasRecurring = data.scheduler && data.scheduler.is_recurring;
      if (hasRecurring) {
        text = this.translatedObj['campaign.edit-recurring-pause-message']
      }
      this.common.openDialog(text, hasRecurring ? this.translatedObj['campaign.edit-recurring-pause-message-confirmation'] : '', 'confirm', (e) => {
        if (e) {
          this.pausePlayCall(data);
        }
      })
    }
    else {
      let text = this.resumeCampaignError;
      let hasRecurring = false;
      let pausedFutureOccurences = false;
      if (data.scheduler && data.scheduler.is_recurring) {
        hasRecurring = true
        pausedFutureOccurences = data.scheduler.pause_future_occurance ? true : false
      }
      if (hasRecurring) {
        text = pausedFutureOccurences ? this.translatedObj['campaign.edit-recurring-resume-with-pause-message'].replace('{{dateTime}}', data['paused_at']) : this.translatedObj['campaign.edit-recurring-resume-no-pause-message'].replace('{{dateTime}}', data['paused_at'])
      }
      this.common.openDialog(text, hasRecurring ? (pausedFutureOccurences ? this.translatedObj['campaign.edit-recurring-resume-with-pause-message-confirmation'] : this.translatedObj['campaign.edit-recurring-resume-no-pause-message-confirmation']) : '', 'confirm', (e) => {
        if (e) {
          this.pausePlayCall(data);
        }
      })
    }
  }
  pausePlayCall(data) {
    let request = {
      campaign_id: data._id,
      pause: data.pause ? false : true
    }
    this.campaignListService.playPauseCampaign(request).subscribe(res => {
      if (res['success']) {
        this.common.openSnackBar(res['message'], 'success');
        this.loadData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.tableActionData.sort);
      } else {
        this.common.openSnackBar(res['message'], 'error');
      }
    }, error => {
      this.common.openSnackBar(error['error']['message'], 'error');
    })
  }

  sendToStopCampaign(data) {
    let text = this.stopCampaignError;
    let hasRecurring = data.scheduler && data.scheduler.is_recurring;
    if (hasRecurring) {
      text = this.translatedObj['campaign.edit-recurring-stop-message']
    }
    this.common.openDialog(text, hasRecurring ? this.translatedObj['campaign.edit-recurring-stop-message-confirmation'] : '', 'confirm', (e) => {
      if (e) {
        let request = {
          campaign_id: data._id
        }
        this.campaignListService.stopCampaign(request).subscribe(res => {
          if (res['success']) {
            this.common.openSnackBar(res['message'], 'success');
            this.loadData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.tableActionData.sort);
          } else {
            this.common.openSnackBar(res['message'], 'error');
          }
        }, error => {
          this.common.openSnackBar(error['error']['message'], 'error');
        })
      }
    })
  }
  clearSearch(event, action) {
    this.search_text = '';
    this.applySearch(event, action);
  }
}
