const fs = require('fs');
const path = require('path');

module.exports = {
  onPreBuild: async ({ utils }) => {
    const contentDir = path.join(process.cwd(), 'content');
    const folders = ['blog', 'gallery', 'artists', 'sponsors'];

    console.log('Meshahara: Generating content indexes...');

    for (const folder of folders) {
      const folderPath = path.join(contentDir, folder);

      if (!fs.existsSync(folderPath)) {
        console.log(`  Skipping ${folder} — folder not found`);
        continue;
      }

      // Get all markdown files, sorted newest first
      const files = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse();

      const indexPath = path.join(folderPath, 'index.json');
      fs.writeFileSync(indexPath, JSON.stringify(files, null, 2));

      console.log(`  ${folder}: ${files.length} file(s) → index.json updated`);
      if (files.length > 0) {
        files.forEach(f => console.log(`    - ${f}`));
      }
    }

    console.log('Meshahara: Content indexes complete.');
  }
};
