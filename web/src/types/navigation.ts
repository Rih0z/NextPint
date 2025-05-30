// Web navigation types (Next.js router based)
export type RootRoutes = {
  '/': undefined;
  '/onboarding': undefined;
  '/onboarding/concept': undefined;
  '/onboarding/privacy': undefined;
  '/onboarding/setup': undefined;
  '/home': undefined;
  '/sessions': undefined;
  '/sessions/create': undefined;
  '/sessions/[id]': { id: string };
  '/history': undefined;
  '/history/beers': undefined;
  '/history/sessions': undefined;
  '/history/beer/[id]': { id: string };
  '/history/session/[id]': { id: string };
  '/settings': undefined;
  '/settings/profile': undefined;
  '/settings/preferences': undefined;
  '/settings/data': undefined;
  '/settings/about': undefined;
  '/import': undefined;
  '/import/[source]': { source: string };
};

export type PageParams = {
  [K in keyof RootRoutes]: RootRoutes[K] extends undefined ? Record<string, never> : RootRoutes[K];
};