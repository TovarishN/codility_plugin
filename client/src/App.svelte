<script lang="ts">

	let nextid = 2;

	let main;

	let lines: Array<{ id: number; path: string; selector: string }> = [
		{ id: 1, path: "", selector: "" },
	];
	chrome.storage.sync.get(["file_selector"], (result) => {
		lines = !!result["file_selector"]
			? result["file_selector"]
			: [{ id: 1, path: "", selector: "" }];
	});

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		let msg: { type: string } = message;
		if (msg.type === "pong") flash(main);
	});

	function remove(id: number) {
		let line = lines.find((x) => x.id === id);
		if (!!line) {
			chrome.runtime.sendMessage(
				{
					type: "file-removed",
					filename: line.path,
					selector: line.selector,
				},
				(response) => {
					console.log(`file-added got response ${response}`);
				}
			);
		}
		lines = lines.filter((x) => x.id !== id);
	}

	function add() {
		lines = [...lines, { id: nextid, path: "", selector: "" }];
		nextid++;
	}

	function set(id: number) {
		chrome.storage.sync.set({ file_selector: lines }, () => {
			console.log("file selector set");
		});

		let line = lines.find((x) => x.id === id);
		chrome.runtime.sendMessage(
			{
				type: "file-added",
				filename: line.path,
				selector: line.selector,
			},
			(response) => {
				console.log(`file-added got response ${response}`);
			}
		);
	}

	function flash(element: HTMLElement) {
		requestAnimationFrame(() => {
			element.style.transition = "none";
			element.style.color = "rgba(0,255,62,1)";
			element.style.backgroundColor = "rgba(0,255,62,0.2)";

			setTimeout(() => {
				element.style.transition = "color 1s, background 1s";
				element.style.color = "";
				element.style.backgroundColor = "";
			});
		});
	}
</script>

<style type="text/scss">
	.line {
		display: grid;
		grid-template-columns: 80px 2fr 2fr 80px;
		column-gap: 5px;
		padding: 5px 0;
		.header {
			font-size: 0.8rem;
			font-weight: bolder;
			padding: 0;
			margin: 0;
			white-space: nowrap;
			min-width: 80px;
		}
	}
	.button {
		min-width: 80px;
		padding: 3px;
		cursor: pointer;
		text-align: center;
	}

	input,
	button {
		border: solid 1px #ccc;
	}

	@media (min-width: 640px) {
		main {
			//max-width: none;
		}
	}
</style>

<main bind:this={main}>
	<div class="line">
		<div />
		<span class="header">File path</span>
		<span class="header">Selector</span>
		<div />
	</div>
	{#each lines as line}
		<div id="line_{line.id}" class="line">
			<button
				class="button"
				on:click={() => remove(line.id)}>Remove</button>
			<input class="path" bind:value={line.path} />
			<input class="selector" bind:value={line.selector} />
			<button class="button" on:click={() => set(line.id)}>Set</button>
		</div>
	{/each}
	<button class="button" on:click={add}>Add</button>
</main>
