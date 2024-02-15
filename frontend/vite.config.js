import {defineConfig} from "vite";

import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url)); //директория текущего файла конфигурации
export default defineConfig({
    build:{
        assetsDir:'./',
        outDir:'../dist',
        emptyOutDir:'../dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            }
        }
    }
})