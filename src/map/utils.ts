import type { INode, IRect } from "./types.ts";

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export const getTextWidth = (text: string, font: string) => {
    const canvas = document.createElement("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return Math.round(metrics.width);
};

/**
 * @desc 获取树中所有末端节点的个数
 * @param {object} tree 树
 * @return {number} 个数
 */
export const getEndNodeNum = (tree: INode) => {
    let num = 0;
    const fn = (t: INode, level?: number) => {
        if (t.children.length === 0) {
            num++;
            return;
        }
        t.children.forEach((t) => fn(t, level + 1));
    };
    fn(tree);
    return num;
};

/**
 * 判断rect1是否与rect2交叉 2020-05-28
 * @param {object} rect { x, y, w, h }
 * @return {bool} true 交叉 false 没有交叉
 */
export const isIntersect = (rect1: IRect, rect2: IRect) => {
    const minX = rect1.x;
    const maxX = rect1.x + rect1.w;
    const minY = rect1.y;
    const maxY = rect1.y + rect1.h;
    if (
        (rect2.x >= minX &&
            rect2.x <= maxX &&
            rect2.y >= minY &&
            rect2.y <= maxY) ||
        (rect2.x + rect2.w >= minX &&
            rect2.x + rect2.w <= maxX &&
            rect2.y >= minY &&
            rect2.y <= maxY) ||
        (rect2.x + rect2.w >= minX &&
            rect2.x + rect2.w <= maxX &&
            rect2.y + rect2.h >= minY &&
            rect2.y + rect2.h <= maxY) ||
        (rect2.x >= minX &&
            rect2.x <= maxX &&
            rect2.y + rect2.h >= minY &&
            rect2.y + rect2.h <= maxY) ||
        (rect2.x <= minX &&
            rect2.x + rect2.w >= maxX &&
            rect2.y >= minY &&
            rect2.y + rect2.h <= maxY) ||
        (rect2.x >= minX &&
            rect2.x + rect2.w <= maxX &&
            rect2.y <= minY &&
            rect2.y + rect2.h >= maxY)
    ) {
        return true;
    }
    return false;
};

export const uuid = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2);

export const mergeObjects = (obj1, obj2) => {
    const result = {};

    // 合并 obj1 的所有属性
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            result[key] = obj1[key];
        }
    }

    // 合并 obj2 的所有属性
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (
                typeof obj2[key] === "object" &&
                obj2[key] !== null &&
                !Array.isArray(obj2[key])
            ) {
                // 如果是对象，则递归合并
                result[key] = mergeObjects(result[key] || {}, obj2[key]);
            } else if (Array.isArray(obj2[key])) {
                // 如果是数组，则合并数组
                result[key] = (result[key] || []).concat(obj2[key]);
            } else {
                // 如果是基本数据类型，则直接赋值
                result[key] = obj2[key];
            }
        }
    }

    return result;
};
