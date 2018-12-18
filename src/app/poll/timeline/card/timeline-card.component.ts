import {Component, Input} from '@angular/core';
import {Poll} from '../../poll.model';

/**
 * Summary of a poll intended for display in a list of polls
 */
@Component({
  selector: 'app-poll-timeline-card',
  templateUrl: './timeline-card.component.html'
})
export class PollTimelineCardComponent {
  @Input() poll: Poll | undefined;
}
