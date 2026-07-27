---
createTime: 2026-06-29 18:58
笔记ID: 2026062918585309
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScript21（webpack构建ts+vue3项目）」笔记。素材来源 CSDN 博客 122708348。
笔记类型: 收集笔记
阐述日期:
tags:
  - TypeScript
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-typescript.canvas|小满zs-typescript]]"
---

## 学习TypeScript21（webpack构建ts+vue3项目）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122708348)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-26 21:26:10

---

## 构建项目目录

src-- main.ts-- App.vue--shim.d.tswebpack.config.jsindex.htmlpackage.jsontsconfig.json

## 基础构建

```typescript
npm install webpack -D
npm install webpack-dev-server -D
npm install webpack-cli -D
```

package.json 添加打包命令和 启动服务的命令

```typescript
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server"
  }
}
```

编写webpack.config.js 配置文件测试打包

```typescript
const { Configuration } = require('webpack')
const path  = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode:"development", //开发模式
    entry:'./src/main.ts', //入口
    output:{
        path: path.resolve(__dirname, 'dist'), //出口目录
        filename: 'main.js', //出口文件
    }
}

module.exports = config
```

tsconfig.json 增加配置项

```typescript
"include": [
    "src/**/*"
  ]
```

运行npm run build 打包成功

## 支持TypeScript

增加依赖

```typescript
npm install ts-loader -D
npm install typescript -D
```

```typescript
const { Configuration } = require('webpack')
const path = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader' //支持解析ts文件
            }
        ]
    }
}

module.exports = config
```

## 支持vue

安装依赖

```typescript
npm install vue-laoder -D
npm install html-webpack-plugin -D
```

main.ts 引入Vue

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

让ts识别.vue后缀

```typescript
declare module "*.vue" {
    import { DefineComponent } from "vue"
    const component: DefineComponent
    export default component
}
```

初始化index.html 模板

```typescript
Document
```

增加vue-loader 和 插件

```typescript
const { Configuration } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWepackPlugin = require('html-webpack-plugin')
const path = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    stats: 'errors-only',
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWepackPlugin({
            template: './index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use:{
                    loader: 'ts-loader',
                    options:{
                        appendTsSuffixTo: [/\.vue$/]
                    }
                }
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            }
        ]
    }
}

module.exports = config
```

## 支持css + less

安装依赖

```typescript
npm install css-loader style-loader less less-loader -D
```

```typescript
const { Configuration } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWepackPlugin = require('html-webpack-plugin')
const path = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    stats: 'errors-only',
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWepackPlugin({
            template: './index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use:{
                    loader: 'ts-loader',
                    options:{
                        appendTsSuffixTo: [/\.vue$/]
                    }
                }
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'] //从右向左解析
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
}

module.exports = config
```

## 代码分包

性能优化 默认把所有代码打包到一个js文件体积太大了我们可以进行代码分包减少体积

```typescript
const { Configuration } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWepackPlugin = require('html-webpack-plugin')
const path = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[chunkhash].js',
        clean: true
    },
    stats: 'errors-only',
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWepackPlugin({
            template: './index.html'
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                moment: {
                    name: "moment",
                    test: /[\\/]node_modules[\\/]moment[\\/]/,
                    chunks: "all"
                },
                common:{
                    name: "common",
                    chunks: "all",
                    minChunks: 2
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    }
                }
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'] //从右向左解析
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
}

module.exports = config
```

## 单独提取css

目前是通过js动态插入style标签的方式进行的，但是我们希望通过link标签引入

安装依赖

```typescript
npm install mini-css-extract-plugin -D
```

```typescript
const { Configuration } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWepackPlugin = require('html-webpack-plugin')
const MimiCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
/**
 * @type {Configuration}
 */
const config = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[chunkhash].js',
        clean: true
    },
    stats: 'errors-only',
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWepackPlugin({
            template: './index.html'
        }),
        new MimiCssExtractPlugin()
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                moment: {
                    name: "moment",
                    test: /[\\/]node_modules[\\/]moment[\\/]/,
                    chunks: "all"
                },
                common:{
                    name: "common",
                    chunks: "all",
                    minChunks: 2
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    }
                }
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [MimiCssExtractPlugin.loader, 'css-loader'] //从右向左解析
            },
            {
                test: /\.less$/,
                use: [MimiCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    }
}

module.exports = config
```
