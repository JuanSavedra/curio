// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import offline from './src/integrations/offline.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), offline()]
});
