import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

const pageFiles = import.meta.glob("./pages/**/*.tsx", { eager: true });
type CustomElementType = () => JSX.Element;
type CustomModule = {
  default: CustomElementType;
};

type CustomRoute = {
  path: string;
  Element: CustomElementType;
};

const tempRoutes: CustomRoute[] = [];
for (const filePath of Object.keys(pageFiles)) {
  try {
    const fileName = filePath.match(/\.\/pages\/(.*)\.tsx$/)?.[1] ?? "";
    // "./pages/index.tsx" ===> "index"
    if (!fileName) continue;
    // "index" ===> "/"
    // "./pages/blog/&id.tsx" ===> "blog/:id"
    const normalizedPathName = fileName.includes("&")
      ? fileName.replace("&", ":")
      : fileName.replace(/\/index/, "");

    tempRoutes.push({
      path:
        fileName === "index"
          ? "/"
          : `${normalizedPathName.toLocaleLowerCase()}`,
      Element: (pageFiles[filePath] as CustomModule).default,
    });
  } catch (error) {
    console.error(error);
    continue;
  }
}

const routes = tempRoutes.filter(
  (route, index, arr) =>
    arr.findIndex((_route) => _route.path === route.path) === index
);

const Router = () => {
  return (
    <Layout>
      <Routes>
        {routes.map(({ path, Element }) => (
          <Route key={`route-ket-${path}`} path={path} element={<Element />} />
        ))}
      </Routes>
    </Layout>
  );
};

export default Router;
