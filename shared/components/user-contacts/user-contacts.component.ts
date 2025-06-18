import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateCampaignService as WACreateCampaignService } from 'src/app/shared/services/whats-app/campaigns/create-campaign.service';
import { CreateCampaignService as CreateVoiceCampaignService } from 'src/app/shared/services/voice/create-campaign.service';
import { CreateCampaignService as CreateRcsCampaignService } from 'src/app/shared/services/rcs/campaigns/create-campaign.service';
import { CampaignListService } from 'src/app/shared/services/voice/campaign-list.service';
import { CreateCampaignService as CreateEmailCampaignService } from 'src/app/shared/services/email/campaigns/create-campaign.service';
import { permissions } from 'src/app/shared/constants/teammate-permission.constrant';
import { ListsServiceService } from 'src/app/shared/services/lists-service.service';
import { CreateCampaignService as CreateTCCampaignService } from 'src/app/shared/services/truecaller/campaigns/create-campaign.service';

@Component({
  selector: 'app-user-contacts',
  templateUrl: './user-contacts.component.html',
  styleUrls: ['./user-contacts.component.css']
})
export class UserContactsComponent implements OnInit {
  modalType = 'import';
  contactsForm: FormGroup;
  contactList: any;
  loaded = false;
  sendUserContactData: boolean = false;
  listOptionsSelectText: any;
  listHeaderSelectText: any;
  selectedListHeaders: any;
  tableConfig = {
    name: 'Campagins',
    dataLength: 100,
    pageSize: 4,
    pageSizeOptions: [10, 25, 50, 100],
    quickFilter: false,
    isShowEntries: false,
    showFilter: false,
    filterOptions: false,
    searchFilter: true,
    showCreateButton: false,
    displayedColumns: [],
    paginationArrow: true,
    isShowPagination: true,
    type: 'lists',
    hideTotalRecord: true
  }
  contactLoaded = false;
  tableData = [];
  contactTableConfig = {
    name: 'Campagins',
    dataLength: 0,
    pageSize: 4,
    pageSizeOptions: [10, 25, 50, 100],
    quickFilter: false,
    isShowEntries: false,
    showFilter: false,
    filterOptions: false,
    searchFilter: true,
    showCreateButton: false,
    displayedColumns: [],
    paginationArrow: true,
    isShowPagination: true,
    type: 'contacts',
    hideTotalRecord: true,
    selectAllCheckbox: true,
    isCheckedAll: false
  }
  listOptions: any;
  loading: boolean = false;
  @Input() campaignId: any;
  contactLoading: boolean = false;
  listMobileIdentifier: any;
  listEmailIdentifier: any;
  listAllEmailIdentifier: any;
  listHeaderColumns: any;
  selectedTabIndex = 1;
  @Output() sendTabIndexData = new EventEmitter<any>();
  configListOptions = {
    image: false,
    title: 'List',
    key: 'name',
    search: false,
    open: false
  };
  configSelectedListHeaders = {
    image: false,
    title: 'Header',
    key: 'name',
    search: false,
    open: false
  };
  loaderSpinner: boolean = false;
  @Output() sendLoaderState = new EventEmitter<any>();
  hasContacts: boolean = false;
  searchedData: boolean = false;
  search_text: any;
  tableActionData: any;
  selectListText: any;
  stop = new Subject<void>();
  receivedDataList: any = [];
  receivedContactsList: any = [];
  @Input() config: any;
  @Output() contactCount = new EventEmitter<any>();
  @Output() scheduledAddContact = new EventEmitter<any>();
  @Input() blacklistConfig: any;
  @Input() id: any;
  importedListData: any[] = [];
  insertImportList: any;
  importRes: any;
  allSelectedArr = [];
  excludedIds = [];
  newData = false;
  permissions = permissions;
  hasInsertContactsAccess: any = false;
  selectedList: any;
  selectTitle: any = '';
  configObj = {
    image: false,
    title: '',
    key: 'key',
    search: true,
    open: false,
    checkbox: true,
    isAllCheckbox: true
  }
  @Input() selectedTab: any;
  @Input() langWiseTabLabelVal: any;

