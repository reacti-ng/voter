import {Set} from 'immutable';
import {User} from './user.model';


export const SET_LOGIN_USER = 'core.user: set login user';
export class SetLoginUser {
  readonly type = SET_LOGIN_USER;
  constructor(readonly user: User) {}
}

export const ADD_USER = 'core.user: add user';
export class AddUser {
  readonly type = ADD_USER;
  constructor(readonly user: User) {}
}

export const ADD_MANY_USERS = 'core.user: add many users';
export class AddManyUsers {
  readonly type = ADD_MANY_USERS;
  constructor(readonly users: Set<User>) {}
}

export type UserAction = SetLoginUser | AddUser | AddManyUsers;

export function isUserAction(obj: any): obj is UserAction {
  return !!obj && [SET_LOGIN_USER, ADD_USER, ADD_MANY_USERS].includes(obj.type);
}
