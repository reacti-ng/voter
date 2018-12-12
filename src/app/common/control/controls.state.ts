import {ControlRef, ControlRefMap, refsForControl} from './control-ref';
import {ControlState, ControlStateMap, reduceControlState} from './control.state';
import {InjectionToken} from '@angular/core';
import {Action, createFeatureSelector, createSelector, Selector} from '@ngrx/store';

import {Map} from 'immutable';
import {Control} from './control.model';
import {DESTROY_CONTROL, INIT_CONTROL, isControlAction, REGISTER_CONTROL} from './control.actions';


export interface ControlsState {
  readonly controls: Map<string, Control<any>>;

  readonly refs: ControlRefMap<any>;
  readonly refStates: ControlStateMap<any>;
}

export const ControlsState = {
  initial: {
    controls: Map<string, Control<any>>(),
    refs: Map<string, ControlRef<any, any>>(),
    refStates: Map<string, ControlState<any>>()
  },
  fromRoot: createFeatureSelector('common.control'),

  selectRefForState: <V>(state: ControlState<V>) => createSelector(
    (registry: ControlsState) => ControlRef.forState(registry.refs, state)
  ),

  selectRefsForControl: <T>(control: Control<T>) => createSelector(
    (registry: ControlsState) => refsForControl(registry.refs, control)
  ),
};

export const CONTROLS_STATE_SELECTOR = new InjectionToken<Selector<object, ControlsState>>('CONTROLS_STATE_SELECTOR');

export function reduceControlsState(state: ControlsState = ControlsState.initial, action: Action): ControlsState {
  if (!isControlAction(action)) {
    return state;
  }
  switch (action.type) {
    case REGISTER_CONTROL:
      const name = action.componentType.name;
      if (state.controls.has(name)) {
        throw new Error(`Control ${name} already registered`);
      }
      return {
        ...state,
        controls: state.controls.set(action.componentType.name, {
          name: action.componentType.name,
          componentType: action.componentType,
        })
      };

    case INIT_CONTROL:
      if (state.refs.has(action.controlRef.id)) {
        throw new Error(`Control ${action.controlRef.id} already initialized`);
      }

      return {
        ...state,
        refs: state.refs.set(action.controlRef.id, action.controlRef),
        refStates: state.refStates.set(action.controlRef.id, action.initialState)
      };

    case DESTROY_CONTROL:
      if (!state.refs.has(action.controlRef.id)) {
        throw new Error(`Control already destroyed`);
      }
      return {
        ...state,
        refs: state.refs.delete(action.controlRef.id),
        refStates: state.refStates.delete(action.controlRef.id)
      };

    default:
      const maybeControlState = state.refStates.get(action.controlRef.id);
      if (maybeControlState === undefined) {
        throw new Error(`No state for control (controlRefId: ${action.controlRef.id}`);
      }
      const controlState = reduceControlState(maybeControlState, action);

      return {
        ...state,
        refStates: state.refStates.set(action.controlRef.id, controlState)
      };
  }
}



