import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterOutlet, SideMenuComponent, CommonModule],
  templateUrl: './dashboard-page.component.html',
})
export default class DashboardPageComponent {
  public sidebarVisible = signal(true);

  toggleSidebar() {
    this.sidebarVisible.update(value => !value);
  }
}