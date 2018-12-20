import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  ViewContainerRef
} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {ControlRef} from './control-ref';
import {createSelector, select, Selector, Store} from '@ngrx/store';
import {CONTROLS_STATE_SELECTOR, ControlsState} from './controls.state';
import {filter, map, shareReplay, takeUntil} from 'rxjs/operators';
import {ControlState, initialControlState} from './control.state';
import {isNotUndefined} from '../common.types';
import {StaticInjector} from '@angular/core/src/di/injector';
import {InitControl} from './control.actions';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ValueAccessor} from './value-accessor';

@Component({
  selector: 'app-control-outlet',
  template: ``
})
export class AppControlOutletComponent implements OnDestroy, AfterViewInit {
  private readonly controlSubject = new BehaviorSubject<string | undefined>(undefined);

  readonly control$ = this.controlSubject.pipe(
    filter((value): value is string => typeof value === 'string')
  );

  /** The registered control with the specified name */
  @Input() set control(value: string) {
    this.controlSubject.next(value);
  }

  /** The _initial_ value for the input. Only checked once, after view init */
  @Input() initial: any;

  constructor(
    readonly injector: Injector,
    readonly componentFactoryResolver: ComponentFactoryResolver,
    readonly viewContainer: ViewContainerRef,
    readonly store: Store<object>,
    @Inject(CONTROLS_STATE_SELECTOR) readonly controlsStateSelector: Selector<object, ControlsState>
  ) {}

  readonly controlComponentType$ = combineLatest(
    this.store.pipe(
      select(createSelector(this.controlsStateSelector, (controlState: ControlsState) => controlState.controls))
    ),
    this.control$
  ).pipe(
    map(([controls, controlName]) => {
      const maybeControl = controls.get(controlName);
      if (maybeControl == null) {
        throw new Error(`No registered control named '${controlName}'`);
      }
      return maybeControl.componentType;
    }),
    takeUntil(this.controlSubject),
    shareReplay(1)
  );

  ngAfterViewInit() {
    this.controlComponentType$.pipe(
      map(componentType => this.componentFactoryResolver.resolveComponentFactory(componentType)),
    ).subscribe((componentFactory) => {
      let componentRef: ComponentRef<any>;

      const injector = new StaticInjector(
        [
          {provide: ControlRef, useValue: new ControlRef(() => componentRef, this.store, this.controlsStateSelector)},
          {provide: ValueAccessor, useClass: ValueAccessor, deps: [ControlRef, Store]},
          {provide: NG_VALUE_ACCESSOR, useExisting: ValueAccessor, multi: true}
        ],
        this.injector
      );
      componentRef = this.viewContainer.createComponent(componentFactory, 0, injector);
      const controlRef = injector.get(ControlRef);

      this.store.dispatch(new InitControl(controlRef, initialControlState(this.initial, controlRef.id)));
    });
  }

  ngOnDestroy() {
    this.controlSubject.complete();
  }

}
