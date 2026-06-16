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

  salvarUsuario(usuario: UsuarioLogado) {
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  obterUsuarioAtual(): UsuarioLogado | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as UsuarioLogado;
    } catch {
      localStorage.removeItem(this.storageKey);
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
    return !!this.obterUsuarioAtual();
  }

  logout() {
    localStorage.removeItem(this.storageKey);
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

  listarFuncionarios() {
    return this.http.get<any[]>(`${this.baseUrl}/funcionarios/`);
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
