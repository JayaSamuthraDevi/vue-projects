<template>
  <Navb />
  <Chat />
</template>

<script>
import Navb from '@/components/Nav.vue'
import Chat from '@/components/Chat.vue'

export default {
  name: 'App',
  components: { Navb, Chat }
}
</script>
