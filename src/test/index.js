// import Mindmap from "../../build/mindmap.es.js";
import Mindmap from "../map/index.js";
import test from "./test";

let map;
const initMap = () => {
    if (map) {
        map.dispose();
    }
    map = new Mindmap({
        container: document.getElementById("app"),
        data: test,
        readonly: false,
    });
};

initMap();
