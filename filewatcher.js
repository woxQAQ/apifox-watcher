// src/fileWatcher.js
import { watch } from "chokidar";

export function createFileWatcher(filePath, onChange) {
    const watcher = watch(filePath, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on("change", onChange);

    console.log(`正在监听文件: ${filePath}`);

    return watcher;
}

export default {
    createFileWatcher,
}
