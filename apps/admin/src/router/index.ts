import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import CategoriesPage from "@/pages/CategoriesPage.vue";
import CommentsPage from "@/pages/CommentsPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import GuestbookPage from "@/pages/GuestbookPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import PostEditPage from "@/pages/PostEditPage.vue";
import PostsPage from "@/pages/PostsPage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import TagsPage from "@/pages/TagsPage.vue";
import UsersPage from "@/pages/UsersPage.vue";

export const router = createRouter({
  history: createWebHistory("/admin"),
  routes: [
    { path: "/login", component: LoginPage },
    {
      path: "/",
      component: AdminLayout,
      children: [
        { path: "", component: DashboardPage },
        { path: "posts", component: PostsPage },
        { path: "posts/new", component: PostEditPage },
        { path: "posts/:id/edit", component: PostEditPage },
        { path: "categories", component: CategoriesPage },
        { path: "tags", component: TagsPage },
        { path: "comments", component: CommentsPage },
        { path: "guestbook", component: GuestbookPage },
        { path: "users", component: UsersPage },
        { path: "settings", component: SettingsPage }
      ]
    }
  ]
});
