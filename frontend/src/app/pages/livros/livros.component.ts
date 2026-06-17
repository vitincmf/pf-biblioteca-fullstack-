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
      <p class="muted">Consulte o acervo e, se estiver logado como funcionario, cadastre, edite ou remova livros.</p>
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

      <div *ngIf="ehFuncionario && livroEdicao.id_livro" class="subsection">
        <h3>Editar livro #{{ livroEdicao.id_livro }}</h3>
        <div class="form-grid">
          <label>Titulo <input [(ngModel)]="livroEdicao.titulo"></label>
          <label>Autor <input [(ngModel)]="livroEdicao.autor"></label>
          <label>Editora <input [(ngModel)]="livroEdicao.editora"></label>
          <label>Ano <input type="number" [(ngModel)]="livroEdicao.ano_publicacao"></label>
          <label>
            Categoria
            <select [(ngModel)]="livroEdicao.id_categoria">
              <option *ngFor="let categoria of categorias" [ngValue]="categoria.id_categoria">
                {{ categoria.nome }}
              </option>
            </select>
          </label>
          <button (click)="atualizarLivro()">Salvar alteracoes</button>
          <button class="secondary" (click)="cancelarEdicao()">Cancelar</button>
        </div>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>
      <p *ngIf="carregando" class="loading">Carregando...</p>

      <table *ngIf="livros.length">
        <thead>
          <tr>
            <th>ID</th><th>Titulo</th><th>Autor</th><th>Editora</th><th>Ano</th><th>Categoria</th><th *ngIf="ehFuncionario">Acoes</th>
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
            <td *ngIf="ehFuncionario">
              <button class="secondary" (click)="prepararEdicao(livro)">Editar</button>
              <button class="danger" (click)="removerLivro(livro.id_livro)">Remover</button>
            </td>
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
  carregando = false;
  ehFuncionario = false;
  novoLivro: any = {
    titulo: '',
    autor: '',
    editora: '',
    ano_publicacao: new Date().getFullYear(),
    id_categoria: null
  };
  livroEdicao: any = {
    id_livro: null,
    titulo: '',
    autor: '',
    editora: '',
    ano_publicacao: null,
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
    this.carregando = true;
    this.api.listarLivros(this.busca).subscribe({
      next: (dados) => {
        this.livros = dados;
        this.carregando = false;
      },
      error: (error) => {
        this.carregando = false;
        this.tratarErro(error);
      }
    });
  }

  criarLivro() {
    this.mensagem = '';
    this.erro = '';
    const payload = this.montarPayloadLivro(this.novoLivro);
    if (!payload) return;

    this.api.criarLivro(payload).subscribe({
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

  prepararEdicao(livro: any) {
    this.mensagem = '';
    this.erro = '';
    this.livroEdicao = {
      id_livro: livro.id_livro,
      titulo: livro.titulo,
      autor: livro.autor,
      editora: livro.editora,
      ano_publicacao: livro.ano_publicacao,
      id_categoria: livro.id_categoria
    };
  }

  atualizarLivro() {
    this.mensagem = '';
    this.erro = '';

    const payload = this.montarPayloadLivro(this.livroEdicao);
    if (!payload) return;

    this.api.atualizarLivro(this.livroEdicao.id_livro, payload).subscribe({
      next: () => {
        this.mensagem = 'Livro atualizado com sucesso.';
        this.cancelarEdicao();
        this.carregarLivros();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  removerLivro(idLivro: number) {
    this.mensagem = '';
    this.erro = '';

    if (!confirm('Deseja remover este livro?')) return;

    this.api.removerLivro(idLivro).subscribe({
      next: () => {
        this.mensagem = 'Livro removido com sucesso.';
        this.cancelarEdicao();
        this.carregarLivros();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  cancelarEdicao() {
    this.livroEdicao = {
      id_livro: null,
      titulo: '',
      autor: '',
      editora: '',
      ano_publicacao: null,
      id_categoria: null
    };
  }

  montarPayloadLivro(origem: any) {
    const idCategoria = Number(origem.id_categoria);
    const anoPublicacao = Number(origem.ano_publicacao);

    if (!origem.titulo || !origem.autor || !idCategoria || Number.isNaN(idCategoria)) {
      this.erro = 'Informe titulo, autor e categoria.';
      return null;
    }

    if (!anoPublicacao || Number.isNaN(anoPublicacao)) {
      this.erro = 'Informe um ano de publicacao valido.';
      return null;
    }

    return {
      titulo: origem.titulo,
      autor: origem.autor,
      editora: origem.editora || '',
      ano_publicacao: anoPublicacao,
      id_categoria: idCategoria
    };
  }

  tratarErro(error: HttpErrorResponse) {
    if (error.status === 0) {
      this.erro = 'Nao foi possivel conectar ao backend. Verifique se o Django esta rodando e se o CORS permite o header X-Usuario-Id.';
      return;
    }

    this.erro = error.error?.erro || error.error?.detalhes || JSON.stringify(error.error || error.message);
  }
}
