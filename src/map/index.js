import zrender from "zrender";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";
import Node from "./node";
import Line from "./line";
import Btn from "./btn";
import Viewport from "./viewport";
import { getTextWidth, getEndNodeNum } from "./utils";

export default class Mindmap {
    constructor({
        container,
        data,
        readonly = true,
        onNodeContentMenuClick = () => {},
        onNodeClick = () => {},
        onNodeMouseOver = () => {},
        onNodeMouseOut = () => {},
        onNodeDoubleClick = () => {},
        onNodeTextChange = () => {},
        onMapMouseDown = () => {},
        onZoom = () => {},
        onSelectedNodesChange = () => {},
        onError = () => {},
        onUpdateNodesChange = () => {},
    }) {
        this.container = container; // 容器
        this.data = data; // 图谱数据
        this.readonly = readonly; // 图谱是否只读
        this.onNodeContentMenuClick = onNodeContentMenuClick; // 右击节点
        this.onNodeClick = onNodeClick; // 单击节点
        this.onNodeMouseOver = onNodeMouseOver; // hover节点
        this.onNodeMouseOut = onNodeMouseOut; // out节点
        this.onNodeDoubleClick = onNodeDoubleClick; // 双击节点
        this.onNodeTextChange = onNodeTextChange; // 节点名字修改
        this.onMapMouseDown = onMapMouseDown; // 图谱背景区域点击
        this.onZoom = onZoom; // 缩放回调
        this.onSelectedNodesChange = onSelectedNodesChange; // 节点选中列表修改回调
        this.onError = onError; // 警告或错误通知回调
        this.onUpdateNodesChange = onUpdateNodesChange;

        this._setConfig(); // 设置配置项
        this._init(); // 初始化图谱
        this.selected_nodes = []; // 选中的节点列表
        this.updated_nodes = []; // 被修改的节点列表(新增的子节点, 新增的兄弟节点, 修改节点的父节点, 修改节点中文名, 删除节点, 修改节点类型)
        this.canMutiSelect = false; // 是否可以多选
        this.dragSourceNode = null; // 拖拽节点
        this.dragTargetNode = null; // 拖拽节点到目标节点
        this.isEditingText = false; // 是否处于文本编辑状态
    }

