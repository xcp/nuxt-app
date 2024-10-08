<template>
  <!-- Pagination -->
  <nav
    class="mt-6 sm:mt-0 flex items-center justify-between"
    aria-label="Pagination"
  >
    <div class="flex items-center">
      <p
        v-if="state.assets.length < 30"
        class="text-base text-gray-300 leading-9"
      >
        Showing
        <span class="font-medium">1</span>
        to
        <span class="font-medium">{{ state.assets.length }}</span>
        of
        <span class="font-medium">{{ state.assets.length }}</span>
        results
      </p>
      <p
        v-else
        class="text-base text-gray-300 leading-9"
      >
        Scroll down to load more...
      </p>
    </div>
    <!-- Table/Grid Toggle Buttons -->
    <div class="flex">
      <!-- Table View Button -->
      <button
        class="h-10 inline-flex items-center justify-center rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-700 focus:outline-none"
        :class="{ 'bg-gray-700 text-white': viewMode === 'table', 'bg-gray-800 text-gray-300': viewMode === 'grid' }"
        @click="viewMode = 'table'; trackEvent('List View')"
      >
        <ListBulletIcon class="h-4 w-4" />
      </button>
      <!-- Grid View Button -->
      <button
        class="h-10 ml-2 inline-flex items-center justify-center rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-700 focus:outline-none"
        :class="{ 'bg-gray-700 text-white ': viewMode === 'grid', 'bg-gray-800 text-gray-300': viewMode === 'table' }"
        @click="viewMode = 'grid'; trackEvent('Grid View')"
      >
        <ViewColumnsIcon class="h-4 w-4" />
      </button>
    </div>
  </nav>

  <!-- Loading -->
  <div
    v-if="state.loading"
    class="flex justify-center items-center my-20 py-20 text-gray-300"
  >
    <ArrowPathIcon
      class="animate-spin h-8 w-8 text-gray-400"
      aria-hidden="true"
    />
  </div>

  <!-- No Data -->
  <div
    v-if="state.assets.length === 0"
    class="my-10 flex justify-center items-center"
  >
    <div class="text-center">
      <p class="text-lg text-gray-400">
        No results found.
      </p>
      <p class="text-base text-gray-400">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>
  </div>

  <!-- Grid View -->
  <div
    v-if="viewMode === 'grid' && state.assets.length > 0"
    class="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-6 gap-4 mt-6"
  >
    <div
      v-for="asset in state.assets"
      :key="asset.asset_name"
      class="flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800"
    >
      <!-- Nuxt Link Wrapping the Image and Asset Name -->
      <NuxtLink :to="`/asset/${asset.asset_name}`">
        <!-- Aspect Ratio Block -->
        <div class="aspect-w-5 aspect-h-7 w-full">
          <ImageHelper
            :asset-name="asset.asset_name"
            :format-asset-name="formatAssetName"
          />
        </div>
        <div class="p-4 pb-0">
          <!-- Asset Name -->
          <div class="font-medium leading-6 text-white">
            {{ formatAssetName(asset.asset_name, asset) }}
          </div>
        </div>
      </NuxtLink>
      <div class="p-4 pt-0">
        <div class="text-base leading-6 text-gray-300">
          Supply: {{ formatBalance(asset.supply, asset) }}
        </div>
        <div class="text-base leading-6 text-gray-300">
          Block #: {{ asset.block_index.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>

  <!-- Table View -->
  <div
    v-else-if="state.assets.length > 0"
    class="mt-6 relative overflow-x-auto"
  >
    <TableTemplate class="w-full whitespace-nowrap text-left border-white/10">
      <thead class="border-t border-b border-white/10 text-base leading-6 text-white">
        <tr>
          <th
            scope="col"
            class="py-2 pr-2 font-semibold"
          >
            Asset
          </th>
          <th
            scope="col"
            class="py-2 pr-2 font-semibold"
          >
            Supply
          </th>
          <th
            scope="col"
            class="py-2 pr-2 font-semibold"
          >
            Type
          </th>
          <th
            scope="col"
            class="py-2 pr-2 font-semibold w-20 text-right"
          >
            Block #
          </th>
          <th
            scope="col"
            class="py-2 w-20"
          >
            <span class="sr-only">View</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/5">
        <tr
          v-for="asset in state.assets"
          :key="asset.asset_name"
        >
          <td class="whitespace-nowrap py-3 pr-3">
            <div class="flex items-center gap-x-4">
              <NuxtImg
                :src="`https://app.xcp.io/img/icon/${asset.asset_name}`"
                :alt="formatAssetName(asset.asset_name, asset)"
                class="h-10 w-10"
                loading="lazy"
              />
              <NuxtLink
                :to="`/asset/${asset.asset_name}`"
                class="font-medium leading-6 text-white"
              >
                {{ formatAssetName(asset.asset_name, asset) }}
              </NuxtLink>
            </div>
          </td>
          <td class="whitespace-nowrap py-3 pl-0 text-base leading-6 text-gray-300">
            {{ formatBalance(asset.supply, asset) }}
          </td>
          <td class="whitespace-nowrap py-3 pr-2 text-base leading-6 text-gray-300 capitalize">
            {{ asset.type }}{{ asset.divisible ? ', Divisible' : '' }}
          </td>
          <td class="py-3 pl-0 text-right text-base leading-6 text-gray-300">
            {{ asset.block_index.toLocaleString() }}
          </td>
          <td class="whitespace-nowrap py-3 pl-3 text-base font-medium text-right">
            <NuxtLink
              :to="`/asset/${asset.asset_name}`"
              class="text-primary"
            >
              View
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </TableTemplate>
  </div>
  <div
    v-if="!state.allDataLoaded"
    ref="lastElement"
  />
</template>

<script setup>
import { ArrowPathIcon, ListBulletIcon, ViewColumnsIcon } from '@heroicons/vue/20/solid'
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'

const { trackEvent } = useFathom()

const props = defineProps({
  collection: String,
})

const state = reactive({
  assets: [],
  loading: false,
  allDataLoaded: false,
  initialLoad: true,
})

const observer = ref(null)
const lastElement = ref(null)
const viewMode = ref('grid')

const fetchData = async () => {
  if (state.loading || state.allDataLoaded) return

  state.loading = true
  const query = `slug=${props.collection}&page=${Math.floor(state.assets.length / 30) + 1}`

  try {
    const response = await fetch(`https://app.xcp.io/api/v1/collections?${query}`)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()

    if (data.data.length < 30) {
      state.allDataLoaded = true
    }

    state.assets.push(...data.data)
  }
  catch (error) {
    console.error('Fetch error:', error)
  }
  finally {
    state.loading = false
    state.initialLoad = false
    if (state.allDataLoaded) {
      observer.value?.disconnect()
    }
  }
}

const handleIntersect = (entries) => {
  if (entries[0].isIntersecting && !state.allDataLoaded) {
    fetchData()
  }
}

onMounted(() => {
  fetchData()
  observer.value = new IntersectionObserver(handleIntersect, { threshold: 1.0 })
  if (lastElement.value) observer.value.observe(lastElement.value)
})

onUnmounted(() => {
  if (observer.value) observer.value.disconnect()
})

watch(lastElement, (el) => {
  if (el && observer.value) observer.value.observe(el)
})
</script>
