import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';
import { EmprestimosComponent } from '../emprestimos/emprestimos.component';
import { HistoricoComponent } from '../historico/historico.component';
import { LivrosComponent } from '../livros/livros.component';

@Component({
  selector: 'app-funcionario-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LivrosComponent,
    EmprestimosComponent,
    HistoricoComponent
  ],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Dashboard do funcionario</h2>
        <p *ngIf="usuario">Ola, {{ usuario.nome }}</p>
      </div>
      <nav class="inline-nav">
        <a routerLink="/livros">Livros</a>
        <a routerLink="/emprestimos">Emprestimos</a>
        <a routerLink="/historico">Relatorio</a>
      </nav>
    </section>

    <section>
      <h2>Minha conta</h2>
      <div class="readonly-grid">
        <div><span>ID</span><strong>{{ conta.id_usuario || '-' }}</strong></div>
        <div><span>Status</span><strong>{{ conta.status || '-' }}</strong></div>
        <div><span>Cargo</span><strong>{{ conta.cargo || '-' }}</strong></div>
        <div><span>Setor</span><strong>{{ conta.setor || '-' }}</strong></div>
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
      <h2>Categorias</h2>
      <div class="form-grid">
        <label>Nome <input [(ngModel)]="categoria.nome"></label>
        <label>Descricao <input [(ngModel)]="categoria.descricao"></label>
        <label>Cor <input type="color" [(ngModel)]="categoria.cor"></label>
        <label class="wide">Observacao <textarea [(ngModel)]="categoria.observacao"></textarea></label>
        <button (click)="criarCategoria()">Criar categoria</button>
      </div>

      <p *ngIf="mensagemCategoria" class="notice">{{ mensagemCategoria }}</p>
      <p *ngIf="erroCategoria" class="error">{{ erroCategoria }}</p>

      <table *ngIf="categorias.length">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Descricao</th><th>Cor</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of categorias">
            <td>{{ item.id_categoria }}</td>
            <td>{{ item.nome }}</td>
            <td>{{ item.descricao }}</td>
            <td><span class="color-dot" [style.background]="item.cor"></span>{{ item.cor }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Relatorios de categorias</h2>
      <div class="toolbar">
        <button (click)="carregarLivrosPorCategoria()">Livros por categoria</button>
        <button (click)="carregarCategoriasComMaisDeUmLivro()">Categorias com mais de um livro</button>
      </div>

      <p *ngIf="mensagemRelatorio" class="notice">{{ mensagemRelatorio }}</p>
      <p *ngIf="erroRelatorio" class="error">{{ erroRelatorio }}</p>

      <div class="report-grid">
        <div>
          <h3>GROUP BY + COUNT</h3>
          <table *ngIf="livrosPorCategoria.length">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Quantidade de livros</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of livrosPorCategoria">
                <td>{{ item.categoria }}</td>
                <td>{{ item.quantidade_livros }}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!livrosPorCategoria.length">Clique no botao para carregar.</p>
        </div>

        <div>
          <h3>HAVING COUNT &gt; 1</h3>
          <table *ngIf="categoriasComMaisDeUmLivro.length">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Quantidade de livros</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of categoriasComMaisDeUmLivro">
                <td>{{ item.categoria }}</td>
                <td>{{ item.quantidade_livros }}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!categoriasComMaisDeUmLivro.length">Clique no botao para carregar.</p>
        </div>
      </div>
    </section>

    <app-livros></app-livros>
    <app-emprestimos></app-emprestimos>
    <app-historico></app-historico>
  `
})
export class FuncionarioDashboardComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  categorias: any[] = [];
  livrosPorCategoria: any[] = [];
  categoriasComMaisDeUmLivro: any[] = [];
  mensagemConta = '';
  erroConta = '';
  mensagemCategoria = '';
  erroCategoria = '';
  mensagemRelatorio = '';
  erroRelatorio = '';
  categoria: any = {
    nome: '',
    descricao: '',
    cor: '#3366ff',
    observacao: 'Categoria criada pelo frontend'
  };
  conta: any = {
    nome: '',
    email: '',
    endereco: '',
    cargo: '',
    setor: '',
    observacao: '',
    senha: ''
  };

  constructor(private api: ApiService, private router: Router) {
    this.usuario = this.api.obterUsuarioAtual();
  }

  ngOnInit() {
    this.carregarConta();
    this.carregarCategorias();
  }

  carregarConta() {
    if (!this.usuario) return;

    this.api.detalheFuncionario(this.usuario.id_usuario).subscribe({
      next: (funcionario) => this.conta = { ...funcionario, senha: '' },
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

    this.api.atualizarFuncionario(this.usuario.id_usuario, payload).subscribe({
      next: (res) => {
        this.mensagemConta = res.mensagem || 'Conta atualizada com sucesso.';
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
      error: (error) => this.tratarErroConta(error)
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
      error: (error) => this.tratarErroConta(error)
    });
  }

  carregarCategorias() {
    this.api.listarCategorias().subscribe({
      next: (dados) => this.categorias = dados,
      error: (error) => this.tratarErro(error)
    });
  }

  criarCategoria() {
    this.mensagemCategoria = '';
    this.erroCategoria = '';

    this.api.criarCategoria(this.categoria).subscribe({
      next: () => {
        this.mensagemCategoria = 'Categoria criada com sucesso.';
        this.categoria = {
          nome: '',
          descricao: '',
          cor: '#3366ff',
          observacao: 'Categoria criada pelo frontend'
        };
        this.carregarCategorias();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  carregarLivrosPorCategoria() {
    this.mensagemRelatorio = '';
    this.erroRelatorio = '';

    this.api.livrosPorCategoria().subscribe({
      next: (dados) => {
        this.livrosPorCategoria = dados;
        this.mensagemRelatorio = 'Relatorio GROUP BY + COUNT carregado.';
      },
      error: (error) => this.tratarErroRelatorio(error)
    });
  }

  carregarCategoriasComMaisDeUmLivro() {
    this.mensagemRelatorio = '';
    this.erroRelatorio = '';

    this.api.categoriasComMaisDeUmLivro().subscribe({
      next: (dados) => {
        this.categoriasComMaisDeUmLivro = dados;
        this.mensagemRelatorio = 'Relatorio com HAVING carregado.';
      },
      error: (error) => this.tratarErroRelatorio(error)
    });
  }

  tratarErro(error: HttpErrorResponse) {
    this.erroCategoria = error.error?.erro || JSON.stringify(error.error || error.message);
  }

  tratarErroConta(error: HttpErrorResponse) {
    this.erroConta = error.error?.erro || JSON.stringify(error.error || error.message);
  }

  tratarErroRelatorio(error: HttpErrorResponse) {
    this.erroRelatorio = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
