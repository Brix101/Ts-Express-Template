import App from "core/app";
import modules from "modules";
// import { generateKeyPairSync } from "crypto";

// const { privateKey, publicKey } = generateKeyPairSync("rsa", {
//   modulusLength: 2048,
// });

// console.log(
//   privateKey.export({
//     format: "pem",
//     type: "pkcs1",
//   }),
//   publicKey.export({
//     format: "pem",
//     type: "pkcs1",
//   })
// );
modules.then((routes) => {
  const app = new App(routes);

  app.listen();
});
