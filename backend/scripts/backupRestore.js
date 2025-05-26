const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DB_NAME = 'gestion-visites-med';
const BACKUP_DIR = path.join(__dirname, '../backups');

// Créer le dossier de sauvegarde s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function backupDatabase() {
  try {
    console.log('📦 Sauvegarde de la base de données...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    const command = `mongodump --db ${DB_NAME} --out "${backupPath}"`;
    
    await executeCommand(command);
    
    console.log('✅ Sauvegarde créée:', backupPath);
    console.log('📁 Fichiers sauvegardés:');
    
    const backupDbPath = path.join(backupPath, DB_NAME);
    if (fs.existsSync(backupDbPath)) {
      const files = fs.readdirSync(backupDbPath);
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    
    return backupPath;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error.message);
    throw error;
  }
}

async function restoreDatabase(backupPath) {
  try {
    console.log('📥 Restauration de la base de données...');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Le chemin de sauvegarde n'existe pas: ${backupPath}`);
    }
    
    const command = `mongorestore --db ${DB_NAME} --drop "${path.join(backupPath, DB_NAME)}"`;
    
    await executeCommand(command);
    
    console.log('✅ Base de données restaurée depuis:', backupPath);
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error.message);
    throw error;
  }
}

async function listBackups() {
  try {
    console.log('📋 Sauvegardes disponibles:');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('   Aucune sauvegarde trouvée');
      return [];
    }
    
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(item => item.startsWith('backup-'))
      .sort()
      .reverse(); // Plus récent en premier
    
    if (backups.length === 0) {
      console.log('   Aucune sauvegarde trouvée');
      return [];
    }
    
    backups.forEach((backup, index) => {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);
      console.log(`   ${index + 1}. ${backup} (${stats.mtime.toLocaleString('fr-FR')})`);
    });
    
    return backups.map(backup => path.join(BACKUP_DIR, backup));
  } catch (error) {
    console.error('❌ Erreur lors de la liste des sauvegardes:', error.message);
    return [];
  }
}

async function exportToJSON() {
  try {
    console.log('📄 Export en JSON...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(BACKUP_DIR, `export-${timestamp}.json`);
    
    const collections = ['users', 'employes', 'rendezvous', 'historiques'];
    const exportData = {};
    
    for (const collection of collections) {
      const command = `mongoexport --db ${DB_NAME} --collection ${collection} --jsonArray`;
      const result = await executeCommand(command);
      exportData[collection] = JSON.parse(result.stdout || '[]');
      console.log(`   ✅ ${collection}: ${exportData[collection].length} documents`);
    }
    
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Export JSON créé:', exportPath);
    return exportPath;
  } catch (error) {
    console.error('❌ Erreur lors de l\'export JSON:', error.message);
    throw error;
  }
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'backup':
        await backupDatabase();
        break;
        
      case 'restore':
        const backupPath = args[1];
        if (!backupPath) {
          console.log('Usage: node backupRestore.js restore <chemin-sauvegarde>');
          const backups = await listBackups();
          if (backups.length > 0) {
            console.log('\nUtilisez un de ces chemins:');
            backups.forEach((backup, index) => {
              console.log(`   ${index + 1}. "${backup}"`);
            });
          }
          return;
        }
        await restoreDatabase(backupPath);
        break;
        
      case 'list':
        await listBackups();
        break;
        
      case 'export':
        await exportToJSON();
        break;
        
      default:
        console.log('🔧 Utilitaire de sauvegarde/restauration MongoDB');
        console.log('');
        console.log('Usage:');
        console.log('  node backupRestore.js backup                    # Créer une sauvegarde');
        console.log('  node backupRestore.js restore <chemin>          # Restaurer une sauvegarde');
        console.log('  node backupRestore.js list                      # Lister les sauvegardes');
        console.log('  node backupRestore.js export                    # Exporter en JSON');
        console.log('');
        console.log('Exemples:');
        console.log('  node backupRestore.js backup');
        console.log('  node backupRestore.js list');
        console.log('  node backupRestore.js restore "./backups/backup-2024-01-15T10-30-00-000Z"');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  backupDatabase,
  restoreDatabase,
  listBackups,
  exportToJSON
};
