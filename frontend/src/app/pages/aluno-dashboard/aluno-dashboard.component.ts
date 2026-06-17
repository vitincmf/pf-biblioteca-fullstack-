import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';

@Component({
  selector: 'app-aluno-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Dashboard do aluno</h2>
        <p *ngIf="usuario">Ola, {{ usuario.nome }}. Acompanhe seu acervo e historico.</p>
      </div>
      <nav class="inline-nav">
        <a routerLink="/aluno/perfil">Perfil</a>
        <a routerLink="/aluno/livros">Livros</a>
        <a routerLink="/aluno/historico">Historico</a>
      </nav>
    </section>

    <section>
      <h2>Atalhos</h2>
      <div class="shortcut-grid">
        <a routerLink="/aluno/perfil">
          <strong>Perfil</strong>
          <span>Atualizar dados pessoais e senha.</span>
        </a>
        <a routerLink="/aluno/livros">
          <strong>Livros</strong>
          <span>Consultar acervo e disponibilidade.</span>
        </a>
        <a routerLink="/aluno/historico">
          <strong>Historico</strong>
          <span>Ver seus emprestimos e situacoes.</span>
        </a>
      </div>
    </section>

    <section>
      <h2>Meus emprestimos por status</h2>
      <p *ngIf="erroResumo" class="error">{{ erroResumo }}</p>

      <table *ngIf="resumoPorStatus.length">
        <thead>
          <tr>
            <th>Status</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of resumoPorStatus">
            <td>{{ item.status }}</td>
            <td>{{ item.quantidade }}</td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!resumoPorStatus.length && !erroResumo">
        Nenhum emprestimo encontrado para gerar o resumo.
      </p>
    </section>
  `
})
export class AlunoDashboardComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  resumoPorStatus: any[] = [];
  erroResumo = '';

  constructor(private api: ApiService) {
    this.usuario = this.api.obterUsuarioAtual();
  }

  ngOnInit() {
    this.carregarResumoPorStatus();
  }

  carregarResumoPorStatus() {
    if (!this.usuario) return;

    this.api.emprestimosPorStatusAluno(this.usuario.id_usuario).subscribe({
      next: (res) => this.resumoPorStatus = res.resumo || [],
      error: (error) => this.tratarErro(error)
    });
  }

  tratarErro(error: HttpErrorResponse) {
    this.erroResumo = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
