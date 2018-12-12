import {List} from 'immutable';
import {Component, Input} from '@angular/core';
import {Poll} from '../poll.model';

/**
 * Summary of a poll intended for display in a list of polls
 */
@Component({
  selector: 'app-poll-list-item',
  templateUrl: './list-item.component.html'
})
export class PollListItemComponent {
  @Input() poll: Poll | undefined;
}
