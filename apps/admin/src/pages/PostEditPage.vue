<template>
  <section>
    <h1>文章编辑</h1>
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input placeholder="请输入文章标题" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="正文 Markdown">
        <el-input type="textarea" :rows="14" />
      </el-form-item>
      <el-button type="primary">保存草稿</el-button>
      <el-button>发布</el-button>
    </el-form>
  </section>
</template>
