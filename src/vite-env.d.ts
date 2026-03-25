/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE: 'digital' | 'manual' | 'token';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
