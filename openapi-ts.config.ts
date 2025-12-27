import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './swagger.json',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/api',
  },
  plugins: [
    {
      name: '@hey-api/client-axios',
    },
    '@hey-api/schemas',
    {
      name: '@hey-api/transformers',
      // Treat OpenAPI format "date" as strings so we can send YYYY-MM-DD
      // and avoid timezone shifts breaking .NET DateOnly parsing.
      dates: false,
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
    },
  ],
});
