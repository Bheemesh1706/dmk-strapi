import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const corsOrigins = env.array('CORS_ORIGINS', [env('PUBLIC_URL', 'http://localhost:1337')]);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              env('R2_PUBLIC_URL'),
              env('R2_ENDPOINT'),
            ],
            'media-src': [
              "'self'",
              'data:',
              'blob:',
              env('R2_PUBLIC_URL'),
              env('R2_ENDPOINT'),
            ],
            'connect-src': [
              "'self'",
              'https:',
              ...corsOrigins,
              env('R2_PUBLIC_URL'),
              env('R2_ENDPOINT'),
            ],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: corsOrigins,
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        credentials: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