    _setConfig() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        // 普通矩形
        const normalRect = {
            w: 50,
            h: 40,
            bg: "#F3F7F7",
            textColor: "#00474F",
            fontSize: 16,
            borderWidth: 4,
            hoverBorderColor: "#C1F3F0", // hover时边框颜色
            clickBorderColor: "#5CDBD3", // 点击选中时边框颜色
        };
        // 矩形之间间距
        const space = {
            x: 80,
            y: 10,
        };
        this.config = {
            w,
            h,
            cx: w / 4, // 画布中心x坐标
            cy: h / 2, // 画布中心y坐标
            textFill: "#fff",
            textPadding: 8,
            fontFamily: "PingFangSC-Semibold PingFang SC",
            fontWeight: 600,
            fontSize: 16,
            rootRect: {
                // 跟节点矩形
                w: 80,
                h: 58,
                bg: "#5CDBD3",
                textColor: "#fff",
                fontSize: 22,
                borderWidth: 4,
                hoverBorderColor: "#C1F3F0", // hover时边框颜色
                clickBorderColor: "#13C2C2", // 点击选中时边框颜色
            },
            normalRect,
            radius: 20, // 节点矩形圆角
            space,
            lineWidth: 4, // 节点间线宽
            lineColor: "#006D75", // 节点间线颜色
            symbolLineWidth: 2, // 展开收起按钮线宽
            symbolRadius: 10, // 展开时候按钮半径
            nodeAreaHeight: normalRect.h + space.y * 2, // 节点区域高度
            animation: {
                // 动画
                switch: true,
                time: 100,
                easing: "linear",
            },
            searchColor: "#FFF566", // 搜索高亮颜色
        };
    }

    _init() {
        const { cx, cy } = this.config;
        this.zr = new zrender.init(this.container, {
            // renderer: 'svg',
        });
        const origin = [cx, cy];
        this.rootGroup = new zrender.Group({
            position: [0, 0],
            origin,
        });
        // 设置视野
        this.viewport = Viewport(
            this.container,
            this.rootGroup,
            this.zr,
            this._onMouseDown,
            this._onMouseMove,
            this._onMouseUp,
            this.onZoom,
            origin
        );
        // 添加键盘按键事件
        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);
    }

    _onKeyDown = (e) => {
        switch (e.keyCode) {
            case 9: // tab键事件 新增子节点
                if (this.readonly) {
                    return;
                }
                this.addChildNode();
                e.preventDefault();
                break;
            case 13: // enter键事件 新增同级节点
                if (this.readonly) {
                    return;
                }
                if (!this.is_editing_text) {
                    this.addSilbingNode();
                }
                e.preventDefault();
                break;
            case 8: // backspace键事件 删除节点
            case 46: // del键事件 删除节点
                if (this.readonly) {
                    return;
                }
                if (!this.is_editing_text) {
                    this.removeNode();
                }
                break;
            case 17: // ctrl键事件 结合鼠标点击事件多选节点
            case 91: // command键事件 结合鼠标点击事件多选节点
                this.canMutiSelect = true;
                break;
            case 32:
                // 空格键事件 结合鼠标点击事件拖拽移动图谱位置
                this.viewport.setIsDragging(true);
                break;
            default:
                break;
        }
    };

    _onKeyUp = (e) => {
        switch (e.keyCode) {
            case 17:
                this.canMutiSelect = false;
                break;
            case 91:
                this.canMutiSelect = false;
                break;
            case 32:
                this.viewport.setIsDragging(false);
                break;
            default:
                break;
        }
    };

    // 点击屏幕其他范围
    _onMouseDown = (e) => {
        if (this.canMutiSelect) {
            return;
        }
        this.cancelSelected();
        this.onMapMouseDown(e);
    };

    // 拖拽区域监听修改
    _onMouseMove = () => {};

    // 拖拽区域监听修改 图谱区域抬起鼠标 FIXME 缩放后拖拽位置有误
    _onMouseUp = (marquee) => {
        const fn = (d) => {
            const i = findIndex(this.selected_nodes, (n) => n.id === d.id);
            const isInte = marquee._rect.intersect(d.node.rect._rect);
            if (i !== -1) {
                d.node.cancelNode();
                this.selected_nodes.splice(i, 1);
            } else if (isInte && i === -1) {
                d.node.selectNode();
                this.selected_nodes.push(d);
            }
            d.children.forEach((c) => fn(c));
        };
        fn(this.data);
        this.onSelectedNodesChange(this.selected_nodes);
    };

    // 递归调整节点及子节点位置
    _resetChildPosition(n, dx, dy, notTrans) {
        n.node.translate(0, dy);
        n.lineBeforeNode &&
            n.lineBeforeNode.translate(dx, notTrans ? 0 : dy, dx, dy);
        n.lineBeforeBtn && n.lineBeforeBtn.translate(dx, dy, dx, dy);
        n.btn && n.btn.translate(dx, dy);
        n.childOrigin[0] += dx;
        n.childOrigin[1] += dy;
        if (n.lineStartPos) {
            n.lineStartPos.x += dx;
            n.lineStartPos.y += dy;
        }
        n.childStartY += dy;
        n.children.forEach((c) => this._resetChildPosition(c, dx, dy, false));
    }

    // 递归调整当前父节点的同级节点的位置
    _resetSlibingPosition(data, dy) {
        if (data.fatherNode) {
            data.fatherNode.children.forEach((n) => {
                if (n.id !== data.id) {
                    if (data.node.y < n.node.y) {
                        // 向下移动节点
                        this._resetChildPosition(n, 0, dy, true);
                    } else {
                        // 向上移动节点
                        this._resetChildPosition(n, 0, -dy, true);
                    }
                } else {
                    n.childStartY -= dy;
                }
            });
            this._resetSlibingPosition(data.fatherNode, dy);
        } else {
            // 修改根节点的子节点开始的y坐标
            data.childStartY -= dy;
        }
    }

    // 新增节点
    // data-节点信息
    // isSilbing - true:新增兄弟节点 false:新增子节点 newD-新增节点数据 isNewAdd-是否新增节点区别于图谱结构中已有的节点
    _addNode(data, isSilbing, newD, isNewAdd) {
        const { space, normalRect, nodeAreaHeight } = this.config;
        const newLevel = isSilbing ? data.level : data.level + 1;
        // 新增节点数据
        let newData;
        if (newD) {
            const nd = cloneDeep(newD);
            newData = {
                id: nd.id,
                name: nd.name,
                children: [],
                level: newLevel,
                is_has_children: nd.is_has_children,
                is_deleted: false,
                is_selected: nd.is_selected,
                parent_id: nd.parent_id,
            };
        } else {
            newData = {
                id: this._getUUID(),
                name: "",
                children: [],
                level: newLevel,
                is_deleted: false,
            };
        }
        if (isNewAdd) {
            newData.is_new_add = true;
        }
        if (isSilbing) {
            newData.fatherNode = data.fatherNode;
            newData.parent_id = data.fatherNode.id;
        } else {
            if (!data.group) {
                data.group = new zrender.Group({
                    origin: data.childOrigin,
                });
            }
            newData.fatherNode = data;
            newData.parent_id = data.id;
        }
        // 添加节点
        const w = this._getTextWidth(newData, newLevel);
        const h = normalRect.h;
        const x =
            (isSilbing ? data.fatherNode.childOrigin[0] : data.childOrigin[0]) +
            space.x / 2;
        let y = isSilbing
            ? data.fatherNode.childStartY - h / 2
            : data.childStartY;
        if (isSilbing) {
            // 节点兄弟节点对本节点的影响
            const i =
                findIndex(data.fatherNode.children, (n) => n.id === data.id) +
                1;
            let silbingNodeNum = 0;
            const silbingNodes = data.fatherNode.children.slice(0, i);
            silbingNodes.forEach((n) => {
                silbingNodeNum += getEndNodeNum(n);
            });
            if (silbingNodeNum > 0) {
                y += silbingNodeNum * nodeAreaHeight;
            } else {
                y += nodeAreaHeight * i;
            }
        } else {
            // 节点子节点对本节点的影响
            const nodeEndNum = getEndNodeNum(data);
            y = data.childStartY;
            if (nodeEndNum > 1 || data.children.length === 1) {
                y += nodeEndNum * nodeAreaHeight - h / 2;
            } else {
                y += space.y;
            }
        }
        // 绘制连线
        const lineStartPos = {
            x: x + w,
            y: y + h / 2,
        };
        newData.lineStartPos = lineStartPos;
        const node = this._getNode({
            x,
            y,
            w,
            h,
            data: newData,
        });
        newData.node = node;
        newData.childOrigin = [x + w + space.x / 2, y + h / 2];
        // 添加节点前线
        const lineBeforeNode = this._getLine({
            x1: isSilbing
                ? data.fatherNode.childOrigin[0]
                : data.childOrigin[0],
            y1: isSilbing
                ? data.fatherNode.childOrigin[1]
                : data.childOrigin[1],
            x2: x,
            y2: newData.childOrigin[1],
        });
        newData.lineBeforeNode = lineBeforeNode;
        // 节点后按钮前的线
        if (newData.is_has_children || newData.children.length > 0) {
            const lineBeforeBtn = this._getLine({
                x1: lineStartPos.x,
                y1: lineStartPos.y,
                x2: lineStartPos.x + space.x / 2,
                y2: lineStartPos.y,
            });
            data.group.add(lineBeforeBtn.getLine());
            newData.lineBeforeBtn = lineBeforeBtn;
            // 展开按钮
            const unfoldBtn = this._getBtn(
                lineStartPos.x + space.x / 2,
                lineStartPos.y,
                newData,
                0
            );
            data.group.add(unfoldBtn.getBtn());
            newData.btn = unfoldBtn;
        }
        if (isSilbing) {
            data.fatherNode.group.add(node.getNode());
            data.fatherNode.group.add(lineBeforeNode.getLine());
            newData.childStartY = y - space.y + nodeAreaHeight / 2;
        } else {
            // 变为父节点的后面的按钮类型为展开状态
            if (data.btn && data.btn.btn.shape.type === 0) {
                data.btn.setType(1);
            }
            data.group.add(node.getNode());
            data.group.add(lineBeforeNode.getLine());
            if (data.level === 0) {
                this.rootGroup.add(data.group);
            } else {
                data.fatherNode.group.add(data.group);
            }
            newData.childStartY = y - space.y;
            if (data.children.length > 0) {
                newData.childStartY += nodeAreaHeight / 2;
            }
        }
        return newData;
    }

    _updateNodes = (newNode) => {
        const i = findIndex(this.updated_nodes, (n) => n.id === newNode.id);
        if (i !== -1) {
            this.updated_nodes.splice(i, 1);
        }
        this.updated_nodes.push(newNode);
        this.onUpdateNodesChange(this.updated_nodes);
    };

    // 添加同级节点
    addSilbingNode() {
        if (this.readonly) {
            return;
        }
        const { nodeAreaHeight } = this.config;
        const dy = nodeAreaHeight / 2;
        if (this.selected_nodes.length === 0) {
            this.onError("请先选中节点");
        } else if (this.selected_nodes.length === 1) {
            const data = this.selected_nodes[0];
            if (data.level === 0) {
                this.onError("根节点无法新增兄弟节点");
            } else {
                const newData = this._addNode(data, true, null, true);
                const i =
                    findIndex(
                        data.fatherNode.children,
                        (n) => n.id === data.id
                    ) + 1;
                data.fatherNode.children.splice(i, 0, newData);
                this._resetSlibingPosition(newData, dy);
                // 设置新增节点为选中节点
                data.node.cancelNode();
                this.selected_nodes = [];
                newData.node.selectNode();
                // 同时进入编辑节点名字状态
                newData.node.editName();
                this.is_editing_text = true;
                this.selected_nodes.push(newData);
                this.onSelectedNodesChange(this.selected_nodes);
                this._updateNodes(newData);
            }
        } else {
            this.onError("新增节点, 只能选中一个节点");
        }
    }

    // 添加子节点
    addChildNode() {
        if (this.readonly) {
            return;
        }
        const { nodeAreaHeight } = this.config;
        const data = this.selected_nodes[0];
        if (this.selected_nodes.length === 0) {
            this.onError("请先选中节点");
        } else if (data.is_has_children && data.btn && data.btn.type === 0) {
            this.onError("请先展开节点");
        } else if (this.selected_nodes.length === 1) {
            const { space } = this.config;
            // 添加btn
            if (!data.btn) {
                const foldBtn = this._getBtn(
                    data.lineStartPos.x + space.x / 2,
                    data.lineStartPos.y,
                    data,
                    0
                );
                if (data.level === 0) {
                    this.rootGroup.add(foldBtn.getBtn());
                } else {
                    data.fatherNode.group.add(foldBtn.getBtn());
                }
                data.btn = foldBtn;
            }
            // 添加lineBeforeBtn
            if (!data.lineBeforeBtn) {
                const lineBeforeBtn = this._getLine({
                    x1: data.lineStartPos.x,
                    y1: data.lineStartPos.y,
                    x2: data.lineStartPos.x + space.x / 2,
                    y2: data.lineStartPos.y,
                });
                if (data.level === 0) {
                    this.rootGroup.add(lineBeforeBtn.getLine());
                } else {
                    data.fatherNode.group.add(lineBeforeBtn.getLine());
                }
                data.lineBeforeBtn = lineBeforeBtn;
            }
            const newData = this._addNode(data, false, null, true);
            data.children.push(newData);
            if (data.children.length > 1) {
                const dy = nodeAreaHeight / 2;
                this._resetSlibingPosition(newData, dy);
            }
            // 设置新增节点为选中节点
            data.node.cancelNode();
            this.selected_nodes = [];
            newData.node.selectNode();
            // 同时进入编辑节点名字状态
            newData.node.editName();
            this.is_editing_text = true;
            this.selected_nodes.push(newData);
            this.onSelectedNodesChange(this.selected_nodes);
            this._updateNodes(newData);
        } else {
            this.onError("新增节点, 只能选中一个节点");
        }
    }

    // 删除节点 is_updated 是否更新到this.updated_list中
    removeNode(nodes, is_updated = true) {
        if (this.readonly) {
            return;
        }
        let needDeleteNodes = [];
        if (nodes) {
            needDeleteNodes = nodes;
        } else {
            needDeleteNodes = this.selected_nodes;
        }
        if (needDeleteNodes.length === 0) {
            this.onError("请先选中节点");
        } else if (needDeleteNodes.length === 1) {
            const { nodeAreaHeight } = this.config;
            const data = needDeleteNodes[0];
            if (data.level === 0) {
                this.onError("根节点不允许删除!");
                return;
            }
            if (getEndNodeNum(data.fatherNode) > 1) {
                let nodeEndNum = getEndNodeNum(data);
                if (data.fatherNode.children.length === 1) {
                    nodeEndNum--;
                }
                const dy = (nodeEndNum * nodeAreaHeight) / 2;
                this._resetSlibingPosition(data, -dy);
            }
            data.btn && data.fatherNode.group.remove(data.btn.getBtn());
            data.lineBeforeBtn &&
                data.fatherNode.group.remove(data.lineBeforeBtn.getLine());
            data.lineBeforeNode &&
                data.fatherNode.group.remove(data.lineBeforeNode.getLine());
            data.node && data.fatherNode.group.remove(data.node.getNode());
            if (data.group) {
                data.fatherNode.group.remove(data.group);
            }
            if (data.node.placeholderRect) {
                data.fatherNode.group.remove(data.node.placeholderRect);
            }
            const i = findIndex(
                data.fatherNode.children,
                (n) => n.id === data.id
            );
            data.fatherNode.children.splice(i, 1);
            if (data.fatherNode.children.length === 0) {
                if (data.fatherNode.fatherNode) {
                    data.fatherNode.btn &&
                        data.fatherNode.fatherNode.group.remove(
                            data.fatherNode.btn.getBtn()
                        );
                    data.fatherNode.lineBeforeBtn &&
                        data.fatherNode.fatherNode.group.remove(
                            data.fatherNode.lineBeforeBtn.getLine()
                        );
                } else {
                    // 根节点
                    data.fatherNode.btn &&
                        this.rootGroup.remove(data.fatherNode.btn.getBtn());
                    data.fatherNode.lineBeforeBtn &&
                        this.rootGroup.remove(
                            data.fatherNode.lineBeforeBtn.getLine()
                        );
                }
                data.fatherNode.btn = undefined;
                data.fatherNode.lineBeforeBtn = undefined;
            }
            this.selected_nodes = [];
            this.onSelectedNodesChange(this.selected_nodes);
            data.is_deleted = true;
            // 只有删除原本属于图谱中的节点才会更新到this.updated_nodes, 新增的节点, 删除后不会添加到this.updated_nodes中
            if (!data.is_new_add && is_updated) {
                this._updateNodes(data);
            }
        } else {
            this.onError("一次只能删除一个节点");
        }
    }

    // 生成唯一节点id
    _getUUID() {
        return new Date().getTime();
    }

    // 点击节点
    onRectNodeClick(e, data) {
        const i = findIndex(this.selected_nodes, (n) => n.id === data.id);
        if (i === -1) {
            if (this.canMutiSelect) {
                data.node.selectNode();
                this.selected_nodes.push(data);
            } else {
                this.selected_nodes.forEach((n) => {
                    n.node.cancelNode();
                });
                data.node.selectNode();
                this.selected_nodes = [data];
            }
        } else {
            data.node.cancelNode();
            this.selected_nodes.splice(i, 1);
        }
        this.onNodeClick(e);
        this.onSelectedNodesChange(this.selected_nodes);
    }

    // 鼠标右击节点
    onContentMenuClick(e, data) {
        this.cancelSelected();
        data.node.selectNode();
        this.selected_nodes.push(data);
        this.onSelectedNodesChange(this.selected_nodes);
        this.onNodeContentMenuClick(e, data);
    }

    // 节点文本改变事件
    onTextChange(data) {
        if (this.readonly) {
            return;
        }
        if (data.name === data.node.rect.style.text) {
            return;
        }
        data.node.setName(data.name);
        const w = this._getTextWidth(data, data.level);
        const dw = w - data.node.w;
        data.node.setWidth(w);
        data.lineBeforeBtn && data.lineBeforeBtn.translate(dw, 0, dw, 0);
        data.childOrigin[0] = data.childOrigin[0] + dw;
        data.btn && data.btn.translate(dw, 0);
        if (data.lineStartPos) {
            data.lineStartPos.x += dw;
        }
        const fn = (tree) => {
            tree.children.forEach((t) => {
                t.node.translate(dw, 0);
                t.lineBeforeNode && t.lineBeforeNode.translate(dw, 0, dw, 0);
                t.lineBeforeBtn && t.lineBeforeBtn.translate(dw, 0, dw, 0);
                t.childOrigin[0] = t.childOrigin[0] + dw;
                t.btn && t.btn.translate(dw, 0);
                if (t.lineStartPos) {
                    t.lineStartPos.x += dw;
                }
                fn(t);
            });
        };
        fn(data);
        this.onNodeTextChange(data);
        this._updateNodes(data);
        this.is_editing_text = false;
    }

    // 鼠标hover节点
    onMouseOver(e, data) {
        this.viewport.setIsHoverNode(true);
        if (this.dragSourceNode && this.dragSourceNode.id !== data.id) {
            this.dragTargetNode = data;
        }
        if (this.viewport.getIsSelecting()) {
            return;
        }
        this.onNodeMouseOver(e, data);
    }

    // 鼠标离开节点
    onMouseOut(e, data) {
        this.viewport.setIsHoverNode(false);
        this.onNodeMouseOut(e, data);
        this.dragTargetNode = null;
    }

    // 鼠标点击节点
    onNodeMouseDown(e, data) {
        this.dragSourceNode = data;
    }

    // 按下的鼠标抬起事件
    onNodeMouseUp(data) {
        if (this.readonly) {
            return;
        }
        if (this.dragSourceNode && this.dragTargetNode) {
            if (
                this.dragTargetNode.is_has_children &&
                this.dragTargetNode.btn &&
                this.dragTargetNode.btn.type === 0
            ) {
                this.onError("请先展开目标节点");
                this.dragSourceNode.node.onMouseUp();
                return;
            }
            // 在target中添加source节点及子节点
            this.addNode(this.dragSourceNode, this.dragTargetNode);
            // 删除source节点及子节点
            this.removeNode([this.dragSourceNode], false);
        }
        this.dragSourceNode = null;
        this.dragTargetNode = null;
    }

    // 拖动添加节点
    addNode(source, target) {
        if (this.readonly) {
            return;
        }
        const { nodeAreaHeight } = this.config;
        const { space } = this.config;
        // 添加btn
        if (!target.btn) {
            const foldBtn = this._getBtn(
                target.lineStartPos.x + space.x / 2,
                target.lineStartPos.y,
                target,
                0
            );
            target.fatherNode.group.add(foldBtn.getBtn());
            target.btn = foldBtn;
        }
        // 添加lineBeforeBtn
        if (!target.lineBeforeBtn) {
            const lineBeforeBtn = this._getLine({
                x1: target.lineStartPos.x,
                y1: target.lineStartPos.y,
                x2: target.lineStartPos.x + space.x / 2,
                y2: target.lineStartPos.y,
            });
            target.fatherNode.group.add(lineBeforeBtn.getLine());
            target.lineBeforeBtn = lineBeforeBtn;
        }
        const fn = (sou, tar) => {
            const newData = this._addNode(tar, false, sou);
            tar.children.push(newData);
            if (tar.children.length > 1) {
                const dy = nodeAreaHeight / 2;
                this._resetSlibingPosition(newData, dy);
            }
            sou.children.forEach((s) => fn(s, newData));
        };
        fn(source, target);
        const newData = cloneDeep(source);
        newData.fatherNode = target;
        newData.parent_id = target.id;
        this._updateNodes(newData);
    }

    _onNodeDoubleClick(e, data) {
        this.is_editing_text = true;
        if (this.readonly) {
            this.onNodeDoubleClick(e, data);
        }
    }

    // 节点
    _getNode({ x, y, w, h, data }) {
        const node = new Node({
            container: this.container,
            x,
            y,
            w,
            h,
            data,
            readonly: this.readonly,
            config: this.config,
            onNodeClick: this.onRectNodeClick.bind(this),
            onNodeContentMenuClick: this.onContentMenuClick.bind(this),
            onTextChange: this.onTextChange.bind(this),
            onNodeMouseOver: this.onMouseOver.bind(this),
            onNodeMouseOut: this.onMouseOut.bind(this),
            onNodeDoubleClick: this._onNodeDoubleClick.bind(this),
            onNodeMouseDown: this.onNodeMouseDown.bind(this),
            onNodeMouseUp: this.onNodeMouseUp.bind(this),
        });
        return node;
    }

    // 展开收起按钮 type 0 展开 1 收起
    _getBtn(x, y, data, type = 0) {
        const btn = new Btn({
            x,
            y,
            data,
            type,
            config: this.config,
        });
        return btn;
    }

    // 节点之间连线
    _getLine({ x1, y1, x2, y2 }) {
        return new Line({ x1, y1, x2, y2, config: this.config });
    }

    // 计算文字宽度
    _getTextWidth(data, type) {
        const { fontFamily, rootRect, normalRect, textPadding } = this.config;
        const w =
            (getTextWidth(
                data.name,
                `${
                    type === 0 ? rootRect.fontSize : normalRect.fontSize
                }px ${fontFamily}`
            ) || normalRect.w) +
            textPadding * 2;
        return w;
    }

    // 生成图谱
    _generateMap() {
        const {
            cx,
            cy,
            rootRect,
            normalRect,
            space,
            nodeAreaHeight,
            animation,
        } = this.config;
        // ******** 绘制根节点
        // 根节点宽度
        const rootW = this._getTextWidth(this.data, 0);
        this.data.level = 0;
        const rootR = this._getNode({
            x: cx - rootW / 2,
            y: cy - rootRect.h / 2,
            w: rootW,
            h: rootRect.h,
            data: this.data,
        });
        this.data.node = rootR;
        this.rootGroup.add(rootR.getNode());
        // 生成展开收起按钮
        this.data.childOrigin = [cx + rootW / 2 + space.x / 2, cy];
        // 按钮前的线
        const lineBeforeBtn = this._getLine({
            x1: cx + rootW / 2,
            y1: cy,
            x2: this.data.childOrigin[0],
            y2: this.data.childOrigin[1],
        });
        this.rootGroup.add(lineBeforeBtn.getLine());
        this.data.lineBeforeBtn = lineBeforeBtn;
        // 根节点下所有其他节点和连线所属的group
        this.data.group = new zrender.Group({
            scale: animation.switch ? [0, 0] : [1, 1],
            origin: this.data.childOrigin,
        });
        if (this.data.children && this.data.children.length > 0) {
            // 收起按钮
            const unfoldBtn = this._getBtn(
                this.data.childOrigin[0],
                this.data.childOrigin[1],
                this.data,
                1
            );
            this.rootGroup.add(unfoldBtn.getBtn());
            this.data.btn = unfoldBtn;
        } else {
            // 展开按钮
            const foldBtn = this._getBtn(
                this.data.childOrigin[0],
                this.data.childOrigin[1],
                this.data,
                0
            );
            this.rootGroup.add(foldBtn.getBtn());
            this.data.btn = foldBtn;
        }
        // 根节点右侧线起始坐标
        this.data.lineStartPos = { x: cx + rootW / 2, y: cy };
        // ******** 绘制子节点
        // 第一层节点起始坐标Y值
        this.data.childStartY =
            cy - (getEndNodeNum(this.data) * nodeAreaHeight) / 2;
        const traverseNode = (fatherNode) => {
            const level = fatherNode.level + 1;
            fatherNode.children.forEach((n, i) => {
                n.level = level;
                n.fatherNode = fatherNode;
                // 计算节点宽高
                const text = n.name;
                const w =
                    text && text !== ""
                        ? this._getTextWidth(n, level)
                        : normalRect.w;
                const h = normalRect.h;
                // 计算节点坐标
                let x = fatherNode.node.x + fatherNode.node.w + space.x;
                let y = fatherNode.childStartY;
                // 节点兄弟节点对本节点的影响
                let silbingNodeNum = 0;
                const silbingNodes = fatherNode.children.slice(0, i);
                silbingNodes.forEach((n) => {
                    silbingNodeNum += getEndNodeNum(n);
                });
                if (silbingNodeNum > 0) {
                    y += silbingNodeNum * nodeAreaHeight;
                } else {
                    y += nodeAreaHeight * i;
                }
                // 节点子节点对本节点的影响
                const nodeEndNum = getEndNodeNum(n);
                y += (nodeEndNum * nodeAreaHeight) / 2 - h / 2;
                // 绘制节点
                const rect = this._getNode({
                    x,
                    y,
                    w,
                    h,
                    data: n,
                });
                fatherNode.group.add(rect.getNode());
                n.node = rect;
                // 绘制连线
                const lineStartPos = {
                    x: x + w,
                    y: y + h / 2,
                };
                n.lineStartPos = lineStartPos;
                // 节点前的线
                const lineBeforeNode = this._getLine({
                    x1: fatherNode.lineStartPos.x + space.x / 2,
                    y1: fatherNode.lineStartPos.y,
                    x2: lineStartPos.x,
                    y2: lineStartPos.y,
                });
                fatherNode.group.add(lineBeforeNode.getLine());
                n.lineBeforeNode = lineBeforeNode;
                // 节点后按钮前的线
                if (n.is_has_children || n.children.length > 0) {
                    const lineBeforeBtn = this._getLine({
                        x1: lineStartPos.x,
                        y1: lineStartPos.y,
                        x2: lineStartPos.x + space.x / 2,
                        y2: lineStartPos.y,
                    });
                    fatherNode.group.add(lineBeforeBtn.getLine());
                    n.lineBeforeBtn = lineBeforeBtn;
                }

                n.childOrigin = [lineStartPos.x + space.x / 2, lineStartPos.y];
                n.childStartY = y + h / 2 - (nodeEndNum * nodeAreaHeight) / 2;
                if (n.children.length > 0) {
                    const branchGroup = new zrender.Group({
                        // scale: animation.switch ? [0, 0] : [1, 1],
                        origin: n.childOrigin,
                    });
                    n.group = branchGroup;
                    traverseNode(n);
                    fatherNode.group.add(branchGroup);
                    // 展开按钮
                    const unfoldBtn = this._getBtn(
                        lineStartPos.x + space.x / 2,
                        lineStartPos.y,
                        n,
                        1
                    );
                    fatherNode.group.add(unfoldBtn.getBtn());
                    n.btn = unfoldBtn;
                } else if (n.is_has_children || n.children.length > 0) {
                    // 收起按钮
                    const foldBtn = this._getBtn(
                        lineStartPos.x + space.x / 2,
                        lineStartPos.y,
                        n,
                        0
                    );
                    fatherNode.group.add(foldBtn.getBtn());
                    n.btn = foldBtn;
                }
            });
        };
        traverseNode(this.data);
        if (animation.switch) {
            this.data.group.animateTo(
                {
                    scale: [1, 1],
                },
                animation.time,
                animation.easing
            );
        }
        this.rootGroup.add(this.data.group);
        this.zr.add(this.rootGroup);
    }

    // 渲染图谱
    render() {
        this._generateMap();
    }

    // 修改数据结构
    setData(data, father_data) {
        if (!data) {
            return;
        }
        if (!father_data) {
            father_data = this.data;
        } // 没有父节点 视为在根节点上添加data节点
        father_data.children = [];
        const { nodeAreaHeight } = this.config;
        data.forEach((d, i) => {
            const newData = this._addNode(father_data, false, d);
            father_data.children.push(newData);
            if (i > 0) {
                const dy = nodeAreaHeight / 2;
                this._resetSlibingPosition(newData, dy);
            }
        });
    }

    appendData(data) {
        if (!data) {
            return;
        }
        let father_data = this.findData(data.parent_id);
        if (!father_data) {
            father_data = this.data;
        } // 没有父节点 视为在根节点上添加data节点
        father_data.children = [];
        const newData = this._addNode(father_data, false, data);
        father_data.children.push(newData);
    }

    findData = (id) => {
        const fn = (n) => {
            for (let i = 0; i < n.children.length; i++) {
                if (!n.children || n.children.length === 0) {
                    continue;
                }
                if (n.children[i].id === id) {
                    return n.children[i];
                } else {
                    return fn(n.children[i]);
                }
            }
        };
        const d = fn(this.data);
        return d ? d : null;
    };

    // 撤销上一步 TODO
    revocate() {
        if (this.readonly) {
            return;
        }
    }

    // 反撤销上一步 TODO
    reRevocate() {
        if (this.readonly) {
            return;
        }
    }

    // 取消选中状态
    cancelSelected() {
        if (this.selected_nodes.length > 0) {
            this.selected_nodes.forEach((n) => {
                n.node.cancelNode();
            });
            this.selected_nodes = [];
            this.onSelectedNodesChange(this.selected_nodes);
        }
    }

    // 选择整个分支
    selectBranch() {
        if (this.selected_nodes.length === 0) {
            this.onError("请选择节点");
        } else if (this.selected_nodes.length === 1) {
            const data = this.selected_nodes[0];
            const fn = (tree) => {
                tree.children.forEach((t) => {
                    t.node.selectNode();
                    this.selected_nodes.push(t);
                    fn(t);
                });
            };
            fn(data);
            this.onSelectedNodesChange(this.selected_nodes);
        } else {
            this.onError("只能选择一个节点");
        }
    }

    // 选择全部节点
    selectAll() {
        const fn = (tree) => {
            tree.children.forEach((t) => {
                if (t.is_selected) {
                    t.node.selectNode();
                    this.selected_nodes.push(t);
                }
                fn(t);
            });
        };
        fn(this.data);
        this.onSelectedNodesChange(this.selected_nodes);
    }

    selectNodeById(id) {
        const fn = (tree) => {
            tree.children.forEach((t) => {
                if (t.id === id) {
                    t.node.selectNode();
                    this.selected_nodes.push(t);
                } else if (
                    this.selected_nodes.filter((item) => item.id === t.id)
                ) {
                    t.node.cancelNode();
                    this.selected_nodes = [];
                }
                fn(t);
            });
        };
        fn(this.data);
        this.onSelectedNodesChange(this.selected_nodes);
    }

    // 编辑名字
    editName(e) {
        if (this.readonly) {
            return;
        }
        if (this.selected_nodes.length === 0) {
            this.onError("请选择节点");
        } else if (this.selected_nodes.length === 1) {
            const data = this.selected_nodes[0];
            data.node.editName(e);
            this.is_editing_text = true;
        } else {
            this.onError("只能选择一个节点");
        }
    }

    // 设置图谱缩放
    zoomMap(scale) {
        this.viewport.zoom(scale);
    }

    // 移除监听事件, 释放内存
    dispose() {
        this.data = [];
        this.zr && this.zr.clear();
        this.zr && this.zr.dispose();
        this.viewport && this.viewport.dispose();
        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("keyup", this._onKeyUp);
    }
}
