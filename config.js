import dotenv from 'dotenv'
dotenv.config();

export const config = {
    APIFOX_PROJECT_ID: process.env.APIFOX_PROJECT_ID,
    APIFOX_API_KEY: process.env.APIFOX_API_KEY,
    API_DOC_PATH: process.env.API_DOC_PATH,
    APIFOX_API_URL: process.env.APIFOX_API_URL,
};

// 检查环境变量是否已正确配置
export function validateConfig() {
    const requiredEnvVars = [
        'APIFOX_PROJECT_ID',
        'APIFOX_API_KEY',
        'API_DOC_PATH',
        'APIFOX_API_URL',
    ];
    const missingVars = requiredEnvVars.filter((key) => !config[key]);
    if (missingVars.length > 0) {
        throw new Error(`缺少以下环境变量: ${missingVars.join(", ")}`);
    }
    console.log("环境变量配置正确, 配置如下:", config);
}

export default {
    config,
    validateConfig,
};
