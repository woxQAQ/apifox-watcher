// src/fileWatcher.js
import { watch } from "chokidar";
import { logger } from './logger.js';

export function createFileWatcher(docPaths, onChange) {
    const watcher = watch(docPaths, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100,
        },
    });

    watcher.on("change", onChange);
    watcher.on("error", error => {
        logger.error('文件监听出错', { error: error.message });
    });

    logger.init('开始监听文件', { paths: docPaths });

    return watcher;
}

export default {
    createFileWatcher,
};
