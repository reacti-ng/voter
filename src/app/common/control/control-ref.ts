/* tslint:disable: member-ordering */

import * as uuid from 'uuid';
import {Map} from 'immutable';

import {ComponentRef, Type} from '@angular/core';
import {createSelector, select, Selector, Store} from '@ngrx/store';

import {ControlState} from './control.state';
import {Control} from './control.model';
import {SetControlIsDisabled, SetControlValue, TouchControl} from './control.actions';
import {Observable} from 'rxjs';

export class ControlRef<T, V> {
  static forState<T, V>(refMap: ControlRefMap<T>, state: ControlState<V>): ControlRef<T, V> {
    const maybeRef = refMap.get(state.controlRefId);
    if (maybeRef === undefined) {
      throw new Error(`ControlRef for ControlState (controlRefId: '${state.controlRefId}')`);
    }
    return maybeRef;
  }

  readonly name = this.component.componentType.name;
  readonly id = `${this.name}::${uuid.v4().substr(28)}`;

  readonly state$: Observable<ControlState<V>> = this.store.pipe(
    select(createSelector(this.controlStateSelector, (controls) => {
      const maybeState = controls.refStates.get(this.id);
      if (maybeState === undefined) {
        throw new Error(`ControlState undefined for ControlRef (controlRefId: ${this.id})`);
      }
      return maybeState;
    }))
  );

  constructor(
    private readonly componentRef: () => ComponentRef<T>,
    readonly store: Store<object>,
    readonly controlStateSelector: Selector<object, any /* ControlsState */>
  ) {}

  get component() {
    return this.componentRef();
  }

  setDisabled(isDisabled: boolean) {
    this.store.dispatch(new SetControlIsDisabled(this, isDisabled));
  }

  touch() {
    this.store.dispatch(new TouchControl(this));
  }

  commit(value: any): void {
    this.touch();
    this.store.dispatch(new SetControlValue(this, value));
  }

}

export type ControlRefMap<T, V = any> = Map<string, ControlRef<T, V>>;

export function refsForControl<T extends Type<any>>(refMap: ControlRefMap<T>, control: Control<T>) {
  return refMap
    .filter(ref => ref.name === control.name);
}
