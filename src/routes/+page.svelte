<script>
	import { enhance } from '$app/forms';
</script>

<main>
	<form action="?/upload" use:enhance>
		<input name="file" type="file" />
		<button>Convert</button>
	</form>
</main>
