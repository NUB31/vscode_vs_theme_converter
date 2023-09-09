<script lang="ts">
	import '../styles/reset.css';
	import '../styles/global.css';
	import Highlight from 'svelte-highlight';
	import powershell from 'svelte-highlight/languages/powershell';
	import github from 'svelte-highlight/styles/github-dark';
	import Button from '$lib/components/button/button.svelte';
	import type { ThemeConverterResponse } from '$lib/types/types';

	let files: FileList;
	let error: string | null = null;
	let ps1DownloadLink: string | null = null;
	let pkgdefDownloadLink: string | null = null;
	let batchDownloadLink: string | null = null;
	let returnedFileName: string | null = null;
	let loading = false;

	async function convertFile() {
		error = null;
		loading = true;
		ps1DownloadLink = null;
		pkgdefDownloadLink = null;
		returnedFileName = null;

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
			returnedFileName = json.data.name;
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

<svelte:head>
	{@html github}
</svelte:head>

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
			<div>
				Upload vscode theme <span class="file-name"
					>{files && files.length > 0 ? `(${files[0].name})` : ''}</span
				>
			</div>
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

	{#if batchDownloadLink || ps1DownloadLink}
		<h2 class="download-options-header">Download options:</h2>
	{/if}
	{#if ps1DownloadLink}
		<h3 class="download-option-header">(Scripted) Download powershell script</h3>
		<p>Download this one if you want to review the code before running the script</p>
		<h4>Usage</h4>
		<p>
			Open powershell as an administrator, enter the folder containing the script and run the
			following commands and follow the instrucitons
		</p>
		<Highlight
			code={`Set-ExecutionPolicy RemoteSigned; 
./${returnedFileName}.ps1`}
			language={powershell}
		/>
		<a href={ps1DownloadLink} download>
			<Button --margin-top="var(--spacing-4)">Download</Button>
		</a>
		<hr />
	{/if}
	{#if pkgdefDownloadLink}
		<h3 class="download-option-header">(Manual) Download .pkgdef file</h3>
		<p>Download this one if you just want the theme file</p>
		<h4>Usage</h4>
		<p>
			Place the file in your visual studio theme folder (typically "C:\Program Files\Microsoft
			Visual Studio\2022\YOUR_EDITION_HERE\Common7\IDE\CommonExtensions\Platform"), open cmd and
			enter the following command
		</p>
		<Highlight code="devenv -updateconfiguration" language={powershell} />
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

	.file-name {
		color: var(--clr-text-dimmed);
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

	.upload-button:hover {
		background-color: var(--clr-secondary-button-hover);
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
