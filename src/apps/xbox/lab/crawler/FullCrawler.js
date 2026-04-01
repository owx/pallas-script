import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FullCrawler {
    constructor(config = {}) {
        this.config = {
            userAgent: config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timeout: config.timeout || 10000,
            retries: config.retries || 3,
            delay: config.delay || 1000,
            useDynamic: config.useDynamic || false,
            ...config
        };
        
        this.browser = null;
    }

    // 获取随机延迟
    async randomDelay() {
        const delay = this.config.delay + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 保存页面
    async savePage(html, filename) {
        const filepath = path.join(__dirname, 'pages', filename);
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, html, 'utf-8');
        return filepath;
    }

    // 提取所有链接
    extractLinks($, baseUrl) {
        const links = [];
        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.startsWith('#')) {
                const absoluteUrl = new URL(href, baseUrl).href;
                links.push({
                    text: $(elem).text().trim(),
                    href: absoluteUrl,
                    title: $(elem).attr('title') || ''
                });
            }
        });
        return links;
    }

    // 提取图片
    extractImages($, baseUrl) {
        const images = [];
        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src) {
                const absoluteUrl = new URL(src, baseUrl).href;
                images.push({
                    src: absoluteUrl,
                    alt: $(elem).attr('alt') || '',
                    title: $(elem).attr('title') || ''
                });
            }
        });
        return images;
    }

    // 静态爬取
    async crawlStatic(url) {
        let lastError;
        
        for (let i = 0; i < this.config.retries; i++) {
            try {
                const response = await axios({
                    method: 'GET',
                    url: url,
                    headers: { 'User-Agent': this.config.userAgent },
                    timeout: this.config.timeout
                });
                
                const $ = cheerio.load(response.data);
                
                return {
                    url,
                    html: response.data,
                    $,
                    title: $('title').text(),
                    links: this.extractLinks($, url),
                    images: this.extractImages($, url),
                    status: 'success'
                };
            } catch (error) {
                lastError = error;
                console.log(`请求失败，重试 ${i + 1}/${this.config.retries}: ${error.message}`);
                await this.randomDelay();
            }
        }
        
        throw lastError;
    }

    // 动态爬取
    async crawlDynamic(url, options = {}) {
        // 查找 Chrome 路径 - 添加更多可能的路径
        console.log('1. 查找 Chrome 路径...');
        const chromePaths = [
            'D:\\Tools\\Google\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
            // Chromium 可能的路径
            'C:\\Program Files\\Chromium\\Application\\chrome.exe',
            `${process.env.LOCALAPPDATA}\\Chromium\\Application\\chrome.exe`,
            // Edge 浏览器（也可以使用）
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`
        ];
        
        let chromePath = null;
        for (const path of chromePaths) {
            if (existsSync(path)) {
                chromePath = path;
                console.log('找到浏览器:', path);
                break;
            }
        }
        
        if (!chromePath) {
            // 如果还是找不到，尝试使用系统路径
            const which = await import('which');
            try {
                chromePath = await which.default('chrome');
            } catch (err) {
                try {
                    chromePath = await which.default('google-chrome');
                } catch (err2) {
                    throw new Error('未找到 Chrome 浏览器。请：\n' +
                        '1. 安装 Chrome 浏览器\n' +
                        '2. 或在代码中指定正确的路径\n' +
                        '3. 或使用 puppeteer 而不是 puppeteer-core（会自动下载）');
                }
            }
        }
        
        if (!this.browser) {
            console.log('2. 启动浏览器...');
            this.browser = await puppeteer.launch({
                executablePath: chromePath,  // 关键：指定路径
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage'
                ]
            });
            console.log('3. 浏览器启动成功');
        }
        
        const page = await this.browser.newPage();
        console.log('4. 创建新页面成功');

        try {
            console.log(`5. 开始加载页面: ${url}`);
            await page.setUserAgent(this.config.userAgent);
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: this.config.timeout
            });
            console.log('6. 页面加载完成');

            // 执行自定义脚本
            console.log('7. 执行页面脚本...');
            if (options.beforeExtract) {
                await page.evaluate(options.beforeExtract);
            }
            
            // 提取数据
            const data = await page.evaluate(() => {
                console.log('在浏览器中执行的代码');
                return {
                    title: document.title,
                    url: window.location.href,
                    html: document.documentElement.outerHTML,
                    text: document.body.innerText,
                    links: Array.from(document.querySelectorAll('a')).map(a => ({
                        href: a.href,
                        text: a.innerText
                    })),
                    images: Array.from(document.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt
                    }))
                };
            });
            console.log('8. 数据提取完成');
            
            return { ...data, status: 'success' };
            
        } finally {
            await page.close();
        }
    }

    // 统一爬取接口
    async crawl(url, options = {}) {
        const useDynamic = options.useDynamic !== undefined ? options.useDynamic : this.config.useDynamic;
        
        if (useDynamic) {
            return await this.crawlDynamic(url, options);
        } else {
            return await this.crawlStatic(url);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

}export default FullCrawler;

// 使用示例
export const crawler = new FullCrawler({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timeout: 15000,
    retries: 3,
    delay: 1000
});
