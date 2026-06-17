import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';

@Component({
  selector: 'app-aluno-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Perfil do aluno</h2>
        <p class="muted">Atualize seus dados pessoais e consulte seus dados academicos.</p>
      </div>
      <a routerLink="/aluno/dashboard">Voltar ao dashboard</a>
    </section>

    <section>
      <h2>Dados da conta</h2>
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
        <button (click)="atualizarConta()">Salvar alteracoes</button>
        <button class="danger" (click)="desativarConta()">Desativar minha conta</button>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>
    </section>
  `
})
export class AlunoPerfilComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  mensagem = '';
  erro = '';
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
  }

  carregarConta() {
    if (!this.usuario) return;

    this.api.detalheAluno(this.usuario.id_usuario).subscribe({
      next: (aluno) => this.conta = { ...aluno, senha: '' },
      error: (error) => this.tratarErro(error)
    });
  }

  atualizarConta() {
    if (!this.usuario) return;

    this.mensagem = '';
    this.erro = '';

    const payload = {
      nome: this.conta.nome,
      email: this.conta.email,
      endereco: this.conta.endereco,
      observacao: this.conta.observacao,
      ...(this.conta.senha ? { senha: this.conta.senha } : {})
    };

    this.api.atualizarAluno(this.usuario.id_usuario, payload).subscribe({
      next: (res) => {
        this.mensagem = res.mensagem || 'Conta atualizada com sucesso.';
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
      error: (error) => this.tratarErro(error)
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
      error: (error) => this.tratarErro(error)
    });
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
