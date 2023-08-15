import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	upload: async ({ request }) => {
		const fd = await request.formData();

		const file = fd.get('file');

		if (!file) {
			throw fail(422, 'Please upload a file, dummy');
		}

		if (!(file instanceof File)) {
			throw fail(418, 'Not a file...');
		}
	}
};
