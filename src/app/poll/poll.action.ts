import {Set} from 'immutable';
import {Poll} from './poll.model';

export const ADD_POLL = 'features.poll: add poll';
export class AddPoll {
  readonly type = ADD_POLL;
  constructor(readonly poll: Poll) {}
}

export const ADD_MANY_POLLS = 'features.poll: add many polls';
export class AddManyPolls {
  readonly type = ADD_MANY_POLLS;
  constructor(readonly polls: Set<Poll>) {}
}

export type PollAction = AddPoll | AddManyPolls;
export function isPollAction(obj: any): obj is PollAction {
  return !!obj && [ADD_POLL, ADD_MANY_POLLS].includes(obj.type);
}
