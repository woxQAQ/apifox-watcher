#!/usr/bin/env node
import { program } from 'commander';
import { config, validateConfig, loadConfig } from "./src/core/config.js";
import { createFileWatcher, closeAllWatchers } from "./src/core/watcher.js";
import { importToApifox } from "./src/services/apifox.js";
import { readFileContent } from "./src/utils/file.js";
import { logger } from './src/core/logger.js';

// 存储每个文件的最后内容
const fileContentsCache = new Map();

// 处理程序退出
async function handleExit(signal) {
    logger.info(`收到退出信号: ${signal}`);
    await closeAllWatchers();
    process.exit(0);
}

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('SIGHUP', () => handleExit('SIGHUP'));

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
        const fileContent = await readFileContent(filePath);
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

async function main(configPath) {
    try {
        // 加载指定的配置文件
        await loadConfig(configPath);
        validateConfig();

        for (const project of config.projects) {
            for (const docPath of project.docPaths) {
                const content = await readFileContent(docPath);
                fileContentsCache.set(docPath, content);
                logger.init('初始化文件内容缓存', { file: docPath });
            }

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

// 配置命令行参数
program
    .name('apifox-autoimport')
    .description('Auto sync OpenAPI docs to Apifox')
    .version('1.0.0')
    .option('-c, --config <path>', 'config file path', 'config.yaml')
    .action((options) => {
        main(options.config);
    });

program.parse(); 