import {Set} from 'immutable';
import {User} from './user.model';


export const SET_LOGIN_USER_ID = 'core.user: set login user id';
export class SetLoginUserId {
  readonly type = SET_LOGIN_USER_ID;
  constructor(readonly userId: string | undefined) {}
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

export const UPSERT_USER = 'core.user: upsert user';
export class UpsertUser {
  readonly type = UPSERT_USER;
  constructor(readonly user: User) {}
}

export type UserAction = SetLoginUserId | AddUser | AddManyUsers | UpsertUser;

export function isUserAction(obj: any): obj is UserAction {
  return !!obj && [SET_LOGIN_USER_ID, ADD_USER, ADD_MANY_USERS, UPSERT_USER].includes(obj.type);
}
