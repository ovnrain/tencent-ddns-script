import axios from 'axios';
import fs from 'fs';
import YAML from 'yaml';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import tencentcloud from 'tencentcloud-sdk-nodejs';
import ENV from './env.js';

interface Config {
  domain: string;
  subDomain: string;
  type: 'A';
  // 如果检测到公网 IP 地址在 blockIPs 中，则不更新
  blockIPs?: string[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const configFilePath = join(__dirname, '..', 'config.yaml');
// 判断文件是否存在
if (!fs.existsSync(configFilePath)) {
  throw new Error('配置文件不存在');
}
const configFile = fs.readFileSync(configFilePath, 'utf8');
const configs: Config[] = YAML.parse(configFile);

const { SECRET_ID, SECRET_KEY } = ENV;

const DnspodClient = tencentcloud.dnspod.v20210323.Client;

const client = new DnspodClient({
  credential: {
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  },
});

try {
  const { data: publicIPText } = await axios.get<string>('https://ifconfig.io/ip', {
    responseType: 'text',
  });
  const publicIP = publicIPText.trim();

  if (!publicIP) {
    throw new Error('获取公网 IP 失败');
  }

  for (const config of configs) {
    if (config.blockIPs?.includes(publicIP)) {
      console.log(`当前 IP ${publicIP} 在 IP 黑名单中，跳过`);
      continue;
    }

    const fullDomain = `${config.subDomain}.${config.domain}`;
    const recordListResponse = await client.DescribeRecordList({
      Domain: config.domain,
    });
    const recordItem = recordListResponse.RecordList?.find(
      (item) => item.Name === config.subDomain && item.Type === config.type,
    );
    const recordId = recordItem?.RecordId;
    const recordIP = recordItem?.Value;

    const recordConfig = {
      Domain: config.domain,
      SubDomain: config.subDomain,
      RecordType: config.type,
      RecordLine: '默认',
      Value: publicIP,
    };

    if (!recordId) {
      await client.CreateRecord(recordConfig);

      console.log(`${fullDomain} 创建记录成功，最新的 IP 为 ${publicIP}`);
    } else if (recordIP !== publicIP) {
      await client.ModifyRecord({ ...recordConfig, RecordId: recordId });

      console.log(`${fullDomain} 更新记录成功，最新的 IP 为 ${publicIP}`);
    } else {
      console.log(`${fullDomain} 记录无需更新，当前 IP 为 ${recordIP}`);
    }
  }
} catch (e) {
  console.log(e instanceof Error ? `错误: ${e.message}` : e);
}
