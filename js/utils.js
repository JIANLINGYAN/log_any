/**
 * RS Log Analyzer - 核心工具函数
 */

const Utils = {
  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 正则表达式转义
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 格式化数字
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * 高亮文本中的匹配项
   */
  highlightText(html, query) {
    if (!query) return html;
    const escaped = this.escapeRegExp(query);
    const regex = new RegExp(`(${escaped})`, 'gi');
    return html.replace(regex, '<span class="match-hl">$1</span>');
  },

  /**
   * 正则高亮文本（支持正则对象，高亮所有匹配）
   */
  highlightTextRegex(html, regex) {
    if (!regex) return html;
    // 确保使用全局标志
    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    return html.replace(globalRegex, (match) => {
      return `<mark class="regex-highlight">${this.escapeHtml(match)}</mark>`;
    });
  },

  /**
   * 高亮变量值
   */
  highlightVariables(html, variables) {
    let result = html;
    for (const [name, value] of Object.entries(variables)) {
      if (value && value !== '0') {
        const escaped = this.escapeRegExp(String(value));
        const regex = new RegExp(`(${escaped})`, 'g');
        result = result.replace(regex, '<span class="var-hl">$1</span>');
      }
    }
    return result;
  },

  /**
   * 显示Toast提示
   */
  showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /**
   * 下载文件
   */
  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// 导出到全局
window.Utils = Utils;
