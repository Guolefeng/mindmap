import Mindmap from "./map";

let map;
const initMap = () => {
    if (map) {
        map.dispose();
    }
    map = new Mindmap({
        container: document.getElementById("app"),
        data: {
            level: 0,
            node_id: 0,
            chinese_name: "根节点",
            children: [],
        },
        readonly: false,
    });
    map.render();
};

initMap();

// map.dispose();
