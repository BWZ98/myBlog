<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">MyBlog</RouterLink>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/archives">归档</RouterLink>
        <RouterLink to="/guestbook">留言板</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
