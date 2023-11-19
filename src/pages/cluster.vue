<script setup lang="ts">
import type { DataTableHeader } from '@/plugins/vuetify'
import axios from "axios"
import {doVerneMQAPICall, transformTableToArray} from "@/verne-api-helper";
import {Notify} from "@/stores/notification";

definePage({
  meta: {
    icon: 'mdi-cylinder',
    title: 'Cluster',
    drawerIndex: 1,
  },
})

const data = ref<any[]>([]);
const dataNode =  ref<any[]>([]);
let timer = null;

const headersCluster: DataTableHeader[] = [
  { title: 'Cluster Size',  key: 'size',},
  { title: 'Clients Online', key: 'num_online' },
  { title: 'Client Offline', key: 'num_offline' },
  { title: 'Msg Queued', key: 'msg_queued' }
]

const headersNode: DataTableHeader[] = [
  { title: 'Node Name', key: 'Node' },
  { title: 'Version', key: 'version' },
  { title: 'Running', key: 'Running' },
  { title: 'Online', key: 'num_online' },
  { title: 'Offline', key: 'num_offline' },
  { title: 'Subscriptions', key: 'num_subscriptions' },
  { title: 'Retained', key: 'num_retained' },
  { title: 'Actions', key: 'actions' },
]


const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall('self','/api/v1/cluster/show');
    dataNode.value = transformTableToArray(response.data, null);
 
    for (const obj of dataNode.value) {
     const nodeValue: string = obj.Node;
     const response = await doVerneMQAPICall(nodeValue, '/api/v1/node/status');
     const entry = transformTableToArray(response.data, null);
     obj.num_online = entry[0].Value;
     obj.num_offline = entry[1].Value;
     obj.num_subscriptions = entry[8].Value;
     obj.num_retained = entry[9].Value;
     obj.version = entry[12].Value;
     console.log(entry);

 //    dataNode.value.version = 
   }

  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const startNode = async (item) => {
  try {
    Notify.info("Start node");
    const responseListener = await doVerneMQAPICall(item.Node, '/api/v1/node/delete?key='+item.Key);
  } catch (error) {
    Notify.error("Error starting node "+error)
  }
}
const stopNode = async (item) => {
  try {
    Notify.info("Stop node");
    const responseListener = await doVerneMQAPICall(item.Node, '/api/v1/node/delete?key='+item.Key);
  } catch (error) {
    Notify.error("Error stopping node "+error)
  }
}
const leaveCluster = async (item) => {
  try {
    Notify.info("Leave cluster");
    const responseListener = await doVerneMQAPICall(item.Node, '/api/v1/node/delete?key='+item.Key);
  } catch (error) {
    Notify.error("Error leave cluster "+error)
  }
}

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
<!--        <h1>Cluster Overview</h1>
        <v-card>
          <v-data-table
            :headers="headersCluster"
            :items="data"
            item-value="name"
            @click:row="handleClick"
          ></v-data-table>
        </v-card> -->
        <v-card title="Nodes" subtitle="Shows all nodes of the cluster">
          <v-data-table
            :headers="headersNode"
            :items="dataNode"
            item-value="name">
          <template v-slot:item.actions="{ item }">
            <BtnIconWithTooltip tooltip="Start Node" @click="startNode(item)" myicon="mdi-play"></BtnIconWithTooltip>
            <BtnIconWithTooltip tooltip="Stop Node" @click="stopNode(item)" myicon="mdi-stop"></BtnIconWithTooltip>
            <BtnIconWithTooltip tooltip="Leave Cluster" @click="leaveCluster(item)" myicon="mdi-location-exit"></BtnIconWithTooltip>
          </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
