import { readFile } from "fs/promises";
import { logger } from '../core/logger.js';

// 新文件：将文件操作相关的功能抽离
export async function readFileContent(filePath) {
    try {
        return await readFile(filePath, "utf-8");
    } catch (error) {
        logger.error('读取文件失败', { file: filePath, error: error.message });
        throw error;
    }
}

export default {
    readFileContent,
}; 