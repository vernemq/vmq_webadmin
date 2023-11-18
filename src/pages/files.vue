<script setup lang="ts">
import type { DataTableHeader } from "@/plugins/vuetify";
import axios from "axios";
import { Notify } from "@/stores/notification";
import { doVerneMQAPICall, transformTableToArray } from "@/verne-api-helper";

definePage({
  meta: {
    icon: "mdi-file-outline",
    title: "Files",
    drawerIndex: 10,
  },
});

const data = ref<any[]>([]);
const SelectedNode = inject("workingNodeSelected");

let listenerDataSelected = ref<any[]>([]);
let timer = null;
let text = ref<any>();
let vmodFiles = ref<any>();

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
const loadTextFile = async (item) => {
  try {
    Notify.info("Load text");
    const response = await doVerneMQAPICall(
      "",
      "/webuiapi/v1/read?file=vmq_config",
    );
    text.value = response.data;
    console.log(text);
  } catch (error) {
    Notify.error("Error loading text " + error);
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
    loadTextFile(1);
    loadListenerDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(vmodFiles, (newValue, oldValue) => {
  if (
    vmodFiles == null ||
    vmodFiles.value == null ||
    vmodFiles.value == "" ||
    vmodFiles.value == undefined
  ) {
    return;
  }

  loadTextFile(1);

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
        <v-select
          :items="['vmq_passwd', 'vmq_acl', 'vmq_config']"
          label="Select an File to load"
          v-model="vmodFiles"
        >
        </v-select>
        <v-card title="File Viewer" subtitle="File content">
          <v-textarea v-model="text"> </v-textarea>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
