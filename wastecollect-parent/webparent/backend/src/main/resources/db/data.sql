-- backend/src/main/resources/data.sql

-- Insérer les rôles si ce n'est pas déjà fait
INSERT IGNORE INTO roles (name) VALUES ('ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('HOUSEHOLD');
INSERT IGNORE INTO roles (name) VALUES ('COLLECTOR');
INSERT IGNORE INTO roles (name) VALUES ('MUNICIPAL_MANAGER'); -- Important pour la création par l'admin

-- Insérer une municipalité par défaut (par exemple, Conakry)
-- Ajustez les colonnes et les valeurs en fonction de votre schéma de table `municipalities`
-- Assurez-vous que 'name' correspond à la colonne utilisée par findByMunicipalityName
INSERT IGNORE INTO municipalities (name, province, country, population, waste_management_budget)
VALUES ('Ratoma', 'Conakry', 'Guinée', 2000000, 50000000.00);
INSERT IGNORE INTO municipalities (name, province, country, population, waste_management_budget)
VALUES ('Matoto', 'Conakry', 'Guinée', 2000000, 50000000.00);
INSERT IGNORE INTO municipalities (name, province, country, population, waste_management_budget)
VALUES ('Dixinn', 'Conakry', 'Guinée', 2000000, 50000000.00);
INSERT IGNORE INTO municipalities (name, province, country, population, waste_management_budget)
VALUES ('Kaloum', 'Conakry', 'Guinée', 2000000, 50000000.00);
INSERT IGNORE INTO municipalities (name, province, country, population, waste_management_budget)
VALUES ('Matam', 'Conakry', 'Guinée', 2000000, 50000000.00);
-- Ajoutez d'autres municipalités si nécessaire pour les tests