/**
 * Custom ESLint Rules for 3D Development
 * Context7 best practices for WebGL, Three.js, and 3D game development
 */

export const threeJsRules = {
  // Memory Management Rules
  'three-js/dispose-geometry': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (['BufferGeometry', 'Geometry', 'SphereGeometry', 'BoxGeometry', 'PlaneGeometry'].includes(className)) {
              context.report({
                node,
                message: 'Consider disposing of THREE.js geometry objects to prevent memory leaks. Use ResourceTracker or dispose() method.',
                suggest: [{
                  desc: 'Add dispose() call after use',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(node, '.dispose()');
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  'three-js/dispose-materials': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (['Material', 'MeshBasicMaterial', 'MeshPhongMaterial', 'MeshStandardMaterial', 'ShaderMaterial'].includes(className)) {
              context.report({
                node,
                message: 'Consider disposing of THREE.js material objects to prevent memory leaks. Use ResourceTracker or dispose() method.',
                suggest: [{
                  desc: 'Add dispose() call after use',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(node, '.dispose()');
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  'three-js/dispose-textures': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (['Texture', 'CanvasTexture', 'VideoTexture', 'DataTexture'].includes(className)) {
              context.report({
                node,
                message: 'Consider disposing of THREE.js texture objects to prevent memory leaks. Use ResourceTracker or dispose() method.',
                suggest: [{
                  desc: 'Add dispose() call after use',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(node, '.dispose()');
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  // Performance Rules
  'three-js/avoid-inline-shaders': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (className === 'ShaderMaterial') {
              const options = node.arguments[0];
              if (options && options.type === 'ObjectExpression') {
                const vertexShader = options.properties.find(prop => 
                  prop.key.name === 'vertexShader' && prop.value.type === 'Literal'
                );
                const fragmentShader = options.properties.find(prop => 
                  prop.key.name === 'fragmentShader' && prop.value.type === 'Literal'
                );
                
                if (vertexShader || fragmentShader) {
                  context.report({
                    node,
                    message: 'Avoid inline shaders in ShaderMaterial. Use external shader files or shader modules for better performance and maintainability.',
                    suggest: [{
                      desc: 'Move shaders to external files',
                      fix: (fixer) => {
                        return fixer.replaceText(node, '/* Move shaders to external files */');
                      }
                    }]
                  });
                }
              }
            }
          }
        }
      };
    }
  },

  'three-js/optimize-geometry-creation': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (['SphereGeometry', 'BoxGeometry', 'PlaneGeometry'].includes(className)) {
              const args = node.arguments;
              if (args.length > 0 && args[0].type === 'Literal' && args[0].value > 64) {
                context.report({
                  node,
                  message: 'High geometry detail may impact performance. Consider using LOD (Level of Detail) or instancing for better performance.',
                  suggest: [{
                    desc: 'Use LOD for distant objects',
                    fix: (fixer) => {
                      return fixer.insertTextBefore(node, '/* Consider using LOD for distant objects */ ');
                    }
                  }]
                });
              }
            }
          }
        }
      };
    }
  },

  // WebGL Best Practices
  'webgl/check-context-loss': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.property?.name === 'getContext' && 
              node.arguments[0]?.value === 'webgl') {
            context.report({
              node,
              message: 'Always check for WebGL context loss and handle it gracefully. Add context loss event listeners.',
              suggest: [{
                desc: 'Add context loss handling',
                fix: (fixer) => {
                  return fixer.insertTextAfter(node, `
// Add context loss handling
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  // Handle context loss
});
canvas.addEventListener('webglcontextrestored', () => {
  // Reinitialize WebGL resources
});`);
                }
              }]
            });
          }
        }
      };
    }
  },

  'webgl/check-extension-support': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.property?.name === 'getExtension') {
            context.report({
              node,
              message: 'Always check if WebGL extensions are supported before using them. Add null checks.',
              suggest: [{
                desc: 'Add extension support check',
                fix: (fixer) => {
                  return fixer.insertTextBefore(node, 'const extension = ');
                }
              }]
            });
          }
        }
      };
    }
  },

  // Animation and Rendering Rules
  'three-js/use-request-animation-frame': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'setInterval' || node.callee.name === 'setTimeout') {
            const parent = node.parent;
            if (parent.type === 'CallExpression' && 
                parent.callee.name === 'setInterval' && 
                parent.arguments[1]?.value < 16) {
              context.report({
                node,
                message: 'Use requestAnimationFrame instead of setInterval for smooth 60fps animations. setInterval may cause frame drops.',
                suggest: [{
                  desc: 'Replace with requestAnimationFrame',
                  fix: (fixer) => {
                    return fixer.replaceText(node, 'requestAnimationFrame(render)');
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  'three-js/optimize-render-loop': {
    create(context) {
      return {
        FunctionDeclaration(node) {
          if (node.id?.name === 'render' || node.id?.name === 'animate') {
            const body = node.body.body;
            const hasRenderCall = body.some(stmt => 
              stmt.type === 'ExpressionStatement' && 
              stmt.expression.type === 'CallExpression' &&
              stmt.expression.callee.property?.name === 'render'
            );
            
            if (hasRenderCall) {
              context.report({
                node,
                message: 'Consider using renderer.info to monitor performance and implement frame rate limiting in render loops.',
                suggest: [{
                  desc: 'Add performance monitoring',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(node.body.body[0], `
// Monitor performance
if (renderer.info) {
  console.log('Draw calls:', renderer.info.render.calls);
  console.log('Triangles:', renderer.info.render.triangles);
}`);
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  // Resource Management Rules
  'three-js/use-resource-tracker': {
    create(context) {
      return {
        Program(node) {
          const hasThreeJsImports = node.body.some(stmt => 
            stmt.type === 'ImportDeclaration' && 
            stmt.source.value === 'three'
          );
          
          if (hasThreeJsImports) {
            const hasResourceTracker = node.body.some(stmt => 
              stmt.type === 'VariableDeclaration' &&
              stmt.declarations.some(decl => 
                decl.id.name === 'ResourceTracker' || 
                decl.id.name === 'resourceTracker'
              )
            );
            
            if (!hasResourceTracker) {
              context.report({
                node,
                message: 'Consider using a ResourceTracker class to manage THREE.js object disposal and prevent memory leaks.',
                suggest: [{
                  desc: 'Add ResourceTracker implementation',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(node.body[0], `
// ResourceTracker for memory management
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource);
        }
      }
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();
  }
}
const resourceTracker = new ResourceTracker();`);
                  }
                }]
              });
            }
          }
        }
      };
    }
  },

  // Shader Rules
  'three-js/validate-shader-syntax': {
    create(context) {
      return {
        CallExpression(node) {
          if (node.callee.name === 'new' && node.callee.object?.name === 'THREE') {
            const className = node.callee.property?.name;
            if (className === 'ShaderMaterial') {
              const options = node.arguments[0];
              if (options && options.type === 'ObjectExpression') {
                const vertexShader = options.properties.find(prop => 
                  prop.key.name === 'vertexShader'
                );
                const fragmentShader = options.properties.find(prop => 
                  prop.key.name === 'fragmentShader'
                );
                
                if (vertexShader && fragmentShader) {
                  context.report({
                    node,
                    message: 'Validate shader syntax and ensure proper precision qualifiers. Use highp for vertex shaders, mediump for fragment shaders.',
                    suggest: [{
                      desc: 'Add precision qualifiers',
                      fix: (fixer) => {
                        return fixer.insertTextAfter(node, `
// Ensure shaders have proper precision qualifiers:
// Vertex shader: precision highp float;
// Fragment shader: precision mediump float;`);
                      }
                    }]
                  });
                }
              }
            }
          }
        }
      };
    }
  }
};
