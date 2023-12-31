<script setup lang="ts">
import type { DataTableHeader } from '@/plugins/vuetify'
import axios from "axios"
import {Notify} from "@/stores/notification";
import {doVerneMQAPICall, transformTableToArray} from "@/verne-api-helper"

definePage({
  meta: {
    icon: 'mdi-developer-board',
    title: 'Listener',
    drawerIndex: 2,
  },
})

const data = ref<any[]>([]);
const SelectedNode = inject('workingNodeSelected')

let listenerDataSelected =  ref<any[]>([]);
let timer = null;

const listenerHeaders: DataTableHeader[] = [
  { title: 'Node', key: 'Node' },
  { title: 'Type', key: 'type' },
  { title: 'Status', key: 'status' },
  { title: 'Address', key: 'address' },
  { title: 'Port', key: 'port' },
  { title: 'Mountpoint', key: 'mountpoint' },
  { title: 'Max Connections', key: 'max_conns' },
  { title: 'Total Connections', key: 'all_conns' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Start/Stop/Delete Listener
const startListener = async (item) => {
  try {
    Notify.info("Start listener");
    const responseListener = await doVerneMQAPICall(item.Node,'/api/v1/listener/restart?address='+item.address+"&port="+item.port);
  } catch (error) {
    Notify.error("Error starting listener "+error)
  }
}

const suspendListener = async (item) => {
  try {
    Notify.info("Suspend listener");
    const responseListener = await doVerneMQAPICall(item.Node,'/api/v1/listener/stop?address='+item.address+"&port="+item.port);
  } catch (error) {
    Notify.error("Error Suspend listener "+error)
  }
}

const stopListener = async (item) => {
  try {
    Notify.info("Stop listener");
    const responseListener = await doVerneMQAPICall(item.Node,'/api/v1/listener/stop?address='+item.address+"&port="+item.port);
  } catch (error) {
    Notify.error("Error stopping listener "+error)
  }
}

const deleteListener = async (item) => {
  try {
    Notify.info("Delete listener");
    const responseListener = await axios.get(item.Node,'/api/v1/listener/delete?address='+item.address+"&port="+item.port, {headers: {'x-token': useAppStore().token}});
  } catch (error) {
    Notify.error("Error Deleting listener "+error)
  }
}

const loadListenerDataFromRestService = async (NodeName) => {
  try {
    const responseListener = await doVerneMQAPICall(NodeName,'/api/v1/listener/show');
    listenerDataSelected.value = transformTableToArray(responseListener.data, NodeName);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall('self', '/api/v1/cluster/show');
    data.value = transformTableToArray(response.data, null);

    if (SelectedNode == null || SelectedNode.value == null || SelectedNode.value == "" ||SelectedNode.value == undefined) {
      return ;
    }

    loadListenerDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (SelectedNode == null || SelectedNode.value == null || SelectedNode.value == "" ||SelectedNode.value == undefined) {
    return ;
  }

  loadListenerDataFromRestService(SelectedNode.value);

  console.log(newValue, oldValue);
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

        <v-card title="Listener" subtitle="Lists all Listener of the selected node">
          <v-data-table
            :headers="listenerHeaders"
            :items="listenerDataSelected"
            :items-per-page="50"
            item-value="name">
            <template v-slot:item.actions="{ item }">
              <BtnIconWithTooltip tooltip="Start Listener" @click="startListener(item)" myicon="mdi-play"></BtnIconWithTooltip>
              <BtnIconWithTooltip tooltip="Suspend Listener" @click="suspendListener(item)" myicon="mdi-pause"></BtnIconWithTooltip>
              <BtnIconWithTooltip tooltip="Stop Listener" @click="stopListener(item)" myicon="mdi-stop"></BtnIconWithTooltip>
              <BtnIconWithTooltip tooltip="Delete Listener" @click="deleteListener(item)" myicon="mdi-delete"></BtnIconWithTooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
