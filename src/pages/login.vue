<script setup lang="ts">
import { transformTableToArray } from "@/verne-api-helper";
import { Notify } from "@/stores/notification";
import axios from "axios";
import { useAppStore } from "@/stores/app";

definePage({
  meta: {
    title: "Login",
    drawerIndex: 10,
  },
});

const username = ref<any[]>([]);
const password = ref<any[]>([]);
const { token } = storeToRefs(useAppStore());

const login = async (NodeName) => {
  console.log(username.value);
  console.log(password.value);
  console.log(token.value);
  try {
    const response = await axios.get("/webuiapi/login", {
      headers: { username: username.value, password: password.value },
      validateStatus: () => true,
    });
    if (response.status == 200) {
      token.value = response.data;
      Notify.info("Login successfull");
    } else {
      Notify.error("Login failed.");
    }
  } catch (error) {
    Notify.error("Error communication with VerneMQ API: " + error);
  }
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card title="Login" subtitle="Pleaser enter your credentials.">
          <v-text-field v-model="username" label="User Name"></v-text-field>
          <v-text-field v-model="password" label="password" type="password"></v-text-field>
          <v-btn @click="login" color="primary" block class="mt-2"
            >Sign in</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
