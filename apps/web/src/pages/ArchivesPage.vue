<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { ArchiveMonth } from "@myblog/shared";
import { getArchive } from "@/services/post.api";

const loading = ref(false);
const loadFailed = ref(false);
const archive = ref<ArchiveMonth[]>([]);

onMounted(async () => {
  loading.value = true;
  loadFailed.value = false;

  try {
    archive.value = await getArchive();
  } catch {
    loadFailed.value = true;
    archive.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="content-page archives-page">
    <p class="eyebrow">Archives</p>
    <h1>归档</h1>
    <p class="lead">按发布时间整理所有已发布文章，适合回头翻找旧笔记。</p>

    <p v-if="loading" class="muted">归档加载中...</p>
    <p v-else-if="loadFailed" class="state-message">归档暂时加载失败，请稍后再试。</p>
    <p v-else-if="archive.length === 0" class="state-message">暂无已发布文章。</p>

    <div v-else class="archive-list">
      <section v-for="group in archive" :key="group.key" class="archive-group">
        <h2>{{ group.year }} 年 {{ group.month }} 月</h2>
        <RouterLink v-for="post in group.posts" :key="post.id" class="archive-item" :to="`/posts/${post.slug}`">
          <span>{{ post.title }}</span>
          <time v-if="post.publishedAt">{{ new Date(post.publishedAt).getDate() }} 日</time>
        </RouterLink>
      </section>
    </div>
  </section>
</template>
