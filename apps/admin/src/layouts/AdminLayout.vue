<script setup lang="ts">
import {
  ChatDotRound,
  Collection,
  DataBoard,
  Document,
  Folder,
  PriceTag,
  Setting,
  User
} from "@element-plus/icons-vue";
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="232px" class="admin-aside">
      <div class="admin-brand">MyBlog Admin</div>
      <el-menu router default-active="/">
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/posts">
          <el-icon><Document /></el-icon>
          <span>文章</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>分类</span>
        </el-menu-item>
        <el-menu-item index="/tags">
          <el-icon><PriceTag /></el-icon>
          <span>标签</span>
        </el-menu-item>
        <el-menu-item index="/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论</span>
        </el-menu-item>
        <el-menu-item index="/guestbook">
          <el-icon><Collection /></el-icon>
          <span>留言</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>访客</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <span>个人博客管理后台</span>
        <el-button text>退出</el-button>
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>
