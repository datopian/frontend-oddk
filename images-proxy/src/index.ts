import type { R2Bucket } from '@cloudflare/workers-types';

declare const MY_BUCKET: R2Bucket;
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { searchParams } = new URL(request.url);
		let imageUrl = searchParams.get('imageUrl');
		if (!imageUrl) {
			return new Response('imageUrl is required', { status: 400 });
		}
		const filePath = new URL(imageUrl).pathname;
		const bucket: R2Bucket = imageUrl.includes('admin.opendata.dk') ? env.MY_BUCKET_PROD as R2Bucket : env.MY_BUCKET_DEV as R2Bucket;
		const object = await bucket.get(`storage${filePath}`);
		if (!object) {
			return new Response('File not found', { status: 404 });
		}
		const headers = new Headers();
		// ? Devalue error: Cannot stringify arbitrary non-POJOs
		// object.writeHttpMetadata(headers);
		object.httpMetadata && headers.append('content-type', object.httpMetadata.contentType!);
		headers.append('cache-control', 'immutable, no-transform, max-age=31536000');
		headers.append('etag', object.httpEtag);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
		headers.append('date', object.uploaded.toUTCString());

		return new Response(object?.body, { headers });
	},
} satisfies ExportedHandler<Env>;
