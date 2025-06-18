import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { CreateCampaignService } from 'src/app/shared/services/create-campaign.service';
import { CreateCampaignService as CreateEmailCampaignService } from 'src/app/shared/services/email/campaigns/create-campaign.service';

@Component({
  selector: 'app-subscriber-limit',
  templateUrl: './subscriber-limit.component.html',
  styleUrls: ['./subscriber-limit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubscriberLimitComponent implements OnInit {

  @Input() subscriber_limit: any;
  @Input() campaignId: any;
  @Output() getSubsLimitData = new EventEmitter();

  showDrawer: boolean = false;
  subscriberLimit = {
    setSubscriberLimit:false,
    indexing_type:'combined',
    recipients:[]
  }
  // copySubscriberLimit = null;
  subscriberLimitConfig = {
    dataLength: 0,
    pageSize: 5,
    isShowEntries: false,
    hidePagination:true,
    pageSizeOptions: [],
    displayedColumns: [],
    name: "Subscriber Limit",
    edit: false,
    subscriberLimit: true,
    email: true,
    hideTotalRecord:true,
    reset: true
  };
  recipients = [];
  copy_indexing_type = 'combined';
  @Input() config: any;
  @Input()emailCampaignApproval: any;
  savedRecipientLists: any = [];
  totalRecords: any;

  constructor( 
    public common: CommonService, 
    public createCampaignService: CreateCampaignService, 
    public createEmailCampaignService: CreateEmailCampaignService) { 

  }

  showDrawerVal(Val){
    this.showDrawer = Val;
    if(this.subscriber_limit){
      this.subscriberLimit  = JSON.parse(JSON.stringify(this.subscriber_limit));
    }else{
      this.subscriberLimit.setSubscriberLimit = false;
      this.subscriberLimit.indexing_type = 'combined';
    }
    this.copy_indexing_type = JSON.parse(JSON.stringify(this.subscriberLimit.indexing_type));
    this.subscriberLimit.recipients = [];
    this.recipients = [];
    this.setTableConfig(this.subscriberLimit.indexing_type, 1, this?.subscriberLimitConfig?.pageSize, true);
    if(this.subscriberLimit.indexing_type == 'individual') this.fetchSavedRecipientRecords()
  }

  fetchSavedRecipientRecords() {
    this.createEmailCampaignService.getSavedRecipientRecords(this.campaignId).subscribe((res:any)=>{
      if(res['success']) {
        this.savedRecipientLists = res['data']['recipients'];
        if(this.savedRecipientLists && this.savedRecipientLists.length) {
          this.savedRecipientLists = this.savedRecipientLists.filter(x => x?.list_id);
        }
      }
    })
  }

  setIndexingType(event?, eventFromTableConfig=false){
    this.subscriberLimit.indexing_type = eventFromTableConfig ? 'individual' : event.value;
    this.recipients = [];
    this.setTableConfig(eventFromTableConfig ? 'individual' : event.value);
    if(this.subscriberLimit.indexing_type == 'individual') this.fetchSavedRecipientRecords();
  }

  setTableConfig(Val,PageIndex=1,PageSize = this.subscriberLimitConfig.pageSize, eventFromOpenDrawer=false){
    // this.copySubscriberLimit = null;
    if(Val === 'combined'){
      this.recipients = [];
      this.subscriberLimitConfig.hidePagination = true; 
      let queryString = this.campaignId+'?indexing_type='+Val;
      this.createEmailCampaignService.getSubscriberLimitList(queryString).subscribe((res:any)=>{
        if (res['success']) {
          this.subscriberLimitConfig.displayedColumns = res.config.fields;
          this.totalRecords = res?.data?.total;
          if(res?.data?.total == '1' && eventFromOpenDrawer) {
            this.setIndexingType('', true);
            return;
          }
          this.recipients = this.setDoc(res.data.docs);   
          this.subscriberLimit.recipients = [JSON.parse(JSON.stringify(this.recipients[0]))]; 
        }
        else {
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }else{
      let queryString = this.campaignId+'?indexing_type='+Val+'&page='+PageIndex+'&limit='+PageSize;
      this.createEmailCampaignService.getSubscriberLimitList(queryString).subscribe((res:any)=>{
        if (res['success']) {
          this.subscriberLimitConfig.displayedColumns = res.config.fields;
          this.totalRecords = res?.data?.total;
          this.subscriberLimit.recipients = this.setDoc(res.data.docs); 
          this.subscriberLimit.recipients.forEach(recipient => {
            let _Index = this.recipients.findIndex(x => x.list_id == recipient.list_id);
            if(_Index == -1){
              let send_to     = ((recipient.send_to || recipient.send_to == 0) && +recipient.send_to != NaN && recipient.send_to != "") ? +recipient.send_to : null;
              let starting_at = ((recipient.starting_at || recipient.starting_at == 0) && +recipient.starting_at != NaN && recipient.starting_at != "") ? +recipient.starting_at : null;
              if((send_to || send_to == 0) && (starting_at || starting_at == 0)){
                this.recipients.push(JSON.parse(JSON.stringify(recipient)));           
              }
            }
          })
          if(this.recipients.length){
            this.recipients.forEach(recipient => {
              let _Index = this.subscriberLimit.recipients.findIndex(x => x.list_id == recipient.list_id);
              if(_Index >= 0){
                this.subscriberLimit.recipients[_Index] = JSON.parse(JSON.stringify(recipient));
              }
            })
          }
          this.subscriberLimitConfig.dataLength = res.data.total; 
          this.subscriberLimitConfig.hidePagination = false; 
          let event = {
            page: PageIndex,
            size: PageSize,
            pagination: true
          }
          this.common.setPagination(event);
        }
        else {
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
    // this.copySubscriberLimit = JSON.parse(JSON.stringify(this.subscriberLimit));
  }

  setDoc(docs){
    this.invalidEntry = false;
    docs.map(x => {
      if(!x.send_to || !x.starting_at){
        x['editable'] = true;
      }else{
        x['editable'] = false;
      }
      if((+x.starting_at > +x.count) || (+x.send_to > +x.count)) this.invalidEntry = true;
    })
    return docs;
  }

  tableActionRecieve(event:any) {
    if(event.action){
      if(event.action == "pagination"){
        this.setTableConfig(this.subscriberLimit.indexing_type,event.pagination.pageIndex,event.pagination.pageSize)
      }else if(event.action == 'individual_indexing'){
        let _Index = this.recipients.findIndex(x => x.list_id == event.data.row.list_id);
        let send_to = ((event.data.row.send_to) && +event.data.row.send_to != NaN && event.data.row.send_to != "") ? +event.data.row.send_to : null;
        let starting_at = ((event.data.row.starting_at) && +event.data.row.starting_at != NaN && event.data.row.starting_at != "") ? +event.data.row.starting_at : null;
        if(_Index >= 0){
          this.recipients[_Index] = {...this.recipients[_Index],...event.data.row}
        }else{
          if((send_to) && (starting_at)){
            this.recipients.push(JSON.parse(JSON.stringify(event.data.row)));
          }
        }
      }
    }
  }

  invalidEntry = false;
  getInputValue(e){
    this.invalidEntry = false;
    if(+e?.row?.send_to == 0 || e?.row?.starting_at == 0 || (+e?.row?.starting_at > e?.row?.count) || (+e?.row?.send_to > (e?.row?.count - +(e?.row?.starting_at ? +e?.row?.starting_at-1 : 0))))this.invalidEntry = true;
    if((!e?.row?.send_to && !e?.row?.starting_at) || (e?.row?.starting_at == '' && e?.row?.send_to == '')) {
        this.invalidEntry = false;
    }   
    if(this.subscriberLimit.indexing_type == 'individual'){
      this.tableActionRecieve({action:'individual_indexing',data:e})
    }
  }

  save(){
    if(!this.checkAllFieldsAreInValid()){
      let req = {
        campaign_id : this.campaignId,
      }
      req = {...req,...this.subscriberLimit};
      if(this.subscriberLimit.indexing_type === 'combined'){
        this.subscriberLimit.recipients[0].list_id = null;
        this.recipients[0] =  this.subscriberLimit.recipients[0];
        // this.recipients.forEach(recipient => {
        //   recipient.send_to     = this.subscriberLimit.recipients[0].send_to;
        //   recipient.starting_at = this.subscriberLimit.recipients[0].starting_at;
        // })
      }
      let notIncludeRecipients = [];
      if(this.subscriberLimit.indexing_type == 'individual') {
        if(this.recipients && this.recipients.length) var list_id = this.recipients.map(x=>x?.list_id);
        if(this.savedRecipientLists && this.savedRecipientLists.length) {
          notIncludeRecipients = this.savedRecipientLists.filter(x => !list_id.includes(x['list_id']));
        }
      }
      
      req['recipients'] = this.subscriberLimit.indexing_type == 'individual' ? this.recipients.concat(notIncludeRecipients) : this.recipients;
      
      this.createEmailCampaignService.saveSubscriberLimit(req).subscribe(res => {
        if (res['success']) {
          this.common.openSnackBar(res['message'], 'success');
          this.closeDrawer('subscriber-limit');
        }
        else {
          this.common.openSnackBar(res['message'], 'error');
        }
      }, err => {
        this.common.openSnackBar(err['error']['message'], 'error');
      })
    }
  }

  close(){
    this.subscriberLimit = {
      setSubscriberLimit:false,
      indexing_type:this.copy_indexing_type,
      recipients:[]
    }
    this.closeDrawer('subscriber-limit');
  }

  closeDrawer(id: string) {
    this.getSubsLimitData.emit(this.subscriberLimit);
    this.showDrawer = false;
    this.common.close(id);
  }

  checkAllFieldsAreInValid(){
    let oneData = 0;
    let Length = this.subscriberLimit.recipients.length;

    for(let i = 0; i < Length; i++){
      if((this.subscriberLimit.recipients[i].send_to && !this.subscriberLimit.recipients[i].starting_at) 
      || (!this.subscriberLimit.recipients[i].send_to && this.subscriberLimit.recipients[i].starting_at)){
        oneData++;
      }
    }
    let returnval = false;
    if( this.invalidEntry){
      this.common.openSnackBar("Please check the entry again", 'error');
      returnval = true;
    }
    return returnval;
  }

  receiveActionEvt(e) {
    if(e && e['type'] == 'reset') {
      e['data']['send_to'] = ''; 
      e['data']['starting_at'] = '';
      if(this.savedRecipientLists && this.savedRecipientLists.length) {
        this.savedRecipientLists = this.savedRecipientLists.filter(x => !x['list_id'].includes(e['data']['list_id']));
        this.recipients = this.recipients.filter(x => !x['list_id'].includes(e['data']['list_id']));
      }
    }
  } 

  ngOnInit(): void {
  }

}
