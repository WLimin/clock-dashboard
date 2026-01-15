# nginx用编译的静态文件提供网络服务时

因为浏览器安全原因，需要进行反向代理，才能避免混合内容、交叉来源等错误。
nginx.conf中需要的关键设置如下：
```code
# 静态网站服务
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    ##
    # SSL Settings
    ##

    ssl_protocols  TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE TLSv1 TLSv1.1
    ssl_prefer_server_ciphers     on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    types_hash_max_size 2048;

set $cosy_voice_ip "172.18.0.180";
set $ollama_ip "172.18.0.160";

    location /ollama/ {
        set $server         "ollama";
        # (Optional) Disable proxy buffering for better streaming response from models
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;

        # (Optional) Increase max request size for large attachments and long audio messages
        client_max_body_size 20M;
        proxy_read_timeout 10m;
        proxy_send_timeout      600s;
        add_header       X-Served-By $host;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Scheme $scheme;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_pass http://$ollama_ip:11434/; #可以工作

        # Add WebSocket support (Necessary for version 0.5.0 and up)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /tts/ {
        set $server         "cosyvoice-api";
        rewrite ^/tts/(.*) /$1 break; 
        add_header       X-Served-By $host;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Scheme $scheme;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_pass http://$cosy_voice_ip:8000;  # api端口8000。web端口是8080
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
其中，ollama容器侦听在172.18.0.160:11434:
```bash
    docker run -itd --name ollama --gpus all \
    --ip=172.18.0.160 \
    -e OLLAMA_DEBUG=True \
    -e OLLAMA_LOG_LEVEL=VERBOSE \
    -e OLLAMA_CONTEXT_LENGTH=$((8*1024)) \
    -e DISABLE_TELEMETRY=YES \
  -v /etc/localtime:/etc/localtime:ro \
  -v /etc/timezone:/etc/timezone:ro \
  -v /usr/share/zoneinfo:/usr/share/zoneinfo:ro \
  -e TZ=Asia/Shanghai \
    -e UID=$(id -u) -e GID=$(id -g) \
    -e "HOME=/app" \
    --user $(id -u):$(id -g) \
    -v ${VOLUMES}/ollama:/app/.ollama \
    ollama/ollama
```
tts的镜像为 CosyVoice2-0.5B。工作在OpenAI兼容API模式。

采用上述配置时， 大语言模型 apiUrl为
```
/ollama/v1/responses
```
tts的 apiUrl为
```
/tts/v1/audio/speech
```
## 点击农历、秒或图标试试看。