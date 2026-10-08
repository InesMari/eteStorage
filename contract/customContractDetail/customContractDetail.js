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
    showFinish: false,
    showAlert: false,
    info: {},
    inBase: true,
    texts:['逾期超90天付款', '逾期超60天付款', '逾期超30天付款', '逾期超30天内付款', '守信客户'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({
    id
  }) {
    this.setData({
      entitys: common.getEntityIds()
    });
    common.checkAppointToken();
    this.initScroll();
    let info = await util.postByBeanName('contractReviewTF', 'getContractReviewInfoForWechat', {
      id
    });
    let customerData = await util.postByBeanName('customerTF', 'queryCustomerListNoPage', {
      sts: 1
    });

    let {
      CERTIFICATE,
      HAVE_OR_NOT,
      CONTRACT_PAY_MODE,
      CONTRACT_INVOICE_TYPE,
      TAX_RATE,
      ACCOUNT_PERIOD,
      CUSTOMER_CONTRACT_TRANSPORT,
      CUSTOMER_CONTRACT_STORAGE,
      CUSTOMER_CONTRACT_PACKING,
      CUSTOMER_CONTRACT_PAY_MODE,
      CUSTOMER_ACCOUNT_PERIOD
    } = await util.postByBeanName('commonTF', 'getSysStaticDataByCodeTypes', {
      codeType: "CERTIFICATE,HAVE_OR_NOT,CONTRACT_PAY_MODE,CONTRACT_INVOICE_TYPE,TAX_RATE,ACCOUNT_PERIOD,CUSTOMER_CONTRACT_TRANSPORT,CUSTOMER_CONTRACT_STORAGE,CUSTOMER_CONTRACT_PACKING,CUSTOMER_CONTRACT_PAY_MODE,CUSTOMER_ACCOUNT_PERIOD"
    });

    this.arrayTypeChange(HAVE_OR_NOT, CONTRACT_PAY_MODE, CONTRACT_INVOICE_TYPE, TAX_RATE, ACCOUNT_PERIOD, CUSTOMER_CONTRACT_PAY_MODE, CUSTOMER_ACCOUNT_PERIOD)

    info.creditLevel = null;
    info.tenantName = null;
    customerData.forEach(function (item) {
      if (item.tenantId == info.tenantId) {
        info.creditLevel = item.creditLevel;
        info.tenantName = item.name;
      }
    });
    this.setData({
      info,
      certificate: CERTIFICATE,
      haveOrNot: HAVE_OR_NOT,
      contractPayMode: CONTRACT_PAY_MODE,
      contractInvoiceType: CONTRACT_INVOICE_TYPE,
      taxRate: TAX_RATE,
      accountPeriod: ACCOUNT_PERIOD,
      customerContractPayMode: CUSTOMER_CONTRACT_PAY_MODE,
      customerAccountPeriod: CUSTOMER_ACCOUNT_PERIOD,

    });
    this.getWorkNames();
    this.getList("transportNames", CUSTOMER_CONTRACT_TRANSPORT, info.transport);
    this.getList("storageNames", CUSTOMER_CONTRACT_STORAGE, info.storage);
    this.getList("packingNames", CUSTOMER_CONTRACT_PACKING, info.packing);
  },
  // 仓储区域
  async getWorkNames() {
    let workData = await util.postByBeanName("workGoodsTF", "queryWorkStorehouseDataNoPage", {});
    let workNames = [];
    workData.forEach(el => {
      if (this.data.info.workAreas.indexOf(el.workId) > -1) {
        workNames.push(el.workName);
      }
    })
    this.setData({
      workNames: workNames.toString()
    });
  },
  /**
   * 处理运输类、仓库类、包装类
   * @param {字段名} name 
   * @param {遍历数据} list 
   * @param {选中数据} data 
   */
  getList(name, list, data) {
    let names = [];
    list.forEach(el => {
      if (data.indexOf(el.codeValue) > -1) {
        names.push(el.codeName);
      }
    })
    if (name == 'transportNames') names.push(this.data.info.transportName);
    if (name == 'storageNames') names.push(this.data.info.storageName);
    this.setData({
      ['info.' + name]: names.toString()
    });
  },
  onPageScroll(e) {
    if (e.scrollTop < this.data.constractTop) {
      if (!this.data.inBase) {
        this.setData({
          inBase: true,
          active: 0
        });
      }
    } else {
      if (this.data.inBase) {
        this.setData({
          inBase: false,
          active: 1
        });
      }
    }
  },
  // 滚动逻辑
  initScroll() {
    let query = wx.createSelectorQuery().in(this);
    query.select("#base").boundingClientRect();
    query.select("#constract").boundingClientRect();
    let _this = this;
    query.exec(function (res) {
      _this.setData({
        baseTop: res[0].top + 130,
        constractTop: res[1].top,
      })
    });
  },
  // 滚动位置
  toScroll(e) {
    let {
      index
    } = e.detail;
    if (index == 0) {
      var scrollTop = 0;
    } else if (index == 1) {
      var scrollTop = this.data.constractTop;
    }
    wx.pageScrollTo({
      scrollTop,
      duration: 300
    });
  },
  // 数据类型转换
  arrayTypeChange() {
    Array.from(arguments).forEach(item => {
      item.forEach(el => {
        el.codeValue = Number(el.codeValue);
      })
    })
  },
  // 备注
  inputSetRemark(e) {
    let {
      value
    } = e.detail;
    this.setData({
      remark: value
    })
  },
  sureAlert() {
    let type = this.data.currentType;
    if (type == 1) {
      this.audit();
    } else {
      if (common.isBlank(this.data.remark)) {
        wxApi.showToast("请填写评审意见。");
        return;
      }
      this.unAudit();
    }
    this.cancelAlert();
  },
  cancelAlert() {
    this.setData({
      showAlert: false,
    })
  },
  // 评审弹窗
  showAlertMethod(e) {
    let {
      type
    } = e.currentTarget.dataset;
    this.setData({
      showAlert: true,
      currentType: type
    })
  },
  // 审核不通过
  async unAudit(e) {
    let {
      remark
    } = this.data;
    let {
      id
    } = this.data.info;
    await util.postByBeanName('contractReviewTF', 'reviewContractInfo', {
      id,
      type: 2,
      reviewRemark: remark
    });
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e) {
    let {
      remark
    } = this.data;
    let {
      id
    } = this.data.info;
    await util.postByBeanName('contractReviewTF', 'reviewContractInfo', {
      id,
      type: 1,
      reviewRemark: remark
    });
    this.setData({
      showFinish: true
    })
  },
  back() {
    let pages = getCurrentPages();
    if (pages.length == 1) {
      wx.redirectTo({
        url: '/contract/contractList/contractList',
      })
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})