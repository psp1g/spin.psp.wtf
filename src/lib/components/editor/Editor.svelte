<script>
	import click from "$lib/action/click";
	import GameList from "$lib/components/editor/GameList.svelte";
	import Button from "$lib/components/input/Button.svelte";
	import Loading from "$lib/components/Loading.svelte";
	import { GAME_TYPE } from "$lib/config/game";
	import { tick } from "svelte";
	import { url } from "$lib/util/index";
	import {
		duration,
		gameType,
		editorOpen,
		currentGame,
		currentItems,
		gameListOpen,
	} from "$lib/stores/game";

	import Item from "$lib/components/editor/Item.svelte";
	import TabOption from "$lib/components/input/TabOption.svelte";
	import EmergingTextInput from "$lib/components/input/EmergingTextInput.svelte";

	import gearSVG from "$lib/images/icon/gear.svg";
	import plusSVG from "$lib/images/icon/plus.svg";
	import shuffleSVG from "$lib/images/icon/shuffle.svg";
	import durationSVG from "$lib/images/icon/duration.svg";

	const { loading } = currentGame;

	const newItem = async () => {
		currentItems.new();
		await tick();
	};
</script>

<div class="editor" class:open={$editorOpen}>
	<div
		class="open-editor"
		style:--mask={url(gearSVG)}
		use:click={() => editorOpen.set(true)}
	/>

	<div class="content">
		<GameList />

		<div
			class="close-editor"
			use:click={() => editorOpen.set(false)}
		>
			X
		</div>

		<div class="title">Editor</div>

		<Loading {loading}>
			<div class="sub-title">Game Metadata</div>

			<div class="game-options">
				<div class="duration-wrapper">
					<EmergingTextInput
						numerical
						class="duration"
						value={$duration}
						bindTo={duration}
					/>
					<span class="s">s</span>
					<div class="icon" style:--mask={url(durationSVG)} />
				</div>

				<TabOption
					value={$gameType}
					bindTo={gameType}
					options={Object.entries(GAME_TYPE)}
				/>
			</div>

			<div class="sub-title">Items ({$currentItems.length})</div>

			<div class="items">
				{#each $currentItems as { name }, i (name + i)}
					<Item {i} />
				{/each}
			</div>

			<div class="buttons">
				<button
					class="new-hidden"
					on:focus={newItem}
				/>

				<div class="left">
					<Button class="open-game-list" onClick={() => gameListOpen.set(true)}>
						Saved Games
					</Button>
				</div>
				<div class="right">
					<Button
						class="new"
						mask={plusSVG}
						onClick={newItem}
						tip="New Item"
					/>
					<Button
						class="shuffle"
						mask={shuffleSVG}
						onClick={() => currentItems.shuffle()}
						tip="Shuffle Items"
					/>
				</div>
			</div>
		</Loading>
	</div>
</div>

<style lang="scss">
	.editor {
		width: 0;
		z-index: 10;
		padding: 10px;
		position: relative;
		box-sizing: border-box;
		transition: width 400ms ease;
		transition-delay: 100ms;

		@media (max-width: 1400px) {
			z-index: 20;
			height: 100%;
			position: absolute;
		}

		&.open {
			width: 30%;
			transition-delay: 0ms;

			@media (max-width: 1400px) {
				width: 100%;
			}

			.open-editor {
				opacity: 0;
				transition: none;

				&:hover {
					cursor: default;
				}
			}

			.content, &::before {
				opacity: 1;
				pointer-events: all;
				transition-duration: 500ms;
			}

			&::before {
				transition-delay: 0ms;
			}

			.content {
				transition-duration: 500ms;
				transition-delay: 450ms;
			}
		}

		.open-editor {
			opacity: 1;
			width: 26px;
			height: 26px;
			left: 16px;
			top: 26px;
			background: #fff;
			position: absolute;
			transition: opacity 500ms;
			mask: var(--mask) center/contain no-repeat;
			mask-origin: content-box;

			&:hover {
				cursor: pointer;
				background: #525050;
			}
		}

		.content, &::before {
			opacity: 0;
			pointer-events: none;
			border-radius: 6px;
			transition: opacity 300ms;
			background: #525050;
		}

		&::before {
			transition-delay: 500ms;
		}

		.content {
			width: 100%;
			height: 100%;
			padding: 8px;
			z-index: 10;
			box-sizing: border-box;
			position: relative;
			gap: 6px;
			display: flex;
			flex-direction: column;

			.close-editor {
				position: absolute;
				top: 6px;
				right: 12px;
				font-size: 20px;

				&:hover {
					cursor: pointer;
					color: #fff;
				}
			}

			.title {
				font-size: 24px;
				font-weight: 600;
			}

			.sub-title {
				font-size: 20px;
				font-weight: 600;
			}

			.game-options {
				gap: 8px;
				padding: 12px;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				justify-content: right;
				border-radius: 6px;
				background: #2c2a2a;

				.duration-wrapper {
					gap: 4px;
					height: 100%;
					display: flex;
					align-items: center;

					:global(.duration) {
						padding-right: 16px;
					}

					.s {
						// todo; eww
						margin-right: 8px;
						margin-left: -18px;
						margin-top: -2px;
					}

					.icon {
						width: 20px;
						height: 100%;
						background: #fff;
						margin-right: 4px;
						mask: var(--mask) center/contain no-repeat;
					}
				}
			}

			.items {
				flex-grow: 1;
				flex-shrink: 1;
				gap: 6px;
				display: flex;
				flex-direction: column;
				overflow-y: scroll;
			}

			.buttons {
				display: flex;

				.new-hidden {
					width: 0;
					height: 0;
					padding: 0;
					border: none;
					position: absolute;
					background: transparent;
				}

				.left, .right {
					gap: 6px;
					font-size: 0;
					display: flex;
					flex-grow: 1;
					flex-shrink: 1;
				}

				.left :global(.open-game-list) {
					--bg-color: #4e6481;
					--bg-focus: #485d79;
				}

				.right {
					flex-flow: row-reverse;

					:global(.shuffle) {
						--bg-color: #4e6481;
						--bg-focus: #485d79;
					}

					:global(.new) {
						--bg-color: #0a8a32;
						--bg-focus: #0f9f3e;
					}
				}
			}
		}

		&::before {
			content: "";
			position: absolute;
			z-index: 9;
			width: calc(100% - 20px);
			height: calc(100% - 20px);
		}
	}
</style>