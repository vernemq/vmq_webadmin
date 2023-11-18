<script setup lang="ts">
import type { DataTableHeader } from '@/plugins/vuetify'
import axios from "axios"
import {Notify} from "@/stores/notification";
import {doVerneMQAPICall, selectedNodeValid, transformTableToArray} from "@/verne-api-helper"

definePage({
  meta: {
    icon: 'mdi-equal',
    title: 'Sessions',
    drawerIndex: 4,
  },
})

const data = ref<any[]>([]);
let timer = null;

let sessionDataSelected =  ref<any[]>([]);
const SelectedNode = inject('workingNodeSelected')
let expanded = ref<any[]>([]);

const sessionHeaders: DataTableHeader[] = [
  { title: 'Client Id', key: 'client_id' },
  { title: 'User', key: 'user' },
  { title: 'Online', key: 'is_online' },
  { title: 'Offline Msg', key: 'offline_messages' },
  { title: 'Online Msg', key: 'online_messages' },
  { title: 'Mountpoint', key: 'mountpoint' },
  { title: 'Peer Host', key: 'peer_host' },
  { title: 'Peer Port', key: 'peer_port' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const reauthorizeSession = async (item) => {
  try {
    console.log(item);
    Notify.info("Reauthorize session");
    const responseSession = await doVerneMQAPICall(item.Node,'/api/v1/session/reauthorize?username='+item.user+'&client-id='+item.client_id+'&--mountpoint='+item.mountpoint);
  } catch (error) {
    Notify.error("Error reauthorizing session "+error)
  }
}

const disconnectSession = async (item) => {
  try {
    Notify.info("Disconnect session");
    let Path = '/webuiapi/v1/nodefwd/'+item.Node+'/api/v1/session/disconnect?client-id='+item.client_id;
    if (item.mountpoint.length > 0)
       Path = Path + '&--mountpoint='+item.mountpoint;   

    const responseSession = await doVerneMQAPICall(Path);
    console.log(responseSession);
  } catch (error) {
    Notify.error("Error Disconnect session "+error)
  }
}

const loadSessionDataFromRestService = async (NodeName) => {
  console.log(NodeName);
  try {
    const responseListener = await doVerneMQAPICall(NodeName,'/api/v1/session/show?--client_id&--user&--is_online&--offline_messages&--online_messages&--mountpoint&--peer_host&--peer_port&--queue_started_at&--session_started_at&--node='+NodeName);
    sessionDataSelected.value = transformTableToArray(responseListener.data, NodeName);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall('self','/api/v1/cluster/show');
    data.value = transformTableToArray(response.data, null);

    if (!selectedNodeValid(SelectedNode)) return;

    loadSessionDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (!selectedNodeValid(SelectedNode)) return;

  loadSessionDataFromRestService(SelectedNode.value);
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
        <v-card title="Sessions" subtitle="Shows session on selected node">
          <v-data-table
            v-model:expanded="expanded"
            :headers="sessionHeaders"
            :items="sessionDataSelected"
            density="compact"
            item-value="client_id"
            :items-per-page="50"
            show-expand>
            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length">
                  Queue started at {{new Date(item.queue_started_at).toISOString()}}
                </td>
              </tr>
              <tr>
                <td :colspan="columns.length">
                  Session started at {{new Date(item.session_started_at).toISOString()}}
                </td>
              </tr>
            </template>
            <template v-slot:item.actions="{ item }">
              <BtnIconWithTooltip tooltip="Reauthorize Sessions" @click="reauthorizeSession(item)" myicon="mdi-arrow-u-left-top"></BtnIconWithTooltip>
              <BtnIconWithTooltip tooltip="Disconnect Session" @click="disconnectSession(item)" myicon="mdi-arrow-split-vertical"></BtnIconWithTooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
