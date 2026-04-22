/**
 * RS Log Analyzer - 虚拟滚动引擎
 * 只渲染可见区域的日志行，支持百万级数据流畅滚动
 */

class VirtualScroller {
  constructor(options) {
    this.viewport = options.viewport;        // 滚动容器
    this.container = options.container;      // 内容容器
    this.spacer = options.spacer;            // 占位元素
    this.itemHeight = options.itemHeight || 26; // 每行高度
    this.bufferSize = options.bufferSize || 10; // 上下缓冲行数
    
    this.items = [];           // 所有数据项
    this.visibleItems = [];    // 当前可见的数据项
    this.scrollTop = 0;        // 当前滚动位置
    
    this.renderCallback = options.onRender;  // 渲染回调
    
    this._bindEvents();
  }

  /**
   * 绑定滚动事件
   */
  _bindEvents() {
    this.viewport.addEventListener('scroll', Utils.debounce(() => {
      this.scrollTop = this.viewport.scrollTop;
      this._updateVisibleItems();
    }, 16)); // 约60fps

    // 窗口大小变化时重新计算
    window.addEventListener('resize', Utils.debounce(() => {
      this._updateVisibleItems();
    }, 100));
  }

  /**
   * 设置数据
   */
  setItems(items) {
    this.items = items;
    this._updateSpacerHeight();
    this._updateVisibleItems();
  }

  /**
   * 更新占位元素高度
   */
  _updateSpacerHeight() {
    const totalHeight = this.items.length * this.itemHeight;
    this.spacer.style.height = `${totalHeight}px`;
  }

  /**
   * 计算可见区域
   */
  _updateVisibleItems() {
    const viewportHeight = this.viewport.clientHeight;
    
    // 计算可见范围
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + viewportHeight) / this.itemHeight) + this.bufferSize
    );

    // 提取可见数据
    const visibleItems = this.items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index
    }));

    // 检查是否需要重新渲染
    if (this._shouldRerender(visibleItems)) {
      this.visibleItems = visibleItems;
      this._render(startIndex);
    }
  }

  /**
   * 判断是否需要重新渲染
   */
  _shouldRerender(newVisibleItems) {
    if (this.visibleItems.length !== newVisibleItems.length) {
      return true;
    }
    
    for (let i = 0; i < newVisibleItems.length; i++) {
      if (this.visibleItems[i].lineNum !== newVisibleItems[i].lineNum) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 渲染可见项
   */
  _render(startIndex) {
    // 清空容器
    this.container.innerHTML = '';
    
    // 设置容器位置
    const offsetTop = startIndex * this.itemHeight;
    this.container.style.transform = `translateY(${offsetTop}px)`;

    // 渲染每个可见项
    const fragment = document.createDocumentFragment();
    
    for (const item of this.visibleItems) {
      const element = this.renderCallback(item);
      if (element) {
        element.style.position = 'absolute';
        element.style.top = `${(item.virtualIndex - startIndex) * this.itemHeight}px`;
        element.style.left = '0';
        element.style.right = '0';
        element.style.height = `${this.itemHeight}px`;
        fragment.appendChild(element);
      }
    }
    
    this.container.appendChild(fragment);
  }

  /**
   * 滚动到指定索引（显示在视口中间）
   */
  scrollToIndex(index) {
    const viewportHeight = this.viewport.clientHeight;
    // 计算使目标行位于视口中间的滚动位置
    const targetScroll = index * this.itemHeight - (viewportHeight / 2) + (this.itemHeight / 2);
    
    this.viewport.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
    
    // 高亮目标行（等待滚动动画完成后）
    setTimeout(() => {
      this._highlightLineByIndex(index);
    }, 400);
  }

  /**
   * 滚动到指定行号（显示在视口中间）
   */
  scrollToLine(lineNum) {
    const viewportHeight = this.viewport.clientHeight;
    // 计算使目标行位于视口中间的滚动位置
    // 注意：这里的lineNum是原始行号，需要根据items中的索引来计算
    const itemIndex = this.items.findIndex(item => item.lineNum === lineNum);
    if (itemIndex === -1) return;
    
    const targetScroll = itemIndex * this.itemHeight - (viewportHeight / 2) + (this.itemHeight / 2);
    
    this.viewport.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
    
    // 高亮目标行（等待滚动动画完成后）
    setTimeout(() => {
      this._highlightLineByIndex(itemIndex);
    }, 400);
  }

  /**
   * 高亮指定行（带模块说明）
   */
  _highlightLine(lineNum) {
    const lines = this.container.querySelectorAll('.log-line');
    for (const line of lines) {
      if (line.dataset.lineNum == lineNum) {
        line.classList.add('highlighted');
        
        // 添加临时标签显示模块信息
        const existingBadge = line.querySelector('.nav-badge');
        if (existingBadge) existingBadge.remove();
        
        // 从log-line-text的title属性获取说明
        const textEl = line.querySelector('.log-line-text');
        if (textEl && textEl.title) {
          const badge = document.createElement('span');
          badge.className = 'nav-badge';
          badge.textContent = textEl.title;
          line.appendChild(badge);
          
          // 3秒后移除高亮和标签
          setTimeout(() => {
            line.classList.remove('highlighted');
            badge.remove();
          }, 3000);
        } else {
          setTimeout(() => {
            line.classList.remove('highlighted');
          }, 2000);
        }
        break;
      }
    }
  }

  /**
   * 根据索引高亮指定行（带模块说明）
   */
  _highlightLineByIndex(index) {
    const item = this.items[index];
    if (!item) return;
    
    const lines = this.container.querySelectorAll('.log-line');
    for (const line of lines) {
      if (line.dataset.lineNum == item.lineNum) {
        line.classList.add('highlighted');
        
        // 添加临时标签显示模块信息
        const existingBadge = line.querySelector('.nav-badge');
        if (existingBadge) existingBadge.remove();
        
        // 从log-line-text的title属性获取说明
        const textEl = line.querySelector('.log-line-text');
        if (textEl && textEl.title) {
          const badge = document.createElement('span');
          badge.className = 'nav-badge';
          badge.textContent = textEl.title;
          line.appendChild(badge);
          
          // 3秒后移除高亮和标签
          setTimeout(() => {
            line.classList.remove('highlighted');
            badge.remove();
          }, 3000);
        } else {
          setTimeout(() => {
            line.classList.remove('highlighted');
          }, 2000);
        }
        break;
      }
    }
  }

  /**
   * 刷新显示（数据变化时调用）
   */
  refresh() {
    this._updateSpacerHeight();
    this._updateVisibleItems();
  }

  /**
   * 获取当前可见范围
   */
  getVisibleRange() {
    const viewportHeight = this.viewport.clientHeight;
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.ceil((this.scrollTop + viewportHeight) / this.itemHeight);
    return { startIndex, endIndex };
  }

  /**
   * 销毁
   */
  destroy() {
    this.viewport.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
  }
}

// 导出到全局
window.VirtualScroller = VirtualScroller;
