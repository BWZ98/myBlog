<template>
  <section>
    <div class="page-title">
      <h1>文章管理</h1>
      <el-button type="primary" @click="$router.push('/posts/new')">新建文章</el-button>
    </div>
    <el-empty description="文章列表接口接入后显示数据" />
  </section>
</template>
