<script>
	import click from "$lib/action/click";
	import { GameTypeIcon } from "$lib/config/game";
	import { currentGame, gameList, gameListOpen, title } from "$lib/stores/game";

	import Button from "$lib/components/input/Button.svelte";
	import Loading from "$lib/components/Loading.svelte";

	import plusSVG from "$lib/images/icon/plus.svg";
	import rightSVG from "$lib/images/icon/right.svg";
	import refreshSVG from "$lib/images/icon/refresh.svg";

	const { key } = currentGame;
	const { keys, loading } = gameList;

	const refresh = () => gameList.refresh();
	const newGame = () => {
		currentGame.new();
		refresh();
	};

	//$: $gameListOpen && $title && refresh();
	$: $gameListOpen && refresh();
</script>

<div class="game-list" class:open={$gameListOpen}>
	<div
		class="close-list"
		use:click={() => gameListOpen.set(false)}
	>
		X
	</div>

	<div class="title">Saved Games</div>

	<div class="games">
		<Loading {loading}>
			<span class="found">
				{$gameList?.length || "No"} game{$gameList?.length !== 1 ? "s" : ""} found
			</span>

			{#each $gameList as game, i ($keys[i])}
				{@const active = $key === $keys[i]}
				{@const gameSVG = GameTypeIcon[game.type]}
				{@const choose = key.set.bind(key, $keys[i])}

				<div
					class="game"
					class:active
					use:click={choose}
				>
					<img src={gameSVG} alt="{game.type} icon" />

					<span class="title">{game.title}</span>
					<span class="items">{game.items.length} Items</span>

					<Button
						class="choose-game"
						mask={rightSVG}
						onClick={choose}
					/>
				</div>
			{/each}
		</Loading>
	</div>

	<div class="buttons">
		<Button
			class="new"
			mask={plusSVG}
			onClick={newGame}
			tip="New Game"
		/>
		<Button
			class="refresh"
			mask={refreshSVG}
			onClick={refresh}
			tip="Refresh List"
		/>
	</div>
</div>

<style lang="scss">
	.game-list {
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		opacity: 0;
		z-index: 20;
		padding: 8px;
		border-radius: 6px;
		position: absolute;
		transition: opacity 300ms;
		background: #525050;
		pointer-events: none;

		gap: 6px;
		display: flex;
		flex-direction: column;

		&.open {
			opacity: 1;
			pointer-events: all;
		}

		.close-list {
			position: absolute;
			top: 6px;
			right: 12px;
			font-size: 20px;

			&:hover {
				cursor: pointer;
				color: #fff;
			}
		}

		&> .title {
			font-size: 24px;
			font-weight: 600;
		}

		.games {
			gap: 6px;
			flex-grow: 1;
			flex-shrink: 1;
			display: flex;
			position: relative;
			overflow-y: scroll;
			flex-direction: column;

			.game {
				gap: 10px;
				display: flex;
				padding: 12px;
				cursor: pointer;
				border-radius: 6px;
				background: #2c2a2a;
				align-items: center;
				transition: background-color 150ms;

				&:hover {
					background: #383636;

					.title {
						color: white;
					}
				}

				&.active {
					background: #313a46;

					.title {
						color: white;
					}

					:global(.choose-game) {
						opacity: 0;
					}
				}

				img {
					height: 30px;
				}

				.title {
					font-size: 20px;
					transition: color 150ms;
				}

				.items {
					text-align: right;
					font-size: 14px;
					flex-grow: 1;
					flex-shrink: 1;
				}

				:global(.choose-game) {
					transition: opacity 200ms;
				}
			}
		}

		.buttons {
			gap: 6px;
			font-size: 0;
			display: flex;
			flex-flow: row-reverse;

			:global(.refresh) {
				--bg-color: #4e6481;
				--bg-focus: #485d79;
			}

			:global(.new) {
				--bg-color: #0a8a32;
				--bg-focus: #0f9f3e;
			}
		}
	}
</style>