import fs from 'fs';
import path from 'path';
import { designManifest } from '../lib/design-manifest';

const generateCSS = () => {
  let css = `/* AUTO-GENERATED FROM DESIGN MANIFEST - DO NOT EDIT MANUALLY */\n\n`;
  
  css += `:root {\n`;
  for (const [key, value] of Object.entries(designManifest.colors)) {
    css += `  --${key}: ${value};\n`;
  }
  css += `}\n\n`;

  css += `@theme inline {\n`;
  
  // Colors
  for (const key of Object.keys(designManifest.colors)) {
    css += `  --color-${key}: var(--${key});\n`;
  }
  
  // Fonts
  for (const [key, value] of Object.entries(designManifest.typography.fonts)) {
    css += `  --font-${key}: ${value};\n`;
  }
  
  css += `}\n`;
  
  const outputPath = path.resolve(process.cwd(), 'app/theme.css');
  fs.writeFileSync(outputPath, css);
  console.log(`Generated theme CSS at ${outputPath}`);
};

generateCSS();
