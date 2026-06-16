import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

    <app-livros></app-livros>
    <app-emprestimos></app-emprestimos>
    <app-historico></app-historico>
  `
})
export class FuncionarioDashboardComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  categorias: any[] = [];
  mensagemCategoria = '';
  erroCategoria = '';
  categoria: any = {
    nome: '',
    descricao: '',
    cor: '#3366ff',
    observacao: 'Categoria criada pelo frontend'
  };

  constructor(private api: ApiService) {
    this.usuario = this.api.obterUsuarioAtual();
  }

  ngOnInit() {
    this.carregarCategorias();
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

  tratarErro(error: HttpErrorResponse) {
    this.erroCategoria = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
