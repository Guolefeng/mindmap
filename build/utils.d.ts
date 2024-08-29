import { ITree, IRect } from './types.ts';
/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export declare const getTextWidth: (text: string, font: string) => number;
/**
 * @desc 获取树中所有末端节点的个数
 * @param {object} tree 树
 * @return {number} 个数
 */
export declare const getEndNodeNum: (tree: ITree) => number;
/**
 * 判断rect1是否与rect2交叉 2020-05-28
 * @param {object} rect { x, y, w, h }
 * @return {bool} true 交叉 false 没有交叉
 */
export declare const isIntersect: (rect1: IRect, rect2: IRect) => boolean;
export declare const uuid: () => number;
