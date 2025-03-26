import fs from "node:fs/promises";
import express from "express";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SERVER_PORT = process.env.PORT || 5175;

const htmlTemplate = IS_PRODUCTION
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

/* SSR에서 어떤 컴포넌트가 어떤 정적 파일(JS/CSS)을 쓰는지 맵핑한 정보. */
const ssrManifest = IS_PRODUCTION
  ? await fs.readFile("./dist/client/.vite/ssr-manifest.json", "utf-8")
  : "";

const app = express();

/* 개발 모드일 때 만들어지는 vite 서버.
   Vite의 미들웨어를 Express에 추가하여 Express가 Vite 개발 서버 역할도 수행하게 함.
   즉, localhost:5175에서 Vite가 제공하는 HMR 등의 개발 환경을 사용할 수 있음.
*/
let vite;
if (!IS_PRODUCTION) {
  // 개발 모드일 때.
  const { createServer } = await import("vite");
  vite = await createServer({
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    base: "/",
  });
  console.log("[DEV MODE] ::: Success to create vite server.");
  app.use(vite.middlewares);
} else {
  /* 배포 모드일 때.
     compression => 응답을 gzip압축 전송.
     sirv => 정적 파일 서빙.
  */
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use("/", sirv("./dist/client", { extensions: [] }));
}

// 사용자가 api 요청 혹은, url을 통해서 페이지 접근 시 응답(api, html)을 해주는 코드
app.use("*", async (req, res) => {
  try {
    // request 페이지 경로 추출(main,home,profile).
    const url = req.originalUrl.replace("/", "");
    let template;
    let render;
    if (!IS_PRODUCTION && vite) {
      /* 
        개발 모드일때.
        index.html 파일을 불러와 변환(vite.transformIndexHTML).
        node환경에서 entry-server.tsx module을 불러옴(vite.ssrLoadModule).
      */
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      /* 
         빌드 모드일때.
         기존 빌드된 template 사용.
      */
      template = htmlTemplate;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    const { appHtml, seoHead } = await render(url, ssrManifest);
    const html = template
      .replace("<!-- app-html -->", appHtml(req.originalUrl))
      .replace("<!-- app-head -->", seoHead(req.originalUrl));

    res
      .status(200)
      .set({
        "Content-Type": "text/html",
      })
      .end(html);
  } catch (error) {
    vite.ssrFixStacktrace(error);
    console.log(error);
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Server started at ${SERVER_PORT}`);
});
