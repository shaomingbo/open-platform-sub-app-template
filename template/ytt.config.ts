// yapi-to-typescript configuration.
//
// Runs `pnpm generate:api` to pull API spec from YAPI and emit
// `src/types/api/<camelCase interface path>.d.ts`. Each sub-app uses its
// own YAPI category (replace `{{YAPI_CATEGORY}}` below with your category
// id) but shares the YAPI token via `.env.local YAPI_TOKEN=`.
//
// ts-node hack: ytt 3.38.0 transitively pulls ts-node 8.10.2 + typescript
// 4.9.5. The old TS doesn't recognize `ignoreDeprecations: "6.0"`, so the
// package.json `ytt` script sets
// `TS_NODE_COMPILER_OPTIONS='{"ignoreDeprecations":"6.0"}'` ENV var as a
// work-around. Keep it.
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'yapi-to-typescript';

const LOCAL = path.resolve(__dirname, '.env.local');
dotenv.config({ path: fs.existsSync(LOCAL) ? LOCAL : '.env' });

export default defineConfig([
  {
    serverUrl: process.env.YAPI_SERVER || 'http://192.168.35.10:3000/',
    typesOnly: true,
    target: 'typescript',
    reactHooks: {
      enabled: false,
    },
    prodEnvName: 'production',
    outputFilePath: (interfaceInfo, changeCase) => {
      const paths = interfaceInfo.path
        .split('/')
        .map((item) => changeCase.camelCase(item))
        .join('/');
      return `src/types/api/${paths}.d.ts`;
    },
    getRequestDataTypeName: (interfaceInfo, changeCase) => {
      return `${changeCase.pascalCase(interfaceInfo.parsedPath.name)}Request`;
    },
    getResponseDataTypeName: (interfaceInfo, changeCase) => {
      return `${changeCase.pascalCase(interfaceInfo.parsedPath.name)}Response`;
    },
    dataKey: 'data',
    projects: [
      {
        token: process.env.YAPI_TOKEN as string,
        categories: [
          {
            id: {{YAPI_CATEGORY}}, // YAPI category for this sub-app's API
          },
        ],
      },
    ],
  },
]);
