window.__PLUGIN_ble_connect = {
  "_protocol": "rs-log-analyzer-plugin-v1.0",
  "meta": {
    "name": "BLE连接流程分析器",
    "version": "1.0.0",
    "author": "RS",
    "description": "分析BLE从广播到GATT服务建立的全流程日志"
  },
  "modules": [
    {
      "id": "ble_init",
      "name": "BLE初始化",
      "icon": "🔌",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "ble_gap_init",
          "match": "gap_init|app_ble_init|GAP init",
          "variables": [
            { "name": "status", "extract": "(success|fail|\\d+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "gatt_service_register",
          "match": "gatts_register_service|GATT service register|rsAdaptGatt_Init",
          "variables": [
            { "name": "uuid", "extract": "(0x[0-9A-Fa-f]+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "adv_register",
          "match": "app_ble_register_advertising|rsAdapBle_AdvInit|adv register",
          "variables": [
            { "name": "handle", "extract": "(\\d+)", "type": "number", "unit": "" }
          ]
        }
      ]
    },
    {
      "id": "ble_adv",
      "name": "BLE广播",
      "icon": "📡",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "adv_start",
          "match": "gap_refresh_advertising|ble_adv_start|app_ble_start_adv|START_ADV",
          "variables": [
            { "name": "interval_ms", "extract": "(\\d+)", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "adv_data_fill",
          "match": "rsAdapBle_AdvDataFillHandler|adv data fill|AdvDataFill",
          "variables": [
            { "name": "tx_power", "extract": "(\\d+)", "type": "number", "unit": "dBm" }
          ]
        },
        {
          "id": "adv_state",
          "match": "BLE_STATE_IDLE|BLE_STARTING_ADV|BLE_ADVERTISING|adv_state",
          "variables": [
            { "name": "state", "extract": "(IDLE|STARTING|ADVERTISING|STOPPING)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "adv_force_switch",
          "match": "rsAdapBle_ForceSwitchAdv|app_ble_force_switch_adv|force_switch_adv",
          "variables": [
            { "name": "enable", "extract": "(true|false|0|1)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "adv_allowed",
          "match": "rsAdapBle_IfAdvAllowed|ble_adv_is_allowed|adv_not_allowed",
          "variables": [
            { "name": "allowed", "extract": "(true|false|0|1|yes|no)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "ble_addr_set",
          "match": "btif_me_set_ble_bd_address|set_ble_bd_addr|BLE addr",
          "variables": [
            { "name": "addr", "extract": "([0-9A-Fa-f:]{17})", "type": "string", "unit": "" }
          ]
        }
      ]
    },
    {
      "id": "ble_conn_establish",
      "name": "BLE连接建立",
      "icon": "🔗",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "conn_opened_gap",
          "match": "GAP_ADV_EVENT_CONN_OPENED|GAP_CONN_EVENT_OPENED|conn_opened|connection_opened",
          "variables": [
            { "name": "connhdl", "extract": "(0x[0-9A-Fa-f]+|\\d+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "conn_handle_event",
          "match": "app_ble_conn_event_handle|BLE_LINK_CONNECTED_EVENT|ble_conn_event",
          "variables": [
            { "name": "event", "extract": "(OPENED|CLOSED|UPDATE)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "rpa_resolved",
          "match": "BLE_RPA_ADDR_PARSED_EVENT|rpa_parsed|irk_resolved|peer_solved_addr",
          "variables": [
            { "name": "resolved_addr", "extract": "([0-9A-Fa-f:]{17})", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "conn_type",
          "match": "HCI_CONN_TYPE_BT_ACL|HCI_CONN_TYPE_LE_ACL|conn_type",
          "variables": [
            { "name": "type", "extract": "(BT_ACL|LE_ACL|\\d+)", "type": "string", "unit": "" }
          ]
        }
      ]
    },
    {
      "id": "gatt_service",
      "name": "GATT服务",
      "icon": "⚙️",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "gatt_conn_opened",
          "match": "GATT_SERV_EVENT_CONN_OPENED|gatt_conn_opened|rsAdaptGatt.*connected",
          "variables": [
            { "name": "conidx", "extract": "(\\d+)", "type": "number", "unit": "" }
          ]
        },
        {
          "id": "gatt_bt_conn_done",
          "match": "RS_GATT_BT_CONN_DONE|BT_GATT_CONNECTED|bt_gatt_connected",
          "variables": [
            { "name": "device_id", "extract": "(\\d+)", "type": "number", "unit": "" }
          ]
        },
        {
          "id": "gatt_ble_conn_done",
          "match": "RS_GATT_BLE_CONN_DONE|BLE_GATT_CONNECTED|ble_gatt_connected",
          "variables": [
            { "name": "conidx", "extract": "(\\d+)", "type": "number", "unit": "" }
          ]
        },
        {
          "id": "cccd_subscribe",
          "match": "GATT_SERV_EVENT_DESC_WRITE|CCCD|SET_NOTIFICATION|cccd_write",
          "variables": [
            { "name": "config", "extract": "(0x[0-9A-Fa-f]+|\\d+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "mtu_exchange",
          "match": "GATT_SERV_EVENT_MTU_CHANGED|MTU_CHANGED|mtu_exchange|mtu_negotiated",
          "variables": [
            { "name": "mtu_size", "extract": "(\\d+)", "type": "number", "unit": "bytes" }
          ]
        },
        {
          "id": "data_rx",
          "match": "GATT_SERV_EVENT_CHAR_WRITE|RS_GATT_DATA_RECEIVED|gatt_data_rx|DataRx",
          "variables": [
            { "name": "length", "extract": "(\\d+)", "type": "number", "unit": "bytes" }
          ]
        },
        {
          "id": "data_tx",
          "match": "gatts_send_value_notification|RS_GATT_DATA_SEND|gatt_data_tx|DataTx|SendData",
          "variables": [
            { "name": "length", "extract": "(\\d+)", "type": "number", "unit": "bytes" }
          ]
        }
      ]
    },
    {
      "id": "device_binding",
      "name": "设备绑定",
      "icon": "📱",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "irk_match",
          "match": "irk_match|IRK.*match|solved_addr.*match|rsAdaptGatt_GetBlePeerSolvedAddr",
          "variables": [
            { "name": "matched_addr", "extract": "([0-9A-Fa-f:]{17})", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "irk_no_match",
          "match": "irk.*no.*match|IRK.*fail|no_resolved_addr|irk_unresolved",
          "variables": [
            { "name": "reason", "extract": "(\\w+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "spp_binding",
          "match": "spp_bind|SPP.*bind|spp_connected_device|bind.*spp",
          "variables": [
            { "name": "device_id", "extract": "(\\d+)", "type": "number", "unit": "" }
          ]
        },
        {
          "id": "dip_check",
          "match": "DipCheck|dip_check|is_iOS|iOS_device",
          "variables": [
            { "name": "is_ios", "extract": "(true|false|0|1)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "mutual_exclusion",
          "match": "mutual_exclusion|disconnect.*existing|priority.*disconnect|BT_GATT.*priority",
          "variables": [
            { "name": "action", "extract": "(disconnect_ble|disconnect_bt|keep_existing)", "type": "string", "unit": "" }
          ]
        }
      ]
    },
    {
      "id": "ble_disconnect",
      "name": "BLE断连",
      "icon": "❌",
      "category": "bluetooth",
      "patterns": [
        {
          "id": "conn_closed_gap",
          "match": "GAP_CONN_EVENT_CLOSED|conn_closed|connection_closed|BLE_DISCONNECT",
          "variables": [
            { "name": "reason", "extract": "(0x[0-9A-Fa-f]+|\\d+)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "gatt_disconn",
          "match": "RS_GATT_DISCONN_DONE|GATT_SERV_EVENT_CONN_CLOSED|gatt_disconnected",
          "variables": [
            { "name": "type", "extract": "(BT|BLE)", "type": "string", "unit": "" }
          ]
        },
        {
          "id": "adv_resume",
          "match": "rsAdapBle_ForceSwitchAdv.*true|resume_adv|adv_restart|restart_advertising",
          "variables": [
            { "name": "enabled", "extract": "(true|1)", "type": "string", "unit": "" }
          ]
        }
      ]
    }
  ],
  "flows": [
    { "id": "step_1_init", "name": "BLE/GAP初始化", "pattern": "ble_gap_init" },
    { "id": "step_2_gatt_register", "name": "GATT服务注册(0xFAA0)", "pattern": "gatt_service_register" },
    { "id": "step_3_adv_register", "name": "广播Handler注册", "pattern": "adv_register" },
    { "id": "step_4_adv_start", "name": "BLE广播启动", "pattern": "adv_start" },
    { "id": "step_5_adv_data", "name": "广播数据填充(电量/UUID/厂商)", "pattern": "adv_data_fill" },
    { "id": "step_6_conn_establish", "name": "GAP连接建立", "pattern": "conn_opened_gap" },
    { "id": "step_7_conn_event", "name": "连接事件处理", "pattern": "conn_handle_event" },
    { "id": "step_8_rpa_resolve", "name": "RPA地址解析(IRK)", "pattern": "rpa_resolved" },
    { "id": "step_9_gatt_conn", "name": "GATT连接通知", "pattern": "gatt_conn_opened" },
    { "id": "step_10_conn_type", "name": "连接类型判定(BT/BLE ACL)", "pattern": "conn_type" },
    { "id": "step_11_irk_match", "name": "IRK地址匹配", "pattern": "irk_match" },
    { "id": "step_12_device_bind", "name": "设备绑定(SPP/互斥/Fallback)", "pattern": "spp_binding" },
    { "id": "step_13_cccd_subscribe", "name": "CCCD订阅(Notify开启)", "pattern": "cccd_subscribe" },
    { "id": "step_14_mtu", "name": "MTU协商", "pattern": "mtu_exchange" },
    { "id": "step_15_data_ready", "name": "数据通道就绪", "pattern": "data_rx" }
  ]
};
