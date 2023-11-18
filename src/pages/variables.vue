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
    icon: "mdi-variable",
    title: "Variables",
    drawerIndex: 6,
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
  { title: "Variable", key: "Config" },
  { title: "Env", key: "Env" },
  { title: "Local", key: "Local" },
  { title: "Global", key: "Global" },
  { title: "Actions", key: "actions" },
];

const loadSettingsDataFromRestService = async (NodeName) => {
  try {
    const responseListener = await doVerneMQAPICall(
      NodeName,
      "/api/v1/config/show?app=vmq_server",
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

const loadSettingsDataDetailFromRestService = async (NodeName, Detail) => {
  try {
    const responseListener = await doVerneMQAPICall(
      NodeName,
      "/api/v1/config/show?app=vmq_server&--key=" + Detail,
    );
    detailText.value = responseListener.data;
    console.log(variablesDataSelected);
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};

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

watch(dialogDetails, (newValue, oldValue) => {
  console.log("dialog.delete.changed");
});

const viewDetails = (item) => {
  detailText.value = "Please wait while fetching data from broker";
  loadSettingsDataDetailFromRestService(SelectedNode.value, item.Config);
  dialogDetails.value = true;
};

const closeDetails = () => {
  dialogDetails.value = false;
};

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
            <template v-slot:top>
              <v-dialog v-model="dialogDetails" max-width="500px">
                <v-card v-model="detailText">
                  <v-card-title class="text-h5">Details</v-card-title>
                  <v-card-text>{{ detailText }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue-darken-1"
                      variant="text"
                      @click="closeDetails()"
                      >Ok</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>

            <template v-slot:item.actions="{ item }">
              <BtnIconWithTooltip
                tooltip="Edit"
                @click="editDetails(item)"
                myicon="mdi-pencil-outline"
              ></BtnIconWithTooltip>
              <BtnIconWithTooltip
                tooltip="View Details"
                @click="viewDetails(item)"
                myicon="mdi-eye-outline"
              ></BtnIconWithTooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
