import { createRouter, createWebHistory } from "vue-router";
import AboutPage from "@/pages/AboutPage.vue";
import ArchivesPage from "@/pages/ArchivesPage.vue";
import HomePage from "@/pages/HomePage.vue";
import PostDetailPage from "@/pages/PostDetailPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/posts/:slug", component: PostDetailPage },
    { path: "/archives", component: ArchivesPage },
    { path: "/about", component: AboutPage }
  ],
  scrollBehavior: () => ({ top: 0 })
});
