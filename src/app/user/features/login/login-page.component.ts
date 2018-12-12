import {Component, Inject, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {HttpResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';

import {of, throwError} from 'rxjs';
import {catchError, filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';

import {FinalizeAuthorizationCodeGrant, SetAuthToken, SetTokenPersistenceIsEnabled} from '../../../common/auth/auth.actions';
import {AuthorizationCodeGrantRequest} from '../../../common/auth/authorization-code-grant.model';
import {AuthService} from '../../../common/auth/auth.service';
import {isNotUndefined} from '../../../common/common.types';

/**
 * Login page for a resource owner of the application.
 *
 * Once the resource owner grant has been issued, the
 * page will request an authorization code and then
 * redirect the page to the predeterimined redirect uri
 */
@Component({
  selector: 'app-user-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: [
    './login-page.component.scss'
  ]
})
export class UserLoginPageComponent implements OnDestroy {
  constructor(
    readonly store: Store<object>,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    @Inject(DOCUMENT) readonly document: Document
  ) {}

  readonly codeGrantRequest$ = this.activatedRoute.queryParamMap.pipe(
    map(queryMap => AuthorizationCodeGrantRequest.fromQueryParams(queryMap)),
    shareReplay(1)
  );
  private codeGrantRequestSubscription = this.codeGrantRequest$.subscribe();

  readonly redirectOnLoginSubscription = this.authService.token$.pipe(
    filter(isNotUndefined),
    // When we have a successful login, generate an auth token for the requested client id
    switchMap((request: AuthorizationCodeGrantRequest) => {
      return this.authService.getAuthorizationCodeForClientId(request).pipe(
        map((response) => ({redirectUri: request.redirectUri, response}))
      );
    })
  ).subscribe(({redirectUri, response}) => {
    this.store.dispatch(new FinalizeAuthorizationCodeGrant(redirectUri, response));
  });


  readonly resourceOwnerCredentialsForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  readonly rememberMeControl = new FormControl(false);
  private readonly rememberMeSubscription = this.rememberMeControl.valueChanges.subscribe(
    rememberMe => this.store.dispatch(new SetTokenPersistenceIsEnabled(rememberMe))
  );

  ngOnDestroy() {
    this.codeGrantRequestSubscription.unsubscribe();
    this.rememberMeSubscription.unsubscribe();
    this.redirectOnLoginSubscription.unsubscribe();
  }

  login(){
    // TODO: Check validity
    const credentials = this.resourceOwnerCredentialsForm.value as {username: string, password: string};
    this.authService.submitResourceOwnerCredentialsGrantRequest(credentials).pipe(
      tap((authToken) => {
        this.store.dispatch(new SetAuthToken(authToken));
      }),
      catchError((err) => {
        if (err instanceof HttpResponse) {
          return of(undefined);
        }
        return throwError(err);
      })
    ).subscribe(
      (token) => console.log('login successful', token)
    );
  }


}
