import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Ajuste aqui caso o back-end esteja hospedado em outro endereço.
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  health() {
    return this.http.get(`${this.baseUrl}/health/`);
  }

  listarCategorias() {
    return this.http.get<any[]>(`${this.baseUrl}/categorias/`);
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
    return this.http.post(`${this.baseUrl}/livros/`, payload);
  }

  atualizarLivro(id: number, payload: any) {
    return this.http.patch(`${this.baseUrl}/livros/${id}/`, payload);
  }

  removerLivro(id: number) {
    return this.http.delete(`${this.baseUrl}/livros/${id}/`);
  }

  listarAlunos() {
    return this.http.get<any[]>(`${this.baseUrl}/alunos/`);
  }

  criarAluno(payload: any) {
    return this.http.post(`${this.baseUrl}/alunos/`, payload);
  }

  listarFuncionarios() {
    return this.http.get<any[]>(`${this.baseUrl}/funcionarios/`);
  }

  criarFuncionario(payload: any) {
    return this.http.post(`${this.baseUrl}/funcionarios/`, payload);
  }

  criarEmprestimo(payload: any) {
    return this.http.post(`${this.baseUrl}/emprestimos/`, payload);
  }

  historico() {
    return this.http.get<any[]>(`${this.baseUrl}/relatorios/historico/`);
  }

  livrosPorCategoria() {
    return this.http.get<any[]>(`${this.baseUrl}/relatorios/livros-por-categoria/`);
  }

  categoriasComMaisDeUmLivro() {
    return this.http.get<any[]>(`${this.baseUrl}/relatorios/categorias-com-mais-de-um-livro/`);
  }

  testarGatilho() {
    return this.http.post(`${this.baseUrl}/emprestimos/testar-gatilho/`, {
      data_emprestimo: '2026-06-20',
      data_devolucao: '2026-06-10',
      multa: 0,
      observacao: 'Teste de gatilho pela interface Angular'
    });
  }

  testarErroIntegridade() {
    return this.http.post(`${this.baseUrl}/testes/erro-integridade/`, {});
  }
}
