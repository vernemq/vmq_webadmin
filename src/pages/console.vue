<script setup lang="ts">
import type { DataTableHeader } from "@/plugins/vuetify";
import axios from "axios";
import { Notify } from "@/stores/notification";
import { doVerneMQAPICall, transformTableToArray } from "@/verne-api-helper";

definePage({
  meta: {
    icon: "mdi-console",
    title: "Console",
    drawerIndex: 20,
  },
});

const data = ref<any[]>([]);
const SelectedNode = inject("workingNodeSelected");

let listenerDataSelected = ref<any[]>([]);
let timer = null;

const listenerHeaders: DataTableHeader[] = [
  { title: "Node", key: "Node" },
  { title: "Type", key: "type" },
  { title: "Status", key: "status" },
  { title: "Address", key: "address" },
  { title: "Port", key: "port" },
  { title: "Mountpoint", key: "mountpoint" },
  { title: "TLS", key: "tls_version" },
  { title: "Max Connections", key: "max_conns" },
  { title: "Total Connections", key: "all_conns" },
  { title: "Actions", key: "actions", sortable: false },
];

// Start/Stop/Delete Listener
const startListener = async (item) => {
  try {
    Notify.info("Start listener");
    const response = await doVerneMQAPICall(
      item.Node,
      "/api/v1/listener/restart?address=" + item.address + "&port=" + item.port,
    );
  } catch (error) {
    Notify.error("Error starting listener " + error);
  }
};

const suspendListener = async (item) => {
  try {
    Notify.info("Suspend listener");
    const response = await doVerneMQAPICall(
      item.Node,
      "/api/v1/listener/stop?address=" + item.address + "&port=" + item.port,
    );
  } catch (error) {
    Notify.error("Error Suspend listener " + error);
  }
};

const stopListener = async (item) => {
  try {
    Notify.info("Stop listener");
    const response = await doVerneMQAPICall(
      item.Node,
      "/api/v1/listener/stop?address=" + item.address + "&port=" + item.port,
    );
  } catch (error) {
    Notify.error("Error stopping listener " + error);
  }
};

const deleteListener = async (item) => {
  try {
    Notify.info("Delete listener");
    const response = await doVerneMQAPICall(
      item.Node,
      "/api/v1/listener/delete?address=" + item.address + "&port=" + item.port,
    );
  } catch (error) {
    Notify.error("Error deleting listener " + error);
  }
};

const loadListenerDataFromRestService = async (NodeName) => {
  try {
    const responseListener = await doVerneMQAPICall(
      NodeName,
      "/api/v1/listener/show?--mqtt&--tls",
    );
    listenerDataSelected.value = transformTableToArray(
      responseListener.data,
      NodeName,
    );
    for (const obj of listenerDataSelected.value) {
      obj.calc_key = obj.Node + obj.address + obj.port;
    }
    console.log(listenerDataSelected);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall("self", "/api/v1/cluster/show");
    data.value = transformTableToArray(response.data, null);

    if (
      SelectedNode == null ||
      SelectedNode.value == null ||
      SelectedNode.value == "" ||
      SelectedNode.value == undefined
    ) {
      return;
    }

    loadListenerDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (
    SelectedNode == null ||
    SelectedNode.value == null ||
    SelectedNode.value == "" ||
    SelectedNode.value == undefined
  ) {
    return;
  }

  loadListenerDataFromRestService(SelectedNode.value);
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
        <NodeSelector v-model="SelectedNode" :data="data" />
        <v-select
          :items="data"
          item-value="File"
          :item-props="fileProps"
          label="Select an File.."
          v-model="vmodFiles"
        >
        </v-select>

        <v-card title="Listener" subtitle="File content"> </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
