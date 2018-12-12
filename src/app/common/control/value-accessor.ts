import {ControlValueAccessor} from '@angular/forms';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Injectable, Type} from '@angular/core';
import {ControlRef} from './control-ref';
import {Store} from '@ngrx/store';
import {SetControlIsDisabled, SetControlValue} from './control.actions';

@Injectable()
export class ValueAccessor<T extends Type<any>, V> implements ControlValueAccessor {
  private onChangeSubscription = Subscription.EMPTY;
  private onTouchSubscription = Subscription.EMPTY;

  constructor(
    private readonly controlRef: ControlRef<T, V>,
    private readonly store: Store<any>,
  ) {
    controlRef.component.onDestroy(() => {
      this.onChangeSubscription.unsubscribe();
      this.onTouchSubscription.unsubscribe();
    });
  }

  registerOnChange(fn: any): void {
    if (!this.onChangeSubscription.closed) {
      this.onChangeSubscription.unsubscribe();
    }
    this.onChangeSubscription = this.controlRef.state$.pipe(
      filter(state => state.value !== undefined),
      map(state => state.value)
    ).subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    if (!this.onTouchSubscription.closed) {
      this.onTouchSubscription.unsubscribe();
    }
    this.onTouchSubscription = this.controlRef.state$.pipe(
      map(state => state.isTouched)
    ).subscribe(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.store.dispatch(new SetControlIsDisabled(this.controlRef, isDisabled));
  }

  writeValue(value: any): void {
    this.store.dispatch(new SetControlValue(this.controlRef, value));
  }
}



