import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    info: {
      count:30,
    },
    isRefresh: false,
    head: [{
        name: "车牌号码",
        code: "plateNumber"
      },
      {
        name: "司机姓名",
        code: "driverName"
      },
      {
        name: "司机号码",
        code: "driverPhone"
      },
      {
        name: "出勤状态",
        code: "codeName"
      },
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({
    tab,type
  }) {
    if (tab == 1) {
      console.log(1)
      // 昨天出勤
      this.setData({method:"queryOwnVehicleYesterdayAttendancePage"})
      wx.setNavigationBarTitle({title:"昨天出勤列表"});
    }else if (tab == 2) {
      console.log(2)
      // 今天出勤
      this.setData({method:"queryOwnVehicleTodayAttendancePage"})
      wx.setNavigationBarTitle({title:"今天出勤列表"});
    }
    if(type && type != 'undefined'){
      this.setData({['info.state']:type})
      if(type == 0){
        // 未出勤
        this.setData({active:2})
      }
      if(type == 1){
        // 已出勤
        this.setData({active:1})
      }
    }
    this.doQuery(true);
  },
  async doQuery(clear) {
    if (clear) { //clear为true的时候清空页码
      this.setData({
        page: 1
      });
    }
    let {
      info,
      page
    } = this.data;
    let {
      items,
      hasNext
    } = await util.postByBeanName('vehicleBenefitAccountingService', this.data.method, {
      ...info,
      page
    });
    if (clear) { //clean为true的时候清空数组(请求后操作，避免出现阶段性页面空白)
      this.setData({
        list: []
      });
    }
    this.setData({
      list: [...this.data.list, ...items],
      hasNext,
      isRefresh: false
    });
  },
  // 滚动加载
  scrolltolowerHandler() {
    if (this.data.hasNext) {
      this.setData({
        page: ++this.data.page
      });
      this.doQuery()
    }
  },
  // 上拉刷新
  toupper() {
    this.setData({
      isRefresh: true
    })
    this.doQuery(true);
  },
  search(e) {
    this.setData({
      ['info.searchKey']: e.detail
    })
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  onChange(e) {
    let waybillState = e.detail.name;
    switch (waybillState) {
      case 0:
        this.setData({
          ['info.state']: ""
        });
        break; //全部
      case 1:
        this.setData({
          ['info.state']: 1
        });
        break; //已出勤
      case 2:
        this.setData({
          ['info.state']: 0
        });
        break; //未出勤
    }
    this.doQuery(true);
  },
})