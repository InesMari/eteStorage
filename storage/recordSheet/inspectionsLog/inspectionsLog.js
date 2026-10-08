import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../../common/commonImport'

Page({
  data: {
    head: [{
        name: "点检项目",
        code: "inspectItem",
        width: 150
      },
      {
        name: "检查基准",
        code: "content",
        width: 300
      },
      {
        name: "方法",
        code: "inspectMethodName",
        width: 150
      },
    ],
    info: {},
    tableData: [],
    days: 30, // 每月天数
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
    scancodeType: 1,
  },

  onLoad(options) {
    // 保存路由参数
    this.setData({
      'param.month': options.month
    });
    this.initHead(options);
    // 获取容器宽高并更新到 gestureState 中
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      'gestureState.containerW': systemInfo.windowWidth,
      'gestureState.containerH': systemInfo.windowHeight,
    });
  },

  initHead(options) {
    console.log(options)
    // 获取月份天数
    const days = this.getDaysInMonthByString(options.month);
    this.setData({
      days,
      daysArr: new Array(days)
    });

    // 添加日期表头
    const head = [...this.data.head];
    for (let i = 1; i <= days; i++) {
      head.push({
        name: i,
        code: "day" + i,
        width: 60
      });
    }
    this.setData({
      head
    });
  },

  // 后退拦截
  handleBeforeLeave(e) {
    this.setData({
      scancodeType: this.data.scancodeType - 1
    })
  },

  //原生 - input赋值
  inputSetDataDefault(e) {
    let {
      value
    } = e.detail;
    this.setData({
      equipmentNum: value
    });
  },
  async queryDeviceTask() {
    // 调用接口获取数据
    let params = {
      "equipmentNum": this.data.equipmentNum,
      "inspectMonth": this.data.param.month,
    }
    let taskList = await util.postByBeanName('wmsInspectionTaskService', 'queryWmsInspectionTaskByEquipmentNum', params);
    if(taskList.length<1){
      wxApi.showToast("没有查询到对应的点检记录，请确认设备号是否正确。")
    }else{
      this.setData({
        taskList,
        scancodeType: 2
      });
    }
  },
  async doQuery(e) {
    let {
      item
    } = e.currentTarget.dataset;
    if(item.inspectionTimes != 1){
      wxApi.showToast("只支持查看巡检频率为每天一次的数据。")
      return
    }
    // 调用接口获取数据
    let options = {
      "equipmentNum": item.equipmentNum,
      "appointId": item.appointId,
      "inspectMonth": this.data.param.month,
      "workId": item.workStoreId,
    }
    let info = await util.postByBeanName('wmsInspectionTaskService', 'queryWmsInspectionTaskStatisticsDtl', options);
    this.setData({
      info,
      tableData: info.list,
      scancodeType: 3
    });
  },

  // 生成天数数组
  newArray(length) {
    return Array.from({
      length
    }, (_, i) => i);
  },

  scancode(e) {
    let _this = this;
    wx.scanCode({
      success(res) {
        console.log(res)
        _this.setData({
          'equipmentNum': res.result
        })
      }
    });
  },

  // 获取月份天数
  getDaysInMonthByString(dateStr) {
    if (!dateStr) return 30;
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    console.log(month)
    return new Date(year, month, 0).getDate();
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