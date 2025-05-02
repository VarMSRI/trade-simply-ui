
import type { Plugin } from 'vite';

export function sockJsPolyfill(): Plugin {
  return {
    name: 'sockjs-polyfill',
    
    // Transform the code to handle the global reference and deprecated event listeners in sockjs-client
    transform(code, id) {
      if (id.includes('sockjs-client')) {
        // Replace global with window
        let newCode = code.replace(/\bglobal\b/g, 'window');
        
        // Replace deprecated unload event listeners with more modern alternatives
        // This specifically targets the issue in sockjs-client.js:66
        newCode = newCode.replace(
          /(\w+)\.addEventListener\(\s*['"]unload['"]/g, 
          '$1.addEventListener(\'beforeunload\''
        );
        
        return { 
          code: newCode, 
          map: null 
        };
      }
      return null;
    },
    
    // Inject a global polyfill into the HTML
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'text/javascript' },
          children: 'window.global = window;',
          injectTo: 'head'
        }
      ];
    }
  };
}
