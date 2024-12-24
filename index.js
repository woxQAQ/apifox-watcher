// src/index.js
import { readFile } from "fs/promises";
import { config, validateConfig } from "./config.js";
import { createFileWatcher, closeAllWatchers } from "./filewatcher.js";
import { importToApifox, importFromUrl } from "./apifox.js";
import { logger } from './logger.js';

// 存储每个文件的最后内容
const fileContentsCache = new Map();

// 处理程序退出
async function handleExit(signal) {
    logger.info(`收到退出信号: ${signal}`);
    await closeAllWatchers();
    process.exit(0);
}

// 注册退出信号处理器
process.on('SIGINT', () => handleExit('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => handleExit('SIGTERM')); // kill
process.on('SIGHUP', () => handleExit('SIGHUP'));   // 终端关闭

// 处理未捕获的异常
process.on('uncaughtException', async (error) => {
    logger.error('未捕获的异常', { error: error.message });
    await closeAllWatchers();
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    logger.error('未处理的 Promise 拒绝', { reason });
    await closeAllWatchers();
    process.exit(1);
});

async function handleFileChange(project, filePath) {
    logger.info('检测到文件变化', { 
        project: project.name,
        file: filePath 
    });

    try {
        const fileContent = await readFile(filePath, "utf-8");
        if (fileContent === fileContentsCache.get(filePath)) {
            logger.debug('文件内容未变化', { file: filePath });
            return;
        }

        logger.info('开始导入', { 
            project: project.name,
            file: filePath
        });

        await importToApifox(
            project.apiUrl.replace(":projectId", project.projectId),
            project.apiKey,
            fileContent
        );

        fileContentsCache.set(filePath, fileContent);
    } catch (error) {
        logger.error('处理文件变化失败', {
            project: project.name,
            file: filePath,
            error: error.message
        });
    }
}

async function main() {
    try {
        validateConfig();

        // 为每个项目创建文件监听器
        for (const project of config.projects) {
            // 初始化文件内容缓存
            for (const docPath of project.docPaths) {
                const content = await readFile(docPath, "utf-8");
                fileContentsCache.set(docPath, content);
                logger.init('初始化文件内容缓存', { file: docPath });
            }

            // 创建文件监听器
            createFileWatcher(project.docPaths, (filePath) => {
                handleFileChange(project, filePath);
            });
        }
        
        logger.level = process.env.LOG_LEVEL || 'info';
    } catch (error) {
        logger.error('程序启动失败', { error: error.message });
        await closeAllWatchers();
        process.exit(1);
    }
}

main();
