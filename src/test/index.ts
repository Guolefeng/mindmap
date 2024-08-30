// import Mindmap from "../../build/mindmap.es.js";
import Mindmap from "../map/index";
import test from "./test";

let map: Mindmap | null = null;
const initMap = () => {
    if (map) {
        map.dispose();
    }
    map = new Mindmap({
        container: document.getElementById("app") as HTMLElement,
        data: test,
        readonly: false,
        config: {
            rootNode: {},
        },
    });
};

initMap();