  constructor(public createCampaignService: CreateCampaignService, public fb: FormBuilder, private cdr: ChangeDetectorRef, public common: CommonService, public translate: TranslateService, public createWhatsappCampaignService: WACreateCampaignService, public createRcsCampaignService: CreateRcsCampaignService, public createVoiceCampaignService: CreateVoiceCampaignService, public voiceListingService: CampaignListService, public createEmailCampaignService: CreateEmailCampaignService, public listService: ListsServiceService,
    public _createTCCampaignService: CreateTCCampaignService
  ) {

    this.contactsForm = this.fb.group({
      messageType: ['1', [Validators.required]],
      searchList: [null, []],
      listOptions: [null, []],
      selectedListHeader: [null, []],
      contactNumber: [null, []]
    });
    translate.stream(['campaign.select-one-list-text', 'common-select']).subscribe((text) => {
      this.selectListText = text['campaign.select-one-list-text']
      this.configObj.title = text['common-select']
    });

    this.createCampaignService.getSelectedTabIndex().pipe(takeUntil(this.stop)).subscribe(res => {
      if ((this.selectedTab == this.langWiseTabLabelVal?.segment) || (this.selectedTab == this.langWiseTabLabelVal?.list)) {
        this.receivedDataList = [];
        this.receivedContactsList = [];
        this.resetUserContactImport();
        this.checkImportedData();
        this.contactType('list');
      }
    })

    this.createCampaignService.getBlacklistSelectedTabIndex().pipe(takeUntil(this.stop)).subscribe(res => {
      if (res == '1') {
        this.receivedDataList = [];
        this.receivedContactsList = [];
        this.resetUserContactImport();
        this.checkImportedData();
        this.contactType('list');
      }
    })

    this.createCampaignService.getEventToGetListItem().pipe(takeUntil(this.stop)).subscribe(e => {
      if (e) {
        let request: any = ''
        if (this.contactList && this.contactList.length) {
          let contactIds = [];
          this.contactList.forEach(item => {
            contactIds.push(item._id);
          })
          request = {
            list_id: this.contactsForm.get('listOptions').value,
            contact_ids: this.getDistinctListData(contactIds, this.importedListData),
            exclude_contact_ids: this.excludedIds,
            select_all_contact: this.allSelectedArr.length ? true : false
          }
        }
        let obj = {
          list: this.selectedList,
          recipients: request
        }
        this.createCampaignService.setEventToGetManualEntryItem(obj);
      }
    })
  }

  callData() {
    this.receivedDataList = [];
    this.receivedContactsList = [];
    this.resetUserContactImport();
    this.contactType('list');
  }

  ngOnInit(): void {
    if (this.config.sms && this.common?.checkUserPermission(permissions?.permissionsTag['SMSCampaigns'], permissions?.permissionName['sms_insert_contacts_from_list'], false)) {
      this.hasInsertContactsAccess = true;
    } else if (this.config.whatsapp && this.common?.checkUserPermission(permissions?.permissionsTag['WhatsAppCampaigns'], permissions?.permissionName['whatsapp_insert_contacts_from_list'], false)) {
      this.hasInsertContactsAccess = true;
    } else if (this.config.email && this.common?.checkUserPermission(permissions?.permissionsTag['Email_Campaigns'], permissions?.permissionName['email_insert_contacts_from_list'], false)) {
      this.hasInsertContactsAccess = true;
    } else if (this.config.voice && this.common?.checkUserPermission(permissions?.permissionsTag['VoiceCampaigns'], permissions?.permissionName['voice_obd_insert_contacts_from_list'], false)) {
      this.hasInsertContactsAccess = true;
    } else if (this.config?.workflow) {
      this.hasInsertContactsAccess = true;
    } else if (this.config?.truecaller && this.common?.checkUserPermission(permissions?.permissionsTag['TruecallerCampaigns'], permissions?.permissionName['truecaller_insert_contacts_from_list'], false)) {
      this.hasInsertContactsAccess = true;
    } else {
      this.hasInsertContactsAccess = false;
    }
  }

