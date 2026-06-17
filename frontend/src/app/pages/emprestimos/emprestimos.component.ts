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
      <p class="muted">Valide o aluno por email e matricula antes de criar emprestimos ou registrar devolucoes.</p>
    </section>

    <section>
      <h2>Criar emprestimo</h2>
      <div class="form-grid">
        <label>
          Email do aluno
          <input
            type="email"
            [(ngModel)]="criacao.email"
            (ngModelChange)="limparAlunoCriacao()"
            placeholder="aluno@email.com"
          >
        </label>
        <label>
          Matricula do aluno
          <input
            [(ngModel)]="criacao.matricula"
            (ngModelChange)="limparAlunoCriacao()"
            placeholder="20260001"
          >
        </label>
        <button type="button" (click)="validarAlunoCriacao()" [disabled]="carregandoCriacao">
          Validar aluno
        </button>
      </div>

      <div *ngIf="alunoCriacao" class="summary-card">
        <strong>Aluno encontrado</strong>
        <span>{{ alunoCriacao.nome }}</span>
        <span>{{ alunoCriacao.email }} - Matricula {{ alunoCriacao.matricula }}</span>
        <span>{{ alunoCriacao.curso || '-' }} - Semestre {{ alunoCriacao.semestre || '-' }}</span>
      </div>

      <div class="subsection">
        <h3>Dados do emprestimo</h3>
        <div class="form-grid">
          <label>
            Livro
            <select [(ngModel)]="criacao.id_livro">
              <option [ngValue]="null">Selecione um livro</option>
              <option *ngFor="let livro of livros" [ngValue]="livro.id_livro">
                {{ livro.id_livro }} - {{ livro.titulo }}
              </option>
            </select>
          </label>
          <label>Data emprestimo <input type="date" [(ngModel)]="criacao.data_emprestimo"></label>
          <label>Data devolucao <input type="date" [(ngModel)]="criacao.data_devolucao"></label>
          <label>Multa <input type="number" min="0" [(ngModel)]="criacao.multa"></label>
          <label class="wide">Observacao <textarea [(ngModel)]="criacao.observacao"></textarea></label>
          <button type="button" (click)="criarEmprestimo()">Criar emprestimo</button>
        </div>
      </div>

      <p *ngIf="mensagemCriacao" class="notice">{{ mensagemCriacao }}</p>
      <p *ngIf="erroCriacao" class="error">{{ erroCriacao }}</p>
      <p *ngIf="carregandoCriacao" class="loading">Validando aluno...</p>
    </section>

    <section>
      <h2>Registrar devolucao</h2>
      <div class="form-grid">
        <label>
          Email do aluno
          <input
            type="email"
            [(ngModel)]="devolucao.email"
            (ngModelChange)="limparAlunoDevolucao()"
            placeholder="aluno@email.com"
          >
        </label>
        <label>
          Matricula do aluno
          <input
            [(ngModel)]="devolucao.matricula"
            (ngModelChange)="limparAlunoDevolucao()"
            placeholder="20260001"
          >
        </label>
        <button type="button" (click)="buscarEmprestimosAtivos()" [disabled]="carregandoDevolucao">
          Buscar emprestimos ativos
        </button>
      </div>

      <div *ngIf="alunoDevolucao" class="summary-card">
        <strong>Aluno validado</strong>
        <span>{{ alunoDevolucao.nome }}</span>
        <span>{{ alunoDevolucao.email }} - Matricula {{ alunoDevolucao.matricula }}</span>
      </div>

      <div class="form-grid subsection">
        <label>Data devolucao real <input type="date" [(ngModel)]="devolucao.data_devolucao_real"></label>
        <label>Multa <input type="number" min="0" [(ngModel)]="devolucao.multa"></label>
      </div>

      <div class="table-scroll" *ngIf="emprestimosAtivos.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Livros</th>
              <th>Data emprestimo</th>
              <th>Prazo devolucao</th>
              <th>Status</th>
              <th>Multa</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emprestimo of emprestimosAtivos">
              <td>{{ emprestimo.id_emprestimo }}</td>
              <td>
                <div *ngFor="let livro of emprestimo.livros">
                  {{ livro.titulo }} - {{ livro.autor }}
                </div>
              </td>
              <td>{{ emprestimo.data_emprestimo }}</td>
              <td>{{ emprestimo.data_devolucao }}</td>
              <td>{{ emprestimo.status }}</td>
              <td>{{ emprestimo.multa }}</td>
              <td>
                <button type="button" (click)="devolverEmprestimo(emprestimo)">
                  Marcar devolvido
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="mensagemDevolucao" class="notice">{{ mensagemDevolucao }}</p>
      <p *ngIf="erroDevolucao" class="error">{{ erroDevolucao }}</p>
      <p *ngIf="carregandoDevolucao" class="loading">Buscando emprestimos...</p>
    </section>
  `
})
export class EmprestimosComponent implements OnInit {
  livros: any[] = [];
  alunoCriacao: any = null;
  alunoDevolucao: any = null;
  emprestimosAtivos: any[] = [];
  mensagemCriacao = '';
  erroCriacao = '';
  mensagemDevolucao = '';
  erroDevolucao = '';
  carregandoCriacao = false;
  carregandoDevolucao = false;
  criacao: any = {
    email: '',
    matricula: '',
    id_livro: null,
    data_emprestimo: this.dataHoje(),
    data_devolucao: this.dataEmDias(7),
    multa: 0,
    observacao: 'Emprestimo criado pelo frontend'
  };
  devolucao: any = {
    email: '',
    matricula: '',
    data_devolucao_real: this.dataHoje(),
    multa: 0
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarLivros();
  }

  carregarLivros() {
    this.api.listarLivros().subscribe({
      next: (dados) => {
        this.livros = dados;
        this.criacao.id_livro = this.criacao.id_livro || dados[0]?.id_livro || null;
      },
      error: (error) => this.erroCriacao = this.mensagemErro(error)
    });
  }

  limparAlunoCriacao() {
    this.alunoCriacao = null;
    this.mensagemCriacao = '';
  }

  limparAlunoDevolucao() {
    this.alunoDevolucao = null;
    this.emprestimosAtivos = [];
    this.mensagemDevolucao = '';
  }

  validarAlunoCriacao() {
    this.erroCriacao = '';
    this.mensagemCriacao = '';
    this.alunoCriacao = null;

    if (!this.criacao.email || !this.criacao.matricula) {
      this.erroCriacao = 'Informe email e matricula do aluno.';
      return;
    }

    this.carregandoCriacao = true;
    this.api.validarAlunoPorEmailMatricula(
      this.criacao.email,
      this.criacao.matricula
    ).subscribe({
      next: (res) => {
        this.alunoCriacao = res.aluno;
        this.mensagemCriacao = 'Aluno validado com sucesso.';
        this.carregandoCriacao = false;
      },
      error: (error) => {
        this.carregandoCriacao = false;
        this.erroCriacao = this.mensagemErro(error);
      }
    });
  }

  criarEmprestimo() {
    this.mensagemCriacao = '';
    this.erroCriacao = '';

    if (!this.alunoCriacao) {
      this.erroCriacao = 'Valide o aluno antes de criar o emprestimo.';
      return;
    }

    if (!this.criacao.id_livro) {
      this.erroCriacao = 'Selecione um livro.';
      return;
    }

    const payload = {
      alunos: [Number(this.alunoCriacao.id_usuario)],
      livros: [Number(this.criacao.id_livro)],
      data_emprestimo: this.criacao.data_emprestimo,
      data_devolucao: this.criacao.data_devolucao,
      multa: this.criacao.multa || 0,
      observacao: this.criacao.observacao
    };

    this.api.criarEmprestimo(payload).subscribe({
      next: () => {
        this.mensagemCriacao = 'Emprestimo criado com sucesso.';
        this.alunoCriacao = null;
        this.criacao = {
          ...this.criacao,
          email: '',
          matricula: '',
          observacao: 'Emprestimo criado pelo frontend',
          multa: 0
        };
      },
      error: (error) => this.erroCriacao = this.mensagemErro(error)
    });
  }

  buscarEmprestimosAtivos() {
    this.erroDevolucao = '';
    this.mensagemDevolucao = '';
    this.alunoDevolucao = null;
    this.emprestimosAtivos = [];

    if (!this.devolucao.email || !this.devolucao.matricula) {
      this.erroDevolucao = 'Informe email e matricula do aluno.';
      return;
    }

    this.carregandoDevolucao = true;
    this.api.validarAlunoPorEmailMatricula(
      this.devolucao.email,
      this.devolucao.matricula
    ).subscribe({
      next: (res) => {
        this.alunoDevolucao = res.aluno;
        this.carregarHistoricoAtivo(res.aluno.id_usuario);
      },
      error: (error) => {
        this.carregandoDevolucao = false;
        this.erroDevolucao = this.mensagemErro(error);
      }
    });
  }

  carregarHistoricoAtivo(idAluno: number) {
    this.api.historicoAluno(idAluno).subscribe({
      next: (res) => {
        this.emprestimosAtivos = (res.historico || []).filter(
          (emprestimo: any) => String(emprestimo.status || '').trim().toUpperCase() === 'ATIVO'
        );
        if (!this.emprestimosAtivos.length) {
          this.mensagemDevolucao = 'Nenhum emprestimo ativo encontrado para este aluno.';
        }
        this.carregandoDevolucao = false;
      },
      error: (error) => {
        this.carregandoDevolucao = false;
        this.erroDevolucao = this.mensagemErro(error);
      }
    });
  }

  devolverEmprestimo(emprestimo: any) {
    if (!this.alunoDevolucao) {
      this.erroDevolucao = 'Valide o aluno antes de registrar devolucao.';
      return;
    }

    this.erroDevolucao = '';
    this.mensagemDevolucao = '';

    const payload = {
      id_aluno: this.alunoDevolucao.id_usuario,
      ...(this.devolucao.data_devolucao_real ? { data_devolucao_real: this.devolucao.data_devolucao_real } : {}),
      ...(this.devolucao.multa !== null && this.devolucao.multa !== '' ? { multa: this.devolucao.multa } : {})
    };

    this.api.devolverEmprestimo(emprestimo.id_emprestimo, payload).subscribe({
      next: () => {
        this.mensagemDevolucao = 'Emprestimo marcado como devolvido.';
        this.buscarEmprestimosAtivos();
      },
      error: (error) => this.erroDevolucao = this.mensagemErro(error)
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

  mensagemErro(error: HttpErrorResponse) {
    return error.error?.erro || error.error?.detalhes || JSON.stringify(error.error || error.message);
  }
}
