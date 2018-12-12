import {createEntityAdapter, EntityState} from '@ngrx/entity';
import {User} from './user.model';
import {Action, createFeatureSelector} from '@ngrx/store';
import {ADD_MANY_USERS, ADD_USER, isUserAction, SET_LOGIN_USER} from './user.actions';


export interface UserState extends EntityState<User> {
  readonly loginUser: User | undefined;
}

const userAdapter = createEntityAdapter<User>();
const userStateSelector = createFeatureSelector<UserState>('features.user');

const initialUserState = userAdapter.getInitialState({
  loginUser: undefined
});

export const UserState = {
  fromRoot: userStateSelector,
  loginUser: (userState: UserState) => userState.loginUser
};

export function reduceUserState(state: UserState = initialUserState, action: Action) {
  if (!isUserAction(action)) { return state; }
  switch (action.type) {
    case SET_LOGIN_USER:
      return {...state, loginUser: action.user};
    case ADD_USER:
      return userAdapter.addOne(action.user, state);
    case ADD_MANY_USERS:
      return userAdapter.addMany(action.users.toArray(), state);
    default:
      return state;
  }

}
