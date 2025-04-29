
// SockJS polyfill plugin for Vite
// This plugin fixes the "global is not defined" issue with sockjs-client in browser environments

export function sockJsPolyfill() {
  return {
    name: 'vite:sockjs-polyfill',
    transform(code: string, id: string) {
      // Only apply this transform to sockjs-client files
      if (id.includes('sockjs-client')) {
        // Replace references to the global object with window
        const modified = code
          .replace(/typeof global/g, 'typeof window')
          .replace(/\bglobal\b(?!\s*=)/g, 'window');
          
        return {
          code: modified,
          map: null
        };
      }
      return null;
    },
    // Inject global polyfill at the start of the application
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `
            // SockJS global polyfill
            window.global = window;
          `,
          injectTo: 'head-prepend'
        }
      ];
    }
  };
}
