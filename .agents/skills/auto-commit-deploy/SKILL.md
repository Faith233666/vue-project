---
name: auto-commit-deploy
description: "全栈项目（Vue3前端 + Express/SQLite后端）代码自动化提交与部署更新Skill。支持前端Netlify与后端Render的云端自动构建部署，以及本地热更新与服务即时重启。"
---

# 全栈项目代码提交与即时更新 Skill (Vue3 + Express/SQLite)

本 Skill 用于协助开发者一键完成全栈项目（前端 `vue-project` + 后端 `sqLite`）的代码 Git 提交、远程仓库推送，并自动触发云端（Netlify / Render）即时部署与本地环境热更新。

## 一、 适用场景

当你或用户发起以下请求时触发此 Skill：
1. "提交前端和后端代码"
2. "同步部署最新代码"
3. "更新生产环境 / 云端环境"
4. "一键 Commit & Push 全栈代码"

---

## 二、 部署架构与联动逻辑

```
[本地开发环境]
  ├─ 前端 Vue3 (Vite HMR 热更新)  ─────── Git Push ──────> GitHub (vue-project) ──> Netlify 自动构建上线
  └─ 后端 Express (Nodemon 即时重启) ─── Git Push ──────> GitHub (sqLite)      ──> Render 自动构建上线
```

- **前端云端即时更新**：Push 到 GitHub `vue-project` 后，Netlify 监听 Webhook 自动触发打包与 CDN 分发。
- **后端云端即时更新**：Push 到 GitHub `sqLite` 后，Render 监听 Webhook 自动拉取最新代码并重启服务。
- **本地环境即时更新**：
  - 前端：Vite Dev Server 实时 HMR（热模块替换）。
  - 后端：Nodemon 监听 `server.js` 变动自动无缝重启。

---

## 三、 标准操作流程 (Workflow)

### 步骤 1：全栈代码状态检查
检查前端与后端项目的修改状态：

```powershell
# 检查后端状态
cd "d:\开发\前端开发\sqLite"
git status -s

# 检查前端状态
cd "d:\开发\前端开发\Vue3个人项目\vue-project"
git status -s
```

---

### 步骤 2：全栈代码提交与推送 (Commit & Push)

#### 方式 A：运行一键部署脚本（推荐）
调用本 Skill 附带的 PowerShell 脚本 `scripts/deploy_all.ps1`：

```powershell
powershell -ExecutionPolicy Bypass -File ".agents/skills/auto-commit-deploy/scripts/deploy_all.ps1" -CommitMsg "feat: 更新全栈功能与接口"
```

#### 方式 B：分步执行 Git 命令

1. **提交并推送后端代码 (`sqLite`)**
   ```powershell
   cd "d:\开发\前端开发\sqLite"
   git add .
   git commit -m "feat(backend): [接口/数据库更新说明]"
   git push origin main
   ```

2. **提交并推送前端代码 (`vue-project`)**
   ```powershell
   cd "d:\开发\前端开发\Vue3个人项目\vue-project"
   git add .
   git commit -m "feat(frontend): [前端功能更新说明]"
   git push origin main
   ```

---

### 步骤 3：云端环境即时更新确认

- **Netlify 前端验证**：Push 成功后 1-2 分钟内，访问 Netlify 分发域名查看最新页面。
- **Render 后端验证**：Push 成功后 1-3 分钟内，请求后端 API 服务节点确认响应正常。

---

### 步骤 4：本地环境即时更新与热重启

在本地开发时，推荐同时开启前端与后端的实时热更新服务：

1. **后端热重启**（进入 `sqLite` 目录）：
   `npm run dev` （基于 nodemon 监听 `server.js`）
2. **前端热更新**（进入 `vue-project` 目录）：
   `npm run dev` （基于 Vite HMR）
