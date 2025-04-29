
import type { Plugin } from 'vite';

export function sockJsPolyfill(): Plugin {
  return {
    name: 'sockjs-polyfill',
    
    // Transform the code to handle the global reference in sockjs-client
    transform(code, id) {
      if (id.includes('sockjs-client')) {
        // Replace any references to global with window
        const newCode = code.replace(/\bglobal\b/g, 'window');
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
