/**
 * lint-staged Configuration for Roadrunner Game
 * Context7 best practices for pre-commit hooks
 */

export default {
  // TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
  ],
  
  // CSS and SCSS files
  '*.{css,scss,sass}': [
    'prettier --write',
  ],
  
  // HTML files
  '*.html': [
    'prettier --write',
  ],
  
  // Configuration files
  '*.{js,ts}': (filenames) => {
    const configFiles = filenames.filter(filename => 
      filename.includes('config') || 
      filename.includes('.eslintrc') || 
      filename.includes('.prettierrc') ||
      filename.includes('vite.config') ||
      filename.includes('tsconfig')
    );
    
    if (configFiles.length > 0) {
      return [
        `eslint --fix ${configFiles.join(' ')}`,
        `prettier --write ${configFiles.join(' ')}`,
      ];
    }
    
    return [];
  },
};
