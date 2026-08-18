import fs from 'fs';
import path from 'path';

const parseNumber = (val: string, name: string): number => {
  const num = parseFloat(val);
  if (isNaN(num)) {
    console.error(`Malformed token value for ${name}: ${val} is not a number.`);
    process.exit(1);
  }
  return num;
};

interface ThemeDictionary {
  colors: Record<string, string>;
  typography: {
    fonts: { sans: string; mono: string };
    sizes: { sm: { fontSize: number; lineHeight: number } };
  };
  masonry: Record<string, number>;
  layout: Record<string, number>;
  breakpoints: Record<string, number>;
  motion: {
    springs: Record<string, { type: string; stiffness: number; damping: number }>;
  };
}

const COLOR_KEYS = [
  'background', 'foreground', 'surface-1', 'surface-2', 
  'border', 'border-active', 'muted', 'muted-strong', 
  'brand-cyan', 'brand-cyan-glow', 'brand-blue', 'brand-blue-glow', 
  'brand-dark', 'success', 'error', 'warning'
];

const parseVariablesFromBlock = (blockContent: string): Record<string, string> => {
  const vars: Record<string, string> = {};
  const varRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(blockContent)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
};

const parseCSSRules = (cssContent: string) => {
  const cleanCSS = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: { selector: string; content: string }[] = [];
  
  let i = 0;
  while (i < cleanCSS.length) {
    const openBrace = cleanCSS.indexOf('{', i);
    if (openBrace === -1) break;

    const rawHeader = cleanCSS.substring(i, openBrace);
    const lastSemi = rawHeader.lastIndexOf(';');
    const selector = (lastSemi !== -1 ? rawHeader.substring(lastSemi + 1) : rawHeader).trim();

    let depth = 1;
    let j = openBrace + 1;
    while (j < cleanCSS.length && depth > 0) {
      if (cleanCSS[j] === '{') depth++;
      else if (cleanCSS[j] === '}') depth--;
      j++;
    }

    const content = cleanCSS.substring(openBrace + 1, j - 1).trim();
    rules.push({ selector, content });
    i = j;
  }
  return rules;
};

const processTokens = (tokens: Record<string, string>): ThemeDictionary => {
  const dictionary: ThemeDictionary = {
    colors: {},
    typography: {
      fonts: { sans: '', mono: '' },
      sizes: { sm: { fontSize: 13, lineHeight: 18 } }
    },
    masonry: {},
    layout: {},
    breakpoints: {},
    motion: { springs: {} }
  };

  // Colors
  for (const key of COLOR_KEYS) {
    if (tokens[key]) {
      dictionary.colors[key] = tokens[key];
    }
  }
  for (const [key, value] of Object.entries(tokens)) {
    if (!COLOR_KEYS.includes(key) &&
        !key.startsWith('layout-') &&
        !key.startsWith('breakpoint-') &&
        !key.startsWith('font-') &&
        !key.startsWith('line-height-') &&
        !key.startsWith('motion-')) {
      dictionary.colors[key] = value;
    }
  }

  // Layout & Masonry
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('layout-masonry-')) {
      const camelName = key.replace('layout-masonry-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
      dictionary.masonry[camelName] = parseNumber(value, key);
    } else if (key.startsWith('layout-')) {
      const camelName = key.replace('layout-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
      dictionary.layout[camelName] = parseNumber(value, key);
    }
  }

  // Breakpoints
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('breakpoint-')) {
      const bName = key.replace('breakpoint-', '');
      dictionary.breakpoints[bName] = parseNumber(value, key);
    }
  }

  // Typography
  dictionary.typography.fonts.sans = tokens['font-sans'] || "var(--font-inter), system-ui, -apple-system, sans-serif";
  dictionary.typography.fonts.mono = tokens['font-mono'] || "var(--font-geist-mono), ui-monospace, monospace";
  dictionary.typography.sizes.sm = {
    fontSize: parseNumber(tokens['font-size-sm'] || "13", 'font-size-sm'),
    lineHeight: parseNumber(tokens['line-height-sm'] || "18", 'line-height-sm')
  };

  // Motion
  const springsData: Record<string, { type: string; stiffness: number; damping: number }> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('motion-spring-')) {
      const match = key.match(/motion-spring-(.+)-(stiffness|damping)/);
      if (match) {
        const [, name, prop] = match;
        const camelName = name.replace(/-([a-z])/g, g => g[1].toUpperCase());
        if (!springsData[camelName]) springsData[camelName] = { type: "spring", stiffness: 0, damping: 0 };
        springsData[camelName][prop as 'stiffness' | 'damping'] = parseNumber(value, key);
      }
    }
  }
  dictionary.motion.springs = springsData;

  return dictionary;
};

