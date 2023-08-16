<script lang="ts">
	import type { ThemeConverterResponse } from '$lib/types/types';

	let files: FileList;
	let error: string | null = null;
	let scriptedDownloadLink: string | null = null;
	let manualDownloadLink: string | null = null;
	let loading = false;

	async function convertFile() {
		error = null;
		loading = true;

		if (files.length === 0) {
			error = 'Please select a file';
			return;
		}

		let fd = new FormData();
		fd.append('file', files[0]);

		try {
			const res = await fetch('/api/v1/convert', {
				method: 'POST',
				body: fd
			});

			const json: ThemeConverterResponse = await res.json();

			if (!json.success) {
				error = json.message;
				return;
			}

			if (!json.data) {
				error = 'No data returned from server';
				return;
			}

			scriptedDownloadLink = json.data.scriptUrl;
			manualDownloadLink = json.data.pkgUrl;
		} catch (e: any) {
			if (typeof e === 'string') {
				error = e;
			} else if (e.msg && typeof e.msg === 'string') {
				error = e.msg;
			} else {
				error = 'Something went wrong';
			}
		} finally {
			loading = false;
		}
	}
</script>

<main>
	{#if error}
		<p style="background-color: coral;">{error}</p>
	{/if}

	<form on:submit|preventDefault={convertFile}>
		<input bind:files name="file" type="file" required />
		<button disabled={loading} type="submit">
			{#if loading}
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2">
						<path
							stroke-dasharray="60"
							stroke-dashoffset="60"
							stroke-opacity=".3"
							d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
						>
							<animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0" />
						</path>
						<path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12">
							<animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0" />
							<animateTransform
								attributeName="transform"
								dur="1.5s"
								repeatCount="indefinite"
								type="rotate"
								values="0 12 12;360 12 12"
							/>
						</path>
					</g>
				</svg>
			{:else}
				Convert
			{/if}
		</button>
	</form>

	{#if scriptedDownloadLink}
		<a href={scriptedDownloadLink} download>Download theme install script</a>
	{/if}
	{#if manualDownloadLink}
		<a href={manualDownloadLink} download>Download .pkgdef and install manually</a>
	{/if}
</main>
