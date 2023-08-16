import type { ThemeConverterResponse } from '$lib/types/types';
import { json, type RequestHandler } from '@sveltejs/kit';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

export const POST: RequestHandler = async ({ request }) => {
	const res: ThemeConverterResponse = { success: false, message: null, data: null };

	const fd = await request.formData();
	const file = fd.get('file');

	if (!file) {
		res.message = 'Please upload a file, dummy';
		return json(res, { status: 422 });
	}

	if (!(file instanceof File)) {
		res.message = 'The "file" field must be of type file...';
		return json(res, { status: 418 });
	}

	if (!(file.name.endsWith('.json') || file.name.endsWith('.jsonc'))) {
		res.message = 'The file must be a json or jsonc file...';
		return json(res, { status: 418 });
	}

	const fileUUID = crypto.randomUUID();

	const inputPath = `${process.cwd()}/input`;
	const inputFilePath = `${inputPath}/${fileUUID}.jsonc`;

	const applierScriptPath = `${process.cwd()}/binaries/ThemeApplier/ThemeApplier.ps1`;

	const outputPath = `${process.cwd()}/output`;
	const outputPkgFilePath = `${outputPath}/${fileUUID}.pkgdef`;
	const outputWebPkgFilePath = `/output/${fileUUID}.pkgdef`;
	const outputScriptFilePath = `${outputPath}/${fileUUID}.ps1`;
	const outputWebScriptFilePath = `/output/${fileUUID}.ps1`;

	try {
		await fs.writeFile(inputFilePath, Buffer.from(await file.arrayBuffer()));
	} catch (error) {
		res.message = 'Could not save your file on the server';
		return json(res, { status: 500 });
	}
	const converterPath = `${process.cwd()}/binaries/ThemeConverter`;
	const converterBinary = `${converterPath}/ThemeConverter`;

	console.log(`starting converter on file: "${inputFilePath}"`);
	const converter = spawn(converterBinary, ['-i', inputFilePath, '-o', outputPath], {
		cwd: converterPath
	});

	converter.stdout.on('data', (data) => {
		console.log(`converter stdout:\n${data}`);
	});

	converter.stderr.on('data', (data) => {
		console.error(`converter stderr:\n${data}`);
	});

	try {
		await new Promise((resolve, reject) => {
			converter.on('exit', async (code, signal) => {
				console.log(`converter exited with code ${code} and signal ${signal}`);
				await fs.unlink(inputFilePath);

				if (code === 0) {
					console.log(`converted file saved to: "${outputPkgFilePath}"`);
					resolve(true);
				} else {
					reject();
				}
			});
		});
	} catch (error) {
		res.message = 'There was an error running the theme converter';
		return json(res, { status: 500 });
	}

	let pkgContent;
	try {
		pkgContent = await fs.readFile(outputPkgFilePath);
	} catch (error) {
		res.message = 'Could not read output pkgdef file';
		return json(res, { status: 500 });
	}

	let scriptContent;
	try {
		scriptContent = await fs.readFile(applierScriptPath, 'utf-8');
	} catch (error) {
		res.message = 'Could not read themeApplier script';
		return json(res, { status: 500 });
	}

	const finalScript = scriptContent
		.toString()
		.replace('{{PKGDEF_UUID}}', crypto.randomUUID())
		.replace('{{PKGDEF_CONTENT}}', pkgContent.toString());

	try {
		await fs.writeFile(outputScriptFilePath, finalScript);
	} catch (error) {
		res.message = 'Could not save completed themeApplier script';
		return json(res, { status: 500 });
	}

	res.success = true;
	res.data = { pkgUrl: outputWebPkgFilePath, scriptUrl: outputWebScriptFilePath };
	return json(res);
};
