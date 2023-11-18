<script setup lang="ts">
import type { DataTableHeader } from "@/plugins/vuetify";
import axios from "axios";
import { Notify } from "@/stores/notification";
import {
  doVerneMQAPICall,
  transformTableToArray,
  selectedNodeValid,
} from "@/verne-api-helper";

definePage({
  meta: {
    icon: "mdi-security",
    title: "TLS",
    drawerIndex: 5,
  },
});

const data = ref<any[]>([]);
let timer = null;

let variablesDataSelected = ref<any[]>([]);
const SelectedNode = inject("workingNodeSelected");
let dialogDetails = ref(false);
let detailText = ref<any[]>([]);

const variableHeaders: DataTableHeader[] = [
  { title: "Node", key: "Node" },
  { title: "File", key: "Filename" },
  { title: "Not before", key: "Not_Before" },
  { title: "Not after", key: "Not_After" },
  { title: "CN", key: "CN" },
  { title: "Issuer", key: "Issuer" },
  { title: "SAN", key: "SAN" },
  { title: "Actions", key: "actions" },
];

const loadSettingsDataFromRestService = async (NodeName) => {
  try {
    const responseListener = await doVerneMQAPICall(
      NodeName,
      "/api/v1/tls/show",
    );
    variablesDataSelected.value = transformTableToArray(
      responseListener.data,
      NodeName,
    );
    console.log(variablesDataSelected);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};
/*
const loadSettingsDataDetailFromRestService = async (NodeName,Detail) => {
  try {
    const responseListener = await doVerneMQAPICall(NodeName,'/api/v1/config/show?app=vmq_server&--key='+Detail);
    detailText.value = responseListener.data;
    console.log(variablesDataSelected);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};
*/

const loadDataFromRestService = async () => {
  try {
    const response = await doVerneMQAPICall("self", "/api/v1/cluster/show");
    data.value = transformTableToArray(response.data, null);

    if (!selectedNodeValid(SelectedNode)) return;

    loadSettingsDataFromRestService(SelectedNode.value);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

watch(SelectedNode, (newValue, oldValue) => {
  if (!selectedNodeValid(SelectedNode)) return;

  loadSettingsDataFromRestService(SelectedNode.value);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});

onMounted(() => {
  loadDataFromRestService();
  dialogDetails.value = false;
  timer = setInterval(loadDataFromRestService, 10000);
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <NodeSelector v-model="SelectedNode" :data="data" />

        <v-card
          title="Listener"
          subtitle="Lists all Listener of the selected node"
        >
          <v-data-table
            :headers="variableHeaders"
            :items="variablesDataSelected"
            :items-per-page="50"
            item-value="name"
          >
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
