<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { PostListItem } from "@myblog/shared";
import { getPosts } from "@/services/post.api";

const loading = ref(false);
const loadFailed = ref(false);
const posts = ref<PostListItem[]>([]);
const postCountText = computed(() => `${posts.value.length} 篇文章`);

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

function formatDate(value?: string | null) {
  if (!value) {
    return "未发布";
  }

  return dateFormatter.format(new Date(value));
}

onMounted(async () => {
  loading.value = true;
  loadFailed.value = false;
  try {
    const result = await getPosts();
    posts.value = result.items;
  } catch {
    loadFailed.value = true;
    posts.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="hero">
    <p>MyBlog</p>
    <h1>记录技术、生活与长期思考</h1>
    <p class="hero-copy">
      这里收集工程实践、产品观察和一些缓慢成形的个人笔记。先把能读的内容安静地放好，后续再逐步长出互动和后台。
    </p>
  </section>

  <section class="post-list">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Latest</p>
        <h2>最新文章</h2>
      </div>
      <span v-if="posts.length > 0" class="post-count">{{ postCountText }}</span>
    </div>

    <p v-if="loading" class="muted">文章加载中...</p>
    <p v-else-if="loadFailed" class="state-message">文章暂时加载失败，请稍后再试。</p>
    <p v-else-if="posts.length === 0" class="state-message">暂无已发布文章。</p>

    <template v-else>
      <RouterLink v-for="post in posts" :key="post.id" class="post-card" :to="`/posts/${post.slug}`">
        <div class="post-meta">
          <span>{{ formatDate(post.publishedAt) }}</span>
          <span v-if="post.category">{{ post.category.name }}</span>
        </div>
        <h3>{{ post.title }}</h3>
        <p>{{ post.summary || "这篇文章还没有摘要。" }}</p>
        <div v-if="post.tags.length > 0" class="tag-row">
          <span v-for="tag in post.tags" :key="tag.id">{{ tag.name }}</span>
        </div>
      </RouterLink>
    </template>
  </section>
</template>
