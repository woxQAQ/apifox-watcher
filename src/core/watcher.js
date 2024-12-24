import { watch } from "chokidar";
import { logger } from './logger.js';

const watchers = new Set();

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
    
    watchers.add(watcher);
    return watcher;
}

export async function closeAllWatchers() {
    logger.info('正在关闭所有文件监听器...');
    const closePromises = Array.from(watchers).map(watcher => 
        watcher.close().catch(err => {
            logger.error('关闭文件监听器时出错', { error: err.message });
        })
    );
    
    await Promise.all(closePromises);
    watchers.clear();
    logger.info('所有文件监听器已关闭');
}

export default {
    createFileWatcher,
    closeAllWatchers,
}; 
