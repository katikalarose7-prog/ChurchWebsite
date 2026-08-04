// Centralized environment loader.
//
// Any file that reads process.env at its own TOP LEVEL (not inside a
// function called later) must `import './loadEnv.js'` as its very FIRST
// import. ES modules resolve and execute all of a file's imports, in
// dependency order, before that file's own body runs — so as long as this
// module is imported first, .env is guaranteed to be loaded before anything
// else executes, no matter what order the rest of the app imports things in.
//
// dotenv.config() is safe to call multiple times (subsequent calls are a
// no-op), and this module itself only runs once thanks to ES module caching.
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
