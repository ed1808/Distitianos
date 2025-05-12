import { serve } from 'bun';

import appRouter from './src/AppRouter';

const server = serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    return appRouter.handle(req);
  },
});

console.log(`Server running on port ${server.port} 🚀`);
