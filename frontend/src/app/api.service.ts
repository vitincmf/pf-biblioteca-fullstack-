import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface UsuarioLogado {
  id_usuario: number;
  nome: string;
  email: string;
  status: string;
  perfil: 'aluno' | 'funcionario' | 'nenhum';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private storageKey = 'biblioteca_usuario';

  constructor(private http: HttpClient) {}

  private authOptions() {
    const usuario = this.obterUsuarioAtual();
    const headers = usuario
      ? new HttpHeaders({ 'X-Usuario-Id': String(usuario.id_usuario) })
      : new HttpHeaders();

    return { headers };
  }

  statusAtivo(usuario: UsuarioLogado | null): boolean {
    return String(usuario?.status || '').trim().toUpperCase() === 'ATIVO';
  }

  salvarUsuario(usuario: UsuarioLogado) {
    this.logout();
    const usuarioNormalizado: UsuarioLogado = {
      ...usuario,
      status: String(usuario.status || '').trim().toUpperCase()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(usuarioNormalizado));
  }

  obterUsuarioAtual(): UsuarioLogado | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const usuario = JSON.parse(raw) as UsuarioLogado;
      if (!usuario?.id_usuario || !this.statusAtivo(usuario)) {
        this.logout();
        return null;
      }

      return {
        ...usuario,
        status: String(usuario.status || '').trim().toUpperCase()
      };
    } catch {
      this.logout();
      return null;
    }
  }

  obterIdUsuario(): number | null {
    return this.obterUsuarioAtual()?.id_usuario ?? null;
  }

  obterPerfil(): string | null {
    return this.obterUsuarioAtual()?.perfil ?? null;
  }

  estaLogado(): boolean {
    return this.statusAtivo(this.obterUsuarioAtual());
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
  }

  login(payload: { email: string; senha: string }) {
    return this.http.post<{ mensagem: string; usuario: UsuarioLogado }>(
      `${this.baseUrl}/auth/login/`,
      payload
    );
  }

  cadastrarUsuario(payload: any) {
    return this.http.post(`${this.baseUrl}/auth/register/`, payload);
  }

  health() {
    return this.http.get(`${this.baseUrl}/health/`);
  }

  listarCategorias() {
    return this.http.get<any[]>(`${this.baseUrl}/categorias/`);
  }

  criarCategoria(payload: any) {
    return this.http.post(`${this.baseUrl}/categorias/`, payload);
  }

  removerCategoria(id: number) {
    return this.http.delete(
      `${this.baseUrl}/categorias/${id}/`,
      this.authOptions()
    );
  }

  listarLivros(q = '') {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<any[]>(`${this.baseUrl}/livros/`, { params });
  }

  buscarLivros(q: string) {
    return this.http.get<any[]>(`${this.baseUrl}/livros/buscar/`, {
      params: new HttpParams().set('q', q)
    });
  }

  criarLivro(payload: any) {
    return this.http.post(`${this.baseUrl}/livros/`, payload, this.authOptions());
  }

  atualizarLivro(id: number, payload: any) {
    return this.http.patch(
      `${this.baseUrl}/livros/${id}/`,
      payload,
      this.authOptions()
    );
  }

  removerLivro(id: number) {
    return this.http.delete(`${this.baseUrl}/livros/${id}/`, this.authOptions());
  }

  listarAlunos() {
    return this.http.get<any[]>(`${this.baseUrl}/alunos/`);
  }

  detalheAluno(idUsuario: number) {
    return this.http.get<any>(`${this.baseUrl}/alunos/${idUsuario}/`);
  }

  atualizarAluno(idUsuario: number, payload: any) {
    return this.http.patch<any>(
      `${this.baseUrl}/alunos/${idUsuario}/`,
      payload,
      this.authOptions()
    );
  }

  removerAluno(idUsuario: number) {
    return this.http.delete<any>(
      `${this.baseUrl}/alunos/${idUsuario}/`,
      this.authOptions()
    );
  }

  listarFuncionarios() {
    return this.http.get<any[]>(`${this.baseUrl}/funcionarios/`);
  }

  detalheFuncionario(idUsuario: number) {
    return this.http.get<any>(`${this.baseUrl}/funcionarios/${idUsuario}/`);
  }

  atualizarFuncionario(idUsuario: number, payload: any) {
    return this.http.patch<any>(
      `${this.baseUrl}/funcionarios/${idUsuario}/`,
      payload,
      this.authOptions()
    );
  }

  removerFuncionario(idUsuario: number) {
    return this.http.delete<any>(
      `${this.baseUrl}/funcionarios/${idUsuario}/`,
      this.authOptions()
    );
  }

  listarEmprestimos() {
    return this.http.get<any[]>(`${this.baseUrl}/emprestimos/`);
  }

  criarEmprestimo(payload: any) {
    return this.http.post(
      `${this.baseUrl}/emprestimos/`,
      payload,
      this.authOptions()
    );
  }

  detalheEmprestimo(id: number) {
    return this.http.get(`${this.baseUrl}/emprestimos/${id}/`);
  }

  historicoAluno(idAluno: number) {
    return this.http.get<any>(`${this.baseUrl}/alunos/${idAluno}/historico/`);
  }

  emprestimosPorStatusAluno(idAluno: number) {
    return this.http.get<any>(
      `${this.baseUrl}/alunos/${idAluno}/relatorios/emprestimos-por-status/`
    );
  }

  relatorioHistoricoGeral() {
    return this.http.get<any[]>(
      `${this.baseUrl}/relatorios/historico/`,
      this.authOptions()
    );
  }

  livrosPorCategoria() {
    return this.http.get<any[]>(`${this.baseUrl}/relatorios/livros-por-categoria/`);
  }

  categoriasComMaisDeUmLivro() {
    return this.http.get<any[]>(
      `${this.baseUrl}/relatorios/categorias-com-mais-de-um-livro/`
    );
  }
}
