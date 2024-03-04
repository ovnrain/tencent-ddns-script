# 腾讯云 DDNS 脚本

## 介绍

腾讯云 DDNS 脚本，用于自动更新腾讯云域名解析记录

## 使用

注意：本脚本获取公网 IP 地址使用了 [ifconfig.io](https://ifconfig.io/ip) 服务，如果使用了软路由等设备，请将 `ifconfig.io` 域名加入直连列表，否则获取到的 IP 可能是代理服务器的 IP 地址

### 获取腾讯云 secretId 和 secretKey

1. 登录腾讯云控制台，进入 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 页面
2. 点击【新建密钥】，创建密钥对
3. 记录 secretId 和 secretKey

### 使用脚本

```bash
git clone https://github.com/ovnrain/tencent-ddns-script.git
cd tencent-ddns-script
pnpm i
pnpm build
cp .env.example .env
cp config.example.yaml config.yaml
```

编辑 `.env` 文件，填入 secretId 和 secretKey，编辑 `config.yaml` 文件，填入域名和子域名，可以配置多个域名

执行 `pnpm start` 可单次更新域名解析记录

### 定时任务

```bash
# 每 5 分钟执行一次
*/5 * * * * cd /path/to/tencent-ddns-script && pnpm start
```
