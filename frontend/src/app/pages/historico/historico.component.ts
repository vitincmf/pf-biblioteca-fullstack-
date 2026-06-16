import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
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

      <table *ngIf="perfil === 'funcionario' && relatorio.length">
        <thead>
          <tr>
            <th *ngFor="let col of colunas(relatorio[0])">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let linha of relatorio">
            <td *ngFor="let col of colunas(linha)">{{ linha[col] }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class HistoricoComponent implements OnInit {
  perfil = '';
  titulo = 'Historico';
  aluno: any = null;
  historico: any[] = [];
  relatorio: any[] = [];
  erro = '';

  constructor(private api: ApiService) {}

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

  colunas(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