  contactType(type) {
    if (this.config && this.config.workflow) {
      this.tableConfig['customCountKey'] = true
    }
    if (type == 'list') {
      this.contactList = [];
      this.loaded = false;
      this.sendUserContactData = false;
      this.contactsForm.get('listOptions').clearValidators();
      this.contactsForm.get('listOptions').updateValueAndValidity();
      this.listOptionsSelectText = '';
      this.listHeaderSelectText = '';
      this.contactsForm.get('listOptions').setValue(null);
      this.contactsForm.get('selectedListHeader').setValue(null);
      this.selectedListHeaders = '';
      this.contactsForm.get('contactNumber').setValue('');
      this.loadData('', '', 1, this.tableConfig.pageSize, this.modalType);
      this.contactsForm.get('contactNumber').clearValidators();
      this.contactsForm.get('contactNumber').updateValueAndValidity();
    }
    else {
      this.contactLoaded = false;
      this.sendUserContactData = false;
      this.tableData = [];
      this.contactList = [];
      this.contactTableConfig.dataLength = 0;
      this.cdr.detectChanges();
      if (!this.listOptions) {
        this.createCampaignService.getListOptions(this.config.email ? 'email' : 'mobile').subscribe((res: any) => {
          this.listOptions = res.data;
        })
      }
      this.contactsForm.get('listOptions').setValidators([Validators.required]);
      this.contactsForm.get('listOptions').updateValueAndValidity();
    }
  }

