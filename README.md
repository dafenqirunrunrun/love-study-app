# 考研伴侣 (Love & Study) - 运行指南

## 🚀 运行步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 打开浏览器
访问 http://localhost:3000 即可看到应用

## 📁 项目结构
```
love-study-app/
├── index.html          # HTML 入口文件
├── package.json        # 项目配置和依赖
├── vite.config.js      # Vite 构建配置
├── tailwind.config.js  # Tailwind CSS 配置
├── postcss.config.js   # PostCSS 配置
└── src/
    ├── main.js         # Vue 应用入口
    ├── router/         # Vue Router 路由配置
    │   └── index.js
    ├── views/          # 页面组件
    │   ├── Home.vue        # 首页（倒计时+概览）
    │   ├── Tasks.vue       # 任务管理
    │   ├── Focus.vue       # 专注计时
    │   ├── Checkin.vue    # 习惯打卡
    │   ├── Stats.vue      # 数据统计
    │   ├── Rewards.vue    # 心愿单兑换
    │   ├── Journal.vue    # 学习心得
    │   └── Achievements.vue # 成就徽章
    ├── components/     # 公共组件
    │   └── Layout.vue   # 主布局组件
    └── style.css       # 全局样式
```

## 🎯 功能特色
- ✅ 考研倒计时（2026-12-26）
- ✅ 每日暖心鼓励语
- ✅ 番茄钟专注计时器（25分钟）
- ✅ 任务管理系统（支持分类、优先级、筛选）
- ✅ 恋爱积分奖励系统
- ✅ 心愿单兑换功能
- ✅ LocalStorage 数据持久化
- ✅ 习惯打卡系统（每日习惯追踪）
- ✅ 专注时长统计（历史记录）
- ✅ 学习数据统计仪表盘
- ✅ 白噪音环境音功能
- ✅ 音效提示和动画效果
- ✅ 成就徽章系统（10个成就）
- ✅ 深色模式切换（夜间护眼）
- ✅ 每日学习心得记录
- ✅ 快捷操作工具栏
- ✅ 进度条可视化
- ✅ 任务分类统计图表

## 🛠️ 技术栈
- Vue 3 (Composition API)
- Vue Router 4 (SPA路由)
- Tailwind CSS
- Vite
- 纯前端，无后端

## 📱 响应式设计
应用完美适配桌面和移动设备！
- 顶部导航栏（桌面端）
- 底部快捷导航（移动端）
- 响应式卡片布局

## 🎨 设计特点
- 玻璃拟态（Glassmorphism）风格
- 动态渐变背景
- 粒子动画效果
- 流畅的过渡动画
- 夜间/日间模式切换
- ✅ 习惯打卡系统（每日习惯追踪）
- ✅ 专注时长统计（历史记录）
- ✅ 学习数据统计仪表盘
- ✅ 白噪音环境音功能
- ✅ 音效提示和动画效果

## 🛠️ 技术栈
- Vue 3 (Composition API)
- Tailwind CSS
- Vite
- 纯前端，无后端

## 📱 响应式设计
应用完美适配桌面和移动设备！