import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export type UserRole = 'student' | 'instructor';

export interface User {
    id: number;
    name: string;
    role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // Signal pour l'utilisateur courant
    private readonly _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();

    private readonly platformId = inject(PLATFORM_ID);

    // Signaux dérivés pour vérifier les rôles facilement
    readonly isAuthenticated = computed(() => this._currentUser() !== null);
    readonly isInstructor = computed(() => this._currentUser()?.role === 'instructor');
    readonly isStudent = computed(() => this._currentUser()?.role === 'student');

    constructor(private router: Router) {
        // Récupérer l'utilisateur depuis le localStorage au démarrage (uniquement côté navigateur)
        if (isPlatformBrowser(this.platformId)) {
            const storedUser = localStorage.getItem('lms_user');
            if (storedUser) {
                try {
                    this._currentUser.set(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Erreur lors du parsing user', e);
                    localStorage.removeItem('lms_user');
                }
            }
        }

        // Effet pour synchroniser avec le localStorage à chaque changement
        effect(() => {
            const user = this._currentUser();
            if (isPlatformBrowser(this.platformId)) {
                if (user) {
                    localStorage.setItem('lms_user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('lms_user');
                }
            }
        });
    }

    // Simulation de login basique
    loginAsStudent() {
        this._currentUser.set({ id: 1, name: 'Alice Etudiante', role: 'student' });
        this.router.navigate(['/']); // Redirection vers l'accueil/dashboard
    }

    loginAsInstructor() {
        this._currentUser.set({ id: 2, name: 'Bob Instructeur', role: 'instructor' });
        this.router.navigate(['/instructor']); // Redirection vers dashboard instructeur
    }

    logout() {
        this._currentUser.set(null);
        this.router.navigate(['/']);
    }

    // Vérifie si l'utilisateur a le rôle requis
    hasRole(role: UserRole): boolean {
        return this._currentUser()?.role === role;
    }
}
