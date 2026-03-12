/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_VAPID_KEY: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
