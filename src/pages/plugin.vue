<script setup lang="ts">
import type { DataTableHeader } from '@/plugins/vuetify'
import axios from "axios"
import {Notify} from "@/stores/notification";
import {doVerneMQAPICall, selectedNodeValid, transformTableToArray} from "@/verne-api-helper"
import NodeSelector from "@/components/NodeSelector.vue";
import {inject} from 'vue';

definePage({
  meta: {
    icon: 'mdi-toy-brick-outline',
    title: 'Plugin',
    drawerIndex: 7,
  },
})

const data = ref<any[]>([]);
let timer = null;

const SelectedNode = inject('workingNodeSelected')

let pluginDataSelected =  ref<any[]>([]);

const pluginHeaders: DataTableHeader[] = [
  { title: 'Plugin', key: 'Plugin' },
  { title: 'Type', key: 'Type' },
  { title: 'Hooks', key: 'Hook(s)' },
  { title: 'M:F/A', key: 'M:F/A' },
  { title: 'Actions', key: 'actions' }
]

const disablePlugin = async (item) => {
  try {
    const responseListener = await axios.get('ppp/api/v1/listener/stop?address='+item.address+"&port="+item.port, {headers: {'x-auth-token': 'E57mFERHoFw6QxUiqjldyILOx8IToB0m'}});
  } catch (error) {
    console.error('Fehler beim Laden der Daten: ' + error);
  }
}

const loadPluginDataFromRestService = async (NodeName) => {
  console.log(SelectedNode);
  console.log(data);
  try {
    const responseListener = await doVerneMQAPICall(NodeName,'/api/v1/plugin/show');
    pluginDataSelected.value = transformTableToArray(responseListener.data, NodeName);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall('self','/api/v1/cluster/show');
    data.value = transformTableToArray(response.data, null);

    if (!selectedNodeValid(SelectedNode)) return;

    loadPluginDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (!selectedNodeValid(SelectedNode)) return;

  loadPluginDataFromRestService(SelectedNode.value);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});

onMounted(() => {
  loadDataFromRestService();
  timer = setInterval(loadDataFromRestService, 10000);
});
</script>


<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <NodeSelector v-model="SelectedNode" :data="data"/>

        <v-card title="Plugins" subtitle="Lists all Plugins of the selected node">
          <v-data-table
            :headers="pluginHeaders"
            :items="pluginDataSelected"
            item-value="name">
            <template v-slot:item.actions="{ item }">
              <BtnIconWithTooltip tooltip="Enable Plugin" @click.once="enablePlugin(item)" myicon="mdi-play"></BtnIconWithTooltip>
              <BtnIconWithTooltip tooltip="Disable Plugin" @click.once="disablePlugin(item)" myicon="mdi-stop"></BtnIconWithTooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
