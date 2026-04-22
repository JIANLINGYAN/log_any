window.__PLUGIN_ota_analyzer = {
  "meta": {
    "name": "Sanag OTA升级日志分析插件",
    "version": "1.0.0",
    "author": "RS",
    "description": "解析Sanag耳机OTA升级流程日志，包括固件传输、校验、同步和错误处理"
  },
  "modules": [
    {
      "id": "ota_status",
      "name": "OTA状态",
      "icon": "📦",
      "category": "ota",
      "description": "OTA升级的各个状态阶段",
      "patterns": [
        {
          "id": "ota_check",
          "match": "OTA status: checking update",
          "description": "检查更新"
        },
        {
          "id": "ota_download",
          "match": "OTA status: downloading firmware (.+)",
          "description": "下载固件",
          "variables": [
            { "name": "firmware_version", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "ota_verify",
          "match": "OTA status: verification passed",
          "description": "固件校验通过"
        },
        {
          "id": "ota_complete",
          "match": "OTA status: update completed successfully",
          "description": "升级完成"
        }
      ]
    },
    {
      "id": "ota_data",
      "name": "OTA数据包",
      "icon": "📡",
      "category": "ota",
      "description": "OTA数据传输过程",
      "patterns": [
        {
          "id": "ota_data_transfer",
          "match": "OTA data: chunk (\\d+)/(\\d+), size=(\\d+)",
          "description": "数据包传输",
          "variables": [
            { "name": "current_chunk", "extract": "\\1", "type": "number" },
            { "name": "total_chunks", "extract": "\\2", "type": "number" },
            { "name": "chunk_size", "extract": "\\3", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "ota_error",
      "name": "OTA错误",
      "icon": "❌",
      "category": "error",
      "description": "OTA升级过程中的错误",
      "patterns": [
        {
          "id": "ota_error",
          "match": "OTA error: (.+)",
          "description": "OTA错误",
          "variables": [
            { "name": "error_message", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "tws_sync",
      "name": "TWS同步",
      "icon": "🔄",
      "category": "tws",
      "description": "TWS双耳OTA同步",
      "patterns": [
        {
          "id": "tws_sync",
          "match": "TWS sync: (\\w+) earbud synced",
          "description": "TWS耳塞同步",
          "variables": [
            { "name": "earbud", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "firmware_version",
      "name": "固件版本",
      "icon": "📋",
      "category": "info",
      "description": "固件版本信息",
      "patterns": [
        {
          "id": "firmware_version",
          "match": "Firmware version: (.+)",
          "description": "固件版本",
          "variables": [
            { "name": "version", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    }
  ]
};
