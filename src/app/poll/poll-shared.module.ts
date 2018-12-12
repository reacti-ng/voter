import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PollListItemComponent} from './list-item/list-item.component';
import {PollService} from './poll.service';
import {reducePollState} from './poll.state';
import {StoreModule} from '@ngrx/store';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PollListItemComponent
  ],
  exports: [
    PollListItemComponent
  ]
})
export class PollSharedModule {
  static forRoot() {
   return {
     ngModule: PollSharedModule,
     providers: [
       PollService
     ]
   };
  }
}
