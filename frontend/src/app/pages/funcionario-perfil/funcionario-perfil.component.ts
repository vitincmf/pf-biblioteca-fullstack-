import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';

@Component({
  selector: 'app-funcionario-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Perfil do funcionario</h2>
        <p class="muted">Atualize seus dados pessoais e consulte seus dados funcionais.</p>
      </div>
      <a routerLink="/funcionario/dashboard">Voltar ao dashboard</a>
    </section>

    <section>
      <h2>Dados da conta</h2>
      <div class="readonly-grid">
        <div><span>ID</span><strong>{{ conta.id_usuario || '-' }}</strong></div>
        <div><span>Status</span><strong>{{ conta.status || '-' }}</strong></div>
        <div><span>Perfil</span><strong>funcionario</strong></div>
        <div><span>Cargo</span><strong>{{ conta.cargo || '-' }}</strong></div>
        <div><span>Setor</span><strong>{{ conta.setor || '-' }}</strong></div>
        <div><span>Salario</span><strong>{{ conta.salario || '-' }}</strong></div>
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
export class FuncionarioPerfilComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  mensagem = '';
  erro = '';
  conta: any = {
    nome: '',
    email: '',
    endereco: '',
    cargo: '',
    setor: '',
    salario: '',
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

    this.api.detalheFuncionario(this.usuario.id_usuario).subscribe({
      next: (funcionario) => this.conta = { ...funcionario, senha: '' },
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

    this.api.atualizarFuncionario(this.usuario.id_usuario, payload).subscribe({
      next: (res) => {
        this.mensagem = res.mensagem || 'Conta atualizada com sucesso.';
        this.conta = { ...res.funcionario, senha: '' };
        this.api.salvarUsuario({
          id_usuario: res.funcionario.id_usuario,
          nome: res.funcionario.nome,
          email: res.funcionario.email,
          status: res.funcionario.status,
          perfil: 'funcionario'
        });
        this.usuario = this.api.obterUsuarioAtual();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  desativarConta() {
    if (!this.usuario) return;

    if (!confirm('Deseja desativar sua conta?')) return;

    this.api.removerFuncionario(this.usuario.id_usuario).subscribe({
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
