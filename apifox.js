// src/apifoxApi.js
import axios from "axios";
import { logger } from './logger.js';

export async function importToApifox(apiUrl, apiKey, fileContent) {
    try {
        logger.debug('准备导入数据到 Apifox', { url: apiUrl });
        
        const raw = JSON.stringify({ input: fileContent });
        const config = {
            method: "post",
            url: apiUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Apifox-Api-Version": "2024-03-28",
            },
            proxy: false,
            data: raw,
        };

        const response = await axios(config);
        logger.info('导入成功', { 
            url: apiUrl,
            status: response.status
        });
        return response.data;
    } catch (error) {
        logger.error('导入失败', {
            url: apiUrl,
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
}

// 新增：从 URL 导入 API 文档
export async function importFromUrl(apiUrl, apiKey, sourceUrl) {
    try {
        logger.debug('从 URL 获取数据', { url: sourceUrl });
        const response = await axios.get(sourceUrl);
        return await importToApifox(apiUrl, apiKey, response.data);
    } catch (error) {
        logger.error('从 URL 导入失败', {
            sourceUrl,
            error: error.message
        });
        throw error;
    }
}

export default {
    importToApifox,
    importFromUrl,
};
