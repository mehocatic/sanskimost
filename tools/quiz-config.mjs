import { writeFileSync } from 'node:fs';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url && !key) {
  writeFileSync('quiz-config.js', 'window.quizConfig = null;\n');
} else {
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url || '') || !/^sb_publishable_[\w-]+$/.test(key || '')) {
    throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
  }
  writeFileSync('quiz-config.js', 'window.quizConfig = ' + JSON.stringify({url,key}) + ';\n');
}
