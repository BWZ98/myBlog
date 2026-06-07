<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <article class="content-page">
    <p class="muted">文章详情</p>
    <h1>{{ route.params.slug }}</h1>
    <p>这里会接入文章正文、目录、评论与回复。</p>
  </article>
</template>
