import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { logger } from './logger.js';

let config = null;

export function loadConfig(configPath) {
    try {
        const resolvedPath = configPath.startsWith('/')
            ? configPath
            : join(process.cwd(), configPath);

        logger.debug('加载配置文件', { path: resolvedPath });
        
        const configFile = readFileSync(resolvedPath, 'utf-8');
        config = yaml.load(configFile);

        // 处理默认值
        config.projects = config.projects.map(project => ({
            ...project,
            apiKey: project.apiKey || config.defaultApiKey,
            apiUrl: project.apiUrl || config.defaultApiUrl,
        }));

        return config;
    } catch (error) {
        logger.error('无法读取配置文件', { path: configPath, error: error.message });
        throw error;
    }
}

export function validateConfig() {
    if (!config) {
        throw new Error('配置未加载，请先调用 loadConfig');
    }

    if (!config.projects || !Array.isArray(config.projects) || config.projects.length === 0) {
        throw new Error('至少需要配置一个项目');
    }

    if (!config.defaultApiKey) {
        logger.warn('未配置默认 API Key');
    }

    config.projects.forEach((project) => {
        const requiredFields = ['projectId', 'docPaths'];
        const missingFields = requiredFields.filter(field => !project[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`项目 ${project.name} 缺少以下配置: ${missingFields.join(", ")}`);
        }
        
        if (!Array.isArray(project.docPaths) || project.docPaths.length === 0) {
            throw new Error(`项目 ${project.name} 未配置文档路径`);
        }

        if (!project.apiKey && !config.defaultApiKey) {
            throw new Error(`项目 ${project.name} 未配置 API Key，且未配置默认 API Key`);
        }
    });

    logger.init('配置验证通过', { 
        projects: config.projects.map(p => ({
            name: p.name,
            docPaths: p.docPaths
        }))
    });
}

export { config };

export default {
    config,
    loadConfig,
    validateConfig,
}; 