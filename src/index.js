import Mindmap from "./map";
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
        onUpdateNodesChange: (nodes) => {
            console.log("nodes", nodes);
        },
    });
    map.render();
};

initMap();

// map.dispose();
