import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  livros: any[] = [];
  categorias: any[] = [];
  alunos: any[] = [];
  funcionarios: any[] = [];
  relatorio: any[] = [];
  mensagem = '';
  erro = '';
  busca = '';

  novoLivro: any = {
    titulo: '',
    autor: '',
    editora: '',
    ano_publicacao: null,
    id_categoria: 1
  };

  livroEdicao: any = {
    id_livro: null,
    titulo: '',
    autor: '',
    editora: '',
    ano_publicacao: null,
    id_categoria: 1
  };

  novoAluno: any = {
    nome: '',
    email: '',
    endereco: '',
    matricula: '',
    curso: '',
    semestre: null,
    observacao: ''
  };

  novoFuncionario: any = {
    nome: '',
    email: '',
    endereco: '',
    cargo: '',
    setor: '',
    salario: null,
    observacao: ''
  };

  novoEmprestimo: any = {
    data_emprestimo: '2026-06-20',
    data_devolucao: '2026-07-04',
    multa: 0,
    observacao: '',
    alunosTexto: '1',
    livrosTexto: '1',
    id_funcionario: 4
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarTudo();
  }

  carregarTudo() {
    this.listarLivros();
    this.api.listarCategorias().subscribe((dados) => this.categorias = dados);
    this.api.listarAlunos().subscribe((dados) => this.alunos = dados);
    this.api.listarFuncionarios().subscribe((dados) => this.funcionarios = dados);
  }

  limparMensagens() {
    this.mensagem = '';
    this.erro = '';
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = JSON.stringify(error.error || error.message, null, 2);
  }

  listarLivros() {
    this.api.listarLivros(this.busca).subscribe({
      next: (dados) => this.livros = dados,
      error: (e) => this.tratarErro(e)
    });
  }

  criarLivro() {
    this.limparMensagens();
    this.api.criarLivro(this.novoLivro).subscribe({
      next: (res) => {
        this.mensagem = 'Livro cadastrado com sucesso. Operação enviada pelo front-end, processada pela API e persistida no PostgreSQL.';
        this.listarLivros();
      },
      error: (e) => this.tratarErro(e)
    });
  }

  prepararEdicao(livro: any) {
    this.livroEdicao = { ...livro };
  }

  atualizarLivro() {
    this.limparMensagens();
    if (!this.livroEdicao.id_livro) {
      this.erro = 'Selecione um livro para editar.';
      return;
    }
    this.api.atualizarLivro(this.livroEdicao.id_livro, this.livroEdicao).subscribe({
      next: () => {
        this.mensagem = 'Livro atualizado com sucesso no PostgreSQL.';
        this.listarLivros();
      },
      error: (e) => this.tratarErro(e)
    });
  }

  removerLivro(id: number) {
    this.limparMensagens();
    this.api.removerLivro(id).subscribe({
      next: () => {
        this.mensagem = 'Remoção solicitada pela interface e executada no PostgreSQL.';
        this.listarLivros();
      },
      error: (e) => this.tratarErro(e)
    });
  }

  criarAluno() {
    this.limparMensagens();
    this.api.criarAluno(this.novoAluno).subscribe({
      next: () => {
        this.mensagem = 'Aluno cadastrado. A API inseriu dados em USUARIO e ALUNO.';
        this.carregarTudo();
      },
      error: (e) => this.tratarErro(e)
    });
  }

  criarFuncionario() {
    this.limparMensagens();
    this.api.criarFuncionario(this.novoFuncionario).subscribe({
      next: () => {
        this.mensagem = 'Funcionário cadastrado. A API inseriu dados em USUARIO e FUNCIONARIO.';
        this.carregarTudo();
      },
      error: (e) => this.tratarErro(e)
    });
  }

  criarEmprestimo() {
    this.limparMensagens();
    const payload = {
      data_emprestimo: this.novoEmprestimo.data_emprestimo,
      data_devolucao: this.novoEmprestimo.data_devolucao,
      multa: this.novoEmprestimo.multa,
      observacao: this.novoEmprestimo.observacao,
      id_funcionario: Number(this.novoEmprestimo.id_funcionario),
      alunos: this.converterLista(this.novoEmprestimo.alunosTexto),
      livros: this.converterLista(this.novoEmprestimo.livrosTexto)
    };
    this.api.criarEmprestimo(payload).subscribe({
      next: (res) => {
        this.mensagem = 'Empréstimo criado. A API inseriu em EMPRESTIMO, REALIZA_EMPRESTIMO e REGISTRA_ITEM.';
      },
      error: (e) => this.tratarErro(e)
    });
  }

  converterLista(texto: string): number[] {
    return texto.split(',')
      .map((item) => Number(item.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
  }

  carregarHistorico() {
    this.api.historico().subscribe({
      next: (dados) => this.relatorio = dados,
      error: (e) => this.tratarErro(e)
    });
  }

  carregarLivrosPorCategoria() {
    this.api.livrosPorCategoria().subscribe({
      next: (dados) => this.relatorio = dados,
      error: (e) => this.tratarErro(e)
    });
  }

  carregarHaving() {
    this.api.categoriasComMaisDeUmLivro().subscribe({
      next: (dados) => this.relatorio = dados,
      error: (e) => this.tratarErro(e)
    });
  }

  testarGatilho() {
    this.limparMensagens();
    this.api.testarGatilho().subscribe({
      next: () => this.mensagem = 'O empréstimo inválido foi aceito, verifique o gatilho.',
      error: (e) => this.tratarErro(e)
    });
  }

  testarErroIntegridade() {
    this.limparMensagens();
    this.api.testarErroIntegridade().subscribe({
      next: () => this.mensagem = 'Registro inserido. Verifique se o teste deveria gerar erro.',
      error: (e) => this.tratarErro(e)
    });
  }

  colunas(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
