import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-panel">
      <h2>Login</h2>
      <div class="form-grid">
        <label>
          Email
          <input type="email" [(ngModel)]="form.email" autocomplete="email">
        </label>
        <label>
          Senha
          <input type="password" [(ngModel)]="form.senha" autocomplete="current-password">
        </label>
        <button (click)="entrar()">Entrar</button>
        <a routerLink="/cadastro">Criar cadastro</a>
      </div>
      <p *ngIf="erro" class="error">{{ erro }}</p>
    </section>
  `
})
export class LoginComponent {
  form = { email: '', senha: '' };
  erro = '';

  constructor(private api: ApiService, private router: Router) {}

  entrar() {
    this.erro = '';
    this.api.login(this.form).subscribe({
      next: (res) => {
        this.api.salvarUsuario(res.usuario);

        if (res.usuario.perfil === 'aluno') {
          this.router.navigateByUrl('/aluno/dashboard');
          return;
        }

        if (res.usuario.perfil === 'funcionario') {
          this.router.navigateByUrl('/funcionario/dashboard');
          return;
        }

        this.api.logout();
        this.erro = 'Usuario sem perfil ativo para acessar o sistema.';
      },
      error: (error: HttpErrorResponse) => {
        this.erro = error.error?.erro || 'Nao foi possivel fazer login.';
      }
    });
  }
}
