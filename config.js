import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { logger } from './logger.js';

// 读取配置文件
function loadConfig() {
    try {
        const configPath = join(process.cwd(), 'config.yaml');
        const configFile = readFileSync(configPath, 'utf-8');
        const config = yaml.load(configFile);

        // 处理默认值
        config.projects = config.projects.map(project => ({
            ...project,
            apiKey: project.apiKey || config.defaultApiKey,  // 使用项目配置的 apiKey，如果没有则使用默认值
            apiUrl: project.apiUrl || config.defaultApiUrl,  // 使用项目配置的 apiUrl，如果没有则使用默认值
        }));

        return config;
    } catch (error) {
        logger.error('无法读取配置文件', { error: error.message });
        throw error;
    }
}

export const config = loadConfig();

export function validateConfig() {
    if (!config.projects || !Array.isArray(config.projects) || config.projects.length === 0) {
        throw new Error('至少需要配置一个项目');
    }

    // 验证全局配���
    if (!config.defaultApiKey) {
        logger.warn('未配置默认 API Key');
    }

    config.projects.forEach((project) => {
        const requiredFields = ['projectId', 'docPaths'];  // apiKey 和 apiUrl 现在可以从默认值继承
        const missingFields = requiredFields.filter(field => !project[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`项目 ${project.name} 缺少以下配置: ${missingFields.join(", ")}`);
        }
        
        if (!Array.isArray(project.docPaths) || project.docPaths.length === 0) {
            throw new Error(`项目 ${project.name} 未配置文档路径`);
        }

        // 确保项目有 apiKey（自己的或默认的）
        if (!project.apiKey && !config.defaultApiKey) {
            throw new Error(`项目 ${project.name} 未配置 API Key，且未配置默认 API Key`);
        }
    });

    // 使用初始化日志级别
    logger.init('配置验证通过', { 
        projects: config.projects.map(p => ({
            name: p.name,
            docPaths: p.docPaths
        }))
    });
}

export default {
    config,
    validateConfig,
};
