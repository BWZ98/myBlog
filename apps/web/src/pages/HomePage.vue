<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { PostListItem } from "@myblog/shared";
import { getPosts } from "@/services/post.api";

const loading = ref(false);
const posts = ref<PostListItem[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    const result = await getPosts();
    posts.value = result.items;
  } catch {
    posts.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="hero">
    <p>个人博客系统</p>
    <h1>记录技术、生活与长期思考</h1>
  </section>

  <section class="post-list">
    <h2>最新文章</h2>
    <p v-if="loading">文章加载中...</p>
    <p v-else-if="posts.length === 0" class="muted">暂无文章，后台发布后会显示在这里。</p>
    <RouterLink v-for="post in posts" :key="post.id" class="post-card" :to="`/posts/${post.slug}`">
      <h3>{{ post.title }}</h3>
      <p>{{ post.summary || "这篇文章还没有摘要。" }}</p>
    </RouterLink>
  </section>
</template>
