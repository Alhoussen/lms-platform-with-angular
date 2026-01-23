import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

// Guard pour vérifier si l'utilisateur est connecté
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Si pas connecté, redirection (pour l'instant vers l'accueil)
    alert("Vous devez être connecté pour accéder à cette page.");
    return router.createUrlTree(['/']);
};

// Guard pour vérifier le rôle
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // On récupère le rôle attendu depuis les données de la route
    const requiredRole = route.data['role'] as UserRole;

    if (!authService.isAuthenticated()) {
        alert("Vous devez être connecté.");
        return router.createUrlTree(['/']);
    }

    if (authService.hasRole(requiredRole)) {
        return true;
    }

    alert(`Accès refusé. Cette page est réservée aux ${requiredRole}s.`);
    return router.createUrlTree(['/']);
};
