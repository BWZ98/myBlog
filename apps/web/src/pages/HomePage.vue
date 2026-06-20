<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { PostListItem } from "@myblog/shared";
import { getPosts } from "@/services/post.api";

const loading = ref(false);
const loadFailed = ref(false);
const posts = ref<PostListItem[]>([]);
const postCountText = computed(() => `${posts.value.length} 篇文章`);
const recentPosts = computed(() => posts.value.slice(0, 3));
const articleMetric = computed(() => (posts.value.length > 0 ? `${posts.value.length}+` : "持续"));

const focusItems = ["Vue", "TypeScript", "前端工程化", "产品实现", "可访问性", "AI 工具"];

const projectHighlights = [
  {
    title: "个人博客系统",
    description: "从内容导入、数据库建模到前端展示，沉淀一套可持续维护的个人内容平台。"
  },
  {
    title: "工程实践记录",
    description: "把开发过程中的取舍、问题定位和上线流程整理成可以复盘的文章。"
  },
  {
    title: "在线简历雏形",
    description: "后续会补充经历、项目、技能与联系方式，让访客更快理解我的能力结构。"
  }
];

const resumeSections = [
  {
    label: "当前定位",
    value: "前端开发者，关注可维护的交互体验与工程交付。"
  },
  {
    label: "主要技术",
    value: "Vue / TypeScript / Node.js / Prisma / 内容系统。"
  },
  {
    label: "下一步",
    value: "补充项目案例、经历时间线与可下载简历。"
  }
];

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
  <section class="home-hero">
    <div class="hero-intro">
      <p class="eyebrow">Frontend Developer</p>
      <h1>你好，我是 Buwei，<span class="nowrap">前端开发者。</span></h1>
      <p class="hero-copy">
        我关注可维护的前端工程、稳定的内容系统和能真正上线的产品体验。这里会记录项目实践、学习笔记和阶段复盘，也会逐步整理成清晰可见的在线简历。
      </p>
      <div class="hero-actions">
        <RouterLink class="button-link" to="/archives">阅读文章</RouterLink>
        <RouterLink class="text-link" to="/about">了解更多</RouterLink>
      </div>
    </div>

    <aside class="profile-panel" aria-label="个人概览">
      <div class="profile-visual">
        <span>B</span>
      </div>
      <div class="profile-summary">
        <p class="profile-name">Buwei</p>
        <p>前端开发者 / 个人博客作者</p>
      </div>
      <dl class="profile-facts">
        <div>
          <dt>关注方向</dt>
          <dd>Vue、工程化、产品落地</dd>
        </div>
        <div>
          <dt>内容主题</dt>
          <dd>项目复盘、技术笔记、成长记录</dd>
        </div>
        <div>
          <dt>文章积累</dt>
          <dd>{{ articleMetric }} 更新</dd>
        </div>
      </dl>
    </aside>
  </section>

  <section class="home-section">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Focus</p>
        <h2>我正在积累的方向</h2>
      </div>
    </div>
    <div class="focus-grid">
      <span v-for="item in focusItems" :key="item">{{ item }}</span>
    </div>
  </section>

  <section class="home-section">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Work</p>
        <h2>近期项目与内容线索</h2>
      </div>
    </div>
    <div class="project-grid">
      <article v-for="item in projectHighlights" :key="item.title" class="project-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </div>
  </section>

  <section class="home-section resume-preview">
    <div>
      <p class="eyebrow">Resume</p>
      <h2>简历快照</h2>
    </div>
    <div class="resume-list">
      <div v-for="item in resumeSections" :key="item.label" class="resume-item">
        <span>{{ item.label }}</span>
        <p>{{ item.value }}</p>
      </div>
    </div>
  </section>

  <section class="home-section post-list">
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
      <RouterLink v-for="post in recentPosts" :key="post.id" class="post-card" :to="`/posts/${post.slug}`">
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
      <RouterLink v-if="posts.length > recentPosts.length" class="archive-cta" to="/archives">查看全部文章</RouterLink>
    </template>
  </section>
</template>
