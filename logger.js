/**
 * @file Logger configuration for apifox-autoimport
 * @license MIT
 */

import winston from 'winston';
import { join } from 'path';
import chalk from 'chalk';

// 定义日志级别和颜色
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    init: 4,  // 添加初始化日志级别
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    init: 'cyan',  // 初始化日志使用青色
};



// 初始化日志格式
const initFormat = winston.format((info) => {
    if (info.level === 'init') {
        const { message, ...meta } = info;

        if (message === '配置验证通过') {
            const projects = meta.projects || [];
            return {
                ...info,
                message: [
                    chalk.cyan('apifox-autoimport v1.0.0'),
                    '',
                    ...projects.map(p => [
                        chalk.green('➜'),
                        chalk.bold(p.name),
                        chalk.gray(`(${p.docPaths.length} files)`),
                        '\n',
                        ...p.docPaths.map(path => 
                            `  ${chalk.dim('文件位置:')} ${path}`
                        ),
                        ''
                    ].join(' ')),
                    '',
                    chalk.cyan('配置验证通过'),
                    ''
                ].join('\n')
            };
        }

        if (message === '开始监听文件') {
            return {
                ...info,
                message: [
                    chalk.green('✓'),
                    '文件监听已启动',
                    chalk.gray(`(${meta.paths.length} files)`),
                    '\n'
                ].join(' ')
            };
        }

        if (message === '初始化文件内容缓存') {
            return {
                ...info,
                message: [
                    chalk.dim('➜'),
                    '缓存文件:',
                    chalk.dim(meta.file),
                ].join(' ')
            };
        }
    }
    return info;
})();
// 创建 logger 实例
export const logger = winston.createLogger({
    levels: logLevels,
    level: 'init', // 确保 init 级别的日志可以输出
    format: initFormat,
});

// 控制台输出
logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            // 只返回消息内容，不包含元数据
            if (level === 'init') {
                return message;
            }
            return `${timestamp} [${level}]: ${message}`;
        })
    )
}));

// 文件输出
logger.add(new winston.transports.File({
    filename: join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    )
}));

logger.add(new winston.transports.File({
    filename: join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    filter: (info) => info.level !== 'init'
}));

// 添加颜色支持
winston.addColors(logColors);

export default logger; 