<script setup lang="ts">
import type { DataTableHeader } from "@/plugins/vuetify";
import axios from "axios";
import { Notify } from "@/stores/notification";
import {
  doVerneMQAPICall,
  selectedNodeValid,
  transformTableToArray,
} from "@/verne-api-helper";

definePage({
  meta: {
    icon: "mdi-key",
    title: "API Key",
    drawerIndex: 6,
  },
});

const data = ref<any[]>([]);
let timer = null;

let apiKeyDataSelected = ref<any[]>([]);
const SelectedNode = inject("workingNodeSelected");

const apikeyHeaders: DataTableHeader[] = [
  { title: "Key", key: "Key" },
  { title: "Scope", key: "Scope" },
  { title: "Expires", key: "Expires (UTC)" },
  { title: "has expired", key: "has expired" },
  { title: "Actions", key: "actions" },
];

const deleteKey = async (item) => {
  try {
    Notify.info("Delete API Key");
    const responseListener = await doVerneMQAPICall(
      item.Node,
      "/api/v1/api-key/delete?key=" + item.Key,
    );
  } catch (error) {
    Notify.error("Error deleting key " + error);
  }
};

const loadPApiKeyDataFromRestService = async (NodeName) => {
  try {
    const responseListener = await doVerneMQAPICall(
      NodeName,
      "/api/v1/api-key/show",
    );
    apiKeyDataSelected.value = transformTableToArray(
      responseListener.data,
      NodeName,
    );
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall("self", "/api/v1/cluster/show");
    data.value = transformTableToArray(response.data, null);

    if (!selectedNodeValid(SelectedNode)) return;

    loadPApiKeyDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (!selectedNodeValid(SelectedNode)) return;

  loadPApiKeyDataFromRestService(SelectedNode.value);
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

        <v-card
          title="API Keys"
          subtitle="Lists all API keys of the selected node"
        >
          <v-data-table
            :headers="apikeyHeaders"
            :items="apiKeyDataSelected"
            item-value="name"
          >
            <template v-slot:item.actions="{ item }">
              <BtnIconWithTooltip
                tooltip="Delete Key"
                @click="deleteKey(item)"
                myicon="mdi-delete"
              ></BtnIconWithTooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
