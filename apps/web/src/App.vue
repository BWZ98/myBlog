<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="回到首页">
        <span class="brand-mark">B</span>
        <span class="brand-text">Buwei</span>
      </RouterLink>
      <nav aria-label="主导航">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/archives">文章</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
