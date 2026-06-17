import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, UsuarioLogado } from '../../api.service';

@Component({
  selector: 'app-funcionario-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="dashboard-header">
      <div>
        <h2>Dashboard do funcionario</h2>
        <p *ngIf="usuario">Ola, {{ usuario.nome }}. Escolha uma area para continuar.</p>
      </div>
    </section>

    <section>
      <h2>Atalhos</h2>
      <div class="shortcut-grid">
        <a routerLink="/funcionario/livros">
          <strong>Livros</strong>
          <span>Consultar, criar, editar e remover livros do acervo.</span>
        </a>
        <a routerLink="/funcionario/categorias">
          <strong>Categorias</strong>
          <span>Criar, listar e remover categorias.</span>
        </a>
        <a routerLink="/funcionario/emprestimos">
          <strong>Criar emprestimo</strong>
          <span>Registrar um novo emprestimo usando seu usuario autenticado.</span>
        </a>
        <a routerLink="/funcionario/relatorio">
          <strong>Relatorio</strong>
          <span>Consultar o historico geral de emprestimos com filtros.</span>
        </a>
        <a routerLink="/funcionario/perfil">
          <strong>Perfil</strong>
          <span>Atualizar seus dados pessoais e desativar sua conta.</span>
        </a>
      </div>
    </section>
  `
})
export class FuncionarioDashboardComponent {
  usuario: UsuarioLogado | null = null;

  constructor(private api: ApiService) {
    this.usuario = this.api.obterUsuarioAtual();
  }
}
