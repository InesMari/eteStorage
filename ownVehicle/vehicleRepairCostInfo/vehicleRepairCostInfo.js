import { util, wxApi, common, regeneratorRuntime } from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish: false,
    showUnPassAlert: false,
    info: {},
    maintenanceShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({ id }) {
    this.setData({ entitys: common.getEntityIds() });
    common.checkAppointToken();
    let data = await util.postByBeanName('vehicleRepairCostService', 'queryVehicleRepairCostInfoById', { id });
    if (data.info.repairType == 1 || data.info.repairType == 3) {
      this.data.maintenanceShow = false;
    } else {
      this.data.maintenanceShow = true;
    }
    this.setData({ info: data.info, fileList: data.fileList, maintenanceShow: this.data.maintenanceShow });
  },
  // 备注
  inputSetRemark(e) {
    let { value } = e.detail;
    this.setData({ remark: value })
  },
  sureAlert() {
    this.unAudit();
  },
  cancelAlert() {
    this.setData({
      showUnPassAlert: false,
    })
  },
  // 审核不通过备注弹窗
  showUnPassAlertMethod() {
    this.setData({
      showUnPassAlert: true,
    })
  },
  // 审核不通过
  async unAudit(e) {
    let { remark } = this.data;
    if (common.isBlank(remark)) {
      wxApi.showToast("请填写不通过原因。");
      return;
    }
    let { id } = this.data.info;
    await util.postByBeanName('vehicleRepairCostService', 'verifyVehicleRepairCostById', { id, verifyState:2, verifyRemark: remark });
    this.cancelAlert();
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit() {
    let { confirm } = await wxApi.showModal({
      title: "提示",
      content: "您正在操作审核通过，是否继续？",
      showCancel: true
    })
    if (confirm) {
      let { id } = this.data.info;
      await util.postByBeanName('vehicleRepairCostService', 'verifyVehicleRepairCostById', { id, verifyState:1 });
      await wxApi.showModal("操作成功。");
      this.back();
    }
  },
  back() {
    wx.navigateBack({
      delta: 1
    })
  },
})