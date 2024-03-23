<script>
	import { title, currentGame, editorOpen } from "$lib/stores/game";

	import Wheel from "$lib/components/Wheel.svelte";
	import Editor from "$lib/components/editor/Editor.svelte";
	import Loading from "$lib/components/Loading.svelte";
	import EmergingTextInput from "$lib/components/input/EmergingTextInput.svelte";

	const { key, loading } = currentGame;
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
		</div>

		<Loading {loading}>
			<Wheel />
		</Loading>
	</div>

	<span class="game-info">
		{APP_VERSION}<br/>
		{$key}
	</span>
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

		.game-info {
			right: 6px;
			bottom: 6px;
			color: #605d5d;
			text-align: right;
			position: absolute;
		}
	}
</style>