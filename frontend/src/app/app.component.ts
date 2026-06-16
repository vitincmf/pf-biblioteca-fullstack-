import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService, UsuarioLogado } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public api: ApiService, private router: Router) {}

  get usuario(): UsuarioLogado | null {
    return this.api.obterUsuarioAtual();
  }

  logout() {
    this.api.logout();
    this.router.navigateByUrl('/login');
  }
}
