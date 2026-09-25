# 月光手帖 · Diary Book

使用 React、Vite、TypeScript、Tailwind CSS 和 lucide-react 构建的个人日记本。日记保存在当前浏览器的 localStorage 中，无需后端。

页面背景使用修复并扩展后的 `public/diary-background.png`。图片来自用户提供的原图，经 imagegen 清理画面瑕疵并扩展为宽屏。背景上叠加了浅色遮罩，以保持正文可读。

## 运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

## 功能

- 按日记日期倒序展示标题和摘要
- 新建、阅读、编辑、删除日记
- 删除二次确认及保存反馈
- 刷新后从 localStorage 恢复日记

数据仅存在当前浏览器及其所在设备。清理网站数据或使用其他浏览器后，原日记不会自动同步。
