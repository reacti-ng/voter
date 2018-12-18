import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PollTimelineComponent} from './timeline.component';
import {PollTimelineCardComponent} from './card/timeline-card.component';


@NgModule({
  imports: [CommonModule],
  declarations: [
    PollTimelineCardComponent,
    PollTimelineComponent
  ],
  exports: [
    PollTimelineComponent
  ]
})
export class PollTimelineModule {}
