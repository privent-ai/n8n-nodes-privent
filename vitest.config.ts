import { defineConfig } from 'vitest/config';

/**
 * `globalSetup` runs once per suite run, so the mode block is printed whether
 * the run is green or red. Reporting it only on failure would defeat the point:
 * the reader who needs to know what a GREEN tick means is exactly the one who
 * never sees a failure message.
 */
export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    globalSetup: ['./__tests__/_global-setup.ts'],
  },
});
