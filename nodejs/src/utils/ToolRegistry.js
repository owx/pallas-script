
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.aliases = new Map();
    }

    // 注册工具
    register(name, handler, aliases = []) {
        this.tools.set(name, { name, handler, aliases });
        
        // 注册别名
        aliases.forEach(alias => {
            this.aliases.set(alias, name);
        });
    }

    // 获取工具
    getTool(mode) {
        // 先查找别名
        const actualName = this.aliases.get(mode) || mode;
        return this.tools.get(actualName);
    }

    // 执行工具
    run(mode, ...args) {
        const tool = this.getTool(mode);
        
        if (tool) {
            console.log(`start ${tool.name} app...`);
            tool.handler(...args);
        } else {
            this.showHelp();
        }
    }

    showHelp() {
        console.log("xbox utils -m(mode)");
        this.tools.forEach(tool => {
            const aliasesStr = tool.aliases.length ? `|${tool.aliases.join('|')}` : '';
            console.log(`\t-m ${tool.name}${aliasesStr} : ${tool.name}工具`);
        });
    }

}export default ToolRegistry;


// const registry = new ToolRegistry();

// // 注册所有工具
// registry.register('qrcode', () => {
//     // 实现二维码功能
// }, ['qr']);

// registry.register('svg2png', (input, output) => {
//     // 实现 svg 转 png 功能
// }, ['s2p']);

// registry.register('encrypt', () => {
//     // 实现加密功能
// }, ['enc']);

// registry.register('minio', () => {
//     // 实现 minio 功能
// });

// registry.register('ocr', () => {
//     // 实现 ocr 功能
// });

// registry.register('oss', () => {
//     // 实现 oss 功能
// });

// registry.register('jujia', () => {
//     // 实现 jujia 功能
// });

// // 执行
// registry.run('qr');
// registry.run('s2p', 'input.svg', 'output.png');