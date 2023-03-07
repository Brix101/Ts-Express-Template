import App from "core/app";
import modules from "modules";

modules.then((routes) => {
  const app = new App(routes);

  app.listen();
});
