import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const content = await fs.readFile(`${process.cwd()}/output/${params.filename}`);
		return new Response(content);
	} catch (error) {
		return new Response('', { status: 404 });
	}
};
