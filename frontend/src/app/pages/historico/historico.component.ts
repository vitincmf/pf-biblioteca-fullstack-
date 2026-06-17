import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>{{ titulo }}</h2>
      <p *ngIf="erro" class="error">{{ erro }}</p>

      <div *ngIf="perfil === 'aluno'">
        <p *ngIf="aluno"><strong>{{ aluno.nome }}</strong> - {{ aluno.email }}</p>
        <article *ngFor="let item of historico" class="history-item">
          <div>
            <strong>#{{ item.id_emprestimo }}</strong>
            {{ item.status }} / {{ item.situacao }}
            <span *ngIf="item.vencido" class="badge danger">Vencido</span>
          </div>
          <div>{{ item.data_emprestimo }} ate {{ item.data_devolucao }}</div>
          <div>Devolucao real: {{ item.data_devolucao_real || '-' }}</div>
          <ul>
            <li *ngFor="let livro of item.livros">{{ livro.titulo }} - {{ livro.autor }}</li>
          </ul>
        </article>
        <p *ngIf="!historico.length && !erro">Nenhum emprestimo encontrado.</p>
      </div>

      <div *ngIf="perfil === 'funcionario'">
        <div class="toolbar">
          <input [(ngModel)]="busca" placeholder="Buscar por aluno, livro, categoria, funcionario ou status">
          <select [(ngModel)]="statusFiltro">
            <option value="">Todos os status</option>
            <option value="ATIVO">ATIVO</option>
            <option value="DEVOLVIDO">DEVOLVIDO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
          <select [(ngModel)]="categoriaFiltro">
            <option value="">Todas as categorias</option>
            <option *ngFor="let categoria of categoriasRelatorio" [value]="categoria">
              {{ categoria }}
            </option>
          </select>
          <select [(ngModel)]="alunoFiltro">
            <option value="">Todos os alunos</option>
            <option *ngFor="let aluno of alunosRelatorio" [value]="aluno">
              {{ aluno }}
            </option>
          </select>
          <select [(ngModel)]="livroFiltro">
            <option value="">Todos os livros</option>
            <option *ngFor="let livro of livrosRelatorio" [value]="livro">
              {{ livro }}
            </option>
          </select>
        </div>

        <div class="table-scroll report-table-container" *ngIf="relatorioFiltrado.length">
          <table>
            <thead>
              <tr>
                <th>ID emprestimo</th>
                <th>Aluno</th>
                <th>Matricula</th>
                <th>Livro</th>
                <th>Categoria</th>
                <th>Funcionario</th>
                <th>Data emprestimo</th>
                <th>Prazo devolucao</th>
                <th>Devolucao real</th>
                <th>Status</th>
                <th>Multa</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let linha of relatorioFiltrado">
                <td>{{ linha.id_emprestimo }}</td>
                <td>{{ valor(linha, ['nome_aluno', 'aluno']) }}</td>
                <td>{{ valor(linha, ['matricula']) || '-' }}</td>
                <td>{{ valor(linha, ['titulo_livro', 'livro']) }}</td>
                <td>{{ valor(linha, ['categoria', 'nome_categoria']) || '-' }}</td>
                <td>{{ valor(linha, ['nome_funcionario', 'funcionario']) || '-' }}</td>
                <td>{{ linha.data_emprestimo }}</td>
                <td>{{ linha.data_devolucao }}</td>
                <td>{{ linha.data_devolucao_real || '-' }}</td>
                <td>{{ linha.status }}</td>
                <td>{{ linha.multa }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p *ngIf="!relatorioFiltrado.length && !erro">Nenhum registro encontrado.</p>
      </div>
    </section>
  `
})
export class HistoricoComponent implements OnInit {
  perfil = '';
  titulo = 'Historico';
  aluno: any = null;
  historico: any[] = [];
  relatorio: any[] = [];
  busca = '';
  statusFiltro = '';
  categoriaFiltro = '';
  alunoFiltro = '';
  livroFiltro = '';
  erro = '';

  constructor(private api: ApiService) {}

  get relatorioFiltrado() {
    const termo = this.normalizar(this.busca);

    return this.relatorio.filter((linha) => {
      const aluno = this.texto(linha, ['nome_aluno', 'aluno']);
      const livro = this.texto(linha, ['titulo_livro', 'livro']);
      const funcionario = this.texto(linha, ['nome_funcionario', 'funcionario']);
      const categoria = this.texto(linha, ['categoria', 'nome_categoria']);
      const status = this.texto(linha, ['status']);

      const bateBusca = !termo || [aluno, livro, funcionario, categoria, status]
        .some((valor) => valor.includes(termo));
      const bateStatus = !this.statusFiltro || status === this.normalizar(this.statusFiltro);
      const bateCategoria = !this.categoriaFiltro || categoria === this.normalizar(this.categoriaFiltro);
      const bateAluno = !this.alunoFiltro || aluno === this.normalizar(this.alunoFiltro);
      const bateLivro = !this.livroFiltro || livro === this.normalizar(this.livroFiltro);

      return bateBusca && bateStatus && bateCategoria && bateAluno && bateLivro;
    });
  }

  get categoriasRelatorio() {
    return this.opcoesUnicas(['categoria', 'nome_categoria']);
  }

  get alunosRelatorio() {
    return this.opcoesUnicas(['nome_aluno', 'aluno']);
  }

  get livrosRelatorio() {
    return this.opcoesUnicas(['titulo_livro', 'livro']);
  }

  ngOnInit() {
    this.perfil = this.api.obterPerfil() || '';

    if (this.perfil === 'aluno') {
      this.titulo = 'Meu historico de emprestimos';
      const idAluno = this.api.obterIdUsuario();
      if (!idAluno) return;

      this.api.historicoAluno(idAluno).subscribe({
        next: (res) => {
          this.aluno = res.aluno;
          this.historico = res.historico || [];
        },
        error: (error) => this.tratarErro(error)
      });
      return;
    }

    this.titulo = 'Relatorio geral de emprestimos';
    this.api.relatorioHistoricoGeral().subscribe({
      next: (dados) => this.relatorio = dados,
      error: (error) => this.tratarErro(error)
    });
  }

  valor(linha: any, chaves: string[]) {
    for (const chave of chaves) {
      if (linha?.[chave] !== undefined && linha?.[chave] !== null && linha?.[chave] !== '') {
        return linha[chave];
      }
    }

    return '';
  }

  texto(linha: any, chaves: string[]) {
    return this.normalizar(String(this.valor(linha, chaves) || ''));
  }

  normalizar(valor: string) {
    return valor.trim().toLowerCase();
  }

  opcoesUnicas(chaves: string[]) {
    return Array.from(
      new Set(
        this.relatorio
          .map((linha) => String(this.valor(linha, chaves) || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
