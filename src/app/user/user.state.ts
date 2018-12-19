import {createEntityAdapter, EntityState} from '@ngrx/entity';
import {User} from './user.model';
import {Action, createFeatureSelector, createSelector} from '@ngrx/store';
import {ADD_MANY_USERS, ADD_USER, isUserAction, SET_LOGIN_USER_ID, UPSERT_USER} from './user.actions';


export interface UserState extends EntityState<User> {
  readonly loginUserId: string | undefined;
}

const userAdapter = createEntityAdapter<User>();
const userStateSelector = createFeatureSelector<UserState>('core.user');

const {selectIds, selectEntities, selectAll, selectTotal} = {...userAdapter.getSelectors() };
const selectLoginUserId = (userState: UserState) => userState.loginUserId;
const selectLoginUser = createSelector(
  selectEntities,
  selectLoginUserId,
  (entities, id) => id ? entities[id] : undefined
);

const initialUserState = userAdapter.getInitialState({
  loginUserId: undefined
});

export const UserState = {
  fromRoot: userStateSelector,

  selectUserIds: createSelector(userStateSelector, selectIds),
  selectUserEntities: createSelector(userStateSelector, selectEntities),
  selectAllUsers: createSelector(userStateSelector, selectAll),
  selectTotalUsers: createSelector(userStateSelector, selectTotal),

  selectLoginUserId: createSelector(userStateSelector, selectLoginUserId),
  selectLoginUser: createSelector(userStateSelector, selectLoginUser)
};

export function reduceUserState(state: UserState = initialUserState, action: Action): UserState {
  if (!isUserAction(action)) { return state; }
  switch (action.type) {
    case SET_LOGIN_USER_ID:
      return {...state, loginUserId: action.userId};
    case ADD_USER:
      return userAdapter.addOne(action.user, state);
    case ADD_MANY_USERS:
      return userAdapter.addMany(action.users.toArray(), state);
    case UPSERT_USER:
      return userAdapter.upsertOne(action.user, state);
    default:
      return state;
  }

}
