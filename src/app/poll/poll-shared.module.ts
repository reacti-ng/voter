import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PollService} from './poll.service';
import {PollTimelineModule} from './timeline/timeline.module';
import {PollCreateComponent} from './create/create.component';


@NgModule({
  imports: [
    CommonModule,
    PollTimelineModule
  ],
  declarations: [
    PollCreateComponent
  ],
  exports: [
    PollTimelineModule
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
