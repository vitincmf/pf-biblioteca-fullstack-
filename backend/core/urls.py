from django.urls import path

from . import views


urlpatterns = [
    path('health/', views.HealthView.as_view()),

    # Autenticação
    path('auth/register/', views.AuthRegisterView.as_view()),
    path('auth/login/', views.AuthLoginView.as_view()),

    path('categorias/', views.CategoriaListCreateView.as_view()),

    path('livros/', views.LivroListCreateView.as_view()),
    path('livros/<int:id_livro>/', views.LivroDetailView.as_view()),
    path('livros/buscar/', views.LivroBuscaView.as_view()),

    path('alunos/', views.AlunoListCreateView.as_view()),
    path('alunos/<int:id_aluno>/historico/', views.AlunoHistoricoEmprestimosView.as_view()),
    path('funcionarios/', views.FuncionarioListCreateView.as_view()),

    path('emprestimos/', views.EmprestimoListCreateView.as_view()),
    path('emprestimos/<int:id_emprestimo>/', views.EmprestimoDetailView.as_view()),
    path('emprestimos/<int:id_emprestimo>/devolver/', views.EmprestimoDevolverView.as_view()),
    path('emprestimos/testar-gatilho/', views.TesteGatilhoEmprestimoView.as_view()),

    path('relatorios/historico/', views.HistoricoEmprestimosView.as_view()),
    path('relatorios/livros-por-categoria/', views.LivrosPorCategoriaView.as_view()),
    path('relatorios/categorias-com-mais-de-um-livro/', views.CategoriasComMaisDeUmLivroView.as_view()),

    path('testes/erro-integridade/', views.TesteErroIntegridadeView.as_view()),
]
