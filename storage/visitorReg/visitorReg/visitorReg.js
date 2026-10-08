import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    info: {},
    visitReasonIndex: null,
    isEnd: false,
    isSubmit:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(query) {
    await this.initData();
    if (common.isNotBlank(query.id)) {  //查看详情
      if (common.isNotBlank(query.id)) this.doQuery(query.id);
    } else {  //扫码来访
      let workStoreId = decodeURIComponent(query.scene);
      this.setData({
        ['info.workStoreId']: workStoreId
      });
    }
  },
  async doQuery(id) {
    let info = await util.postByBeanName('wmsVisitService', 'queryWmsVisitDataById', {
      id
    });
    this.data.visitReasonList.forEach((item, index) => {
      if (item.codeValue == info.visitReason) {
        this.setData({
          visitReasonIndex: index
        });
      }
    })
    this.setData({
      info,
      disabled: true
    })
  },
  async initData() {
    let visitReasonList = await util.postByBeanName('commonTF', 'getSysStaticData', {
      codeType: "VISIT_REASON"
    });
    this.setData({
      visitReasonList
    });
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
      ['info.' + key]: value
    });
  },
  // 时间选择
  changeDate(e) {
    let value = e.detail;
    this.setData({
      ['info.visitDate']: value
    });
  },
  // 选择来访事由
  visitReasonChange(e) {
    let {
      value
    } = e.detail;
    this.setData({
      ['info.visitReason']: this.data.visitReasonList[value].codeValue,
      'visitReasonIndex': value,
    });
  },
  changePlate(event) {
    const val = event.detail;
    console.log(val.array) //数组形式
    console.log(val.value) //字符串形式
    console.log(val.pass) //是否验证通过

    this.setData({
      ['info.plateNumber']: val.value
    })
  },
  async submit() {
    let _this = this;
    this.setData({isSubmit:true})
    let tmplId = 'TCPAKSLUAjnvPRkmM9bqj-3uWs-v6DZa7A8GBeUKSOs'
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success(res) {
        console.log(res);
        _this.save();
      },
      fail(res) {
        console.log(res);
        _this.save();
      }
    })
  },
  async save() {
    let {
      visitName,
      visitPhone,
      idCard,
      plateNumber,
      visitDate,
      visitCustomer,
      visitReason
    } = this.data.info;
    if (common.isBlank(visitName)) {
      wxApi.showToast("请输入来访人姓名。");
      return
    }
    if (common.isBlank(visitPhone)) {
      wxApi.showToast("请输入来访人联系方式。");
      return
    }
    if (common.isBlank(idCard)) {
      wxApi.showToast("请输入身份证号。");
      return
    }
    if (common.isBlank(plateNumber) || plateNumber.length<7) {
      wxApi.showToast("请输入来访人车牌。");
      return
    }
    if (common.isBlank(visitDate)) {
      wxApi.showToast("请选择来访时间。");
      return
    }
    if (common.isBlank(visitCustomer)) {
      wxApi.showToast("来访所属客户/供应商。");
      return
    }
    if (common.isBlank(visitReason)) {
      wxApi.showToast("请选择来访事由。");
      return
    }
    try{
      wx.login({
        success: async (res) => {
          this.data.info.code = res.code;
          await util.postByBeanName('wmsVisitService', 'saveOrUpdateWmsVisit', this.data.info);
          this.setData({
            isEnd: true,
            isSubmit:false
          })
        }
      })
    }catch(e){
      this.setData({
        isSubmit:false
      })
    }
  },
  liveActivity(e) {
    console.log(e)
  },
})