  loadData(filter?, search_text?, page?, size?, modalType?) {
    if (this.contactsForm.get('messageType').value == '1') {
      this.loading = true;
      this.loaderSpinner = true;
      this.sendLoaderState.emit(this.loaderSpinner);
      let serviceCall: any;
      let channel = this.config?.whatsapp ? 'whatsapp' : (this.config?.rcs ? 'rcs' : (this.config?.sms ? 'sms' : (this.config?.email ? 'email' : (this.config?.truecaller ? 'truecaller' : ''))))
      if (this.config?.segment) {
        serviceCall = this.createEmailCampaignService.getListForSegment(this.campaignId, this.contactsForm.get('searchList').value, page, size, channel)
      }
      else {
        if (this.config && this.config.whatsapp) {
          serviceCall = this.createWhatsappCampaignService.getList(this.campaignId, this.contactsForm.get('searchList').value, page, size, 'mobile', channel, this.blacklistConfig?.blacklist ? true : false)
        }
        else if (this.config && this.config.rcs) {
          serviceCall = this.createRcsCampaignService.getList(this.campaignId, this.contactsForm.get('searchList').value, page, size, 'mobile', channel)
        }
        else if (this.config && this.config.voice) {
          serviceCall = this.createVoiceCampaignService.getList(this.campaignId, this.contactsForm.get('searchList').value, page, size, 'mobile', channel?channel:'voice_obd', this.blacklistConfig?.blacklist ? true : false)
        }
        else if (this.config && this.config.email) {
          serviceCall = this.createEmailCampaignService.getListForContact(this.campaignId, this.contactsForm.get('searchList').value, page, size, channel, channel, this.blacklistConfig?.blacklist ? true : false)
        }
        else if (this.config && this.config.workflow) {
          serviceCall = this.listService.getallRecords(filter, this.contactsForm.get('searchList').value, page, size, {workflow:true})
        }
        else if (this.config && this.config?.truecaller) {
          serviceCall = this._createTCCampaignService.getListFromContact(this.campaignId, this.contactsForm.get('searchList').value, page, size, 'mobile', 'truecaller', this.blacklistConfig?.blacklist ? true : false)
        }
        else {
          serviceCall = this.createCampaignService.getListFromContact(this.campaignId, this.contactsForm.get('searchList').value, page, size, this.blacklistConfig?.blacklist ? true : false)
        }
      }
      serviceCall.subscribe(res => {
        this.loading = false;
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.loaded = true;
        if (this.config && this.config.workflow) {
          res['data']['docs'].forEach(e => {
            e.mobile_identifier = e.email_identifier = null;
            e.radio = false;
          })
        }
        res['data']['docs'].forEach(ele => {
          ele['is_selected'] = 0
          ele['config'] = { ...this.configObj }
          ele['select_text'] = ''
          let obj = this.importedListData.find(ev => ev.list_id == ele?._id)
          let arr = []
          let obj1 = { 'key': 'All' };
          if (ele['headers'] && ele['headers'].length) {
            ele['headers'].unshift(obj1);
            ele['headers'].forEach(e => {
              if (e['key'] != 'All')
                e = { "key": e, "value": e, checkbox: false }
              if (obj && obj.extra_fields.includes(e?.value)) {
                e['checkbox'] = true
                ele['select_text'] = obj?.extra_fields
              }
              arr.push(e)
            })
          }
          ele['headers'] = arr
        })
        if (this.importedListData && this.importedListData.length) {
          this.importedListData.forEach(e => {
            let index = res['data']['docs'].findIndex(ev => e.list_id == ev._id)
            if (index > -1) {
              res['data']['docs'][index]['is_selected'] = 1
            }
          })
        }
        this.tableData = res['data']['docs'];
        if (this.tableData.find(e => e.is_selected)) {
          this.hasContacts = true;
        }
        else {
          this.hasContacts = false;
        }
        this.tableData.map(e => {
          e['realtimeChecked'] = e['is_selected']
        })
        this.getContactList();
        this.tableConfig.dataLength = res['data']['total'];
        this.tableConfig.displayedColumns = res['config']['fields'];

        if (this.searchedData) {
          let event = {
            page: page,
            size: size,
            pagination: true
          }
          this.common.setPagination(event);
        }
        this.cdr.detectChanges();
      })
    }
    else {
      this.tableData = [];
      this.contactLoading = true;
      if (this.contactsForm.get('listOptions').value) {
        this.loaderSpinner = true;
        this.sendLoaderState.emit(this.loaderSpinner);
        let channel = '';
        if (this.config && this.config.whatsapp) {
          channel = 'whatsapp';
        }
        else if (this.config && this.config.rcs) {
          channel = 'rcs';
        }
        else if (this.config && this.config.voice) {
          channel = 'voice_obd';
        }
        else if (this.config && this.config.email) {
          channel = 'email';
        }
        else if (this.config && this.config.truecaller) {
          channel = 'truecaller';
        }
        else {
          channel = 'sms';
        }
        this.createCampaignService.getListRecipient(this.contactsForm.get('listOptions').value, this.campaignId, this.contactsForm.get('selectedListHeader').value, this.contactsForm.get('contactNumber').value, page, size, channel, this.blacklistConfig?.blacklist ? true : false).subscribe((res: any) => {
          this.contactLoading = false;
          this.loaderSpinner = false;
          this.sendLoaderState.emit(this.loaderSpinner);
          this.tableData = res['data']['docs'];
          if (!this.contactTableConfig.isCheckedAll && this.tableData.length && !this.allSelectedArr.length && !this.importedListData.length) {
            this.tableData.forEach(e => {
              e['realtimeChecked'] = false
              e['is_selected'] = 0
            })
          }
          if (this.tableData.find(e => e.is_selected)) {
            this.hasContacts = true;
          }
          else {
            this.hasContacts = false;
          }
          this.tableData.map(e => {
            e['realtimeChecked'] = e['is_selected']
          })
          this.getContactList();
          this.contactTableConfig.dataLength = res['data']['total'];
          this.contactTableConfig.displayedColumns = res['config']['fields'];
          this.listMobileIdentifier = res['data']['default_mobile_identifier']
          this.listEmailIdentifier = res['data']['default_email_identifier']
          if (this.config?.email) {
            this.listAllEmailIdentifier = res['data']['email_identifiers'] ? res['data']['email_identifiers'] : "";
          }
          if (res['data']['headers_column']) {
            this.listHeaderColumns = res['data']['headers_column'][0].headers;
          }
          this.contactLoaded = true;
          if (this.searchedData) {
            let event = {
              page: page,
              size: size,
              pagination: true
            }
            this.common.setPagination(event);
          }
          this.cdr.detectChanges();
        })
      }
    }
  }

  showErrors(fieldName, errorType, formName) {
    if (this.contactsForm.controls[fieldName].errors && this.contactsForm.controls[fieldName].errors[errorType]) {
      return (this.sendUserContactData || this.contactsForm.controls[fieldName].dirty) && this.contactsForm.controls[fieldName].errors[errorType];
    } else {
      return false;
    }
  }

