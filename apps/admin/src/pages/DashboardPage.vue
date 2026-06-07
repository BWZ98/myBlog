<template>
  <section>
    <h1>仪表盘</h1>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="never"><p>文章数</p><strong>0</strong></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p>评论数</p><strong>0</strong></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p>留言数</p><strong>0</strong></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p>访客数</p><strong>0</strong></el-card>
      </el-col>
    </el-row>
  </section>
</template>
