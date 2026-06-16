import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { AlunoDashboardComponent } from './pages/aluno-dashboard/aluno-dashboard.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { EmprestimosComponent } from './pages/emprestimos/emprestimos.component';
import { FuncionarioDashboardComponent } from './pages/funcionario-dashboard/funcionario-dashboard.component';
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
    path: 'funcionario/dashboard',
    component: FuncionarioDashboardComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  { path: 'livros', component: LivrosComponent, canActivate: [authGuard] },
  {
    path: 'emprestimos',
    component: EmprestimosComponent,
    canActivate: [authGuard],
    data: { perfil: 'funcionario' }
  },
  { path: 'historico', component: HistoricoComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