  selectActionRecive(item, key) {
    if (key == 'listOptions') {
      this.sendUserContactData = false;
      this.listOptionsSelectText = item.name;
      this.contactsForm.get(key).setValue(item._id);
      this.listHeaderSelectText = '';
      this.contactsForm.get('selectedListHeader').setValue('');
      this.contactsForm.get('contactNumber').setValue('');
      this.createCampaignService.getListHeaders(this.contactsForm.get('listOptions').value).subscribe((res: any) => {
        let headersArr = {
          _id: res.data[0]._id,
          headers: []
        };
        res.data[0].headers.forEach(el => {
          headersArr.headers.push({
            name: el
          })
        })
        this.selectedListHeaders = headersArr;
      })
      this.contactsForm.get('contactNumber').clearValidators();
      this.contactsForm.get('contactNumber').updateValueAndValidity();
    }
    else if (key == 'selectedListHeader') {
      this.listHeaderSelectText = item.name;
      this.contactsForm.get(key).setValue(item.name);
      this.contactsForm.get('contactNumber').setValue('');
      this.contactsForm.get('contactNumber').setValidators([Validators.required]);
      this.contactsForm.get('contactNumber').updateValueAndValidity();
      this.sendUserContactData = false;
    }
  }

  resetUserContactImport() {
    this.contactsForm.reset();
    this.contactsForm.get('messageType').setValue(1);
  }

  searchList(event, action) {
    this.search(event, action);
  }

  search(event, action?) {
    if (((event.keyCode == 8) && !this.contactsForm.get('searchList').value) || action || (event.keyCode == 13)) {
      this.sendUserContactData = true;
      if (this.contactsForm.invalid) {
        return;
      }
      this.receivedContactsList = [];
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
      this.newData = true;
      this.tableActionRecieve(this.tableActionData ? this.tableActionData : obj, this.newData);
    }
  }

