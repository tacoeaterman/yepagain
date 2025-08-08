import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
  },
  define: {
    // Inject Firebase config at build time
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).apiKey : 'demo-key'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).projectId : 'demo-project'),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).appId : 'demo-app-id'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).authDomain : 'demo-project.firebaseapp.com'),
    'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).databaseURL : 'https://demo-project-default-rtdb.firebaseio.com'),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG).storageBucket : 'demo-project.firebasestorage.app'),
  },
});
