window.__PLUGIN_ota = {
  "_protocol": "rs-log-analyzer-plugin-v1.0",
  "meta": {
    "name": "Sanag OTA升级日志分析插件",
    "version": "1.0.0",
    "author": "RS",
    "description": "解析Sanag耳机OTA升级流程日志，包括固件传输、校验、同步和错误处理"
  },
  "modules": [
    {
      "id": "ota_state",
      "name": "OTA状态",
      "icon": "📦",
      "category": "flash",
      "patterns": [
        {
          "id": "ota_status_change",
          "match": "\\[RS\\]\\[OTA\\].*ota_status.*?(\\d+)",
          "variables": [
            { "name": "status", "extract": "\\1", "type": "number", "unit": "状态码" }
          ]
        },
        {
          "id": "ota_transmission_active",
          "match": "\\[RS\\]\\[OTA\\]OTA transmission (started|timeout|stopped)",
          "variables": [
            { "name": "state", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "ota_packet",
      "name": "OTA数据包",
      "icon": "📤",
      "category": "flash",
      "patterns": [
        {
          "id": "packet_received",
          "match": "\\[RS\\]\\[OTA\\]rs_app_ota_transfer_file_func packet_index = \\[(\\d+)\\], packet_len = \\[(\\d+)\\]",
          "variables": [
            { "name": "index", "extract": "\\1", "type": "number" },
            { "name": "length", "extract": "\\2", "type": "number", "unit": "字节" }
          ]
        },
        {
          "id": "packet_crc_check",
          "match": "\\[RS\\]\\[OTA\\]packet_crc = \\[(0x[0-9A-F]+)\\], recive_crc = \\[(0x[0-9A-F]+)\\]",
          "variables": [
            { "name": "expected_crc", "extract": "\\1", "type": "string" },
            { "name": "received_crc", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "packet_loss",
          "match": "\\[RS\\]\\[OTA\\]Packet loss detected! Expected: (\\d+), Received: (\\d+), Lost: (\\d+) packets",
          "variables": [
            { "name": "expected", "extract": "\\1", "type": "number" },
            { "name": "received", "extract": "\\2", "type": "number" },
            { "name": "lost_count", "extract": "\\3", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "ota_error",
      "name": "OTA错误",
      "icon": "❌",
      "category": "flash",
      "patterns": [
        {
          "id": "crc_error",
          "match": "\\[RS\\]\\[OTA\\]CRC error! packet_index=(\\d+)",
          "variables": [
            { "name": "packet_index", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "error_report",
          "match": "\\[RS\\]\\[OTA\\]Reporting OTA error: (0x[0-9A-F]+)",
          "variables": [
            { "name": "error_code", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "audio_interrupt",
          "match": "\\[RS\\]\\[OTA\\](Audio interrupt detected|Call interrupt|Music interrupt)",
          "variables": [
            { "name": "interrupt_type", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "ota_tws_sync",
      "name": "TWS同步",
      "icon": "🔄",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "tws_crc_check",
          "match": "\\[RS\\]\\[OTA\\]\\[SYN\\].*crc check (succesful|fail).*crc = (0x[0-9A-F]+)",
          "variables": [
            { "name": "result", "extract": "\\1", "type": "string" },
            { "name": "crc", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "sync_ota_info",
          "match": "\\[RS\\]\\[OTA\\]\\[SYN\\]rsAdaptOta_TwsSyncOtaInfoHandler",
          "variables": []
        }
      ]
    },
    {
      "id": "ota_version",
      "name": "固件版本",
      "icon": "📱",
      "category": "system",
      "patterns": [
        {
          "id": "software_version",
          "match": "\\[RS\\]\\[OTA\\]rs_app_get_device_info sw_version = (\\d+) - \\[0x([0-9A-F]+)\\], hw_version = (\\d+) - \\[0x([0-9A-F]+)\\]",
          "variables": [
            { "name": "sw_dec", "extract": "\\1", "type": "number" },
            { "name": "sw_hex", "extract": "\\2", "type": "string" },
            { "name": "hw_dec", "extract": "\\3", "type": "number" },
            { "name": "hw_hex", "extract": "\\4", "type": "string" }
          ]
        }
      ]
    }
  ],
  "flows": [
    { "id": "step_1", "name": "固件升级条件检查", "pattern": "check_firmware_update" },
    { "id": "step_2", "name": "进入OTA状态", "pattern": "enter_ota_state" },
    { "id": "step_3", "name": "开始传输命令", "pattern": "start_send_cmd" },
    { "id": "step_4", "name": "传输固件数据包", "pattern": "packet_received" },
    { "id": "step_5", "name": "CRC校验", "pattern": "packet_crc_check" },
    { "id": "step_6", "name": "TWS同步OTA信息", "pattern": "tws_crc_check" },
    { "id": "step_7", "name": "传输完成", "pattern": "transfer_complete" },
    { "id": "step_8", "name": "请求更新固件", "pattern": "request_update" },
    { "id": "step_9", "name": "设备重启", "pattern": "reboot" }
  ]
};