  insertUserContactsData() {
    if (this.contactsForm.get('messageType').value == '1') {
      if ((!this.contactList && !this.hasContacts) || (this.contactList && !this.contactList.length && !this.hasContacts) || !this.hasContacts) {
        this.common.openSnackBar(this.selectListText, 'error');
        return
      }
      let request = {}
      if (this.config?.segment) {
        let arr = this.contactList.map(item => item._id)
        request = {
          campaign_id: this.campaignId,
          segments: arr
        }
      }
      else {
        let listData = [];
        this.contactList.forEach(item => {
          item?.headers.shift();
          let data = {
            recipient_column: this.config?.email ? item.default_email_identifier : item.default_mobile_identifier,
            list_id: item._id,
            headers: item.headers?.map(ele => {
              return ele?.key
            }),
            extra_fields: item?.select_text ? item?.select_text : []
          }
          if (this.config.email) {
            data['list_name'] = item.name;
            data['email_identifiers'] = item.email_identifiers ? item.email_identifiers : "";
          }
          listData.push(data);
        })
        request = {
          campaign_id: this.campaignId,
          lists: this.getDistinctListData(listData, '', 'id')
        }
      }
      // if (this.config && !this.config['voiceListing']) {
      //   this.closeModal(this.id);
      // }
      this.loaderSpinner = true;
      this.sendLoaderState.emit(this.loaderSpinner);
      this.loaderSpinner = true;
      let serviceCall: any;
      if (this.blacklistConfig && this.blacklistConfig.blacklist) {
        if (this.config && this.config.email) {
          serviceCall = this.createEmailCampaignService.importEmailBlacklistCampaignRecipientList(request)
        }
        if (this.config && this.config.sms) {
          serviceCall = this.createCampaignService.importBlacklistCampaignRecipientList(request)
        }
        else if (this.config && this.config.whatsapp) {
          serviceCall = this.createWhatsappCampaignService.importBlacklistCampaignRecipientList(request)
        }
        else if (this.config && this.config.voice) {
          serviceCall = this.createVoiceCampaignService.importVoiceBlacklistCampaignRecipientList(request)

        }
        else if (this.config && this.config.rcs) {
          serviceCall = this.createRcsCampaignService.importRCSBlacklistCampaignRecipientList(request)
        }
        else if (this.config && this.config.truecaller) {
          serviceCall = this._createTCCampaignService.importBlacklistCampaignRecipientList(request)
        }
      }
      else if (this.config && this.config.whatsapp) {
        if (this.config?.segment) {
          serviceCall = this.createWhatsappCampaignService.importSegmentRecipientList(request);
        }
        else {
          serviceCall = this.createWhatsappCampaignService.importCampaignRecipientList(request)
        }
      }
      else if (this.config && this.config.voiceListing) {
        serviceCall = this.voiceListingService.importCampaignRecipientList(request)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.createVoiceCampaignService.importCampaignRecipientList(request)
      }
      else if (this.config && this.config.rcs) {
        if (this.config?.segment) {
          serviceCall = this.createRcsCampaignService.importSegmentRecipientList(request);
        }
        else {
          serviceCall = this.createRcsCampaignService.importCampaignRecipientList(request)
        }
      }
      else if (this.config && this.config.email) {
        if (this.config?.segment) {
          serviceCall = this.createEmailCampaignService.importSegmentRecipientList(request);
        }
        else {
          serviceCall = this.createEmailCampaignService.importCampaignRecipientList(request);
          this.createEmailCampaignService.recipientsAddedManuallyPreVal.next(JSON.parse(JSON.stringify(this.createEmailCampaignService.isRecipientsAddedManually.value)));
          this.createEmailCampaignService.isRecipientsAddedManually.next(false);
        }
      }
      else if (this.config && this.config.truecaller) {
        serviceCall = this._createTCCampaignService.importCampaignRecipientList(request)
      }
      else {
        if (this.config?.segment) {
          serviceCall = this.createCampaignService.importSegmentRecipientList(request);
        }
        else {
          serviceCall = this.createCampaignService.importCampaignRecipientList(request)
        }
      }
      serviceCall.subscribe((res: any) => {
        if (res['success']) {
          if (this.config && !this.config['voiceListing']) {
            this.closeModal(this.id);
          }
          this.receivedContactsList = [];
          this.loaderSpinner = false;
          this.sendLoaderState.emit(this.loaderSpinner);
          if (res.data.show_error) {
            this.common.openSnackBar(res['message'], 'error');
          }
          else {
            this.common.openSnackBar(res['message'], 'success');
          }
          if (this.blacklistConfig && this.blacklistConfig.blacklist) {
            let obj = {
              count: res.data.data_count,
              uploaded: true
            }
            if (this.config && this.config.voice) {
              this.createVoiceCampaignService.setBlacklistContactCountInVoice(obj);
            } else if (this.config && this.config.sms) {
              this.createCampaignService.setBlacklistContactCount(obj);
            } else if (this.config && this.config.whatsapp) {
              this.createWhatsappCampaignService.setBlacklistContactCount(obj);
            } else if (this.config && this.config.email) {
              this.createCampaignService.setBlacklistContactCount(obj);
            } else if (this.config && this.config.rcs) {
              this.createRcsCampaignService.setBlacklistContactCount(obj);
            } else if (this.config && this.config.truecaller) {
              this._createTCCampaignService.setBlacklistContactCount(obj);
            }
          }
          else {
            this.createCampaignService.setContactCount(res.data.data_count);
            if (this.config.email) {
              this.createEmailCampaignService.getCommonHeaders(this.campaignId);
            }
            this.createCampaignService.setEventtoResetText(true);
            this.contactCount.emit(res.data.data_count)
          }
          if (this.config && this.config.voiceListing) {
            this.scheduledAddContact.emit({ id: 'schedule-add-contact' });
          }
          this.closeModal(this.id);
        }
        else {
          this.loaderSpinner = false;
          this.sendLoaderState.emit(this.loaderSpinner);
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
    else {
      if ((!this.contactList && !this.hasContacts) || (this.contactList && !this.contactList.length && !this.hasContacts) || !this.hasContacts) {
        this.common.openSnackBar('Please select atleast one contact.', 'error');
        return
      }
      let contactIds = [];
      this.contactList.forEach(item => {
        contactIds.push(item._id);
      })

      let request = {
        campaign_id: this.campaignId,
        list_id: this.contactsForm.get('listOptions').value,
        recipient_column: this.config?.email ? this.listEmailIdentifier : this.listMobileIdentifier,
        contact_ids: this.getDistinctListData(contactIds),
        exclude_contact_ids: this.excludedIds,
        // for backup
        // headers: this.contactsForm.get('selectedListHeader').value ? this.contactsForm.get('selectedListHeader').value : null,
        headers: this.contactsForm.get('selectedListHeader').value ? this.contactsForm.get('selectedListHeader').value : null,
        headers_value: this.contactsForm.get('contactNumber').value ? this.contactsForm.get('contactNumber').value : null,
        select_all_contact: this.allSelectedArr.length ? true : false,
        list_headers: this.listHeaderColumns
      }
      if (this.config?.email) {
        request['email_identifiers'] = this.listAllEmailIdentifier;
      }

      // if (this.config && !this.config['voiceListing']) {
      //   this.closeModal(this.id);
      // }
      this.loaderSpinner = true;
      this.sendLoaderState.emit(this.loaderSpinner);
      let serviceCall: any;
      if (this.blacklistConfig && this.blacklistConfig.blacklist) {
        serviceCall = this.createCampaignService.importBlacklistCampaignListRecipient(request)
      }
      else if (this.config && this.config.whatsapp) {
        serviceCall = this.createWhatsappCampaignService.importCampaignListRecipient(request)
      }
      else if (this.config && this.config.voiceListing) {
        serviceCall = this.voiceListingService.importCampaignListRecipient(request)
      }
      else if (this.config && this.config.voice) {
        serviceCall = this.createVoiceCampaignService.importCampaignListRecipient(request)
      }
      else if (this.config && this.config.rcs) {
        serviceCall = this.createRcsCampaignService.importCampaignListRecipient(request)
      }
      else if (this.config && this.config.email) {
        serviceCall = this.createEmailCampaignService.importCampaignListRecipient(request)
      }
      else if (this.config && this.config.truecaller) {
        serviceCall = this._createTCCampaignService.importCampaignListRecipient(request)
      }
      else {
        serviceCall = this.createCampaignService.importCampaignListRecipient(request)
      }
      serviceCall.subscribe((res: any) => {
        if (res['success']) {
          if (this.config && !this.config['voiceListing']) {
            this.closeModal(this.id);
          }
          this.receivedDataList = [];
          this.loaderSpinner = false;
          this.sendLoaderState.emit(this.loaderSpinner);
          this.common.openSnackBar(res['message'], 'success');
          if (this.blacklistConfig && this.blacklistConfig.blacklist) {
            let obj = {
              count: res.data.data_count,
              uploaded: true
            }
            if (this.config && this.config.voice) {
              this.createVoiceCampaignService.setBlacklistContactCountInVoice(obj);
            } else {
              this.createCampaignService.setBlacklistContactCount(obj);
            }
          }
          else {
            this.createCampaignService.setContactCount(res.data.data_count);
            if (this.config.email) {
              this.createEmailCampaignService.getCommonHeaders(this.campaignId);
            }
            this.createCampaignService.setEventtoResetText(true);
            this.contactCount.emit(res.data.data_count)
          }
          if (this.config && this.config.voiceListing) {
            this.scheduledAddContact.emit({ id: 'schedule-add-contact' });
          }
          this.closeModal(this.id);
        }
        else {
          this.loaderSpinner = false;
          this.sendLoaderState.emit(this.loaderSpinner);
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.loaderSpinner = false;
        this.sendLoaderState.emit(this.loaderSpinner);
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  getContactList() {
    this.contactList = [];
    if (this.contactsForm.get('messageType').value == '1') {
      if (this.receivedDataList && this.receivedDataList.length > 0) {
        this.contactList = this.receivedDataList
      }
      else {
        this.tableData.forEach(res => {
          if (res.is_selected) {
            this.contactList.push(res);
          }
        })
      }
    }
    if (this.contactsForm.get('messageType').value == '2') {
      if (this.receivedContactsList && this.receivedContactsList.length > 0) {
        this.contactList = this.receivedContactsList
      }
      else {
        this.tableData.forEach(res => {
          if (res.is_selected) {
            this.contactList.push(res);
          }
        })
      }
    }
  }

  closeModal(id: string) {
    this.common.close(id);
    this.resetUserContactImport();
    this.selectedTabIndex = 0;
    this.sendTabIndexData.emit(this.selectedTabIndex);
  }

  tableActionRecieve($event, value?) {
    this.newData = false;
    if (value) this.newData = true;
    this.tableActionData = $event;
    if (this.searchedData) {
      this.tableActionData['search'] = this.search_text
    }
    this.loadData(this.tableActionData.filters, this.tableActionData.search, this.tableActionData.pagination.pageIndex, this.tableActionData.pagination.pageSize, this.modalType);
  }

  dataReceived(data) {
    this.contactList = data;
    if (this.contactsForm.get('messageType').value == '1') {
      this.receivedDataList = data;
    }
    if (this.contactsForm.get('messageType').value == '2') {
      this.receivedContactsList = data;
    }
    if (!this.hasContacts) {
      this.hasContacts = true;
    }
  }

  checkImportedData() {
    // this.loaderSpinner = true;
    // this.sendLoaderState.emit(this.loaderSpinner);
    let serviceCall: any;
    if (this.config && this.config.whatsapp) {
      serviceCall = this.createWhatsappCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.voice) {
      serviceCall = this.createVoiceCampaignService.getimportDetails(this.campaignId);
    }
    else if (this.config && this.config.rcs) {
      serviceCall = this.createRcsCampaignService.getimportDetails(this.campaignId)
    }
    else if (this.config && this.config.email) {
      serviceCall = this.createEmailCampaignService.getimportDetails(this.campaignId);
    }
    else if (this.config && this.config.truecaller) {
      serviceCall = this._createTCCampaignService.getimportDetails(this.campaignId);
    }
    else {
      serviceCall = this.createCampaignService.getimportDetails(this.campaignId)
    }
    serviceCall.subscribe((res: any) => {
      this.importedListData = [];
      this.importRes = res
      if (this.blacklistConfig?.blacklist) {
        if (res && res.data && res.data.blacklist_lists && res.data.blacklist_lists.length > 0) {
          this.importedListData = [...res.data.blacklist_lists]
        }
      }
      else {
        if (res && res.data && res.data.lists && res.data.lists.length > 0) {
          this.importedListData = [...res.data.lists]

        } else if (res && res.data && res.data.list_contacts && Object.keys(res.data.list_contacts).length > 0) {
          this.importedListData = [...res.data.list_contacts.contacts]
          this.contactTableConfig.isCheckedAll = res.data.list_contacts?.select_all_contact
          this.excludedIds = res.data.list_contacts?.exclude_contact_ids
        }
        else if (res && res.data && res.data.segments && res.data.segments.length > 0) {
          this.importedListData = [...res.data.segments]
        }
      }
      // this.loaderSpinner = false;
      // this.sendLoaderState.emit(this.loaderSpinner);
    }, err => {
      // this.loaderSpinner = false;
      // this.sendLoaderState.emit(this.loaderSpinner);
      // this.common.openSnackBar(err['message'], 'error');
    })
  }

  getDistinctListData(arr, arr2?, hasId?) {
    if (arr2 && arr2.length > 0) {
      let unique = [];
      for (let i = 0; i < arr2.length; i++) {
        let found = false;
        for (let j = 0; j < arr.length; j++) {
          if (hasId && arr[j].list_id == arr2[i].list_id || !hasId && arr[j] == arr2[i]) {
            found = true;
          }
        }
        if (!found) {
          unique.push(arr2[i])
        }

      }
      return arr.concat(unique);
    }
    else {
      return arr;
    }
  }

  getCheckboxItem(item) {
    if (this.allSelectedArr.length && !item.realtimeChecked) {
      let index = this.excludedIds.findIndex(e => e == item._id)
      if (index === -1) this.excludedIds.push(item._id)
    }
    if (this.allSelectedArr.length && item.realtimeChecked) {
      this.excludedIds = this.excludedIds.filter(e => e != item._id)
    }
    if (this.importedListData && this.importedListData.length > 0) {
      let index = this.importedListData.findIndex(e => (e.list_id == item._id) || (e == item._id))
      if (index > -1) {
        this.importedListData.splice(index, 1)
      }
    }
  }

  rowCheckboxStatus(data) {
    this.allSelectedArr = data
    if (this.tableData.length) {
      this.tableData.forEach(e => {
        e['realtimeChecked'] = this.allSelectedArr.length ? true : false
      })
    }
  }

  getCheckedData(data) {
    this.allSelectedArr = data
  }

  getCheckAllData(data) {
    this.contactTableConfig.isCheckedAll = data;
    if (!data) {
      this.excludedIds = [];
      this.importedListData = [];
      this.allSelectedArr = [];
    }
  }

  selectedData(event) {
    if (event.radio && (event.email_identifier || event.mobile_identifier)) {
      this.selectedList = event
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
