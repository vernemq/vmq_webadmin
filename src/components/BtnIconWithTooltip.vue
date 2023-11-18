<script setup lang="ts">
withDefaults(
  defineProps<{
    myicon: string;
    tooltip: string;
  }>(),
  {},
);

const emit = defineEmits<{
  click: [any];
}>();
</script>
<style lang="scss" scoped>
.btn-icon {
  padding: 0px;
  min-width: 32px;
  --v-btn-size: unset;
}
</style>

<template>
  <v-btn
    @click="$emit('click')"
    variant="plain"
    density="compact"
    class="pa-0 pm-0 btn-icon"
    rounded="0"
    size="x-small"
    :ripple="false"
    :prepend-icon="myicon"
  >
    <v-tooltip activator="parent">
      {{ tooltip }}
    </v-tooltip>
  </v-btn>
</template>
