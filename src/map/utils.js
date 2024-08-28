/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export const getTextWidth = (text, font) => {
    // re-use canvas object for better performance
    const canvas =
        getTextWidth.canvas ||
        (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return Math.round(metrics.width);
};

/**
 * @desc 获取树中所有末端节点的个数
 * @param {object} tree 树
 * @return {number} 个数
 */
export const getEndNodeNum = (tree) => {
    let num = 0;
    const fn = (t, level) => {
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
 * @desc 判断rect1是否与rect2交叉 2020-05-28
 * @param {object} rect { x, y, w, h }
 * @return {bool} true 交叉 false 没有交叉
 */
export const isIntersect = (rect1, rect2) => {
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

export const uuid = () => new Date().getTime();
