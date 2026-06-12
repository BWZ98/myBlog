<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { PostDetail } from "@myblog/shared";
import { getPostBySlug } from "@/services/post.api";

type ArticleBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

const route = useRoute();
const loading = ref(false);
const loadFailed = ref(false);
const post = ref<PostDetail | null>(null);
const slug = computed(() => String(route.params.slug ?? ""));
const articleBlocks = computed(() => parseMarkdown(post.value?.contentMd ?? ""));

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

function parseMarkdown(markdown: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ")
    });
    paragraphLines.length = 0;
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      type: "list",
      items: [...listItems]
    });
    listItems.length = 0;
  }

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        text: line.slice(3)
      });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

watch(
  slug,
  async (currentSlug) => {
    loading.value = true;
    loadFailed.value = false;
    post.value = null;

    try {
      post.value = await getPostBySlug(currentSlug);
      document.title = `${post.value.title} - MyBlog`;
    } catch {
      loadFailed.value = true;
      document.title = "文章未找到 - MyBlog";
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <article class="content-page post-detail">
    <p v-if="loading" class="muted">文章加载中...</p>
    <p v-else-if="loadFailed" class="state-message">这篇文章暂时不可访问。</p>

    <template v-else-if="post">
      <div class="post-meta">
        <span>{{ formatDate(post.publishedAt) }}</span>
        <span v-if="post.category">{{ post.category.name }}</span>
      </div>
      <h1>{{ post.title }}</h1>
      <p v-if="post.summary" class="lead">{{ post.summary }}</p>
      <div v-if="post.tags.length > 0" class="tag-row">
        <span v-for="tag in post.tags" :key="tag.id">{{ tag.name }}</span>
      </div>
      <div class="article-body">
        <template v-for="(block, index) in articleBlocks" :key="index">
          <h2 v-if="block.type === 'heading'">{{ block.text }}</h2>
          <p v-else-if="block.type === 'paragraph'">{{ block.text }}</p>
          <ul v-else>
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
        </template>
      </div>
    </template>
  </article>
</template>
