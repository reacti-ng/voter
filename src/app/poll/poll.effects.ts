import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Effect} from '@ngrx/effects';


@Injectable()
export class PollEffects {
  constructor(
    readonly router: Router
  ) {}

}
