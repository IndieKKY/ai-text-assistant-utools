import {defineConfig, PluginOption} from 'vite'
import react from '@vitejs/plugin-react'
import {visualizer} from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default ({mode}) => {
  return defineConfig({
    base: mode === 'production_utools'?'./':'/',
    plugins: [react(), visualizer() as PluginOption],
    css: {
      modules: {
        localsConvention: "camelCase"
      }
    }
  })
}
