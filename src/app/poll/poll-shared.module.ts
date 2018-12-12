import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PollTimelineCardComponent} from './timeline-card/timeline-card.component';
import {PollService} from './poll.service';
import {PollTimelineComponent} from './timeline/timeline.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PollTimelineCardComponent,
    PollTimelineComponent
  ],
  exports: [
    PollTimelineComponent
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