const renderDictionaryTS = (dict: ThemeDictionary, indent: string = '  '): string => {
  let ts = '';
  
  // Colors
  ts += `${indent}colors: {\n`;
  for (const [k, v] of Object.entries(dict.colors)) {
    ts += `${indent}  /** Original CSS Variable: --${k} */\n`;
    ts += `${indent}  "${k}": "${v}",\n`;
  }
  ts += `${indent}},\n`;

  // Typography
  ts += `${indent}typography: {\n`;
  ts += `${indent}  fonts: {\n`;
  ts += `${indent}    /** Font stack for sans-serif */\n`;
  ts += `${indent}    sans: "${dict.typography.fonts.sans}",\n`;
  ts += `${indent}    /** Font stack for monospace */\n`;
  ts += `${indent}    mono: "${dict.typography.fonts.mono}",\n`;
  ts += `${indent}  },\n`;
  ts += `${indent}  sizes: {\n`;
  ts += `${indent}    sm: {\n`;
  ts += `${indent}      /** Original CSS Variable: --font-size-sm */\n`;
  ts += `${indent}      fontSize: ${dict.typography.sizes.sm.fontSize},\n`;
  ts += `${indent}      /** Original CSS Variable: --line-height-sm */\n`;
  ts += `${indent}      lineHeight: ${dict.typography.sizes.sm.lineHeight},\n`;
  ts += `${indent}    }\n`;
  ts += `${indent}  }\n`;
  ts += `${indent}},\n`;

  // Masonry
  ts += `${indent}masonry: {\n`;
  for (const [k, v] of Object.entries(dict.masonry)) {
    const cssName = `layout-masonry-${k.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
    ts += `${indent}  /** Original CSS Variable: --${cssName} */\n`;
    ts += `${indent}  ${k}: ${v},\n`;
  }
  ts += `${indent}},\n`;

  // Layout
  ts += `${indent}layout: {\n`;
  for (const [k, v] of Object.entries(dict.layout)) {
    const cssName = `layout-${k.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
    ts += `${indent}  /** Original CSS Variable: --${cssName} */\n`;
    ts += `${indent}  ${k}: ${v},\n`;
  }
  ts += `${indent}},\n`;

  // Breakpoints
  ts += `${indent}breakpoints: {\n`;
  for (const [k, v] of Object.entries(dict.breakpoints)) {
    ts += `${indent}  /** Original CSS Variable: --breakpoint-${k} */\n`;
    ts += `${indent}  "${k}": ${v},\n`;
  }
  ts += `${indent}},\n`;

  // Motion
  ts += `${indent}motion: {\n`;
  ts += `${indent}  springs: {\n`;
  for (const [k, obj] of Object.entries(dict.motion.springs)) {
    ts += `${indent}    ${k}: { type: "${obj.type}", stiffness: ${obj.stiffness}, damping: ${obj.damping} },\n`;
  }
  ts += `${indent}  }\n`;
  ts += `${indent}},\n`;

  return ts;
};

const parseCSSAndGenerateTS = () => {
  const cssPath = path.resolve(process.cwd(), 'app/globals.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  const rules = parseCSSRules(css);

  const rootRules = rules.filter(r => 
    r.selector.split(',').some(s => {
      const trimmed = s.trim();
      return (trimmed === ':root' || trimmed === 'html') && 
             !trimmed.includes('light') && 
             !trimmed.includes('dark') && 
             !trimmed.includes('data-theme') && 
             !trimmed.includes('data-studio-theme');
    })
  );

  const lightRules = rules.filter(r => 
    r.selector.includes('light') || 
    r.selector.includes('data-theme="light"') || 
    r.selector.includes("data-theme='light'") || 
    r.selector.includes('data-studio-theme="light"')
  );

  const rootTokens: Record<string, string> = {};
  for (const rule of rootRules) {
    Object.assign(rootTokens, parseVariablesFromBlock(rule.content));
  }

  if (Object.keys(rootTokens).length === 0) {
    console.error("Could not find :root block in globals.css");
    process.exit(1);
  }

  const lightBlockTokens: Record<string, string> = {};
  for (const rule of lightRules) {
    Object.assign(lightBlockTokens, parseVariablesFromBlock(rule.content));
  }

  const rootManifest = processTokens(rootTokens);
  const mergedLightTokens = { ...rootTokens, ...lightBlockTokens };
  const lightManifest = processTokens(mergedLightTokens);

  let ts = `/**\n * AUTO-GENERATED DESIGN TOKENS\n * Do not edit this file directly. Edit app/globals.css instead.\n */\n\n`;
  ts += `export const designManifest = {\n`;
  ts += renderDictionaryTS(rootManifest, '  ');
  ts += `  themes: {\n`;
  ts += `    light: {\n`;
  ts += renderDictionaryTS(lightManifest, '      ');
  ts += `    }\n`;
  ts += `  }\n`;
  ts += `} as const;\n\n`;
  ts += `export const themes = designManifest.themes;\n`;
  ts += `export const lightTheme = designManifest.themes.light;\n`;
  ts += `export type DesignManifest = typeof designManifest;\n`;
  ts += `export type ThemeDictionary = typeof designManifest.themes.light;\n`;

  const outputPath = path.resolve(process.cwd(), 'lib/design-manifest.ts');
  fs.writeFileSync(outputPath, ts);
  console.log(`Generated TS constants at ${outputPath}`);
};

parseCSSAndGenerateTS();
