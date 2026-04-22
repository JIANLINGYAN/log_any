window.__PLUGIN_device_context = {
  "meta": {
    "name": "设备上下文分析器",
    "version": "1.0.0",
    "author": "RS AI",
    "description": "分析BT ACL/SPP/BT GATT/BLE GATT连接、设备管理、激活切换、通道管理和TWS同步日志"
  },
  "modules": [
    {
      "id": "bt_acl",
      "name": "BT ACL连接",
      "icon": "📡",
      "category": "bluetooth",
      "description": "BT ACL连接与断开事件，通过配对记录自动识别设备",
      "patterns": [
        {
          "id": "bt_acl_connected",
          "match": "\\[RS\\]\\[DEVICE\\]BT ACL Connected: device_id=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "BT ACL连接成功，识别到新连接的设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "bt_acl_connected_slot",
          "match": "\\[RS\\]\\[DEVICE\\]BT ACL connected: slot=(\\d+), bt_device_id=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "BT ACL连接完成，设备已分配到指定slot",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_device_id", "extract": "\\2", "type": "number" },
            { "name": "bt_addr", "extract": "\\3", "type": "string" }
          ]
        },
        {
          "id": "bt_acl_no_new",
          "match": "\\[RS\\]\\[DEVICE\\]No new connected device found",
          "description": "BT ACL连接事件但未识别到新设备"
        },
        {
          "id": "bt_acl_disconnected_start",
          "match": "\\[RS\\]\\[DEVICE\\]=== \\[BLE_DBG\\] BT ACL Disconnected START ===",
          "description": "BT ACL断开处理开始"
        },
        {
          "id": "bt_acl_disconnected_found",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] FOUND disconnected device: device_id=(\\d+)",
          "description": "找到断开连接的设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "bt_acl_disconnected_not_found",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] FAIL: No disconnected device found!",
          "description": "未找到断开连接的设备（异常）"
        },
        {
          "id": "bt_acl_keep",
          "match": "\\[RS\\]\\[DEVICE\\]Device still in paired records, keep it: addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "设备仍在配对记录中，保留为断开状态",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "bt_acl_remove",
          "match": "\\[RS\\]\\[DEVICE\\]Device not in paired records, remove it: addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "设备不在配对记录中，从设备管理器移除",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "spp",
      "name": "SPP连接",
      "icon": "🔌",
      "category": "bluetooth",
      "description": "SPP串口连接与断开，支持BLE GATT Rebind",
      "patterns": [
        {
          "id": "spp_connected",
          "match": "\\[RS\\]\\[DEVICE\\]SPP Connected: spp_id=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "SPP连接成功",
          "variables": [
            { "name": "spp_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "spp_clear_old",
          "match": "\\[RS\\]\\[DEVICE\\]Clear old SPP connection: slot=(\\d+), spp_id=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "清除旧的SPP连接（限制策略）",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "old_spp_id", "extract": "\\2", "type": "number" },
            { "name": "bt_addr", "extract": "\\3", "type": "string" }
          ]
        },
        {
          "id": "spp_with_ble",
          "match": "\\[RS\\]\\[DEVICE\\]SPP connected with existing BLE GATT: slot=(\\d+), spp_id=(\\d+), conn_type=(\\d+)",
          "description": "SPP连接且已存在BLE GATT，形成混合连接",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "spp_id", "extract": "\\2", "type": "number" },
            { "name": "conn_type", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "spp_rebind_ble",
          "match": "\\[RS\\]\\[DEVICE\\]Rebind BLE GATT from slot=(\\d+) to slot=(\\d+), ble_conidx=(\\d+)",
          "description": "将BLE GATT从旧设备Rebind到新SPP设备",
          "variables": [
            { "name": "from_slot", "extract": "\\1", "type": "number" },
            { "name": "to_slot", "extract": "\\2", "type": "number" },
            { "name": "ble_conidx", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "spp_disconnected",
          "match": "\\[RS\\]\\[DEVICE\\]SPP Disconnected: spp_id=(\\d+)",
          "description": "SPP断开连接",
          "variables": [
            { "name": "spp_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "spp_not_found",
          "match": "\\[RS\\]\\[DEVICE\\]SPP device not found: spp_id=(\\d+)",
          "description": "SPP断开时未找到对应设备（异常）",
          "variables": [
            { "name": "spp_id", "extract": "\\1", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "bt_gatt",
      "name": "BT GATT连接",
      "icon": "📶",
      "category": "bluetooth",
      "description": "BT GATT(GATT_OVER_BR/EDR)连接与断开，BT GATT优先级高于BLE GATT",
      "patterns": [
        {
          "id": "bt_gatt_connected",
          "match": "\\[RS\\]\\[DEVICE\\]BT GATT Connected: bt_device_id=(\\d+), ble_conidx=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "BT GATT连接成功",
          "variables": [
            { "name": "bt_device_id", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" },
            { "name": "bt_addr", "extract": "\\3", "type": "string" }
          ]
        },
        {
          "id": "bt_gatt_disconnect_ble",
          "match": "\\[RS\\]\\[DEVICE\\]New BT GATT \\(high priority\\), disconnect BLE GATT: slot=(\\d+), addr=(\\w{2}:\\w{2}:\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "新BT GATT高优先级，强制断开BLE GATT",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "bt_gatt_old_timeout",
          "match": "\\[RS\\]\\[DEVICE\\]Old BT GATT timeout \\((\\d+) ms\\), disconnect old: slot=(\\d+)",
          "description": "旧BT GATT连接超时(>30s)，断开旧连接",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" },
            { "name": "slot", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "bt_gatt_old_active",
          "match": "\\[RS\\]\\[DEVICE\\]Old BT GATT active \\((\\d+) ms\\), disconnect self: slot=(\\d+)",
          "description": "旧BT GATT仍活跃，断开自己（互斥）",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" },
            { "name": "slot", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "bt_gatt_disconnected",
          "match": "\\[RS\\]\\[DEVICE\\]BT GATT Disconnected: bt_device_id=(\\d+)",
          "description": "BT GATT断开连接",
          "variables": [
            { "name": "bt_device_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "bt_gatt_new_conn_type",
          "match": "\\[RS\\]\\[DEVICE\\]BT GATT disconnected: slot=(\\d+), new_conn_type=(\\d+)",
          "description": "BT GATT断开后更新连接类型",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "new_conn_type", "extract": "\\2", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "ble_gatt",
      "name": "BLE GATT连接",
      "icon": "🔗",
      "category": "bluetooth",
      "description": "BLE GATT连接与断开，含IRK解析匹配、SPP优先绑定、设备类型一致性检查",
      "patterns": [
        {
          "id": "ble_gatt_connected",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT Connected: ble_conidx=(\\d+)",
          "description": "BLE GATT连接事件触发",
          "variables": [
            { "name": "ble_conidx", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "ble_solved_addr",
          "match": "\\[RS\\]\\[DEVICE\\]BLE solved addr: (\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "通过IRK解析出BLE对端地址",
          "variables": [
            { "name": "solved_addr", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "ble_irk_match",
          "match": "\\[RS\\]\\[DEVICE\\]BLE matched BT device by IRK in paired records: idx=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2}), is_connected=(\\d+)",
          "description": "IRK解析地址与配对记录中的BT设备匹配成功",
          "variables": [
            { "name": "paired_idx", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" },
            { "name": "is_connected", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "ble_irk_slot",
          "match": "\\[RS\\]\\[DEVICE\\]IRK matched device slot=(\\d+), bt_acl=(\\d+), has_spp=(\\d+)",
          "description": "IRK匹配的设备slot信息",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "has_bt_acl", "extract": "\\2", "type": "number" },
            { "name": "has_spp", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "ble_irk_has_spp",
          "match": "\\[RS\\]\\[DEVICE\\]IRK matched device has SPP, binding directly",
          "description": "IRK匹配的设备有SPP，直接绑定（SPP最准确）"
        },
        {
          "id": "ble_irk_no_spp_use_spp",
          "match": "\\[RS\\]\\[DEVICE\\]IRK matched but no SPP, found SPP device at slot=(\\d+), use SPP instead",
          "description": "IRK匹配的设备无SPP，优先绑定到已有SPP的设备",
          "variables": [
            { "name": "spp_slot", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "ble_irk_consistency_check",
          "match": "\\[RS\\]\\[DEVICE\\]IRK matched slot has BT ACL, checking consistency: slot=(\\d+), ble_is_ios=(\\d+), bt_is_ios=(\\d+)",
          "description": "IRK匹配的设备有BT ACL，检查设备类型一致性(iOS/Android)",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "ble_is_ios", "extract": "\\2", "type": "number" },
            { "name": "bt_is_ios", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "ble_irk_mismatch",
          "match": "\\[RS\\]\\[DEVICE\\]IRK mismatch: slot BT ACL is (iOS|Android) but BLE GATT is (iOS|Android), reject IRK match",
          "description": "设备类型不一致，拒绝IRK匹配",
          "variables": [
            { "name": "bt_type", "extract": "\\1", "type": "string" },
            { "name": "ble_type", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_irk_bind",
          "match": "\\[RS\\]\\[DEVICE\\]IRK matched and no other SPP device, binding to IRK matched device",
          "description": "IRK匹配成功且无其他SPP设备，绑定到IRK匹配设备"
        },
        {
          "id": "ble_solved_not_match",
          "match": "\\[RS\\]\\[DEVICE\\]BLE solved addr not matched any BT device",
          "description": "IRK解析地址未匹配到任何BT设备"
        },
        {
          "id": "ble_fallback",
          "match": "\\[RS\\]\\[DEVICE\\]BLE solved addr not available, fallback to legacy logic",
          "description": "IRK解析地址不可用，回退到传统逻辑"
        },
        {
          "id": "ble_stale_state",
          "match": "\\[RS\\]\\[DEVICE\\]Found stale BLE GATT state: slot=(\\d+), ble_conidx=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2}), clearing\\.\\.\\.",
          "description": "发现残留的BLE GATT状态，清理",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" },
            { "name": "bt_addr", "extract": "\\3", "type": "string" }
          ]
        },
        {
          "id": "ble_old_timeout",
          "match": "\\[RS\\]\\[DEVICE\\]Old BLE GATT timeout \\((\\d+) ms\\), disconnect old: slot=(\\d+)",
          "description": "旧BLE GATT连接超时(>30s)，断开旧连接",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" },
            { "name": "slot", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_old_active",
          "match": "\\[RS\\]\\[DEVICE\\]Old BLE GATT active \\((\\d+) ms\\), disconnect self: slot=(\\d+)",
          "description": "旧BLE GATT仍活跃，断开自己（互斥）",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" },
            { "name": "slot", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_spp_binding",
          "match": "\\[RS\\]\\[DEVICE\\]Found device with SPP binding: slot=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "找到有SPP绑定的设备，BLE GATT将绑定到该设备",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_with_spp",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT connected with SPP binding: slot=(\\d+), ble_conidx=(\\d+)",
          "description": "BLE GATT绑定到已有SPP的设备",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_no_spp_binding",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT no SPP binding: bt_connected_count=(\\d+), bt_connected_device_id=(\\d+)",
          "description": "BLE GATT无SPP绑定，根据BT连接情况选择设备",
          "variables": [
            { "name": "bt_connected_count", "extract": "\\1", "type": "number" },
            { "name": "bt_connected_device_id", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_fallback_mismatch",
          "match": "\\[RS\\]\\[DEVICE\\]BLE fallback: device mismatch! BT is (iOS|Android), BLE is (iOS|Android)",
          "description": "Fallback模式下检测到设备类型不一致",
          "variables": [
            { "name": "bt_type", "extract": "\\1", "type": "string" },
            { "name": "ble_type", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_fallback_slot",
          "match": "\\[RS\\]\\[DEVICE\\]BLE fallback: found (empty|paired) slot for BLE GATT: slot=(\\d+)",
          "description": "Fallback模式下找到空闲/已配对的slot",
          "variables": [
            { "name": "slot_type", "extract": "\\1", "type": "string" },
            { "name": "slot", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_fallback_no_slot",
          "match": "\\[RS\\]\\[DEVICE\\]BLE fallback: no available slot for BLE GATT, disconnect",
          "description": "Fallback模式下无可用slot，断开BLE"
        },
        {
          "id": "ble_bind_single",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT binding to single BT connected device: device_id=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "BLE GATT绑定到唯一BT连接的设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_bind_unverified",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT binding to unverified device: device_id=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "BLE GATT绑定到未IRK验证的设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_reject_illegal",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT IRK not matched, all devices verified, reject as illegal",
          "description": "所有设备都已IRK验证，拒绝非法BLE连接"
        },
        {
          "id": "ble_temp_binding",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT temp binding: device_id=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2}), ble_conidx=(\\d+), conn_type=(\\d+)",
          "description": "BLE GATT临时绑定到目标设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" },
            { "name": "ble_conidx", "extract": "\\3", "type": "number" },
            { "name": "conn_type", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "ble_disconnected",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT Disconnected: ble_conidx=(\\d+)",
          "description": "BLE GATT断开连接",
          "variables": [
            { "name": "ble_conidx", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "ble_disconnected_not_found",
          "match": "\\[RS\\]\\[DEVICE\\]BLE GATT device not found: ble_conidx=(\\d+)",
          "description": "BLE GATT断开时未找到对应设备（异常）",
          "variables": [
            { "name": "ble_conidx", "extract": "\\1", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "device_mgmt",
      "name": "设备管理",
      "icon": "📱",
      "category": "system",
      "description": "设备创建、LRU替换、激活切换和信息打印",
      "patterns": [
        {
          "id": "device_created",
          "match": "\\[RS\\]\\[DEVICE\\]Created device: slot=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "新设备创建成功",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "device_replace_lru",
          "match": "\\[RS\\]\\[DEVICE\\]Replace LRU device: slot=(\\d+), new_addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "LRU替换最久未使用的设备",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "new_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "device_all_occupied",
          "match": "\\[RS\\]\\[DEVICE\\]All slots occupied by connected devices, reject: addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "所有slot都被已连接设备占用，拒绝新设备",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "device_create_fail",
          "match": "\\[RS\\]\\[DEVICE\\]Failed to create device for (.*)",
          "description": "设备创建失败",
          "variables": [
            { "name": "reason", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "device_switch_active",
          "match": "\\[RS\\]\\[DEVICE\\]Switch active device to: (\\d+)",
          "description": "自动切换激活设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "device_no_active",
          "match": "\\[RS\\]\\[DEVICE\\]No available device to switch to",
          "description": "没有可用设备可切换为激活状态"
        },
        {
          "id": "device_manual_active",
          "match": "\\[RS\\]\\[DEVICE\\]Manually set active device: (\\d+)",
          "description": "手动设置激活设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "device_auto_active",
          "match": "\\[RS\\]\\[DEVICE\\]Auto updated active device: (\\d+) \\(data received(.*)\\)",
          "description": "数据接收触发自动更新激活设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "extra", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "device_already_active",
          "match": "\\[RS\\]\\[DEVICE\\]Device already active: (\\d+)",
          "description": "设备已经是激活状态",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "device_update_blocked",
          "match": "\\[RS\\]\\[DEVICE\\]Update blocked: app_id=(\\d+), elapsed=(\\d+) ms \\(need (\\d+) ms\\)",
          "description": "激活设备更新被防抖机制阻塞",
          "variables": [
            { "name": "app_id", "extract": "\\1", "type": "number" },
            { "name": "elapsed_ms", "extract": "\\2", "type": "number", "unit": "ms" },
            { "name": "need_ms", "extract": "\\3", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "device_info_header",
          "match": "\\[RS\\]\\[DEVICE\\]=== Device Info ===",
          "description": "设备信息打印开始"
        },
        {
          "id": "device_info_summary",
          "match": "\\[RS\\]\\[DEVICE\\](Connected count|Active device|Paired count): (\\d+)",
          "description": "设备管理器统计信息",
          "variables": [
            { "name": "field", "extract": "\\1", "type": "string" },
            { "name": "value", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "device_info_detail",
          "match": "\\[RS\\]\\[DEVICE\\]Device\\[(\\d+)\\]: bt_addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2}), state=(\\d+), bt_id=(\\d+)",
          "description": "设备基本信息",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" },
            { "name": "state", "extract": "\\3", "type": "number" },
            { "name": "bt_id", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "device_info_connections",
          "match": "\\[RS\\]\\[DEVICE\\]  has_bt_acl=(\\d+), has_spp=(\\d+)\\(spp_id=(\\d+)\\), has_ble_gatt=(\\d+)\\(ble_conidx=(\\d+)\\), has_bt_gatt=(\\d+)\\(bt_gatt_conidx=(\\d+)\\)",
          "description": "设备连接状态详情",
          "variables": [
            { "name": "has_bt_acl", "extract": "\\1", "type": "number" },
            { "name": "has_spp", "extract": "\\2", "type": "number" },
            { "name": "spp_id", "extract": "\\3", "type": "number" },
            { "name": "has_ble_gatt", "extract": "\\4", "type": "number" },
            { "name": "ble_conidx", "extract": "\\5", "type": "number" },
            { "name": "has_bt_gatt", "extract": "\\6", "type": "number" },
            { "name": "bt_gatt_conidx", "extract": "\\7", "type": "number" }
          ]
        },
        {
          "id": "device_info_misc",
          "match": "\\[RS\\]\\[DEVICE\\]  conn_type=(\\d+), is_active=(\\d+), last_active=(\\d+)",
          "description": "设备其他状态",
          "variables": [
            { "name": "conn_type", "extract": "\\1", "type": "number" },
            { "name": "is_active", "extract": "\\2", "type": "number" },
            { "name": "last_active", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "device_init",
          "match": "\\[RS\\]\\[DEVICE\\]rsAppDevice_Init",
          "description": "设备管理器初始化"
        },
        {
          "id": "device_clear_all",
          "match": "\\[RS\\]\\[DEVICE\\]rsAppDevice_ClearAll",
          "description": "清空所有设备上下文"
        }
      ]
    },
    {
      "id": "connection_close",
      "name": "连接关闭",
      "icon": "❌",
      "category": "bluetooth",
      "description": "CloseAllSubConnections子流程日志",
      "patterns": [
        {
          "id": "conn_close_start",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] CloseAllSubConnections: addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2})",
          "description": "开始关闭设备的所有附属连接",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "conn_close_null",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] CloseAllSubConnections: dev is NULL",
          "description": "关闭连接时设备指针为NULL（异常）"
        },
        {
          "id": "conn_close_ble_enter",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] >>> Enter BLE disconnect branch: has_ble_gatt=(\\d+), ble_conidx=(\\d+)",
          "description": "进入BLE GATT断开分支",
          "variables": [
            { "name": "has_ble_gatt", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "conn_close_ble_done",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] Closed BLE GATT: addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}), ble_conidx=(\\d+)",
          "description": "BLE GATT关闭完成",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "conn_close_ble_skip",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] SKIP BLE disconnect: has_ble_gatt=(\\d+), ble_conidx=(\\d+) \\(condition NOT met\\)",
          "description": "跳过BLE GATT断开（条件不满足）",
          "variables": [
            { "name": "has_ble_gatt", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "conn_close_bt_gatt",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] Closed BT GATT: addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2})",
          "description": "BT GATT关闭完成",
          "variables": [
            { "name": "bt_addr", "extract": "\\1", "type": "string" }
          ]
        },
        {
          "id": "conn_close_end",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] CloseAllSubConnections END",
          "description": "关闭所有附属连接完成"
        }
      ]
    },
    {
      "id": "channel",
      "name": "通道管理",
      "icon": "📨",
      "category": "system",
      "description": "数据收发通道管理，实现从哪来到哪去",
      "patterns": [
        {
          "id": "channel_set",
          "match": "\\[RS\\]\\[DEVICE\\]Channel set: id=(\\d+), type=(\\d+)",
          "description": "设置当前数据通道",
          "variables": [
            { "name": "channel_id", "extract": "\\1", "type": "number" },
            { "name": "channel_type", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "channel_invalid",
          "match": "\\[RS\\]\\[DEVICE\\]Channel not valid",
          "description": "当前通道无效"
        },
        {
          "id": "channel_cleared",
          "match": "\\[RS\\]\\[DEVICE\\]Channel cleared: id=(\\d+), type=(\\d+)",
          "description": "清除当前数据通道",
          "variables": [
            { "name": "channel_id", "extract": "\\1", "type": "number" },
            { "name": "channel_type", "extract": "\\2", "type": "number" }
          ]
        }
      ]
    },
    {
      "id": "paired_records",
      "name": "配对记录",
      "icon": "📋",
      "category": "bluetooth",
      "description": "配对记录缓存更新",
      "patterns": [
        {
          "id": "paired_none",
          "match": "\\[RS\\]\\[DEVICE\\]No paired devices",
          "description": "没有配对设备"
        },
        {
          "id": "paired_record",
          "match": "\\[RS\\]\\[DEVICE\\]Paired\\[(\\d+)\\]: id=(\\d+), connected=(\\d+), addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2})",
          "description": "配对记录详情",
          "variables": [
            { "name": "index", "extract": "\\1", "type": "number" },
            { "name": "device_id", "extract": "\\2", "type": "number" },
            { "name": "is_connected", "extract": "\\3", "type": "number" },
            { "name": "bt_addr", "extract": "\\4", "type": "string" }
          ]
        }
      ]
    },
    {
      "id": "tws_sync",
      "name": "TWS同步",
      "icon": "🔄",
      "category": "tws",
      "description": "主耳向从耳同步设备上下文，含防抖机制",
      "patterns": [
        {
          "id": "tws_sync_fail",
          "match": "\\[RS\\]\\[DEVICE\\]rsAppDevice_SyncToTws fail",
          "description": "TWS同步失败（未连接TWS或非主耳）"
        },
        {
          "id": "tws_sync_skipped",
          "match": "\\[RS\\]\\[DEVICE\\]TWS sync skipped: data unchanged, elapsed=(\\d+) ms \\(need (\\d+) ms\\)",
          "description": "TWS同步被跳过（数据未变且防抖间隔内）",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" },
            { "name": "need_ms", "extract": "\\2", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "tws_sync_sent",
          "match": "\\[RS\\]\\[DEVICE\\]TWS sync sent: device_count=(\\d+), active_id=(\\d+), connected=(\\d+)",
          "description": "TWS同步数据已发送",
          "variables": [
            { "name": "device_count", "extract": "\\1", "type": "number" },
            { "name": "active_id", "extract": "\\2", "type": "number" },
            { "name": "connected_count", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "tws_sync_rx",
          "match": "\\[RS\\]\\[DEVICE\\]TWS sync rx: device_count=(\\d+), active_id=(\\d+), connected=(\\d+)",
          "description": "从TWS接收到同步数据",
          "variables": [
            { "name": "device_count", "extract": "\\1", "type": "number" },
            { "name": "active_id", "extract": "\\2", "type": "number" },
            { "name": "connected_count", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "tws_sync_null",
          "match": "\\[RS\\]\\[DEVICE\\]TWS sync: NULL data",
          "description": "TWS同步数据为NULL"
        },
        {
          "id": "tws_sync_invalid",
          "match": "\\[RS\\]\\[DEVICE\\]TWS sync: invalid (device_count|active_device_id|connected_count)=(\\d+)",
          "description": "TWS同步数据校验失败",
          "variables": [
            { "name": "field", "extract": "\\1", "type": "string" },
            { "name": "value", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "tws_sync_device",
          "match": "\\[RS\\]\\[DEVICE\\]Synced device\\[(\\d+)\\]: addr=(\\w{2}:\\w{2}:\\*\\*:\\*\\*:\\w{2}:\\w{2}), state=(\\d+), has_spp=(\\d+), has_ble_gatt=(\\d+)",
          "description": "同步单个设备信息到本地",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" },
            { "name": "state", "extract": "\\3", "type": "number" },
            { "name": "has_spp", "extract": "\\4", "type": "number" },
            { "name": "has_ble_gatt", "extract": "\\5", "type": "number" }
          ]
        },
        {
          "id": "tws_periodic_trigger",
          "match": "\\[RS\\]\\[DEVICE\\]Periodic sync triggered: elapsed=(\\d+) ms",
          "description": "触发定期TWS同步",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" }
          ]
        }
      ]
    },
    {
      "id": "ble_gatt_dbg",
      "name": "BLE调试",
      "icon": "🐛",
      "category": "bluetooth",
      "description": "BLE GATT处理过程中的详细调试日志",
      "patterns": [
        {
          "id": "ble_dbg_enter",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] FindDisconnectedDevice ENTER",
          "description": "FindDisconnectedDevice入口"
        },
        {
          "id": "ble_dbg_dev_check",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\]   Check dev\\[(\\d+)\\]: bt_acl=(\\d+), addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2})",
          "description": "检查设备断开状态",
          "variables": [
            { "name": "slot", "extract": "\\1", "type": "number" },
            { "name": "bt_acl", "extract": "\\2", "type": "number" },
            { "name": "bt_addr", "extract": "\\3", "type": "string" }
          ]
        },
        {
          "id": "ble_dbg_paired_check",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\]     paired\\[(\\d+)\\]: addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}), conn=(\\d+)",
          "description": "检查配对记录中的连接状态",
          "variables": [
            { "name": "index", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" },
            { "name": "connected", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "ble_dbg_found_match",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\]     Found match in paired records, is_still_connected=true",
          "description": "在配对记录中找到匹配且仍连接"
        },
        {
          "id": "ble_dbg_not_found",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] FindDisconnectedDevice: NOT FOUND, return false",
          "description": "未找到断开设备"
        },
        {
          "id": "ble_dbg_found_dev",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] Found device: device_id=(\\d+), addr=(\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2})",
          "description": "找到断开设备",
          "variables": [
            { "name": "device_id", "extract": "\\1", "type": "number" },
            { "name": "bt_addr", "extract": "\\2", "type": "string" }
          ]
        },
        {
          "id": "ble_dbg_dev_ble",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] Device BLE: has_ble_gatt=(\\d+), ble_conidx=(\\d+)",
          "description": "设备BLE状态",
          "variables": [
            { "name": "has_ble_gatt", "extract": "\\1", "type": "number" },
            { "name": "ble_conidx", "extract": "\\2", "type": "number" }
          ]
        },
        {
          "id": "ble_dbg_dev_status",
          "match": "\\[RS\\]\\[DEVICE\\]\\[BLE_DBG\\] Device status: has_bt_gatt=(\\d+), has_spp=(\\d+)",
          "description": "设备连接状态",
          "variables": [
            { "name": "has_bt_gatt", "extract": "\\1", "type": "number" },
            { "name": "has_spp", "extract": "\\2", "type": "number" }
          ]
        }
      ]
    }
  ],
  "flows": [
    { "id": "bt_acl_connect", "name": "BT ACL连接", "pattern": "bt_acl_connected", "description": "BT ACL连接并识别设备" },
    { "id": "bt_acl_slot", "name": "设备分配", "pattern": "bt_acl_connected_slot", "description": "设备分配到slot" },
    { "id": "bt_acl_disconnect_start", "name": "BT ACL断开开始", "pattern": "bt_acl_disconnected_start", "description": "BT ACL断开处理开始" },
    { "id": "bt_acl_find_dev", "name": "查找断开设备", "pattern": "bt_acl_disconnected_found", "description": "通过配对记录找到断开设备" },
    { "id": "bt_acl_close_sub", "name": "关闭附属连接", "pattern": "conn_close_start", "description": "关闭BLE/BT GATT等附属连接" },
    { "id": "bt_acl_keep_or_remove", "name": "保留或移除", "pattern": "bt_acl_keep", "description": "根据配对记录决定保留或移除设备" },
    { "id": "spp_connect", "name": "SPP连接", "pattern": "spp_connected", "description": "SPP连接事件" },
    { "id": "spp_clear_old", "name": "清除旧SPP", "pattern": "spp_clear_old", "description": "限制策略：清除旧SPP连接" },
    { "id": "spp_rebind", "name": "BLE GATT Rebind", "pattern": "spp_rebind_ble", "description": "将BLE GATT Rebind到新SPP设备" },
    { "id": "bt_gatt_connect", "name": "BT GATT连接", "pattern": "bt_gatt_connected", "description": "BT GATT连接成功" },
    { "id": "bt_gatt_priority", "name": "高优先级处理", "pattern": "bt_gatt_disconnect_ble", "description": "BT GATT高优先级，断开BLE" },
    { "id": "ble_connect", "name": "BLE GATT连接", "pattern": "ble_gatt_connected", "description": "BLE GATT连接事件" },
    { "id": "ble_irk", "name": "IRK解析", "pattern": "ble_solved_addr", "description": "IRK解析BLE对端地址" },
    { "id": "ble_irk_match", "name": "IRK匹配", "pattern": "ble_irk_match", "description": "IRK地址与配对记录匹配" },
    { "id": "ble_irk_bind", "name": "IRK绑定", "pattern": "ble_irk_has_spp", "description": "IRK匹配设备有SPP，直接绑定" },
    { "id": "ble_fallback", "name": "Fallback处理", "pattern": "ble_spp_binding", "description": "IRK失败，回退到SPP绑定逻辑" },
    { "id": "ble_disconnect", "name": "BLE GATT断开", "pattern": "ble_disconnected", "description": "BLE GATT断开处理" },
    { "id": "device_create", "name": "设备创建", "pattern": "device_created", "description": "创建设备上下文" },
    { "id": "device_active", "name": "激活切换", "pattern": "device_switch_active", "description": "自动切换激活设备" },
    { "id": "channel_set", "name": "通道设置", "pattern": "channel_set", "description": "设置数据收发通道" },
    { "id": "tws_sync", "name": "TWS同步", "pattern": "tws_sync_sent", "description": "主耳同步设备上下文到从耳" },
    { "id": "tws_sync_rx", "name": "TWS接收", "pattern": "tws_sync_rx", "description": "从耳接收主耳设备上下文" }
  ]
};
