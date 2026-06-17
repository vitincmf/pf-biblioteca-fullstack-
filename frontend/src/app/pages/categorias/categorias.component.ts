import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Categorias</h2>
        <p class="muted">Cadastre e organize as categorias do acervo.</p>
      </div>
      <a routerLink="/funcionario/dashboard">Voltar ao dashboard</a>
    </section>

    <section>
      <h2>Nova categoria</h2>
      <div class="form-grid">
        <label>Nome <input [(ngModel)]="categoria.nome"></label>
        <label>Descricao <input [(ngModel)]="categoria.descricao"></label>
        <label>Cor <input type="color" [(ngModel)]="categoria.cor"></label>
        <label class="wide">Observacao <textarea [(ngModel)]="categoria.observacao"></textarea></label>
        <button (click)="criarCategoria()">Criar categoria</button>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>
    </section>

    <section>
      <h2>Lista de categorias</h2>
      <p *ngIf="carregando" class="loading">Carregando...</p>

      <div class="table-scroll" *ngIf="categorias.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descricao</th>
              <th>Cor</th>
              <th>Observacao</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of categorias">
              <td>{{ item.id_categoria }}</td>
              <td>{{ item.nome }}</td>
              <td>{{ item.descricao || '-' }}</td>
              <td><span class="color-dot" [style.background]="item.cor"></span>{{ item.cor || '-' }}</td>
              <td>{{ item.observacao || '-' }}</td>
              <td>
                <button class="danger" (click)="removerCategoria(item.id_categoria)">
                  Remover
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="!categorias.length && !carregando">Nenhuma categoria cadastrada.</p>
    </section>
  `
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  carregando = false;
  mensagem = '';
  erro = '';
  categoria: any = this.novaCategoria();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.carregando = true;
    this.api.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias = dados;
        this.carregando = false;
      },
      error: (error) => {
        this.carregando = false;
        this.tratarErro(error);
      }
    });
  }

  criarCategoria() {
    this.mensagem = '';
    this.erro = '';

    this.api.criarCategoria(this.categoria).subscribe({
      next: () => {
        this.mensagem = 'Categoria criada com sucesso.';
        this.categoria = this.novaCategoria();
        this.carregarCategorias();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  removerCategoria(idCategoria: number) {
    this.mensagem = '';
    this.erro = '';

    if (!confirm('Deseja remover esta categoria?')) return;

    this.api.removerCategoria(idCategoria).subscribe({
      next: () => {
        this.mensagem = 'Categoria removida com sucesso.';
        this.carregarCategorias();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  novaCategoria() {
    return {
      nome: '',
      descricao: '',
      cor: '#3366ff',
      observacao: 'Categoria criada pelo frontend'
    };
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || error.error?.detalhes || JSON.stringify(error.error || error.message);
  }
}
