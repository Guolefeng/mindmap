export default {
    build: {
        minify: "terser", // 打包结果是否minify
        target: "es2015",
        // 指定输出路径
        assetsDir: "./",
        // 指定输出文件路径
        outDir: "build",
        // 代码压缩配置
        terserOptions: {
            sourceMap: true,
            // 生产环境移除console
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        lib: {
            entry: "src/map/index.js", // 指定入口文件
            name: "mindmap", // 输出的全局变量名称
            fileName: (format) => `mindmap.${format}.js`, // 输出文件名
        },
    },
};
