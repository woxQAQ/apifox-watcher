// src/index.js
import { readFile } from "fs/promises";
import { config, validateConfig } from "./config.js";
import { createFileWatcher } from "./filewatcher.js";
import { importToApifox } from "./apifox.js";

async function main() {
    try {
        // 验证配置
        validateConfig();

        const {
            APIFOX_PROJECT_ID,
            APIFOX_API_KEY,
            API_DOC_PATH,
            APIFOX_API_URL,
        } = config;

        // 创建文件监听器
        const watcher = createFileWatcher(API_DOC_PATH, async (filePath) => {
            console.log(`文件已修改: ${filePath}`);

            try {
                // 读取文件内容
                const fileContent = await readFile(filePath, "utf-8");

                // 导入到 Apifox
                await importToApifox(
                    APIFOX_API_URL.replace(":projectId", APIFOX_PROJECT_ID),
                    APIFOX_API_KEY,
                    fileContent
                );
            } catch (error) {
                console.error(`处理文件时出错: ${error.message}`);
            }
        });
    } catch (error) {
        console.error(`程序启动失败: ${error.message}`);
    }
}

main();
