import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './bottom-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixed bottom-0 w-full bg-ocean-base border-t border-ocean-light z-50 rounded-t-xl'
  }
})
export class BottomNav {
}