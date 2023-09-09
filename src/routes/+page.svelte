<script lang="ts">
	import type { ThemeConverterResponse } from '$lib/types/types';
	import Button from '$lib/components/button/button.svelte';
	import '../styles/reset.css';
	import '../styles/global.css';

	let files: FileList;
	let error: string | null = null;
	let ps1DownloadLink: string | null = null;
	let pkgdefDownloadLink: string | null = null;
	let batchDownloadLink: string | null = null;
	let loading = false;

	async function convertFile() {
		error = null;
		loading = true;
		ps1DownloadLink = null;
		pkgdefDownloadLink = null;
		batchDownloadLink = null;

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

			ps1DownloadLink = json.data.ps1Url;
			pkgdefDownloadLink = json.data.pkgUrl;
			batchDownloadLink = json.data.batchUrl;
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
	<h1 class="page-title">VScode to VS theme converter</h1>

	{#if error}
		<p style="background-color: coral;">{error}</p>
	{/if}

	<form on:submit|preventDefault={convertFile}>
		<label for="file-input" class="upload-button">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
				<path
					fill="currentColor"
					d="M74.34 77.66a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 0l48 48a8 8 0 0 1-11.32 11.32L136 43.31V128a8 8 0 0 1-16 0V43.31L85.66 77.66a8 8 0 0 1-11.32 0ZM240 136v64a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h68a4 4 0 0 1 4 4v3.46c0 13.45 11 24.79 24.46 24.54A24 24 0 0 0 152 128v-4a4 4 0 0 1 4-4h68a16 16 0 0 1 16 16Zm-40 32a12 12 0 1 0-12 12a12 12 0 0 0 12-12Z"
				/>
			</svg>
			<div>Upload vscode theme</div>
		</label>

		<input bind:files name="file" type="file" class="file-input" id="file-input" required />

		<Button
			type="submit"
			disabled={files == null || files.length == 0}
			{loading}
			--margin-top="var(--spacing-4)"
			style="primary"
		>
			Convert
		</Button>
	</form>

	{#if batchDownloadLink || ps1DownloadLink || pkgdefDownloadLink}
		<h2 class="download-options-header">Download options:</h2>
	{/if}
	{#if batchDownloadLink}
		<h3 class="download-option-header">(Easiest) Download batch file</h3>
		<p>Download this one if you want to apply the theme easily</p>
		<h4>Usage</h4>
		<p>Just double click the .bat file and follow the instructions</p>
		<a href={batchDownloadLink} download>
			<Button --margin-top="var(--spacing-4)">Download</Button>
		</a>
		<hr />
	{/if}
	{#if ps1DownloadLink}
		<h3 class="download-option-header">(Easy) Download powershell script</h3>
		<p>Download this one if you want to review the code before running the script</p>
		<h4>Usage</h4>
		<p>
			Open powershell as an administrator, enter the folder containing the script and run the
			following commands and follow the instrucitons
		</p>
		<pre>Set-ExecutionPolicy RemoteSigned; ./filename.ps1</pre>
		<a href={ps1DownloadLink} download>
			<Button --margin-top="var(--spacing-4)">Download</Button>
		</a>
		<hr />
	{/if}
	{#if pkgdefDownloadLink}
		<h3 class="download-option-header">(Harder) Download .pkgdef file</h3>
		<p>Download this one if you just want the theme file</p>
		<h4>Usage</h4>
		<p>
			Place the file in your visual studio theme folder (typically "C:\Program Files\Microsoft
			Visual Studio\2022\YOUR_EDITION_HERE\Common7\IDE\CommonExtensions\Platform"), open cmd and
			enter the following command
		</p>
		<pre>devenv /updateconfiguration</pre>
		<a href={pkgdefDownloadLink} download>
			<Button --margin-top="var(--spacing-4)">Download</Button>
		</a>
		<hr />
	{/if}
</main>

<style>
	.page-title {
		margin-top: var(--spacing-8);
	}

	.file-input {
		display: none;
	}

	.upload-button {
		width: fit-content;
		display: flex;
		gap: var(--spacing-8);
		border-radius: var(--spacing-4);
		background-color: var(--clr-secondary-button);
		padding: var(--spacing-4) var(--spacing-8);
		margin-top: var(--spacing-8);
		cursor: pointer;
	}

	.download-options-header {
		margin-top: var(--spacing-16);
	}

	.download-option-header {
		margin-top: var(--spacing-8);
	}

	hr {
		width: 50%;
		margin-right: 100%;
		height: 3px;
		background-color: var(--clr-accent);
		border: none;
		border-radius: var(--rounded-full);
		margin-top: var(--spacing-8);
	}
</style>
