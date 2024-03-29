
import type { OrdersTable } from '#build/components';

import type { OrdersTable } from '#build/components';

import type { OrdersTable } from '#build/components';

<template>
  <!-- Pagination -->
  <nav v-if="state.orders.length > 0" class="mt-6 sm:mt-0 flex items-center justify-between" aria-label="Pagination">
    <div class="flex items-center">
      <p class="text-gray-300 leading-9">
        Showing
        <span class="font-medium">1</span>
        to
        <span class="font-medium">{{ filteredOrders.length.toLocaleString() }}</span>
        of
        <span class="font-medium">{{ state.orders.length.toLocaleString() }}</span>
        results
      </p>
    </div>
    <div class="flex">
      <button
        @click="state.showFilters = !state.showFilters; trackEvent('Toggle Filters')"
        class="h-10	inline-flex items-center justify-center rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-700 focus:outline-none"
        :class="{ 'bg-gray-700 text-white': state.showFilters, 'bg-gray-800 text-gray-300': !state.showFilters }"
      >
        <FunnelIcon class="h-4 w-4" />
      </button>
    </div>
  </nav>

  <!-- Filters -->
  <div v-if="props.collection && state.showFilters" class="flex flex-col sm:flex-row justify-between my-4 p-4 bg-gray-800 rounded-lg">
    <!-- Asset Name Filter -->
    <div class="flex items-center space-x-2 my-2">
      <input type="text" v-model="assetNameFilter" @input="handleInput" placeholder="Type asset name..." class="input bg-gray-700 text-white" />
    </div>

    <!-- Supply Filter Buttons -->
    <div class="flex items-center justify-between space-x-2 my-2">
      <span class="text-base text-gray-300">Supply:</span>
      <button v-for="option in supplyOptions" :key="option.value" @click="setSupplyFilter(option.value)" :class="{ 'bg-gray-700 text-white': supplyFilter === option.value, 'bg-gray-800 text-gray-300': supplyFilter !== option.value }" class="inline-flex items-center justify-center rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-700 focus:outline-none">
        {{ option.label }}
      </button>
    </div>

    <!-- Reset Filters Button -->
    <div class="flex items-center space-x-2 my-2">
      <button @click="resetFilters" class="inline-flex items-center justify-center rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-700 focus:outline-none bg-gray-800 text-gray-300">
        <ArrowPathIcon class="h-5 w-5 mr-2" /> Reset Filters
      </button>
    </div>

  </div>

  <!-- Loading -->
  <div v-if="state.loading" class="flex justify-center items-center my-20 py-20 text-gray-300">
    <ArrowPathIcon class="animate-spin h-8 w-8 text-gray-500" aria-hidden="true" />
  </div>

  <!-- No Data -->
  <div v-if="!state.loading && state.orders.length === 0" class="my-20 flex justify-center items-center">
    <div class="text-center">
      <p class="text-lg text-gray-500">No active orders.</p>
      <p class="text-base text-gray-400">Consider placing one or trying dispensers.</p>
    </div>
  </div>

  <!-- No Data -->
  <div v-else-if="!state.loading && filteredOrders.length === 0" class="my-20 flex justify-center items-center">
    <div class="text-center">
      <p class="text-lg text-gray-500">No matching orders.</p>
      <p class="text-base text-gray-400">Update or reset your filters to start over.</p>
    </div>
  </div>

  <!-- Table View -->
  <div v-if="!state.loading && filteredOrders.length > 0" class="mt-6 relative overflow-x-auto">
    <table class="w-full whitespace-nowrap text-left border-white/10">
      <thead class="border-t border-b border-white/10 text-base leading-6 text-white">
        <tr>
          <th scope="col" class="py-2 pr-2 font-semibold">Asset</th>
          <th scope="col" class="py-2 pr-2 font-semibold">Price</th>
          <th scope="col" class="py-2 pr-2 font-semibold">Amount</th>
          <th scope="col" class="py-2 w-20"><span class="sr-only">View</span></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/5">
        <tr v-for="order in filteredOrders" :key="order.tx_hash">
          <td class="whitespace-nowrap py-3 pr-3 min-w-64">
            <div class="flex items-center gap-x-4">
              <NuxtImg :src="`https://api.xcp.io/img/icon/${order.base_asset_name}`" :alt="order.base_asset_name" class="h-10 w-10 bg-gray-800" loading="lazy" />
              <NuxtLink :to="`/asset/${formatAssetName(order.base_asset_name, { divisible: order.base_asset_divisible})}`" class="font-medium leading-6 text-base text-white">
                {{ formatAssetName(order.base_asset_name, { asset_longname: order.base_asset_longname}) }}
              </NuxtLink>
            </div>
          </td>
          <td class="whitespace-nowrap py-3 pr-3 leading-6 text-gray-300">
            {{ order.effective_trading_price.toFixed(8) }} XCP
          </td>
          <td class="whitespace-nowrap py-3 pr-3 leading-6 text-gray-300">
            {{ formatBalance(order.base_asset_quantity, { divisible: order.base_asset_divisible}) }}
          </td>
          <td class="whitespace-nowrap py-3 font-medium text-right">
            <NuxtLink :to="`/tx/${order.tx_hash}`" class="text-primary">View</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ArrowPathIcon, FunnelIcon } from '@heroicons/vue/20/solid'
