import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public auth pages are prerendered. Everything else depends on the session
 * stored in the browser, so it renders on the client.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: 'auth/register', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
