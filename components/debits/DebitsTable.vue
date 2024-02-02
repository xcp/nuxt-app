<template>
  <Table apiUrl="https://api.xcp.io/api/messages" :queryParams="{ address: props.address, category: props.category }" :initialPage="props.initialPage">
    <template v-slot:table-headers>
      <tr>
        <th scope="col" class="py-2 pl-2 font-semibold">Type</th>
        <th scope="col" class="py-2 pl-0 font-semibold">Asset</th>
        <th scope="col" class="py-2 pl-0 font-semibold">Quantity</th>
        <th scope="col" class="py-2 pl-0 font-semibold">Event</th>
        <th scope="col" class="py-2 pl-0 font-semibold text-right">Timestamp</th>
        <th scope="col" class="py-2 pl-0"><span class="sr-only">View</span></th>
      </tr>
    </template>
    <template v-slot:table-rows="{ data }">
      <tr v-for="(item, index) in data" :key="index">
        <td class="whitespace-nowrap py-3 pr-8">
          <div class="flex items-center gap-x-4 leading-6">
            <Badge :category="item.category" />
          </div>
        </td>
        <td class="whitespace-nowrap py-3 pl-0 pr-4 sm:table-cell sm:pr-8">
          <NuxtLink :to="`/asset/${formatAssetName(item.asset_name, item.asset)}`" class="leading-6 font-medium text-white">
            {{ formatAssetName(item.asset_name, item.asset) }}
          </NuxtLink>
        </td>
        <td class="whitespace-nowrap py-3 pl-0 pr-4 text-sm leading-6 text-gray-300">
          {{ formatBalance(item.bindings.quantity, item.asset) }}
        </td>
        <td class="whitespace-nowrap py-3 pl-0 pr-8 text-sm leading-6 text-gray-300 md:table-cell">
          {{ item.bindings.action }}
        </td>
        <td class="whitespace-nowrap py-3 pl-0 text-right text-sm leading-6 text-gray-300 sm:table-cell">
          <time :datetime="item.created_at">{{ new Date(item.confirmed_at).toLocaleString() }}</time>
        </td>
        <td class="whitespace-nowrap py-3 pl-3 text-right text-sm font-medium">
          <NuxtLink :to="`/tx/${item.bindings.event}`" class="text-indigo-400 hover:text-indigo-300">View</NuxtLink>
        </td>
      </tr>
    </template>
  </Table>
</template>

<script setup>
const props = defineProps({
  address: String,
  category: String,
  initialPage: {
    type: Number,
    default: 1
  }
})
</script>