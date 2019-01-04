import {Component, Input, InjectionToken, Inject} from '@angular/core';

export const DEFAULT_AVATAR_HREF = new InjectionToken<string>('DEFAULT_AVATAR_HREF');

@Component({
  selector: 'app-user-avatar',
  template: `<img [attr.src]="href || defaultAvatarHref" alt="avatar">`,
  styleUrls: ['avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() href: string | null | undefined;

  constructor(
    @Inject(DEFAULT_AVATAR_HREF) readonly defaultAvatarHref: string
  ) {}
}
