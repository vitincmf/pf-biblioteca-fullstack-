import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { AlunoDashboardComponent } from './pages/aluno-dashboard/aluno-dashboard.component';
import { AlunoPerfilComponent } from './pages/aluno-perfil/aluno-perfil.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { EmprestimosComponent } from './pages/emprestimos/emprestimos.component';
import { FuncionarioDashboardComponent } from './pages/funcionario-dashboard/funcionario-dashboard.component';
import { FuncionarioPerfilComponent } from './pages/funcionario-perfil/funcionario-perfil.component';
import { HistoricoComponent } from './pages/historico/historico.component';
import { LivrosComponent } from './pages/livros/livros.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  {
    path: 'aluno/dashboard',
    component: AlunoDashboardComponent,
    canActivate: [authGuard],
    data: { perfil: 'aluno' }
  },
  {
    path: 'aluno/perfil',
    component: AlunoPerfilComponent,
    canActivate: [authGuard],
    data: { perfil: 'aluno' }
  },
  {
    path: 'aluno/livros',
    component: LivrosComponent,
    canActivate: [authGuard],
    data: { perfil: 'aluno' }
  },
  {
    path: 'aluno/historico',
    component: HistoricoComponent,
    canActivate: [authGuard],
    data: { perfil: 'aluno' }
  },
  {
    path: 'funcionario/dashboard',
    component: FuncionarioDashboardComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'funcionario/livros',
    component: LivrosComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'funcionario/categorias',
    component: CategoriasComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'funcionario/emprestimos',
    component: EmprestimosComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'funcionario/relatorio',
    component: HistoricoComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'funcionario/perfil',
    component: FuncionarioPerfilComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  {
    path: 'livros',
    component: LivrosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'emprestimos',
    redirectTo: 'funcionario/emprestimos',
    pathMatch: 'full'
  },
  {
    path: 'historico',
    redirectTo: 'funcionario/relatorio',
    pathMatch: 'full'
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
