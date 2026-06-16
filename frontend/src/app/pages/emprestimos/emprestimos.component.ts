import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-emprestimos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>Emprestimos</h2>

      <div class="subsection">
        <h3>Novo emprestimo</h3>
        <div class="form-grid">
          <label>
            Aluno
            <select [(ngModel)]="form.id_aluno">
              <option *ngFor="let aluno of alunos" [ngValue]="aluno.id_usuario">
                {{ aluno.id_usuario }} - {{ aluno.nome }}
              </option>
            </select>
          </label>
          <label>
            Livro
            <select [(ngModel)]="form.id_livro">
              <option *ngFor="let livro of livros" [ngValue]="livro.id_livro">
                {{ livro.id_livro }} - {{ livro.titulo }}
              </option>
            </select>
          </label>
          <label>Data emprestimo <input type="date" [(ngModel)]="form.data_emprestimo"></label>
          <label>Data devolucao <input type="date" [(ngModel)]="form.data_devolucao"></label>
          <label>Multa <input type="number" min="0" [(ngModel)]="form.multa"></label>
          <label class="wide">Observacao <textarea [(ngModel)]="form.observacao"></textarea></label>
          <button (click)="criarEmprestimo()">Criar emprestimo</button>
        </div>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>

      <table *ngIf="emprestimos.length">
        <thead>
          <tr>
            <th>ID</th><th>Emprestimo</th><th>Devolucao</th><th>Devolucao real</th><th>Status</th><th>Multa</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let emprestimo of emprestimos">
            <td>{{ emprestimo.id_emprestimo }}</td>
            <td>{{ emprestimo.data_emprestimo }}</td>
            <td>{{ emprestimo.data_devolucao }}</td>
            <td>{{ emprestimo.data_devolucao_real || '-' }}</td>
            <td>{{ emprestimo.status }}</td>
            <td>{{ emprestimo.multa }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class EmprestimosComponent implements OnInit {
  alunos: any[] = [];
  livros: any[] = [];
  emprestimos: any[] = [];
  mensagem = '';
  erro = '';
  form: any = {
    id_aluno: null,
    id_livro: null,
    data_emprestimo: this.dataHoje(),
    data_devolucao: this.dataEmDias(7),
    multa: 0,
    observacao: 'Emprestimo criado pelo frontend'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.api.listarAlunos().subscribe({
      next: (dados) => {
        this.alunos = dados;
        this.form.id_aluno = this.form.id_aluno || dados[0]?.id_usuario || null;
      },
      error: (error) => this.tratarErro(error)
    });

    this.api.listarLivros().subscribe({
      next: (dados) => {
        this.livros = dados;
        this.form.id_livro = this.form.id_livro || dados[0]?.id_livro || null;
      },
      error: (error) => this.tratarErro(error)
    });

    this.carregarEmprestimos();
  }

  carregarEmprestimos() {
    this.api.listarEmprestimos().subscribe({
      next: (dados) => this.emprestimos = dados,
      error: (error) => this.tratarErro(error)
    });
  }

  criarEmprestimo() {
    this.mensagem = '';
    this.erro = '';

    const payload = {
      alunos: [Number(this.form.id_aluno)],
      livros: [Number(this.form.id_livro)],
      data_emprestimo: this.form.data_emprestimo,
      data_devolucao: this.form.data_devolucao,
      multa: this.form.multa || 0,
      observacao: this.form.observacao
    };

    this.api.criarEmprestimo(payload).subscribe({
      next: () => {
        this.mensagem = 'Emprestimo criado com funcionario autenticado pelo header.';
        this.carregarEmprestimos();
      },
      error: (error) => this.tratarErro(error)
    });
  }

  dataHoje(): string {
    return new Date().toISOString().slice(0, 10);
  }

  dataEmDias(dias: number): string {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data.toISOString().slice(0, 10);
  }

  tratarErro(error: HttpErrorResponse) {
    this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
  }
}
