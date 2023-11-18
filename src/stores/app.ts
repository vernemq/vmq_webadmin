import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => {
    return {
      drawer: true,
      drawerImage: "AppStore",
      token: "not_yet_set",
      drawerImageShow: true,
    };
  },
});
