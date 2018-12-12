import {ControlRef} from './control-ref';
import {Type} from '@angular/core';
import {ControlState} from './control.state';

export const REGISTER_CONTROL = 'control:register';
export class RegisterControl<T> {
  readonly type = REGISTER_CONTROL;
  constructor(readonly componentType: Type<T>) {}
}

export const INIT_CONTROL = 'control:init';
export class InitControl<V> {
  readonly type = INIT_CONTROL;
  constructor(readonly controlRef: ControlRef<any, V>, readonly initialState: ControlState<V>) {}
}

export const DESTROY_CONTROL = 'control:destroy';
export class DestroyControl {
  readonly type = DESTROY_CONTROL;
  constructor(readonly controlRef: ControlRef<any, any>) {}
}

export const SET_CONTROL_VALUE = 'control:set-value';
export class SetControlValue<V> {
  readonly type = SET_CONTROL_VALUE;
  constructor(readonly controlRef: ControlRef<any, V>, readonly value: V) {}
}

export const COMMIT_CONTROL = 'control:commit';
export class CommitControl {
  readonly type = COMMIT_CONTROL;
  constructor(readonly controlRef: ControlRef<any, any>) {}
}

export const SET_CONTROL_IS_DISABLED = 'control:set-disabled';
export class SetControlIsDisabled {
  readonly type = SET_CONTROL_IS_DISABLED;

  constructor(readonly controlRef: ControlRef<any, any>, readonly isDisabled: boolean) {}
}

export const TOUCH_CONTROL = 'control:set-is-touched';
export class TouchControl {
  readonly type = TOUCH_CONTROL ;
  constructor(readonly controlRef: ControlRef<any, any>) {}
}

export type ControlInstanceAction
    = InitControl<any>
    | DestroyControl
    | SetControlValue<any>
    | CommitControl
    | SetControlIsDisabled
    | TouchControl;

export type ControlAction
  = ControlInstanceAction
  | RegisterControl<any>;

export function isControlAction(obj: any): obj is ControlAction {
  return !!obj && [
    INIT_CONTROL,
    DESTROY_CONTROL,
    SET_CONTROL_VALUE,
    COMMIT_CONTROL,
    SET_CONTROL_IS_DISABLED,
    TOUCH_CONTROL,
    REGISTER_CONTROL
  ].includes(obj.type);
}




