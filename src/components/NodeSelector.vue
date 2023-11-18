<script setup lang="ts">


const props = defineProps<{
  modelValue: any
  data: any
}>();

const vMod = ref<any[]>([]);
vMod.value = props.modelValue;

const itemProps = (item) => {
  return {
    title: item.Node,
    subtitle: item.Running? "Running" : "Stopped",
  }
}

const emit = defineEmits<{
  'update:modelValue': [any]
}>()

watch(vMod, (newValue, oldValue) => {
  emit('update:modelValue', vMod.value);
});

</script>

<style lang="scss" scoped>
.btn-icon {
  padding: 0px;
}
</style>

<template>
<v-card title="Node" subtitle="Please select a node">
<v-select
  :items="data"
  item-value="Node"
  :item-props="itemProps"
  label="Select an Node.."
  v-model="vMod"
></v-select>
</v-card></template>
