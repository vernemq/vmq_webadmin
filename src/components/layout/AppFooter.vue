<template>
  <v-footer app>
    <v-spacer />
    <v-defaults-provider
      :defaults="{ VBtn: { variant: 'text', size: 'x-small' } }"
    >
      <AppNotification />
      <ButtonSettings />
    </v-defaults-provider>
  </v-footer>
</template>
<style scoped lang="scss">
.v-footer {
  padding: 0px 10px;
  :deep(> .v-btn--icon) {
    .v-icon {
      height: 1.25em;
      width: 1.25em;
    }
  }
}
</style>
