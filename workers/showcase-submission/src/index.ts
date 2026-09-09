interface Env {
  GH_OWNER: string;
  GH_REPO: string;
  GH_BASE_BRANCH: string;
  SHOWCASE_DATA_DIR: string;
  GH_REPO_TOKEN: string;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_KV: KVNamespace;
}

import {
  normalizeUrl,
  toYaml,
  validateItem,
  type ShowcaseItem,
} from './lib';

type SubmissionPayload = {
  item: ShowcaseItem;
  turnstileToken?: string;
};

const ALLOWED_ORIGINS = new Set([
  'https://halopsa.community',
  'https://www.halopsa.community',
  'http://localhost:3000',
]);

function cors(origin: string | null): HeadersInit {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://halopsa.community';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin',
  };
}

async function githubRequest(
  env: Env,
  path: string,
  init: RequestInit,
): Promise<Response> {
  const token = env.GH_REPO_TOKEN;
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'halo-showcase-submission-worker',
      ...(init.headers ?? {}),
    },
  });
}

async function verifyTurnstile(
  token: string | undefined,
  remoteip: string,
  env: Env,
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) {
    return true;
  }

  if (!token || token.trim().length === 0) {
    return false;
  }

  const form = new URLSearchParams();
  form.set('secret', env.TURNSTILE_SECRET);
  form.set('response', token);
  form.set('remoteip', remoteip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    return false;
  }

  const body = (await response.json()) as {success?: boolean};
  return body.success === true;
}

async function createSubmission(payload: SubmissionPayload, env: Env): Promise<{pullRequestUrl: string}> {
  const rawItem = payload.item;

  rawItem.website = normalizeUrl(rawItem.website);
  rawItem.source = normalizeUrl(rawItem.source);
  rawItem.preview = normalizeUrl(rawItem.preview);

  const error = validateItem(rawItem);
  if (error) {
    throw new Error(error);
  }

  const branch = `showcase-submission/${rawItem.id}-${Date.now()}`;
  const filePath = `${env.SHOWCASE_DATA_DIR}/${rawItem.id}.yaml`;

  const refResponse = await githubRequest(
    env,
    `/repos/${env.GH_OWNER}/${env.GH_REPO}/git/ref/heads/${env.GH_BASE_BRANCH}`,
    {method: 'GET'},
  );

  if (!refResponse.ok) {
    throw new Error('Unable to fetch base branch ref from GitHub.');
  }

  const refBody = (await refResponse.json()) as {object: {sha: string}};
  const baseSha = refBody.object.sha;

  const branchResponse = await githubRequest(
    env,
    `/repos/${env.GH_OWNER}/${env.GH_REPO}/git/refs`,
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: baseSha,
      }),
    },
  );

  if (!branchResponse.ok) {
    throw new Error('Unable to create GitHub branch for submission.');
  }

  const yamlContent = toYaml(rawItem);

  const commitResponse = await githubRequest(
    env,
    `/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
    {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        message: `feat(showcase): add ${rawItem.id}`,
        content: btoa(unescape(encodeURIComponent(yamlContent))),
        branch,
      }),
    },
  );

  if (!commitResponse.ok) {
    const body = await commitResponse.text();
    throw new Error(`Unable to commit submission file: ${body}`);
  }

  const prResponse = await githubRequest(
    env,
    `/repos/${env.GH_OWNER}/${env.GH_REPO}/pulls`,
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        title: `[Showcase] ${rawItem.name}`,
        head: branch,
        base: env.GH_BASE_BRANCH,
        body: [
          'Automated showcase submission from community form.',
          '',
          `ID: ${rawItem.id}`,
          `Offer type: ${rawItem.offerType}`,
          `License: ${rawItem.license}`,
        ].join('\n'),
      }),
    },
  );

  if (!prResponse.ok) {
    const body = await prResponse.text();
    throw new Error(`Unable to open pull request: ${body}`);
  }

  const prBody = (await prResponse.json()) as {html_url: string};
  return {pullRequestUrl: prBody.html_url};
}

async function checkRateLimit(ip: string, env: Env): Promise<boolean> {
  const key = `submit:${ip}`;
  const existing = await env.RATE_LIMIT_KV.get(key);
  if (existing) {
    return false;
  }

  await env.RATE_LIMIT_KV.put(key, '1', {expirationTtl: 60});
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin');
    const corsHeaders = cors(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, {status: 204, headers: corsHeaders});
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {status: 405, headers: corsHeaders});
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({message: 'Origin not allowed.'}), {
        status: 403,
        headers: {...corsHeaders, 'content-type': 'application/json; charset=utf-8'},
      });
    }

    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const allowed = await checkRateLimit(ip, env);
    if (!allowed) {
      return new Response(JSON.stringify({message: 'Too many submissions. Please wait a minute and try again.'}), {
        status: 429,
        headers: {...corsHeaders, 'content-type': 'application/json; charset=utf-8'},
      });
    }

    try {
      const payload = (await request.json()) as SubmissionPayload;
      const turnstileOk = await verifyTurnstile(payload.turnstileToken, ip, env);
      if (!turnstileOk) {
        return new Response(JSON.stringify({message: 'Turnstile verification failed.'}), {
          status: 400,
          headers: {...corsHeaders, 'content-type': 'application/json; charset=utf-8'},
        });
      }
      const result = await createSubmission(payload, env);
      return new Response(
        JSON.stringify({
          message: 'Submission received. A pull request has been created for moderator review.',
          pullRequestUrl: result.pullRequestUrl,
        }),
        {status: 200, headers: {...corsHeaders, 'content-type': 'application/json; charset=utf-8'}},
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown submission error.';
      return new Response(JSON.stringify({message}), {
        status: 400,
        headers: {...corsHeaders, 'content-type': 'application/json; charset=utf-8'},
      });
    }
  },
};
