import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { GifService } from '../../../services/gifs.service';

interface MenuOption {
  icon: string;
  label: string;
  route: string;
  subLabel: string;
}

@Component({
  selector: 'gifs-side-menu-options',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './side-menu-options.component.html',
  styles: [`
    :host {
      display: block;
      flex-grow: 1;
      overflow: auto;
    }
  `],
})
export class SideMenuOptionsComponent {

  GifService = inject(GifService)
  private router = inject(Router);

  @Output() requestClose = new EventEmitter<void>();

  onNavigate() {
    this.requestClose.emit();
  }

  menuOptions: MenuOption[] = [
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Trending',
      subLabel: 'Gifs Populares',
      route: '/dashboard/trending',
    },
    {
      icon: 'fa-solid fa-magnifying-glass',
      label: 'Buscador',
      subLabel: 'Buscar gifs',
      route: '/dashboard/search',
    },
  ];

  deleteSearch(tag: string) {
    if (this.router.url.includes(tag)) {
      this.router.navigate(['/dashboard']);
    }

    this.GifService.deleteSearchFromHistory(tag);
  }
}
