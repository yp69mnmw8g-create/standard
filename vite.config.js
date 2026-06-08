import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Alles clientseitig, keine Datenbank. JSON-Daten liegen unter src/data.
export default defineConfig({
  plugins: [react()],
})
