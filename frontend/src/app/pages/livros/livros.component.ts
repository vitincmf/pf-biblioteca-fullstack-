import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-livros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>Livros</h2>
      <div class="toolbar">
        <input [(ngModel)]="busca" placeholder="Buscar por titulo">
        <button (click)="carregarLivros()">Buscar</button>
      </div>

      <div *ngIf="ehFuncionario" class="subsection">
        <h3>Novo livro</h3>
        <div class="form-grid">
          <label>Titulo <input [(ngModel)]="novoLivro.titulo"></label>
          <label>Autor <input [(ngModel)]="novoLivro.autor"></label>
          <label>Editora <input [(ngModel)]="novoLivro.editora"></label>
          <label>Ano <input type="number" [(ngModel)]="novoLivro.ano_publicacao"></label>
          <label>
            Categoria
            <select [(ngModel)]="novoLivro.id_categoria">
              <option *ngFor="let categoria of categorias" [ngValue]="categoria.id_categoria">
                {{ categoria.nome }}
              </option>
            </select>
          </label>
          <button (click)="criarLivro()">Criar livro</button>
        </div>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>

      <table *ngIf="livros.length">
        <thead>
          <tr>
            <th>ID</th><th>Titulo</th><th>Autor</th><th>Editora</th><th>Ano</th><th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let livro of livros">
            <td>{{ livro.id_livro }}</td>
            <td>{{ livro.titulo }}</td>
            <td>{{ livro.autor }}</td>
            <td>{{ livro.editora }}</td>
            <td>{{ livro.ano_publicacao }}</td>
            <td>{{ livro.categoria }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class LivrosComponent implements OnInit {
  livros: any[] = [];
  categorias: any[] = [];
  busca = '';
  mensagem = '';
  erro = '';
  ehFuncionario = false;
  novoLivro: any = {
    titulo: '',
    autor: '',
    editora: '',
    ano_publicacao: new Date().getFullYear(),
    id_categoria: null
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.ehFuncionario = this.api.obterPerfil() === 'funcionario';
    this.carregarCategorias();
    this.carregarLivros();
  }

  carregarCategorias() {
    this.api.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias = dados;
        if (!this.novoLivro.id_categoria && dados.length) {
          this.novoLivro.id_categoria = dados[0].id_categoria;
        }
      },
      error: (error) => this.tratarErro(error)
    });
  }

  carregarLivros() {
    this.api.listarLivros(this.busca).subscribe({
      next: (dados) => this.livros = dados,
      error: (error) => this.tratarErro(error)
    });
  }

  criarLivro() {
    this.mensagem = '';
    this.erro = '';
    this.api.criarLivro(this.novoLivro).subscribe({
      next: () => {
        this.mensagem = 'Livro criado com sucesso.';
        this.novoLivro = {
          titulo: '',
          autor: '',
          editora: '',
          ano_publicacao: new Date().getFullYear(),
          id_categoria: this.categorias[0]?.id_categoria ?? null
        };
        this.carregarLivros();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
