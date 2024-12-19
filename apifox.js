// src/apifoxApi.js
import axios from "axios";
const UrlPatternOptions = {
    segmentValueCharset: "a-zA-Z0-9-_~.",
};
export async function importToApifox(apiUrl, apiKey, fileContent) {
    console.log(apiUrl);
    try {
        let raw = JSON.stringify({
            input: fileContent,
        });
        let config = {
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

        axios(config)
            .then((resp) => {})
            .catch((error) => {
                console.log(error);
            });
        console.log("导入成功");
    } catch (error) {
        console.error(`导入失败，错误信息: ${error.message}`);
    }
}

export default {
    importToApifox,
};
