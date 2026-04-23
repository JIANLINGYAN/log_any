/**
 * RS Log Analyzer - 主应用
 */

class LogAnalyzerApp {
  constructor() {
    // 状态
    this.plugins = [];
    this.allPlugins = []; // 所有可用插件（包括未启用的）
    this.logEntries = [];
    this.filteredEntries = [];
    this.activeModuleIds = new Set();
    this.searchQuery = '';
    this.collapsedModules = new Set();
    this.pluginConfig = {}; // 插件启用配置
    this.searchRegex = null; // 正则搜索对象
    
    // 范围选择
    this.rangeStart = null;
    this.rangeEnd = null;
    
    // 虚拟滚动器
    this.scroller = null;
    
    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.initVirtualScroller();
    this.bindEvents();
    this.loadExamplePlugin();
  }

  /**
   * 初始化虚拟滚动
   */
  initVirtualScroller() {
    const viewport = document.getElementById('logViewport');
    const container = document.getElementById('logContainer');
    const spacer = document.getElementById('logSpacer');
    
    this.scroller = new VirtualScroller({
      viewport,
      container,
      spacer,
      itemHeight: 26,
      bufferSize: 15,
      onRender: (item) => this.renderLogLine(item)
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 文件输入 - 只有日志输入
    const logInput = document.getElementById('logInput');
    if (logInput) {
      logInput.addEventListener('change', (e) => this.handleLogLoad(e));
    }
    
    // 搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchQuery = e.target.value.trim();
        this.applyFilters();
      }, 150));
    }
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const si = document.getElementById('searchInput');
        if (si) si.focus();
      }
      if (e.key === 'Escape') {
        closeModal();
        const si = document.getElementById('searchInput');
        if (si) si.blur();
      }
    });
  }

  /**
   * 加载插件
   */
  async handlePluginLoad(e) {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        if (!json.meta || !json.modules) {
          Utils.showToast('无效的插件格式: ' + file.name);
          continue;
        }
        
        // 预编译正则
        this.compilePluginPatterns(json);
        this.plugins.push(json);
        
        Utils.showToast('已加载插件: ' + json.meta.name);
      } catch (err) {
        Utils.showToast('解析失败: ' + file.name + ' - ' + err.message);
      }
    }
    
    this.renderPluginInfo();
    this.renderModuleList();
    
    if (this.logEntries.length > 0) {
      this.reprocessLogs();
    }
    
    e.target.value = '';
  }

  /**
   * 编译插件正则
   */
  compilePluginPatterns(plugin) {
    plugin.modules.forEach(mod => {
      mod._compiledPatterns = mod.patterns.map(p => {
        try {
          return {
            ...p,
            regex: new RegExp(p.match, 'i'),
            varRegexes: p.variables ? p.variables.map(v => ({
              ...v,
              regex: new RegExp(v.extract, 'i')
            })) : []
          };
        } catch (err) {
          console.warn('Bad regex in pattern:', p.id, err);
          return null;
        }
      }).filter(Boolean);
    });
    
    if (plugin.flows) {
      plugin.flows.forEach(step => {
        const pat = plugin.modules
          .flatMap(m => m._compiledPatterns)
          .find(p => p.id === step.pattern);
        step._regex = pat ? pat.regex : null;
      });
    }
  }

  /**
   * 加载日志
   */
  async handleLogLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    this.showLoading('正在读取文件...');
    
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      
      this.showLoading(`正在处理 ${lines.length} 行日志...`);
      
      // 使用setTimeout让UI有机会更新
      setTimeout(() => {
        this.processLogs(lines);
        this.hideLoading();
        Utils.showToast('已导入 ' + lines.length + ' 行日志');
      }, 100);
      
    } catch (err) {
      this.hideLoading();
      Utils.showToast('读取失败: ' + err.message);
    }
    
    e.target.value = '';
  }

  /**
   * 处理日志
   */
  processLogs(lines) {
    // 创建日志条目
    this.logEntries = lines.map((line, i) => ({
      lineNum: i + 1,
      raw: line,
      moduleId: null,
      patternId: null,
      variables: {},
      category: 'default'
    }));
    
    // 如果有插件，进行匹配
    if (this.plugins.length > 0) {
      this.matchLogEntries();
    }
    
    // 清空所有选中状态 - 需要用户手动选择模块
    this.activeModuleIds.clear();
    
    this.applyFilters();
    this.renderModuleList();
    this.renderFlow();
  }

  /**
   * 匹配日志条目
   */
  matchLogEntries() {
    for (const entry of this.logEntries) {
      for (const plugin of this.plugins) {
        if (entry.moduleId) break;
        
        for (const mod of plugin.modules) {
          if (entry.moduleId) break;
          
          for (const pat of mod._compiledPatterns) {
            const m = entry.raw.match(pat.regex);
            if (m) {
              entry.moduleId = mod.id;
              entry.patternId = pat.id;
              entry.category = mod.category || 'default';
              
              // 提取变量
              if (pat.variables) {
                pat.variables.forEach((v, i) => {
                  if (m[i + 1] !== undefined) {
                    entry.variables[v.name] = m[i + 1];
                  }
                });
              }
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 重新处理日志
   */
  reprocessLogs() {
    this.logEntries.forEach(entry => {
      entry.moduleId = null;
      entry.patternId = null;
      entry.variables = {};
      entry.category = 'default';
    });
    
    this.matchLogEntries();
    this.applyFilters();
    this.renderModuleList();
    this.renderFlow();
  }

  /**
   * 应用过滤
   */
  applyFilters() {
    let filtered = this.logEntries;
    
    // 模块过滤
    if (this.activeModuleIds.size > 0) {
      filtered = filtered.filter(e => 
        !e.moduleId || this.activeModuleIds.has(e.moduleId)
      );
    }
    
    // 搜索过滤（支持正则）
    this.searchRegex = null;
    if (this.searchQuery) {
      try {
        this.searchRegex = new RegExp(this.searchQuery, 'i');
        filtered = filtered.filter(e => this.searchRegex.test(e.raw));
      } catch (err) {
        // 正则无效时，回退到普通搜索
        const queryLower = this.searchQuery.toLowerCase();
        filtered = filtered.filter(e => 
          e.raw.toLowerCase().includes(queryLower)
        );
      }
    }
    
    // 范围过滤
    if (this.rangeStart !== null && this.rangeEnd !== null) {
      filtered = filtered.filter(e => e.lineNum >= this.rangeStart && e.lineNum <= this.rangeEnd);
    }
    
    this.filteredEntries = filtered;
    this.updateStats();
    this.scroller.setItems(filtered);
    this.renderNavigation();
    this.renderRangeIndicator();
  }

  /**
   * 渲染单行日志
   */
  renderLogLine(entry) {
    const div = document.createElement('div');
    const catClass = 'border-cat-' + entry.category;
    const dotCls = 'bg-cat-' + entry.category;
    
    let text = Utils.escapeHtml(entry.raw);
    
    // 正则高亮搜索词（支持所有匹配，不只是第一个）
    if (this.searchRegex) {
      text = Utils.highlightTextRegex(text, this.searchRegex);
    }
    // 高亮变量
    else if (Object.keys(entry.variables).length > 0) {
      text = Utils.highlightVariables(text, entry.variables);
    }
    
    // 构建类名
    let classes = 'log-line ' + catClass;
    if (this.rangeStart !== null && entry.lineNum === this.rangeStart) {
      classes += ' range-start';
    }
    if (this.rangeEnd !== null && entry.lineNum === this.rangeEnd) {
      classes += ' range-end';
    }
    
    div.className = classes;
    div.dataset.lineNum = entry.lineNum;
    
    // 单击打开上下文浮窗（仅在搜索过滤后显示）
    div.style.cursor = this.searchRegex ? 'pointer' : 'default';
    if (this.searchRegex) {
      div.addEventListener('click', (e) => {
        if (e.target.closest('.context-popup')) return;
        this.showContextPopup(entry);
      });
    }
    
    // 双击设置范围起点/终点
    div.addEventListener('dblclick', (e) => {
      if (e.target.closest('.context-popup')) return;
      this.setRangePoint(entry.lineNum);
    });
    
    // 如果有模块信息，添加工具提示
    let tooltip = '';
    if (entry.moduleId) {
      const module = this.findModuleById(entry.moduleId);
      if (module) {
        const pattern = module.patterns.find(p => p.id === entry.patternId);
        if (pattern) {
          tooltip = `title="${Utils.escapeHtml(module.name)} - ${Utils.escapeHtml(pattern.description || pattern.id)}"`;
        }
      }
    }
    
    div.innerHTML = `
      <span class="log-line-num">${entry.lineNum}</span>
      <span class="log-line-cat ${dotCls}"></span>
      <span class="log-line-text" ${tooltip}>${text}</span>
    `;
    
    return div;
  }

  /**
   * 更新统计
   */
  updateStats() {
    const total = this.logEntries.length;
    const shown = this.filteredEntries.length;
    
    let matched = 0;
    if (this.searchQuery) {
      const queryLower = this.searchQuery.toLowerCase();
      matched = this.logEntries.filter(e => 
        e.raw.toLowerCase().includes(queryLower)
      ).length;
    }
    
    document.getElementById('statTotal').textContent = Utils.formatNumber(total);
    document.getElementById('statShown').textContent = Utils.formatNumber(shown);
    document.getElementById('statMatched').textContent = Utils.formatNumber(matched);
  }

  /**
   * 渲染插件信息
   */
  renderPluginInfo() {
    const el = document.getElementById('pluginInfo');
    
    if (this.plugins.length === 0) {
      el.innerHTML = `
        <div class="plugin-empty">
          <span class="icon">PLUGIN</span>
          点击"加载插件"导入 JSON 配置<br>
          或点击"示例插件"查看格式
        </div>
      `;
      return;
    }
    
    el.innerHTML = this.plugins.map(p => `
      <div class="plugin-info" style="margin-bottom:8px">
        <div class="plugin-name">${Utils.escapeHtml(p.meta.name)}</div>
        <div class="plugin-meta">v${Utils.escapeHtml(p.meta.version)} ${p.meta.author ? '· ' + Utils.escapeHtml(p.meta.author) : ''}</div>
        ${p.meta.description ? `<div class="plugin-desc">${Utils.escapeHtml(p.meta.description)}</div>` : ''}
        <div class="plugin-meta" style="margin-top:4px">
          ${p.modules.length} modules · ${p.modules.reduce((s,m) => s + m.patterns.length, 0)} patterns
        </div>
      </div>
    `).join('');
  }

  /**
   * 渲染模块列表
   */
  renderModuleList() {
    const el = document.getElementById('moduleList');
    
    if (this.plugins.length === 0) {
      el.innerHTML = '<div class="plugin-empty" style="margin-top:8px">加载插件后显示模块列表</div>';
      return;
    }
    
    const allModules = this.plugins.flatMap(p => p.modules);
    
    // 统计每个模块的条目数
    const counts = {};
    this.logEntries.forEach(e => {
      if (e.moduleId) {
        counts[e.moduleId] = (counts[e.moduleId] || 0) + 1;
      }
    });
    
    el.innerHTML = allModules.map(mod => {
      const active = this.activeModuleIds.has(mod.id);
      const count = counts[mod.id] || 0;
      const catClass = 'bg-cat-' + (mod.category || 'default');
      
      return `
        <div class="module-item ${active ? 'active' : ''}" data-module="${Utils.escapeHtml(mod.id)}">
          <div class="module-check">${active ? '&#x2713;' : ''}</div>
          <div class="module-dot ${catClass}"></div>
          <div class="module-name">${Utils.escapeHtml(mod.icon || '')} ${Utils.escapeHtml(mod.name)}</div>
          <div class="module-count">${count}</div>
        </div>
      `;
    }).join('');
    
    // 绑定点击事件
    el.querySelectorAll('.module-item').forEach(item => {
      item.addEventListener('click', () => {
        const moduleId = item.dataset.module;
        this.toggleModule(moduleId);
      });
    });
  }

  /**
   * 切换模块选中状态
   */
  toggleModule(moduleId) {
    if (this.activeModuleIds.has(moduleId)) {
      this.activeModuleIds.delete(moduleId);
    } else {
      this.activeModuleIds.add(moduleId);
    }
    
    this.renderModuleList();
    this.applyFilters();
    this.renderNavigation(); // 更新导航面板
  }

  /**
   * 渲染快速导航面板
   */
  renderNavigation() {
    const panel = document.getElementById('navPanel');
    const content = document.getElementById('navContent');
    
    // 如果没有选中的模块，隐藏面板
    if (this.activeModuleIds.size === 0) {
      panel.style.display = 'none';
      return;
    }
    
    panel.style.display = '';
    
    // 按模块分组显示关键日志位置
    const moduleGroups = {};
    
    this.filteredEntries.forEach(entry => {
      if (entry.moduleId && this.activeModuleIds.has(entry.moduleId)) {
        if (!moduleGroups[entry.moduleId]) {
          moduleGroups[entry.moduleId] = [];
        }
        moduleGroups[entry.moduleId].push(entry);
      }
    });
    
    if (Object.keys(moduleGroups).length === 0) {
      content.innerHTML = `
        <div class="nav-empty">
          <div class="nav-empty-icon"></div>
          <div>暂无匹配的日志</div>
        </div>
      `;
      return;
    }
    
    // 构建导航内容
    let html = '';
    
    for (const [moduleId, entries] of Object.entries(moduleGroups)) {
      const module = this.findModuleById(moduleId);
      if (!module) continue;
      
      const catClass = 'bg-cat-' + (module.category || 'default');
      const icon = module.icon || '📄';
      
      html += `
        <div class="nav-section">
          <div class="nav-section-title">
            <span class="module-dot ${catClass}" style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>
            ${Utils.escapeHtml(module.name)} (${entries.length})
          </div>
      `;
      
      // 显示所有日志（不再限制50条）
      entries.forEach(entry => {
        // 智能预览：优先显示完整日志，过长则截断但保持可读性
        let preview;
        
        // 如果有变量，构建包含变量的高亮预览
        if (Object.keys(entry.variables).length > 0) {
          // 提取变量值并高亮显示
          const varValues = Object.values(entry.variables)
            .filter(v => v && v !== '0' && v !== 'false')
            .join(', ');
          
          // 截取日志的关键部分（前80字符）+ 变量值
          const rawPreview = entry.raw.length > 80 
            ? entry.raw.substring(0, 80) + '...' 
            : entry.raw;
          
          preview = varValues 
            ? `<span class="nav-preview-text">${Utils.escapeHtml(rawPreview)}</span><span class="nav-vars">${Utils.escapeHtml(varValues)}</span>`
            : `<span class="nav-preview-text">${Utils.escapeHtml(rawPreview)}</span>`;
        } else {
          // 没有变量，直接显示截断的日志
          preview = entry.raw.length > 80 
            ? Utils.escapeHtml(entry.raw.substring(0, 80)) + '...'
            : Utils.escapeHtml(entry.raw);
        }
        
        html += `
          <div class="nav-item" onclick="app.scrollToLine(${entry.lineNum})">
            <div class="nav-item-icon found">${icon}</div>
            <div class="nav-item-info">
              <div class="nav-item-line">Line ${entry.lineNum}</div>
              <div class="nav-item-preview">${preview}</div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    content.innerHTML = html;
  }

  /**
   * 根据ID查找模块
   */
  findModuleById(moduleId) {
    for (const plugin of this.plugins) {
      const module = plugin.modules.find(m => m.id === moduleId);
      if (module) return module;
    }
    return null;
  }

  /**
   * 关闭导航面板
   */
  closeNavigation() {
    document.getElementById('navPanel').style.display = 'none';
  }

  /**
   * 全选模块
   */
  selectAllModules() {
    this.plugins.flatMap(p => p.modules).forEach(m => {
      this.activeModuleIds.add(m.id);
    });
    this.renderModuleList();
    this.applyFilters();
  }

  /**
   * 全不选
   */
  deselectAllModules() {
    this.activeModuleIds.clear();
    this.renderModuleList();
    this.applyFilters();
  }

  /**
   * 反选
   */
  invertModuleSelection() {
    const all = this.plugins.flatMap(p => p.modules).map(m => m.id);
    all.forEach(id => {
      if (this.activeModuleIds.has(id)) {
        this.activeModuleIds.delete(id);
      } else {
        this.activeModuleIds.add(id);
      }
    });
    this.renderModuleList();
    this.applyFilters();
  }

  /**
   * 渲染流程
   */
  renderFlow() {
    const panel = document.getElementById('flowPanel');
    const list = document.getElementById('flowList');
    
    const plugin = this.plugins.find(p => p.flows && p.flows.length > 0);
    if (!plugin) {
      panel.style.display = 'none';
      return;
    }
    
    panel.style.display = '';
    
    // 检查哪些步骤已找到
    const foundSteps = new Map();
    for (const entry of this.logEntries) {
      for (const step of plugin.flows) {
        if (step._regex && step._regex.test(entry.raw)) {
          if (!foundSteps.has(step.id)) {
            foundSteps.set(step.id, {
              lineNum: entry.lineNum,
              text: entry.raw.trim().substring(0, 60)
            });
          }
        }
      }
    }
    
    list.innerHTML = plugin.flows.map((step, i) => {
      const found = foundSteps.get(step.id);
      const dotCls = found ? 'found' : 'not-found';
      
      return `
        <div class="flow-step ${found ? 'found' : ''}">
          <div class="flow-dot ${dotCls}">${i + 1}</div>
          <div class="flow-info">
            <div class="flow-name">${Utils.escapeHtml(step.name)}</div>
            ${step.description ? `<div class="flow-detail">${Utils.escapeHtml(step.description)}</div>` : ''}
            ${found ? 
              `<div class="flow-line-ref" onclick="app.scrollToLine(${found.lineNum})">
                Line ${found.lineNum}: ${Utils.escapeHtml(found.text)}...
              </div>` : 
              '<div class="flow-detail" style="color:var(--text-muted)">Not found</div>'
            }
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 滚动到指定行
   */
  scrollToLine(lineNum) {
    // 在filteredEntries中找到对应行的索引
    const index = this.filteredEntries.findIndex(e => e.lineNum === lineNum);
    
    if (index === -1) {
      console.warn('Line not found in filtered entries:', lineNum);
      Utils.showToast('该行不在当前筛选范围内，请调整筛选条件');
      return;
    }
    
    // 使用虚拟滚动器的scrollToIndex，传入在filteredEntries中的索引
    this.scroller.scrollToIndex(index);
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logEntries = [];
    this.filteredEntries = [];
    this.scroller.setItems([]);
    this.renderModuleList();
    this.renderFlow();
    this.updateStats();
    Utils.showToast('日志已清空');
  }

  /**
   * 导出过滤结果
   */
  exportFiltered() {
    if (this.filteredEntries.length === 0) {
      Utils.showToast('没有日志可导出');
      return;
    }
    
    const text = this.filteredEntries.map(e => e.raw).join('\n');
    const filename = 'filtered_log_' + Date.now() + '.txt';
    
    Utils.downloadFile(text, filename);
    Utils.showToast('已导出 ' + this.filteredEntries.length + ' 行');
  }

  /**
   * 显示加载动画
   */
  showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = text;
    overlay.classList.add('active');
  }

  /**
   * 隐藏加载动画
   */
  hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
  }

  /**
   * 加载示例插件
   */
  loadExamplePlugin() {
    // 从全局变量加载（在index.html中定义）
    if (window.EXAMPLE_PLUGIN) {
      const plugin = JSON.parse(JSON.stringify(window.EXAMPLE_PLUGIN));
      this.compilePluginPatterns(plugin);
      this.plugins.push(plugin);
      this.renderPluginInfo();
      this.renderModuleList();
    }
  }

  /**
   * 显示上下文浮窗
   */
  showContextPopup(entry) {
    const popup = document.getElementById('contextPopup');
    const overlay = document.getElementById('contextPopupOverlay');
    const body = document.getElementById('contextPopupBody');
    const lineNumEl = document.getElementById('contextLineNumber');
    const badgeEl = document.getElementById('contextModuleBadge');
    
    // 设置行号
    lineNumEl.textContent = entry.lineNum;
    
    // 设置模块标签
    if (entry.moduleId) {
      const module = this.findModuleById(entry.moduleId);
      if (module) {
        const pattern = module.patterns.find(p => p.id === entry.patternId);
        badgeEl.textContent = (module.icon || '') + ' ' + module.name + (pattern ? ' - ' + (pattern.description || '') : '');
        badgeEl.style.display = '';
      } else {
        badgeEl.style.display = 'none';
      }
    } else {
      badgeEl.style.display = 'none';
    }
    
    // 获取上下文行（扩大范围到前后各 50 行）
    const contextRange = 50;
    const currentIndex = this.logEntries.findIndex(e => e.lineNum === entry.lineNum);
    const startIdx = Math.max(0, currentIndex - contextRange);
    const endIdx = Math.min(this.logEntries.length, currentIndex + contextRange + 1);
    
    let html = '';
    for (let i = startIdx; i < endIdx; i++) {
      const ctxEntry = this.logEntries[i];
      const isTarget = ctxEntry.lineNum === entry.lineNum;
      
      // 高亮当前行
      let lineText = Utils.escapeHtml(ctxEntry.raw);
      if (this.searchRegex) {
        lineText = Utils.highlightTextRegex(lineText, this.searchRegex);
      }
      
      html += `
        <div class="context-line ${isTarget ? 'context-line-target' : ''}" 
             data-line-num="${ctxEntry.lineNum}"
             onclick="app.scrollToLine(${ctxEntry.lineNum}); app.closeContextPopup();"
             ondblclick="app.setRangePoint(${ctxEntry.lineNum}); app.closeContextPopup();">
          <span class="context-line-num">${ctxEntry.lineNum}</span>
          <span class="context-line-text">${lineText}</span>
        </div>
      `;
    }
    
    body.innerHTML = html;
    
    // 显示遮罩和浮窗
    overlay.style.display = '';
    popup.style.display = '';
    
    // 使用 requestAnimationFrame 确保动画流畅
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      popup.classList.add('active');
    });
    
    // 滚动到目标行（在浮窗内）
    const targetLine = body.querySelector('.context-line-target');
    if (targetLine) {
      setTimeout(() => {
        targetLine.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 50);
    }
  }

  /**
   * 关闭上下文浮窗
   */
  closeContextPopup() {
    const popup = document.getElementById('contextPopup');
    const overlay = document.getElementById('contextPopupOverlay');
    
    popup.classList.remove('active');
    overlay.classList.remove('active');
    
    setTimeout(() => {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    }, 200);
  }

  /**
   * 设置范围点（双击调用）
   */
  setRangePoint(lineNum) {
    if (this.rangeStart === null) {
      // 设置起点
      this.rangeStart = lineNum;
      this.rangeEnd = null;
      Utils.showToast(`🟢 已设置起点: Line ${lineNum}，双击另一行设置终点`);
    } else if (this.rangeEnd === null) {
      // 设置终点
      if (lineNum < this.rangeStart) {
        // 如果新点比起点小，交换
        this.rangeEnd = this.rangeStart;
        this.rangeStart = lineNum;
      } else {
        this.rangeEnd = lineNum;
      }
      Utils.showToast(`🔴 已框定范围: Line ${this.rangeStart} ~ Line ${this.rangeEnd} (${this.rangeEnd - this.rangeStart + 1} 行)`);
    } else {
      // 已有点，重新设置起点
      this.rangeStart = lineNum;
      this.rangeEnd = null;
      Utils.showToast(`🟢 重置起点: Line ${lineNum}，双击另一行设置终点`);
    }
    this.applyFilters();
  }

  /**
   * 清除范围
   */
  clearRange() {
    this.rangeStart = null;
    this.rangeEnd = null;
    this.applyFilters();
    Utils.showToast('已清除范围限制');
  }

  /**
   * 渲染范围指示器
   */
  renderRangeIndicator() {
    const indicator = document.getElementById('rangeIndicator');
    if (!indicator) return;
    
    if (this.rangeStart !== null && this.rangeEnd !== null) {
      indicator.innerHTML = `
        <div class="range-active">
          <span class="range-label">📐 范围:</span>
          <span class="range-value">Line ${this.rangeStart} ~ Line ${this.rangeEnd}</span>
          <button class="range-clear" onclick="app.clearRange()">✕ 清除</button>
        </div>
      `;
      indicator.style.display = '';
    } else if (this.rangeStart !== null) {
      indicator.innerHTML = `
        <div class="range-active range-partial">
          <span class="range-label">🟢 起点: Line ${this.rangeStart}</span>
          <button class="range-clear" onclick="app.clearRange()">✕ 清除</button>
        </div>
      `;
      indicator.style.display = '';
    } else {
      indicator.style.display = 'none';
    }
  }
}
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new LogAnalyzerApp();
  
  // app 初始化完成后，自动加载插件
  setTimeout(() => {
    if (typeof loadPluginsFromFolder === 'function') {
      loadPluginsFromFolder();
    }
    if (typeof loadEnabledPlugins === 'function') {
      loadEnabledPlugins();
    }
  }, 100);
});

// 暴露给全局供HTML调用
window.selectAllModules = () => app.selectAllModules();
window.deselectAllModules = () => app.deselectAllModules();
window.invertModuleSelection = () => app.invertModuleSelection();
window.clearLogs = () => app.clearLogs();
window.exportFiltered = () => app.exportFiltered();
window.scrollToLine = (lineNum) => app.scrollToLine(lineNum);
