// src/fileWatcher.js
import { watch } from "chokidar";
export function createFileWatcher(filePath, onChange) {
    const watcher = watch(filePath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000, // 等待 2000ms 确保文件写入完成
            pollInterval: 100, // 检查文件状态的间隔时间
        },
    });

    watcher.on("change", onChange);

    console.log(`正在监听文件: ${filePath}`);

    return watcher;
}

export default {
    createFileWatcher,
};
