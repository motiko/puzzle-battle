import { initConnections } from "./protocol";

if (module.hot) {
  module.hot.accept();
}

initConnections();
