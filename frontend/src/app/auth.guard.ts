import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';

export const authGuard: CanActivateFn = (route) => {
  const api = inject(ApiService);
  const router = inject(Router);
  const usuario = api.obterUsuarioAtual();
  const perfilEsperado = route.data['perfil'] as string | undefined;

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  if (!api.statusAtivo(usuario)) {
    api.logout();
    return router.createUrlTree(['/login']);
  }

  if (perfilEsperado && usuario.perfil !== perfilEsperado) {
    if (usuario.perfil === 'aluno') {
      return router.createUrlTree(['/aluno/dashboard']);
    }

    if (usuario.perfil === 'funcionario') {
      return router.createUrlTree(['/funcionario/dashboard']);
    }

    api.logout();
    return router.createUrlTree(['/login']);
  }

  return true;
};
