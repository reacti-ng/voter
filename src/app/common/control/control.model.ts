import {Type} from '@angular/core';
import {ControlRef} from './control-ref';

export interface Control<T> {
  readonly name: string;
  readonly componentType: Type<T>;
}

export type ControlMap<T, V = any> = Map<string, Control<T>>;

export function controlForType<T>(controlMap: ControlMap<T>, type: Type<T>): Control<T> {
  const maybeControl = controlMap.get(type.name);
  if (maybeControl === undefined) {
    throw new Error('Control type was undefined');
  }
  return maybeControl;
}

