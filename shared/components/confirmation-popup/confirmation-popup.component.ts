import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.css']
})
export class ConfirmationPopupComponent implements OnInit {

  @Input() message: any;
  subscription: Subscription
  @Input() id: any;
  @Input() data: any;
  @Input() migrationType: any;
  @Input() messageConfirmation: any;
  @Input() openModalType: any;
  @Input() response: any
  @Output() actionEvent: EventEmitter<any> = new EventEmitter();
  @Output() resetEvent: EventEmitter<any> = new EventEmitter();
  loader = false;
  constructor(private common: CommonService) { }

  ngOnInit(): void {
  }

  cancel(id){
    this.common.close(id);
    this.resetEvent.emit(true)
  }

  ok(){
    this.loader = true
    this.actionEvent.emit(true)
  }
}
