import {createFeatureSelector} from '@ngrx/store';
import {createEntityAdapter, EntityState} from '@ngrx/entity';
import {Poll} from './poll.model';
import {ADD_MANY_POLLS, ADD_POLL, PollAction} from './poll.action';

export interface PollState extends EntityState<Poll> {
}

const pollStateAdapter = createEntityAdapter<Poll>();
const initialPollState = pollStateAdapter.getInitialState({
});

export const PollState = {
  fromRoot: createFeatureSelector<PollState>('features.poll')
};

export function reducePollState(state: PollState = initialPollState, action: PollAction) {
  switch (action.type) {
    case ADD_POLL:
      return pollStateAdapter.addOne(action.poll, state);
    case ADD_MANY_POLLS:
      return pollStateAdapter.addMany(action.polls.toArray(), state);
    default:
      return state;
  }
}


