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
    // console.warn("Auth required");
    return router.createUrlTree(['/']);
};

// Guard pour vérifier le rôle
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // On récupère le rôle attendu depuis les données de la route
    const requiredRole = route.data['role'] as UserRole;
    if (!authService.isAuthenticated()) {
        // console.warn("Utilisateur non connecté, redirection...");
        return router.createUrlTree(['/']);
    }

    if (authService.hasRole(requiredRole)) {
        return true;
    }

    console.warn(`Accès refusé. Rôle requis: ${requiredRole}`);
    return router.createUrlTree(['/']);
};
