import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../common/commonImport'
Page({
  data: {
    longitude: 113.629131, // 地图默认中心经度（易迁易总部）
    latitude: 23.147885, // 地图中心纬度
    scale: 16, // 地图缩放级别
    markers: [], // 地图标记（地图模式用）
    filteredVehicles: [], // 车辆列表
    searchKey: '', // 搜索关键字
    isMapMode: true, // 默认「地图模式」
    statusOptions: [], // 状态筛选选项
    statusIndex: 0, // 当前选中的状态
    param: {
      state: '',
      searchKey: '',
      count: 99,
    },
    showCalloutId: null,
    customCalloutMarkerIds: [],
    isReadonly: false, //外部跳转进来
  },

  async onLoad({
    vehicleId
  }) {
    this.initData();
    if (vehicleId) {
      this.setData({
        isReadonly: true
      })
      await this.queryDetail(vehicleId)
      this.updateMarkers();
    } else {
      this.doQuery();
    }
  },
  // 初始化静态数据    
  async initData() {
    let {
      OPERATE_STATE
    } = await util.postByBeanName('commonTF', 'getSysStaticDataByCodeTypes', {
      codeType: "OPERATE_STATE"
    });
    OPERATE_STATE.unshift({
      codeName: "全部",
      codeValue: ""
    })
    this.setData({
      statusOptions: OPERATE_STATE
    });
  },
  todoQuery() {
    this.setData({
      isMapMode: false,
    })
    this.doQuery();
  },
  async doQuery() {
    let filteredVehicles = await util.postByBeanName('monitorTF', 'vehicleMonitorForWechat', this.data.param);
    this.setData({
      filteredVehicles,
    })
    if (this.data.isMapMode) this.updateMarkers(); // 地图模式才初始化标记
  },
  // 状态筛选器值变化
  onStatusChange(e) {
    const index = e.detail.value;
    this.setData({
      statusIndex: index,
      ['param.state']: this.data.statusOptions[index].codeValue,
    });
    this.todoQuery();
  },
  //原生 - input赋值
  inputSetDataDefault(e) {
    let {
      value
    } = e.detail;
    let {
      key
    } = e.currentTarget.dataset;
    this.data.param[key] = value;
    this.setData({
      param: this.data.param,
    });
    clearTimeout(this.data.timeout);
    this.data.timeout = setTimeout(() => {
      this.todoQuery();
    }, 500)
  },

  // 切换「地图/列表」模式
  async switchMode(e) {
    const isMapMode = !this.data.isMapMode;
    this.setData({
      isMapMode
    });
    await this.doQuery();
    if (isMapMode) this.updateMarkers(); // 切换到地图模式时，生成标记
  },


  // 地图标记聚合与生成（地图模式用）
  updateMarkers() {
    const {
      filteredVehicles,
    } = this.data;
    const markers = [];
    filteredVehicles.forEach(item => {
      if (item.longitude) {
        markers.push({
          id: item.vehicleId,
          longitude: item.longitude,
          latitude: item.latitude,
          iconPath: '/common/images/car.png', // 本地聚合图标路径
          width: 40, // 图标宽度（rpx）
          height: 20, // 图标高度（rpx）
          title: item.plateNumber,
          joinCluster: true,
          label: {
            content: item.plateNumber,
            color: '#000',
            fontSize: 12,
            bgColor: '#fff',
            padding: 2,
            borderRadius: 4,
            textAlign: 'center',
          },
          customCallout: {
            id: item.vehicleId,
            anchorY: 0,
            anchorX: 0,
            display: 'ALWAYS',
          },
        });
      }
    })
    if (markers.length > 0) {
      var longitude = markers[0].longitude;
      var latitude = markers[0].latitude;
      var customCalloutMarkerIds = markers.map(item => item.id)
    }
    this.setData({
      markers,
      latitude,
      longitude,
      customCalloutMarkerIds,
    });
  },

  // 点击空白处隐藏
  onMapTap(e) {
    // console.log(e)
    if (this.data.isReadonly) return;
    this.setData({
      showCalloutId: null
    });
  },

  // 地图标记点击事件（地图模式用）
  onMarkerTap(e) {
    setTimeout(() => {
      const {
        markerId
      } = e.detail; // 获取点击的标记点id
      // 根据markerId找到对应的customCalloutId
      const marker = this.data.markers.find(m => m.id === markerId);
      if (!marker) return;
      this.queryDetail(markerId);
      const {
        id
      } = marker.customCallout;

      // 切换显示状态：如果点击的是当前显示的，则隐藏；否则显示新的
      this.setData({
        showCalloutId: this.data.showCalloutId === id ? null : id
      });
    })
  },

  // 查询详情
  async queryDetail(vehicleId) {
    var vehicleInfo = await util.postByBeanName('monitorTF', 'loadVehicleMonitorInfoByVehicleId', {
      vehicleId
    });
    this.setData({
      vehicleInfo,
      isMapMode: true,
      latitude: vehicleInfo.latitude,
      longitude: vehicleInfo.longitude,
      scale: 16,
    });
    if(this.data.isReadonly){
      this.setData({
        filteredVehicles:[vehicleInfo]
      })
    }
  },

  // 列表项点击（跳转车辆详情，示例为Toast提示）
  gotoVehicleDetail(e) {
    const {
      vehicleId
    } = e.currentTarget.dataset.item;
    this.queryDetail(vehicleId);
  },
});