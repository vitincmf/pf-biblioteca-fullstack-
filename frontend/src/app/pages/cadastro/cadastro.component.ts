import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section>
      <h2>Cadastro</h2>
      <div class="form-grid">
        <label>
          Perfil
          <select [(ngModel)]="form.perfil">
            <option value="aluno">Aluno</option>
            <option value="funcionario">Funcionario</option>
          </select>
        </label>
        <label>Nome <input [(ngModel)]="form.nome"></label>
        <label>Email <input type="email" [(ngModel)]="form.email"></label>
        <label>Senha <input type="password" [(ngModel)]="form.senha"></label>
        <label>Endereco <input [(ngModel)]="form.endereco"></label>
        <label>Status <input [(ngModel)]="form.status"></label>

        <ng-container *ngIf="form.perfil === 'aluno'">
          <label>Matricula <input [(ngModel)]="form.matricula"></label>
          <label>Curso <input [(ngModel)]="form.curso"></label>
          <label>Semestre <input type="number" min="1" [(ngModel)]="form.semestre"></label>
        </ng-container>

        <ng-container *ngIf="form.perfil === 'funcionario'">
          <label>Cargo <input [(ngModel)]="form.cargo"></label>
          <label>Setor <input [(ngModel)]="form.setor"></label>
          <label>Salario <input type="number" min="0" [(ngModel)]="form.salario"></label>
        </ng-container>

        <label class="wide">Observacao <textarea [(ngModel)]="form.observacao"></textarea></label>
        <button (click)="cadastrar()">Cadastrar</button>
        <a routerLink="/login">Voltar para login</a>
      </div>

      <p *ngIf="mensagem" class="notice">{{ mensagem }}</p>
      <p *ngIf="erro" class="error">{{ erro }}</p>
    </section>
  `
})
export class CadastroComponent {
  mensagem = '';
  erro = '';
  form: any = {
    perfil: 'aluno',
    nome: '',
    email: '',
    senha: '',
    endereco: '',
    status: 'ATIVO',
    matricula: '',
    curso: '',
    semestre: 1,
    cargo: '',
    setor: '',
    salario: 0,
    observacao: ''
  };

  constructor(private api: ApiService) {}

  cadastrar() {
    this.mensagem = '';
    this.erro = '';

    const comum = {
      nome: this.form.nome,
      email: this.form.email,
      senha: this.form.senha,
      perfil: this.form.perfil,
      endereco: this.form.endereco,
      status: this.form.status,
      observacao: this.form.observacao
    };

    const payload = this.form.perfil === 'aluno'
      ? {
          ...comum,
          matricula: this.form.matricula,
          curso: this.form.curso,
          semestre: this.form.semestre
        }
      : {
          ...comum,
          cargo: this.form.cargo,
          setor: this.form.setor,
          salario: this.form.salario
        };

    this.api.cadastrarUsuario(payload).subscribe({
      next: () => this.mensagem = 'Cadastro realizado. Use o login para entrar.',
      error: (error: HttpErrorResponse) => {
        this.erro = error.error?.erro || JSON.stringify(error.error || error.message);
      }
    });
  }
}
