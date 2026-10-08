import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../../common/commonImport'

Page({
  data: {
    head: [{
        code: "time",
        name: "时间"
      },
      {
        code: "temperature",
        name: "温度"
      },
      {
        code: "humidity",
        name: "湿度"
      },
    ],
    title: '温湿度记录表',
    info: {
      list: []
    },
    param: {
      reportType: 2
    },
    timeRanges: [{
        timeRange: "08:00 ~ 10:00"
      },
      {
        timeRange: "10:00 ~ 12:00"
      },
      {
        timeRange: "12:00 ~ 14:00"
      },
      {
        timeRange: "14:00 ~ 16:00"
      },
      {
        timeRange: "16:00 ~ 18:00"
      },
      {
        timeRange: "18:00 ~ 20:00"
      },
      {
        timeRange: "20:00 ~ 22:00"
      },
      {
        timeRange: "22:00 ~ 24:00"
      },
      {
        timeRange: "24:00 ~ 02:00"
      },
      {
        timeRange: "02:00 ~ 04:00"
      },
      {
        timeRange: "04:00 ~ 06:00"
      },
      {
        timeRange: "06:00 ~ 08:00"
      },
    ],
    isScancode: false,
    gestureState: {
      scaleRatio: 1, // 缩放比例（默认1倍）
      translateX: 0, // X轴平移距离
      translateY: 0, // Y轴平移距离
      lastTouchDistance: null, // 上一次双指之间的距离
      lastScaleRatio: 1, // 上一次的缩放比例（用于连续缩放计算）
      startTouchX: 0, // 单指触摸起始X坐标
      startTouchY: 0, // 单指触摸起始Y坐标
      isMultiTouch: false, // 是否处于双指触摸状态
      containerW: 0, // 容器宽度（用于计算边界）
      containerH: 0, // 容器高度（用于计算边界）
    },
  },

  onLoad(options) {
    const month = options.month.replace('-', '');
    this.setData({
      'param.month': month,
    });
    // 获取容器宽高并更新到 gestureState 中
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      'gestureState.containerW': systemInfo.windowWidth,
      'gestureState.containerH': systemInfo.windowHeight,
    });
  },

  // 后退拦截
  handleBeforeLeave(e){
    this.setData({isScancode:false})
  },

  //原生 - input赋值
  inputSetDataDefault(e) {
    let {
      value
    } = e.detail;
    let {
      key
    } = e.currentTarget.dataset;
    this.setData({
      ['param.' + key]: value
    });
  },

  async doQuery() {
    const {
      param
    } = this.data;
    // 处理月份格式（同Vue逻辑）
    const month = param.month.slice(0, 4) + '-' + param.month.slice(4);
    const date = new Date(month);
    let info = await util.postByBeanName('sensorTF', 'getSensorDataReport', param);
    const title = `${date.getFullYear()}年${date.getMonth() + 1}月${info.location}（编号：${param.deviceAddress}）温湿度记录表`;
    this.setData({
      info,
      title,
      isScancode: true
    })
  },
  scancode(e) {
    let _this = this;
    wx.scanCode({
      success(res) {
        console.log(res)
        _this.setData({
          ['param.deviceAddress']: res.result
        })
      }
    });
  },
  /**
   * 触摸开始：记录初始状态
   */
  handleTouchStart(e) {
    const {
      gestureState
    } = this.data;

    if (e.touches.length === 2) {
      // 双指触摸：计算初始距离
      this.setData({
        'gestureState.isMultiTouch': true
      });
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const distance = this.calcDistance(x1, y1, x2, y2);

      this.setData({
        'gestureState.lastTouchDistance': distance,
        'gestureState.lastScaleRatio': gestureState.scaleRatio, // 以当前缩放为基准
      });
    } else {
      // 单指触摸：记录起始位置
      this.setData({
        'gestureState.isMultiTouch': false,
        'gestureState.startTouchX': e.touches[0].clientX,
        'gestureState.startTouchY': e.touches[0].clientY,
      });
    }
  },

  /**
   * 触摸移动：计算缩放/平移
   */
  handleTouchMove(e) {
    const {
      gestureState
    } = this.data;

    if (gestureState.isMultiTouch && e.touches.length === 2) {
      // 双指缩放逻辑
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const currentDistance = this.calcDistance(x1, y1, x2, y2);

      // 计算新缩放比例（当前距离/初始距离 * 上一次缩放比例）
      let newScale = (currentDistance / gestureState.lastTouchDistance) * gestureState.lastScaleRatio;
      // 限制缩放范围（0.5~3倍）
      newScale = Math.max(0.5, Math.min(3, newScale));

      this.setData({
        'gestureState.scaleRatio': newScale
      });
    } else if (!gestureState.isMultiTouch && e.touches.length === 1) {
      // 单指拖动逻辑（仅在缩放后允许拖动）
      if (gestureState.scaleRatio === 1) return;

      const moveX = e.touches[0].clientX - gestureState.startTouchX;
      const moveY = e.touches[0].clientY - gestureState.startTouchY;

      // 计算新的平移距离（根据缩放比例调整灵敏度）
      let newTranslateX = gestureState.translateX + moveX / gestureState.scaleRatio;
      let newTranslateY = gestureState.translateY + moveY / gestureState.scaleRatio;

      // 限制拖动边界（避免内容完全移出容器）
      const maxTranslateX = Math.max(0, (gestureState.containerW * gestureState.scaleRatio - gestureState.containerW) / 2);
      const maxTranslateY = Math.max(0, (gestureState.containerH * gestureState.scaleRatio - gestureState.containerH) / 2);
      newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
      newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));

      // 更新位置和起始点
      this.setData({
        'gestureState.translateX': newTranslateX,
        'gestureState.translateY': newTranslateY,
        'gestureState.startTouchX': e.touches[0].clientX,
        'gestureState.startTouchY': e.touches[0].clientY,
      });
    }
  },

  /**
   * 触摸结束：重置临时状态
   */
  handleTouchEnd() {
    this.setData({
      'gestureState.lastTouchDistance': null
    });
  },

  /**
   * 计算两点之间的距离（勾股定理）
   */
  calcDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
});