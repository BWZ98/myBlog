<template>
  <main class="login-page">
    <el-card class="login-card" shadow="never">
      <h1>管理员登录</h1>
      <el-form label-position="top">
        <el-form-item label="邮箱或用户名">
          <el-input placeholder="admin@example.com" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" show-password />
        </el-form-item>
        <el-button type="primary" class="full-button">登录</el-button>
      </el-form>
    </el-card>
  </main>
</template>
