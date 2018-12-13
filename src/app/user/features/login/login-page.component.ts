import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {HttpResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';

import {of, Subscription, throwError} from 'rxjs';
import {catchError, distinctUntilChanged, filter, first, map, shareReplay, switchMap, switchMapTo, tap} from 'rxjs/operators';

import {AuthorizationCodeGrantRedirect, SetAuthToken, SetTokenPersistenceIsEnabled} from '../../../common/auth/auth.actions';
import {AuthorizationCodeGrantRequest} from '../../../common/auth/authorization-code-grant.model';
import {AuthService} from '../../../common/auth/auth.service';
import {isNotUndefined} from '../../../common/common.types';
import {ResourceOwnerPasswordGrantApplication} from '../../../common/auth/application.model';

/**
 * Login features for a resource owner of the application.
 *
 * Once the resource owner grant has been issued, the
 * features will request an authorization code and then
 * redirect the features to the predeterimined redirect uri
 */
@Component({
  selector: 'app-user-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: [
    './login-page.component.scss'
  ]
})
export class UserLoginPageComponent implements OnInit, OnDestroy {
  readonly app: ResourceOwnerPasswordGrantApplication;

  constructor(
    readonly store: Store<object>,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService<any>,
    @Inject(DOCUMENT) readonly document: Document
  ) {
    const app = this.authService.apps['login'];
    if (!app || app.type !== 'password') {
      throw new Error('login application must be of grant type \'password\'');
    }
    this.app = app;
  }

  readonly codeGrantRequest$ = this.activatedRoute.queryParamMap.pipe(
    map(queryMap => AuthorizationCodeGrantRequest.fromQueryParams(queryMap)),
    shareReplay(1)
  );
  private codeGrantRequestSubscription = this.codeGrantRequest$.subscribe();
  private redirectOnLoginSubscription = this.app.state$.pipe(
    map(state => state.token),
    filter(isNotUndefined),
    distinctUntilChanged(),
    switchMapTo(this.codeGrantRequest$.pipe(first())),
    // When we have a successful login, generate an auth token for the requested client id
    switchMap((request: AuthorizationCodeGrantRequest) => {
      return this.app.requestAuthorizationCodeForClientId(request).pipe(
        map((response) => ({redirectUri: request.redirectUri, response}))
      );
    })
  ).subscribe(({redirectUri, response}) => {
    console.log('issuing redirect to', redirectUri, response);
    this.store.dispatch(new AuthorizationCodeGrantRedirect(redirectUri, response, {app: 'login'}));
  });
  readonly resourceOwnerCredentialsForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  readonly rememberMeControl = new FormControl(false);
  private readonly rememberMeSubscription = this.rememberMeControl.valueChanges.subscribe(
    rememberMe => this.store.dispatch(new SetTokenPersistenceIsEnabled(rememberMe, {app: 'login'}))
  );

  ngOnDestroy() {
    this.codeGrantRequestSubscription.unsubscribe();
    this.rememberMeSubscription.unsubscribe();
    this.redirectOnLoginSubscription.unsubscribe();
  }

  login() {
    // TODO: Check validity
    const credentials = this.resourceOwnerCredentialsForm.value as {username: string, password: string};
    this.app.requestGrant(credentials).pipe(
      tap((authToken) => {
        this.store.dispatch(new SetAuthToken(authToken, {app: 'login'}));
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
