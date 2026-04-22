window.__PLUGIN_health_monitor = {
  "meta": {
    "name": "健康监测分析器",
    "version": "1.0.0",
    "author": "RS AI",
    "description": "分析日常活动、心率、血氧监测的完整生命周期，包含传感器开关、APP指令交互、主动测量、TWS同步和健康告警日志"
  },
  "modules": [
    {
      "id": "normal_activity",
      "name": "日常活动监测",
      "icon": "🚶",
      "category": "sport",
      "description": "全天步数、距离、卡路里记录与TWS同步",
      "patterns": [
        {
          "id": "na_update",
          "match": "\\[RS\\]\\[Motion\\]normal_activity_update distance(\\d+), consumption(\\d+), step(\\d+)",
          "description": "日常活动数据更新（每2分钟）",
          "variables": [
            { "name": "distance", "extract": "\\1", "type": "number", "unit": "m" },
            { "name": "calories", "extract": "\\2", "type": "number", "unit": "Kcal" },
            { "name": "steps", "extract": "\\3", "type": "number", "unit": "steps" }
          ]
        },
        {
          "id": "na_tws_sent",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]sent daily activity: steps=(\\d+), dist=(\\d+)m, cal=(\\d+)",
          "description": "主耳TWS同步日常活动数据到从耳",
          "variables": [
            { "name": "steps", "extract": "\\1", "type": "number" },
            { "name": "distance", "extract": "\\2", "type": "number", "unit": "m" },
            { "name": "calories", "extract": "\\3", "type": "number", "unit": "Kcal" }
          ]
        },
        {
          "id": "na_tws_recv",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]recv daily activity: steps=(\\d+), dist=(\\d+)m, cal=(\\d+)",
          "description": "从耳接收日常活动TWS同步数据",
          "variables": [
            { "name": "steps", "extract": "\\1", "type": "number" },
            { "name": "distance", "extract": "\\2", "type": "number", "unit": "m" },
            { "name": "calories", "extract": "\\3", "type": "number", "unit": "Kcal" }
          ]
        }
      ]
    },
    {
      "id": "heart_rate",
      "name": "心率监测",
      "icon": "❤️",
      "category": "sensor",
      "description": "心率监测完整生命周期：初始化、启动、实时更新、数据保存、停止",
      "patterns": [
        {
          "id": "hr_init",
          "match": "\\[RS\\]\\[Motion\\]heart_rate_init",
          "description": "心率监测模块初始化"
        },
        {
          "id": "hr_start_success",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_start: SUCCESS \\(hr_enabled=(\\d+)\\)",
          "description": "心率功能启动成功",
          "variables": [
            { "name": "wbd_enabled", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "hr_start_fail_wear",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_start: FAILED - not wearing",
          "description": "心率启动失败：未佩戴"
        },
        {
          "id": "hr_start_wbd_retry",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_start: WBD layer enabled after (\\d+)ms",
          "description": "WBD心率传感器延迟启用成功",
          "variables": [
            { "name": "delay_ms", "extract": "\\1", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "hr_start_wbd_timeout",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_start: WBD layer did not enable HR after 500ms",
          "description": "WBD心率传感器启用超时（轮询将重试）"
        },
        {
          "id": "hr_stop",
          "match": "\\[RS\\]\\[Motion\\]heart_rate_stop$",
          "description": "心率功能停止"
        },
        {
          "id": "hr_stop_running_data",
          "match": "\\[RS\\]\\[Motion\\]heart_rate_stop running , data: (\\d+)",
          "description": "心率监测模式运行时数据记录",
          "variables": [
            { "name": "heart_rate", "extract": "\\1", "type": "number", "unit": "bpm" }
          ]
        },
        {
          "id": "hr_update_not_wearing",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_update: not wearing, reporting measurement failure",
          "description": "未佩戴状态下上报测量失败"
        },
        {
          "id": "hr_update_timeout",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_update: measurement timeout after (\\d+) ms",
          "description": "主动测量30秒超时",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "hr_update_auto_stop",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] heart_rate_update: auto-stopping heart rate function",
          "description": "心率因未佩戴或超时自动关闭"
        },
        {
          "id": "hr_manual_save",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] manual measurement: saved data to cache, count=(\\d+), hr=(\\d+), time=(\\d+):(\\d+)",
          "description": "主动/监测模式心率数据保存到缓存",
          "variables": [
            { "name": "count", "extract": "\\1", "type": "number" },
            { "name": "heart_rate", "extract": "\\2", "type": "number", "unit": "bpm" },
            { "name": "hour", "extract": "\\3", "type": "number" },
            { "name": "minute", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "hr_stop_save",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] manual measurement stopped: saved last valid value to cache, count=(\\d+), hr=(\\d+)",
          "description": "停止时保存最后有效心率值",
          "variables": [
            { "name": "count", "extract": "\\1", "type": "number" },
            { "name": "heart_rate", "extract": "\\2", "type": "number", "unit": "bpm" }
          ]
        },
        {
          "id": "hr_using_last_valid",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] manual measurement: current value invalid, using last valid value=(\\d+)",
          "description": "当前值无效，使用最近一次有效值保存",
          "variables": [
            { "name": "heart_rate", "extract": "\\1", "type": "number", "unit": "bpm" }
          ]
        },
        {
          "id": "hr_array_full",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] WARNING: heart_rate array full \\(200\\)",
          "description": "心率数据数组已满（200条），无法继续保存"
        },
        {
          "id": "hr_active_session_start",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] active measurement session started",
          "description": "主动测量会话开始"
        },
        {
          "id": "hr_active_session_end",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] active measurement session ended",
          "description": "主动测量会话结束（监测继续）"
        }
      ]
    },
    {
      "id": "oximetry",
      "name": "血氧监测",
      "icon": "🫁",
      "category": "sensor",
      "description": "血氧监测完整生命周期，与心率共享WBD传感器但模式不同",
      "patterns": [
        {
          "id": "spo2_init",
          "match": "\\[RS\\]\\[Motion\\]oximetry_init",
          "description": "血氧监测模块初始化"
        },
        {
          "id": "spo2_start_success",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_start: SUCCESS \\(spo2_enabled=(\\d+)\\)",
          "description": "血氧功能启动成功",
          "variables": [
            { "name": "wbd_enabled", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "spo2_start_fail_wear",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_start: FAILED - not wearing",
          "description": "血氧启动失败：未佩戴"
        },
        {
          "id": "spo2_start_wbd_retry",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_start: WBD layer enabled after (\\d+)ms",
          "description": "WBD血氧传感器延迟启用成功",
          "variables": [
            { "name": "delay_ms", "extract": "\\1", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "spo2_start_wbd_timeout",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_start: WBD layer did not enable SpO2 after 500ms",
          "description": "WBD血氧传感器启用超时（轮询将重试）"
        },
        {
          "id": "spo2_stop",
          "match": "\\[RS\\]\\[Motion\\]oximetry_stop$",
          "description": "血氧功能停止"
        },
        {
          "id": "spo2_stop_running_data",
          "match": "\\[RS\\]\\[Motion\\]oximetry running , data: (\\d+)",
          "description": "血氧监测模式运行时数据记录",
          "variables": [
            { "name": "spo2", "extract": "\\1", "type": "number", "unit": "%" }
          ]
        },
        {
          "id": "spo2_update_not_wearing",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_update: not wearing, reporting measurement failure",
          "description": "未佩戴状态下上报血氧测量失败"
        },
        {
          "id": "spo2_update_timeout",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_update: measurement timeout after (\\d+) ms",
          "description": "血氧主动测量30秒超时",
          "variables": [
            { "name": "elapsed_ms", "extract": "\\1", "type": "number", "unit": "ms" }
          ]
        },
        {
          "id": "spo2_update_auto_stop",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] oximetry_update: auto-stopping oximetry function",
          "description": "血氧因未佩戴或超时自动关闭"
        },
        {
          "id": "spo2_manual_save",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] manual measurement: saved data to cache, count=(\\d+), spo2=(\\d+), time=(\\d+):(\\d+)",
          "description": "主动/监测模式血氧数据保存到缓存",
          "variables": [
            { "name": "count", "extract": "\\1", "type": "number" },
            { "name": "spo2", "extract": "\\2", "type": "number", "unit": "%" },
            { "name": "hour", "extract": "\\3", "type": "number" },
            { "name": "minute", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "spo2_stop_save",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] manual measurement stopped: saved last valid value to cache, count=(\\d+), spo2=(\\d+)",
          "description": "停止时保存最后有效血氧值",
          "variables": [
            { "name": "count", "extract": "\\1", "type": "number" },
            { "name": "spo2", "extract": "\\2", "type": "number", "unit": "%" }
          ]
        },
        {
          "id": "spo2_using_last_valid",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] manual measurement: current value invalid, using last valid value=(\\d+)",
          "description": "当前值无效，使用最近一次有效血氧值保存",
          "variables": [
            { "name": "spo2", "extract": "\\1", "type": "number", "unit": "%" }
          ]
        },
        {
          "id": "spo2_array_full",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] WARNING: blood_oxygen array full \\(200\\)",
          "description": "血氧数据数组已满（200条），无法继续保存"
        },
        {
          "id": "spo2_active_session_start",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] active measurement session started",
          "description": "血氧主动测量会话开始"
        },
        {
          "id": "spo2_active_session_end",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] active measurement session ended",
          "description": "血氧主动测量会话结束（监测继续）"
        }
      ]
    },
    {
      "id": "sensor_control",
      "name": "传感器开关",
      "icon": "🔌",
      "category": "sensor",
      "description": "WBD层心率/血氧传感器硬件开关控制",
      "patterns": [
        {
          "id": "sensor_hr_open",
          "match": "\\[MotionAdapter\\] Open heart rate sensor \\(HR only mode\\)",
          "description": "打开心率传感器（仅心率模式）"
        },
        {
          "id": "sensor_spo2_open",
          "match": "\\[MotionAdapter\\] Open oximetry sensor \\(HR \+ SpO2 mode\\)",
          "description": "打开血氧传感器（心率+血氧模式）"
        },
        {
          "id": "sensor_spo2_close_keep_hr",
          "match": "\\[MotionAdapter\\] Close SpO2, keep HR only mode",
          "description": "关闭血氧，保留心率-only模式"
        },
        {
          "id": "sensor_all_close",
          "match": "\\[MotionAdapter\\] Close both HR and SpO2 sensors",
          "description": "完全关闭心率和血氧传感器"
        }
      ]
    },
    {
      "id": "manager",
      "name": "监测管理器",
      "icon": "⚙️",
      "category": "system",
      "description": "APP指令效果：主动测量、临时启用、主从切换锁定",
      "patterns": [
        {
          "id": "mgr_hr_temp_enable",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] HR temporarily enabled by manual measure",
          "description": "APP主动测量临时启用心率监测"
        },
        {
          "id": "mgr_spo2_temp_enable",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] SPO2 temporarily enabled by manual measure",
          "description": "APP主动测量临时启用血氧监测"
        },
        {
          "id": "mgr_hr_lock",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] HR manual measure: locked role switch",
          "description": "心率主动测量锁定主从切换（防止切换中断测量）"
        },
        {
          "id": "mgr_hr_unlock",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] HR manual measure: unlocked role switch",
          "description": "心率主动测量解锁主从切换"
        },
        {
          "id": "mgr_spo2_lock",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] SPO2 manual measure: locked role switch",
          "description": "血氧主动测量锁定主从切换"
        },
        {
          "id": "mgr_spo2_unlock",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] SPO2 manual measure: unlocked role switch",
          "description": "血氧主动测量解锁主从切换"
        },
        {
          "id": "mgr_hr_stop_temp",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] HR monitoring stopped \\(was temporarily enabled by manual measure\\)",
          "description": "临时启用的心率监测随主动测量关闭而停止"
        },
        {
          "id": "mgr_hr_keep",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] HR monitoring kept running \\(user enabled\\)",
          "description": "用户手动开启的心率监测在主动测量关闭后保持运行"
        },
        {
          "id": "mgr_spo2_stop_temp",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] SPO2 monitoring stopped \\(was temporarily enabled by manual measure\\)",
          "description": "临时启用的血氧监测随主动测量关闭而停止"
        },
        {
          "id": "mgr_spo2_keep",
          "match": "\\[RS\\]\\[Motion\\]\\[Manager\\] SPO2 monitoring kept running \\(user enabled\\)",
          "description": "用户手动开启的血氧监测在主动测量关闭后保持运行"
        }
      ]
    },
    {
      "id": "alert",
      "name": "健康告警",
      "icon": "🚨",
      "category": "error",
      "description": "心率过高/过低、血氧过低告警触发与清除",
      "patterns": [
        {
          "id": "alert_play",
          "match": "\\[RS\\]\\[Motion\\]\\[ALERT\\] type=(\\d+) played count=(\\d+)/(\\d+)",
          "description": "健康告警触发播放（语音提醒）",
          "variables": [
            { "name": "alert_type", "extract": "\\1", "type": "number" },
            { "name": "play_count", "extract": "\\2", "type": "number" },
            { "name": "max_count", "extract": "\\3", "type": "number" }
          ]
        },
        {
          "id": "alert_clear",
          "match": "\\[RS\\]\\[Motion\\]\\[ALERT\\] type=(\\d+) cycle ended, enter cooldown",
          "description": "告警条件消失，进入冷却",
          "variables": [
            { "name": "alert_type", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "alert_dismiss",
          "match": "\\[RS\\]\\[Motion\\]\\[ALERT\\] type=(\\d+) dismissed by user",
          "description": "用户手动消除告警",
          "variables": [
            { "name": "alert_type", "extract": "\\1", "type": "number" }
          ]
        },
        {
          "id": "alert_hr_reset",
          "match": "\\[RS\\]\\[Motion\\]\\[HR\\] Alert buffer reset",
          "description": "心率告警检测缓冲区重置"
        },
        {
          "id": "alert_spo2_reset",
          "match": "\\[RS\\]\\[Motion\\]\\[SPO2\\] Alert buffer reset",
          "description": "血氧告警检测缓冲区重置"
        }
      ]
    },
    {
      "id": "tws_sync",
      "name": "TWS数据同步",
      "icon": "📡",
      "category": "tws",
      "description": "主从耳之间同步日常活动、实时体征、运动状态",
      "patterns": [
        {
          "id": "tws_vital_sent",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]send vital: hr=(\\d+), spo2=(\\d+)",
          "description": "主耳发送实时心率/血氧体征数据到从耳",
          "variables": [
            { "name": "heart_rate", "extract": "\\1", "type": "number", "unit": "bpm" },
            { "name": "spo2", "extract": "\\2", "type": "number", "unit": "%" }
          ]
        },
        {
          "id": "tws_vital_recv",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]recv vital: ts=(\\d+), hr=(\\d+)\\(valid=(\\d+)\\), spo2=(\\d+)\\(valid=(\\d+)\\)",
          "description": "从耳接收实时体征数据",
          "variables": [
            { "name": "timestamp", "extract": "\\1", "type": "number" },
            { "name": "heart_rate", "extract": "\\2", "type": "number", "unit": "bpm" },
            { "name": "hr_valid", "extract": "\\3", "type": "number" },
            { "name": "spo2", "extract": "\\4", "type": "number", "unit": "%" },
            { "name": "spo2_valid", "extract": "\\5", "type": "number" }
          ]
        },
        {
          "id": "tws_state_sent",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]send state: ver=0x([0-9A-Fa-f]+), sporting=(\\d+), type=(\\d+), steps=(\\d+)",
          "description": "发送运动状态到从耳",
          "variables": [
            { "name": "version", "extract": "\\1", "type": "string" },
            { "name": "sporting", "extract": "\\2", "type": "number" },
            { "name": "sport_type", "extract": "\\3", "type": "number" },
            { "name": "steps", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "tws_state_recv",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]recv state: ver=0x([0-9A-Fa-f]+), sporting=(\\d+), type=(\\d+), steps=(\\d+)",
          "description": "从耳接收运动状态",
          "variables": [
            { "name": "version", "extract": "\\1", "type": "string" },
            { "name": "sporting", "extract": "\\2", "type": "number" },
            { "name": "sport_type", "extract": "\\3", "type": "number" },
            { "name": "steps", "extract": "\\4", "type": "number" }
          ]
        },
        {
          "id": "tws_role_switch_resume_hr",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]Resume heart_rate after role switch",
          "description": "主从切换后恢复心率监测"
        },
        {
          "id": "tws_role_switch_resume_spo2",
          "match": "\\[RS\\]\\[Motion\\]\\[TWS_SYNC\\]Resume sit_remind after role switch",
          "description": "主从切换后恢复久坐提醒"
        }
      ]
    },
    {
      "id": "app_notify",
      "name": "APP通知上报",
      "icon": "📲",
      "category": "info",
      "description": "向APP上报历史心率/血氧数据结果",
      "patterns": [
        {
          "id": "notify_hr_send",
          "match": "\\[RS\\]\\[Motion\\]\\[NOTIFY\\] Send HR data notification \\(read from Flash history\\)",
          "description": "开始发送心率历史数据通知到APP"
        },
        {
          "id": "notify_hr_result",
          "match": "\\[RS\\]\\[Motion\\]\\[NOTIFY\\] HR data notification sent: (success|failed)",
          "description": "心率历史数据通知发送结果",
          "variables": [
            { "name": "result", "extract": "\\1", "type": "string" }
          ]
        }
      ]
    }
  ],
  "flows": [
    { "id": "step_1", "name": "APP开启心率监测", "pattern": "mgr_hr_temp_enable", "description": "APP发送监测开启指令或主动测量触发临时启用" },
    { "id": "step_2", "name": "WBD打开心率传感器", "pattern": "sensor_hr_open", "description": "Adapter层调用WBD API启用心率传感器" },
    { "id": "step_3", "name": "心率功能启动", "pattern": "hr_start_success", "description": "心率功能进入RUNNING状态，轮询开始" },
    { "id": "step_4", "name": "实时数据更新", "pattern": "hr_stop_running_data", "description": "心率监测模式下定期数据记录（每10分钟保存+每秒上报）" },
    { "id": "step_5", "name": "APP开启主动测量", "pattern": "mgr_hr_lock", "description": "APP发送主动测量指令，锁定主从切换" },
    { "id": "step_6", "name": "主动测量会话开始", "pattern": "hr_active_session_start", "description": "标记主动测量会话，开始每分钟保存数据" },
    { "id": "step_7", "name": "心率数据保存", "pattern": "hr_manual_save", "description": "有效心率值保存到Flash缓存（每分钟/每10分钟）" },
    { "id": "step_8", "name": "TWS同步体征数据", "pattern": "tws_vital_sent", "description": "主耳将心率数据同步到从耳" },
    { "id": "step_9", "name": "APP关闭主动测量", "pattern": "mgr_hr_unlock", "description": "主动测量结束，解锁主从切换" },
    { "id": "step_10", "name": "心率功能停止", "pattern": "hr_stop", "description": "心率监测完全停止" },
    { "id": "step_11", "name": "传感器关闭", "pattern": "sensor_all_close", "description": "WBD层关闭心率传感器" },
    { "id": "step_20", "name": "日常活动更新", "pattern": "na_update", "description": "记录全天步数、距离、卡路里" },
    { "id": "step_21", "name": "日常活动TWS同步", "pattern": "na_tws_sent", "description": "主耳每分钟同步日常活动数据到从耳" },
    { "id": "step_30", "name": "心率告警触发", "pattern": "alert_play", "description": "检测到心率过高/过低，触发语音提醒" },
    { "id": "step_31", "name": "告警条件消失", "pattern": "alert_clear", "description": "心率恢复正常，告警进入冷却" }
  ]
};