import { ref, reactive, watch, computed, onMounted } from 'vue';

// Props
const props = defineProps({
  baseAsset: String,
  quoteAsset: String,
  intent: String,
  collection: String,
});

// State
const state = reactive({
  orders: [],
  loading: false,
  showFilters: false,
});
const supplyFilter = ref(Number.MAX_SAFE_INTEGER);
const assetNameFilter = ref('');
const debouncedAssetName = ref('');

// Options
const supplyOptions = [
  { label: '<100', value: 100 },
  { label: '<1k', value: 1000 },
  { label: '<10k', value: 10000 },
  { label: 'All', value: Number.MAX_SAFE_INTEGER },
];

// Compute
const filteredOrders = computed(() => {
  // Check if no filters are applied
  const noFiltersApplied = supplyFilter.value === Number.MAX_SAFE_INTEGER &&
                           debouncedAssetName.value === '';

  // If no filters are applied, return the entire dispensers array
  if (noFiltersApplied) {
    return state.orders;
  }

  // Otherwise, apply the filters
  return state.orders.filter(order => {
    const supplyCondition = order.base_asset_supply < supplyFilter.value;

    // Skip the item if it doesn't meet the supply or effective rate conditions
    if (!supplyCondition) return false;

    // Check if the asset name matches the filter (considering debouncing)
    const assetNameCondition = order.get_asset.includes(debouncedAssetName.value) || order.give_asset.includes(debouncedAssetName.value);

    return assetNameCondition;
  });
});

// Computed property for query parameters
const queryParams = computed(() => {
  const params = {};
  if (props.collection) params.collection = props.collection;
  if (props.quoteAsset) params.quote = props.quoteAsset;
  if (props.baseAsset) params.base = props.baseAsset;
  if (props.intent) params.intent = props.intent;
  return params;
});

// Methods
const setSupplyFilter = (value) => supplyFilter.value = value;
const handleInput = () => assetNameFilter.value = assetNameFilter.value.toUpperCase();
const resetFilters = () => {
  supplyFilter.value = Number.MAX_SAFE_INTEGER;
  assetNameFilter.value = '';
  debouncedAssetName.value = '';
};

// Debounce function (utility)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Debounced filter
const debouncedFilter = debounce(() => {
  debouncedAssetName.value = assetNameFilter.value;
}, 300);

// Function to fetch orders from API
const fetchOrders = async () => {
  state.loading = true;
  try {
    const queryString = new URLSearchParams(queryParams.value).toString();
    const response = await fetch(`https://api.xcp.io/api/v1/orders?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    state.orders = await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    state.loading = false;
  }
};

watch(assetNameFilter, () => {
  debouncedFilter();

  if (assetNameFilter.value === '') {
    debouncedAssetName.value = '';
  }
}, { immediate: true });

onMounted(fetchOrders);
</script>
