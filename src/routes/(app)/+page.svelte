<script>
	// import { writable } from "svelte/store";
	import { currentGame, editorOpen } from "$lib/stores/game";
	import Wheel from "$lib/components/Wheel.svelte";
	import Editor from "$lib/components/editor/Editor.svelte";
	import EmergingTextInput from "$lib/components/input/EmergingTextInput.svelte";

	const title = currentGame.store("title");

	// const desc = writable("");
	// const descFocused = writable(false);
</script>

<div class="page">
	<Editor />

	<div class="game">
		<div class="meta" class:editor-open={$editorOpen}>
			<EmergingTextInput
				class="title"
				value={$title}
				bindTo={title}
			/>

			<!--			<textarea-->
			<!--				class="desc"-->
			<!--				spellcheck={$descFocused}-->
			<!--				bind:value={$desc}-->
			<!--				use:focused={descFocused}-->
			<!--			/>-->
		</div>

		<Wheel />
	</div>
</div>

<style lang="scss">
	.page {
		max-width: 100vw;
		height: 100%;
		display: flex;
		position: relative;
		box-sizing: border-box;

		.game {
			flex-grow: 1;
			position: relative;

			.meta {
				top: 30px;
				left: 34px;
				width: 35%;
				height: 30vh;
				box-sizing: border-box;
				padding-top: 8px;
				position: absolute;

				@media (max-width: 1400px) {
					left: 54px;
				}

				&.editor-open {
					@media (min-width: 1401px) {
						left: 12px;
					}
				}

				textarea {
					height: 12%;
					resize: none;
				}

				:global(.title) {
					font-size: 26px;
					font-weight: 600;
					transform: translateY(-50%);
				}
			}
		}
	}
</style>