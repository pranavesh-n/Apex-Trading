import 'dotenv/config';
import { spawn } from 'child_process';

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

console.log('Deploying to Cloudflare Pages...');
console.log('Account ID:', accountId);

const proc = spawn('npx.cmd', [
  'wrangler',
  'pages',
  'deploy',
  'dist',
  '--project-name',
  'axtrade',
  '--commit-dirty=true'
], {
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ACCOUNT_ID: accountId
  },
  stdio: 'inherit',
  shell: true
});

proc.on('close', (code) => {
  console.log(`Deployment process completed with exit code: ${code}`);
});
