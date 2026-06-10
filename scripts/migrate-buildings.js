/**
 * Building Migration Script
 * Migrates existing saves to new building tree with Command Center
 * 
 * Usage: node scripts/migrate-buildings.js
 */

const fs = require('fs');
const path = require('path');

// Migration configuration
const MIGRATION_VERSION = 2;
const SOURCE_VERSION = 1;

/**
 * Migrates a single save file
 * @param {string} savePath - Path to save file
 * @returns {object} Migration result
 */
function migrateSave(savePath) {
  try {
    const rawData = fs.readFileSync(savePath, 'utf8');
    const data = JSON.parse(rawData);

    if (data.version !== SOURCE_VERSION) {
      return {
        success: false,
        message: `Unsupported version: ${data.version}`
      };
    }

    // Add Command Center if not present
    if (!data.buildings.some(b => b.id === 'command_center')) {
      data.buildings.push({
        id: 'command_center',
        name: 'Command Center',
        category: 'Command',
        level: 0, // Locked initially
        summary: 'Coordinates recruitment and route planning.',
        effect: 'Locked - Requires Workshop Level 3 + Infirmary Level 2',
        isFocused: false
      });
    }

    // Update version
    data.version = MIGRATION_VERSION;

    // Write back
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));

    return {
      success: true,
      message: 'Migration successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Migrates all saves in a directory
 * @param {string} dirPath - Directory containing save files
 */
function migrateAllSaves(dirPath) {
  const files = fs.readdirSync(dirPath);
  const results = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const result = migrateSave(filePath);
      results.push({ file, ...result });
    }
  }

  return results;
}

// CLI execution
if (require.main === module) {
  const saveDir = process.argv[2] || './saves';
  
  if (!fs.existsSync(saveDir)) {
    console.log(`Save directory not found: ${saveDir}`);
    process.exit(1);
  }

  console.log(`Migrating saves in: ${saveDir}`);
  const results = migrateAllSaves(saveDir);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\nMigration complete:`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\nFailed migrations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.message}`);
    });
    process.exit(1);
  }
}

module.exports = { migrateSave, migrateAllSaves };
