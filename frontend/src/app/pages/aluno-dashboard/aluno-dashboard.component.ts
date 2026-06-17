import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';
import { HistoricoComponent } from '../historico/historico.component';
import { LivrosComponent } from '../livros/livros.component';

@Component({
  selector: 'app-aluno-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LivrosComponent, HistoricoComponent],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Dashboard do aluno</h2>
        <p *ngIf="usuario">Ola, {{ usuario.nome }}</p>
      </div>
      <a routerLink="/historico">Abrir historico</a>
    </section>

    <section>
      <h2>Minha conta</h2>
      <div class="readonly-grid">
        <div><span>ID</span><strong>{{ conta.id_usuario || '-' }}</strong></div>
        <div><span>Status</span><strong>{{ conta.status || '-' }}</strong></div>
        <div><span>Matricula</span><strong>{{ conta.matricula || '-' }}</strong></div>
        <div><span>Curso</span><strong>{{ conta.curso || '-' }}</strong></div>
        <div><span>Semestre</span><strong>{{ conta.semestre || '-' }}</strong></div>
      </div>
      <div class="form-grid">
        <label>Nome <input [(ngModel)]="conta.nome"></label>
        <label>Email <input type="email" [(ngModel)]="conta.email"></label>
        <label>Endereco <input [(ngModel)]="conta.endereco"></label>
        <label class="wide">Observacao <textarea [(ngModel)]="conta.observacao"></textarea></label>
        <label>Nova senha <input type="password" [(ngModel)]="conta.senha"></label>
        <button (click)="atualizarConta()">Salvar conta</button>
        <button class="danger" (click)="desativarConta()">Desativar minha conta</button>
      </div>
      <p *ngIf="mensagemConta" class="notice">{{ mensagemConta }}</p>
      <p *ngIf="erroConta" class="error">{{ erroConta }}</p>
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

    <app-livros></app-livros>
    <app-historico></app-historico>
  `
})
export class AlunoDashboardComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  resumoPorStatus: any[] = [];
  erroResumo = '';
  mensagemConta = '';
  erroConta = '';
  conta: any = {
    nome: '',
    email: '',
    endereco: '',
    matricula: '',
    curso: '',
    semestre: null,
    observacao: '',
    senha: ''
  };

  constructor(private api: ApiService, private router: Router) {
    this.usuario = this.api.obterUsuarioAtual();
  }

  ngOnInit() {
    this.carregarConta();
    this.carregarResumoPorStatus();
  }

  carregarConta() {
    if (!this.usuario) return;

    this.api.detalheAluno(this.usuario.id_usuario).subscribe({
      next: (aluno) => this.conta = { ...aluno, senha: '' },
      error: (error) => this.tratarErroConta(error)
    });
  }

  atualizarConta() {
    if (!this.usuario) return;

    this.mensagemConta = '';
    this.erroConta = '';

    const payload = {
      nome: this.conta.nome,
      email: this.conta.email,
      endereco: this.conta.endereco,
      observacao: this.conta.observacao,
      ...(this.conta.senha ? { senha: this.conta.senha } : {})
    };

    this.api.atualizarAluno(this.usuario.id_usuario, payload).subscribe({
      next: (res) => {
        this.mensagemConta = res.mensagem || 'Conta atualizada com sucesso.';
        this.conta = { ...res.aluno, senha: '' };
        this.api.salvarUsuario({
          id_usuario: res.aluno.id_usuario,
          nome: res.aluno.nome,
          email: res.aluno.email,
          status: res.aluno.status,
          perfil: 'aluno'
        });
        this.usuario = this.api.obterUsuarioAtual();
      },
      error: (error) => this.tratarErroConta(error)
    });
  }

  desativarConta() {
    if (!this.usuario) return;

    if (!confirm('Deseja desativar sua conta?')) return;

    this.api.removerAluno(this.usuario.id_usuario).subscribe({
      next: () => {
        this.api.logout();
        this.router.navigateByUrl('/login');
      },
      error: (error) => this.tratarErroConta(error)
    });
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

  tratarErroConta(error: HttpErrorResponse) {
    this.erroConta = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
