import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { themePreset } from './core/theme/theme-preset';
import { OPERATION_REPOSITORY, SERVER_REPOSITORY } from './core/tokens/repositories';
import { DexieOperationRepository } from './infra/repositories/dexie-operation.repository';
import { DexieServerRepository } from './infra/repositories/dexie-server.repository';
import { SeedDefaultUseCases } from './application/use-cases/seed-default.use-cases';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    providePrimeNG({
      ripple: true,
      theme: { preset: themePreset },
      translation: {
        startsWith: 'Commence par',
        contains: 'Contient',
        notContains: 'Ne contient pas',
        endsWith: 'Se termine par',
        equals: 'Egal a',
        notEquals: 'Different de',
        noFilter: 'Aucun filtre',
        lt: 'Inferieur a',
        lte: 'Inferieur ou egal a',
        gt: 'Superieur a',
        gte: 'Superieur ou egal a',
        dateIs: 'Date est',
        dateIsNot: 'Date nest pas',
        dateBefore: 'Date avant',
        dateAfter: 'Date apres',
        clear: 'Effacer',
        apply: 'Appliquer',
        matchAll: 'Toutes les regles',
        matchAny: 'Au moins une regle',
        addRule: 'Ajouter une regle',
        removeRule: 'Supprimer la regle',
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        monthNames: [
          'Janvier',
          'Fevrier',
          'Mars',
          'Avril',
          'Mai',
          'Juin',
          'Juillet',
          'Aout',
          'Septembre',
          'Octobre',
          'Novembre',
          'Decembre'
        ],
        monthNamesShort: [
          'Jan',
          'Fev',
          'Mar',
          'Avr',
          'Mai',
          'Juin',
          'Juil',
          'Aout',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ],
        today: 'Aujourdhui',
        weekHeader: 'Sem'
      }
    }),
    provideRouter(routes, withHashLocation()),
    { provide: OPERATION_REPOSITORY, useClass: DexieOperationRepository },
    { provide: SERVER_REPOSITORY, useClass: DexieServerRepository },
    provideAppInitializer(() => {
      const seed = inject(SeedDefaultUseCases);
      return seed.seedIfEmpty();
    })
  ]
};
