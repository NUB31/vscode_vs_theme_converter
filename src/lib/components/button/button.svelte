<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' | null | undefined = undefined;
	export let disabled: boolean | null | undefined = undefined;
	export let loading: boolean | null | undefined = undefined;
	export let style: 'primary' | 'secondary' | 'custom' = 'secondary';

	let actuallyDisabled = disabled;

	$: loading ? (actuallyDisabled = true) : (actuallyDisabled = disabled);
</script>

<button
	on:click
	{type}
	disabled={actuallyDisabled}
	style={`
		${loading ? '--color: hsl(0, 0%, 0%, 0%);' : ''}
		${
			style == 'secondary'
				? '--background-color: var(--clr-secondary-button); --background-color-hover: var(--clr-secondary-button-hover);'
				: ''
		}
		${
			style == 'primary'
				? '--background-color: var(--clr-primary-button); --background-color-hover: var(--clr-primary-button-hover);'
				: ''
		}
	;`}
>
	<slot />
	<div class="spinner-wrapper" style={!loading ? 'display: none' : ''}>
		<svg
			class="spinner"
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
		>
			<path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z" />
		</svg>
	</div>
</button>

<style>
	button {
		background-color: var(--background-color);

		color: var(--color, var(--clr-text));
		padding: var(--padding, var(--spacing-4) var(--spacing-8));
		border-radius: var(--border-radius, var(--rounded-4));
		font-weight: var(--font-weight, var(--weight-500));
		font-size: var(--font-size, inherit);
		width: var(--width, auto);
		height: var(--height, auto);

		margin-top: var(--margin-top, 0);
		margin-bottom: var(--margin-bottom, 0);

		border: none;
		transition: all 100ms ease-in-out;
		position: relative;
	}

	button:disabled {
		opacity: var(--disabled-opacity, 0.7);
	}

	button:not(:disabled):hover,
	button:focus-visible {
		background-color: var(--background-color-hover);
		cursor: pointer;
	}

	button:focus-visible {
		outline: 1px solid black;
	}

	.spinner-wrapper {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.spinner {
		animation: spin 1s linear infinite;
		display: block;
		color: var(--spinner-color, var(--clr-text));
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
