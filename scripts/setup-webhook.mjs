/**
 * ngrok이 실행 중인 상태에서 이 스크립트를 실행하면:
 * 1. ngrok 터널 URL을 자동으로 읽어옴
 * 2. Polar sandbox에 webhook endpoint 등록
 * 3. .env.local에 POLAR_WEBHOOK_SECRET 자동 저장
 *
 * 실행: node scripts/setup-webhook.mjs
 */

import { Polar } from '@polar-sh/sdk';
import fs from 'fs';
import path from 'path';

const ENV_PATH = path.resolve(process.cwd(), '.env.local');

// ── 1. ngrok 터널 URL 읽기 ──────────────────────────────────────────────────

async function getNgrokUrl() {
  const res = await fetch('http://localhost:4040/api/tunnels');
  if (!res.ok) throw new Error('ngrok API 응답 실패 — ngrok이 실행 중인지 확인하세요');
  const { tunnels } = await res.json();
  const https = tunnels.find((t) => t.public_url?.startsWith('https'));
  if (!https) throw new Error('HTTPS 터널을 찾을 수 없습니다');
  return https.public_url;
}

// ── 2. .env.local 업데이트 ─────────────────────────────────────────────────

function updateEnvFile(key, value) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content = content.trimEnd() + `\n${key}=${value}\n`;
  }
  fs.writeFileSync(ENV_PATH, content, 'utf8');
}

// ── 3. 기존 webhook endpoint 정리 ─────────────────────────────────────────

async function deleteExistingEndpoints(polar, targetUrl) {
  try {
    const iter = await polar.webhooks.listWebhookEndpoints({});
    for await (const page of iter) {
      for (const ep of page.result.items) {
        if (ep.url.includes('/api/payment/webhook')) {
          await polar.webhooks.deleteWebhookEndpoint({ id: ep.id });
          console.log(`  기존 endpoint 삭제: ${ep.url}`);
        }
      }
    }
  } catch {
    // 목록 조회 실패는 무시
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const token = process.env.POLAR_API_TOKEN;
  if (!token) {
    // .env.local에서 직접 읽기
    const env = fs.readFileSync(ENV_PATH, 'utf8');
    const match = env.match(/^POLAR_API_TOKEN=(.+)$/m);
    if (!match) throw new Error('.env.local에 POLAR_API_TOKEN이 없습니다');
    process.env.POLAR_API_TOKEN = match[1].trim();
  }

  console.log('🔍  ngrok 터널 URL 확인 중...');
  const ngrokUrl = await getNgrokUrl();
  console.log(`✅  ngrok URL: ${ngrokUrl}`);

  const polar = new Polar({
    accessToken: process.env.POLAR_API_TOKEN,
    server: 'sandbox',
  });

  const webhookUrl = `${ngrokUrl}/api/payment/webhook`;

  console.log('🧹  기존 webhook endpoint 정리 중...');
  await deleteExistingEndpoints(polar, webhookUrl);

  console.log(`📡  Polar에 webhook endpoint 등록 중...\n    ${webhookUrl}`);
  const endpoint = await polar.webhooks.createWebhookEndpoint({
    url: webhookUrl,
    format: 'raw',
    events: ['order.paid'],
  });

  console.log(`✅  Webhook endpoint 등록 완료 (id: ${endpoint.id})`);

  updateEnvFile('POLAR_WEBHOOK_SECRET', endpoint.secret);
  console.log('✅  .env.local에 POLAR_WEBHOOK_SECRET 저장 완료');

  console.log('\n🎉  설정 완료! 개발 서버를 재시작하세요: npm run dev');
}

main().catch((err) => {
  console.error('❌ ', err.message);
  process.exit(1);
});
