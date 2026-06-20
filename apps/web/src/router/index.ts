import { createRouter, createWebHistory } from "vue-router";
import AboutPage from "@/pages/AboutPage.vue";
import ArchivesPage from "@/pages/ArchivesPage.vue";
import HomePage from "@/pages/HomePage.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";
import PostDetailPage from "@/pages/PostDetailPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: HomePage,
      meta: {
        title: "Buwei - 前端开发者",
        description: "Buwei 的个人主页与博客，记录前端开发、项目实践和长期学习笔记。"
      }
    },
    {
      path: "/posts/:slug",
      component: PostDetailPage,
      meta: {
        title: "文章详情 - MyBlog",
        description: "阅读 MyBlog 上的文章内容。"
      }
    },
    {
      path: "/archives",
      component: ArchivesPage,
      meta: {
        title: "归档 - MyBlog",
        description: "按时间查看 MyBlog 已发布的文章。"
      }
    },
    {
      path: "/about",
      component: AboutPage,
      meta: {
        title: "关于 - MyBlog",
        description: "了解博客作者和这个博客项目。"
      }
    },
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundPage,
      meta: {
        title: "页面没有找到 - MyBlog",
        description: "这个地址暂时没有对应内容。"
      }
    }
  ],
  scrollBehavior: () => ({ top: 0 })
});

router.afterEach((to) => {
  const title = typeof to.meta.title === "string" ? to.meta.title : "MyBlog";
  const description =
    typeof to.meta.description === "string"
      ? to.meta.description
      : "Buwei 的个人主页与博客，记录前端开发、项目实践和长期学习笔记。";

  document.title = title;
  setMetaContent("description", description);
  setMetaContent("og:title", title, "property");
  setMetaContent("og:description", description, "property");
});

function setMetaContent(name: string, content: string, attribute = "name") {
  const selector = `meta[${attribute}="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}
