import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';
import { HistoricoComponent } from '../historico/historico.component';
import { LivrosComponent } from '../livros/livros.component';

@Component({
  selector: 'app-aluno-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LivrosComponent, HistoricoComponent],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Dashboard do aluno</h2>
        <p *ngIf="usuario">Ola, {{ usuario.nome }}</p>
      </div>
      <a routerLink="/historico">Abrir historico</a>
    </section>

    <app-livros></app-livros>
    <app-historico></app-historico>
  `
})
export class AlunoDashboardComponent {
  usuario: UsuarioLogado | null = null;

  constructor(private api: ApiService) {
    this.usuario = this.api.obterUsuarioAtual();
  }
}
