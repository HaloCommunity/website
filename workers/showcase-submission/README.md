# Halo Showcase Submission Worker

This Cloudflare Worker receives showcase form submissions and creates a pull request with a YAML file in this repository.

## Why use this

* Keeps GitHub UI out of the contributor flow.
* Centralizes validation and sanitization.
* Lets maintainers review via normal PR workflow.

## Required secrets and vars

1. Set secret:

* `GH_REPO_TOKEN` with repo `contents:write` and `pull_requests:write`.
* `TURNSTILE_SECRET` (optional but recommended for abuse protection).

2. Set vars in `wrangler.toml`:

* `GH_OWNER`
* `GH_REPO`
* `GH_BASE_BRANCH`
* `SHOWCASE_DATA_DIR`

3. Configure a KV namespace for rate limiting:

* Bind it as `RATE_LIMIT_KV`.

## Local dev

```bash
cd workers/showcase-submission
corepack yarn install
corepack yarn dev
```

The worker package has its own `packageManager` field, so running commands from this folder resolves Yarn through Corepack (not global Yarn classic).

## Deploy

```bash
cd workers/showcase-submission
corepack yarn deploy
```

## Deploy via GitHub Actions

This repository includes `.github/workflows/deploy-showcase-worker.yml`.

Use repository secrets with non-`GITHUB_` names:

* `CF_API_TOKEN`
* `CF_ACCOUNT_ID`
* `WORKER_GH_REPO_TOKEN`
* `WORKER_TURNSTILE_SECRET` (optional)

The workflow injects worker secrets with `wrangler secret put`, then deploys.

## Site build configuration

The Docusaurus build reads these environment variables:

* `SHOWCASE_SUBMISSION_API_URL` set to your deployed Worker URL, for example `https://<your-worker-domain>/submit`.
* `SHOWCASE_TURNSTILE_SITE_KEY` set to your Cloudflare Turnstile site key.

For GitHub Actions publish builds, add both as repository secrets.

## Wire to site

In [docusaurus.config.ts](../../docusaurus.config.ts), set the showcase plugin option:

* `submissionApiUrl: 'https://<your-worker-domain>/submit'`

The custom `ShowcaseForm` theme override reads this option and posts JSON to it.
