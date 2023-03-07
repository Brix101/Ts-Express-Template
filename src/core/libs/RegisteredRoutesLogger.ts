import { logger } from "./Logger";

interface Route {
  path: string;
  stack: Layer[];
}

interface Layer {
  name: string;
  route: Route;
  handle: Route;
  regexp: Thing;
  method: string;
}

interface Thing {
  fast_slash: boolean;
}

function print(path: string[], layer: Layer) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path)))
    );
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp)))
    );
  } else if (layer.method) {
    logger.warn(
      `[${layer.method.toUpperCase()}]  /${path
        .concat(split(layer.regexp))
        .filter(Boolean)
        .join("/")}`
    );
  }
}

function split(thing: string | Thing) {
  if (typeof thing === "string") {
    return thing.split("/");
  } else if (thing.fast_slash) {
    return "";
  } else {
    var match = thing
      .toString()
      .replace("\\/?", "")
      .replace("(?=\\/|$)", "$")
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, "$1").split("/")
      : "<complex:" + thing.toString() + ">";
  }
}

export { print };
