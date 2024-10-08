import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build: {
        minify: "terser", // 打包结果是否minify
        target: "es2015",
        // 指定输出路径
        assetsDir: "./",
        // 指定输出文件路径
        outDir: "dist",
        // 代码压缩配置
        terserOptions: {
            sourceMap: true,
            // 生产环境移除console
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
});
