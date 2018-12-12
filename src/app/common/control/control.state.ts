import {isBoolean} from '../common.types';
import {Map} from 'immutable';
import {Control} from './control.model';
import {
  COMMIT_CONTROL,
  SET_CONTROL_IS_DISABLED,
  SET_CONTROL_VALUE,
  TOUCH_CONTROL,
  ControlAction
} from './control.actions';

export interface ControlState<V> {
  readonly controlRefId: string;
  readonly isTouched: boolean;
  readonly isDisabled: boolean;

  readonly committedValue: V | undefined;
  readonly value: V;
}
export function isControlState(obj: any): obj is ControlState<any> {
  return !!obj
    && isBoolean(obj.isDisabled)
    && isBoolean(obj.isTouched);
}

export function initialControlState<V>(controlRefId: string, value: V): ControlState<V> {
  return {
    controlRefId,
    value,
    committedValue: undefined,
    isTouched: false,
    isDisabled: false
  };
}

export type ControlStateMap<V> = Map<string, ControlState<V>>;

export function statesForControl<T, V>(stateMap: ControlStateMap<V>, control: Control<T>): ControlStateMap<V> {
  return stateMap
    .filter((value, key) => key.startsWith(control.name));
}


export function reduceControlState(state: ControlState<any>, action: ControlAction): ControlState<any> {
  switch (action.type) {
    case SET_CONTROL_VALUE:
      return {...state, value: action.value};
    case COMMIT_CONTROL:
      return { ...state, committedValue: state.value };
    case TOUCH_CONTROL:
      return {...state, isTouched: true};
    case SET_CONTROL_IS_DISABLED:
      return {...state, isDisabled: action.isDisabled};
    default:
      return state;
  }
}
