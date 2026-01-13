# Migrations de base de données

Ce dossier contient les migrations TypeORM pour gérer l'évolution du schéma de la base de données en production.

## Commandes disponibles

### Créer une nouvelle migration (manuelle)

```bash
npm run migration:create -- src/migrations/NomDeLaMigration
```

### Générer une migration automatiquement

Après avoir modifié vos entités, TypeORM peut générer automatiquement la migration en JavaScript :

```bash
npm run migration:generate -- src/migrations/NomDeLaMigration
```

### Exécuter les migrations en attente

```bash
npm run migration:run
```

### Annuler la dernière migration

```bash
npm run migration:revert
```

### Voir l'état des migrations

```bash
npm run migration:show
```

## Workflow de développement

1. **Modifier vos entités** dans `src/entity/`
2. **Générer la migration** : `npm run migration:generate -- src/migrations/DescriptionDuChangement`
3. **Vérifier le fichier généré** dans `src/migrations/`
4. **Tester la migration** : `npm run migration:run`
5. **Commiter la migration** avec votre code

## En production

Les migrations s'exécutent automatiquement au démarrage de l'application grâce à `migrationsRun: true` dans la configuration.

## Migration initiale

Le fichier `Initial` est une migration vide qui marque l'état actuel de votre base de données. Toutes les futures migrations seront appliquées après celle-ci.

## Important

- ⚠️ Ne modifiez jamais une migration déjà exécutée en production
- ✅ Testez toujours vos migrations en local avant de déployer
- ✅ Vérifiez les migrations générées automatiquement (TypeORM peut se tromper)
- ✅ Ajoutez une méthode `down()` pour pouvoir annuler la migration si nécessaire
