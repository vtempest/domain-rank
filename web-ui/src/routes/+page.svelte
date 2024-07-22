<script>
	import { writable, derived } from 'svelte/store';
	import { Input } from '../components/ui/input';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuRadioGroup,
		DropdownMenuRadioItem
	} from '../components/ui/dropdown-menu';
	import { Button } from '../components/ui/button';
	import { onMount } from 'svelte';
	import axios from 'axios';

	let domains = writable([]);
	let loading = true;

	let searchTerm = writable('');
	let sortBy = writable('popularity');
	let favorites = writable([]);
	let selectedCategory = writable(null);
	const siteCategories = [
		'All',
		'Business',
		'Shopping',
		'Search',
		'Tech',
		'News',
		'Social',
		'Finance',
		'Travel',
		'Entertainment',
		'Education'
	];

	onMount(async () => {
		// try {
		const response = await axios.get('/api');

		// if (!response.data) {
		// 	loading = false;
		// 	return
		// }
		domains = writable(response.data);

		console.log(domains);
		loading = false;
		// } catch (err) {
		// // error = err.message;
		// loading = false;
		// }
	});

	// favicon: "/placeholder.svg",
	// summary: "A classic example website",
	// popular: true,
	// new: false,
	// category: "tech",
	// wikipedia: "https://en.wikipedia.org/wiki/Example.com",

	$: filteredDomains = derived(
		[domains, searchTerm, sortBy, selectedCategory],
		([$domains, $searchTerm, $sortBy, $selectedCategory]) => {
			let data = $domains;
			if ($searchTerm) {
				data = data.filter(
					(domain) =>
						domain.title.toLowerCase().includes($searchTerm.toLowerCase()) ||
						domain.summary.toLowerCase().includes($searchTerm.toLowerCase())
				);
			}
			if ($selectedCategory) {
				data = data.filter((domain) => domain.category === $selectedCategory);
			}
			switch ($sortBy) {
				case 'alphabetical':
					data = data.sort((a, b) => a.title?.localeCompare(b.title));
					break;
				case 'popular':
					data = data.sort((a, b) => (b.rank ? 1 : -1) - (a.rank ? 1 : -1));
					break;
				case 'newest':
					data = data.sort((a, b) => (b.new ? 1 : -1) - (a.new ? 1 : -1));
					break;
			}
			return data;
		}
	);

	function handleFavorite(id) {
		favorites.update(($favorites) => {
			if ($favorites.includes(id)) {
				return $favorites.filter((fav) => fav !== id);
			} else {
				return [...$favorites, id];
			}
		});
	}

	function handleCategoryClick(category) {
		selectedCategory.update(($selectedCategory) =>
			category === $selectedCategory ? null : category
		);
	}
</script>

<div class="flex flex-col h-screen">
	<header class="bg-primary text-primary-foreground py-4 px-6">
		<div class="max-w-6xl mx-auto flex items-center justify-between">
			<h1 class="text-2xl font-bold">Domain Directory</h1>
			<div class="flex items-center gap-4">
				<Input
					placeholder="Search domains..."
					bind:value={$searchTerm}
					class="bg-primary-foreground/10 text-primary-foreground rounded-lg px-4 py-2 w-64"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" class="flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="w-5 h-5"
							>
								<line x1="10" x2="21" y1="6" y2="6" />
								<line x1="10" x2="21" y1="12" y2="12" />
								<line x1="10" x2="21" y1="18" y2="18" />
								<path d="M4 6h1v4" />
								<path d="M4 10h2" />
								<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
							</svg>
							Sort by: {$sortBy}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent class="w-48">
						<DropdownMenuRadioGroup bind:value={$sortBy}>
							<DropdownMenuRadioItem value="alphabetical">Alphabetical</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="popular">Most Popular</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	</header>
	<div class="flex flex-1 overflow-hidden">
		<div class="bg-card text-card-foreground p-6 border-r">
			<h2 class="text-lg font-medium mb-4">Categories</h2>
			<div class="grid gap-2">
				{#each siteCategories as category}
					<Button
						variant={$selectedCategory === (category === 'All' ? null : category.toLowerCase())
							? 'primary'
							: 'ghost'}
						on:click={() => handleCategoryClick(category === 'All' ? null : category.toLowerCase())}
						class="justify-start"
					>
						{category}
					</Button>
				{/each}
			</div>
		</div>
		<main class="flex-1 overflow-auto p-6">
			<div
				class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
			>
				{#each $filteredDomains as domain, index}
					<div class="bg-card p-2 text-card-foreground rounded-lg overflow-hidden shadow-lg relative">
						<div
							class="absolute top-2 right-2 bg-white text-muted-foreground px-2 py-1 rounded-md text-xs font-medium border border-muted"
						>
							{domain.rank}
						</div>

						<div class="flex-1">
							<div class="flex items-start align-top gap-4 p-4 border-b">
								{#if domain.favicon}
									<img src={domain.favicon} width={32} height={32} class="rounded-full align-top" />
								{/if}
								<div class="font-medium">{domain.title}</div>
							</div>
							<div class="text-sm text-muted-foreground">{domain.domain}</div>
							<div class="py-2 text-sm text-muted-foreground">
								{@html domain.summary.slice(0, 200) + '...'}
							</div>
							<img src={domain.image} class="py-2" width="200px" />
						</div>
						<Button
							size="icon"
							variant={$favorites.includes(domain.title) ? 'primary' : 'ghost'}
							on:click={() => handleFavorite(domain.title)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="w-5 h-5"
							>
								<path
									d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
								/>
							</svg>
							<span class="sr-only">
								{$favorites.includes(domain.title) ? 'Remove from favorites' : 'Add to favorites'}
							</span>
						</Button>
						<!-- <Button
								size="icon"
								variant="ghost"
								on:click={() => window.open(domain.wikipedia, '_blank')}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="w-5 h-5"
								>
									<path
										d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
									/>
									<path d="m10 15 5-3-5-3z" />
								</svg>
								<span class="sr-only">View Wikipedia page</span>
							</Button> -->
						<!-- <Button
								size="icon"
								variant="ghost"
								on:click={() => console.log(`Closing domain card for ${domain.title}`)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="w-5 h-5"
								>
									<path d="M18 6 6 18" />
									<path d="m6 6 12 12" />
								</svg>
								<span class="sr-only">Close domain card</span>
							</Button> -->
					</div>
					<!-- </div> -->
				{/each}
			</div>
		</main>
	</div>
</div>
