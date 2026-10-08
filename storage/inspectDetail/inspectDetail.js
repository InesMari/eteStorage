import { util, wxApi, common, regeneratorRuntime } from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    activeNames: ['0'],
    taskSelect: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ id, equipmentNum }) {
    this.setData({entitys:common.getEntityIds()});
    if (common.isNotBlank(equipmentNum)) {
      this.queryDeviceTask(equipmentNum);
    } else {
      this.doQuery(id);
    }
  },
  // 查询设备任务
  async queryDeviceTask(equipmentNum) {
    let taskList = await util.postByBeanName('wmsInspectionTaskService', 'queryWmsInspectionTaskByEquipmentNum', { equipmentNum,taskState:0 });
    if (taskList.length == 1) {
      this.doQuery(taskList[0].id);
    } else {
      this.setData({
        taskList,
        taskSelect: true
      });
    }
  },
  // 选择任务
  selectTask(item) {
    let {id} = item.currentTarget.dataset.item;
    this.doQuery(id);
  },
  // 查询任务
  async doQuery(id) {
    let info = await util.postByBeanName('wmsInspectionTaskService', 'loadWmsInspectionTaskDataById', { id });
    info.id = info.info.id;
    info.imgList.forEach(item => {
      if (common.isBlank(item.fullPath)) {
        item.urls = [];
      } else {
        item.urls = [{ url: item.fullPath }];
      }
    })
    info.standardDtlList.forEach(el => {
      if (common.isBlank(el.fullPath)) {
        el.urls = [];
      } else {
        el.urls = [{ url: el.fullPath }];
      }
      // 默认正常
      if (el.type == 1 && info.info.taskState == 0) {
        el.contentAnswer = 1;
      }
    })
    if (info.info.taskState != 0) var disabled = true;
    this.setData({
      info,
      disabled,
      taskSelect: false
    });
  },
  onChangeCollapse(event) {
    this.setData({
      activeNames: event.detail,
    })
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
    let { index } = e.detail;
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
  inputSetData(e) {
    let value = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.standardDtlList[' + index + '].contentAnswer']: value,
    });
  },
  inputSetRemark(e) {
    let value = e.detail;
    this.setData({
      ['info.info.submitRemark']: value,
    });
  },
  // 输入异常备注
  inputSetDataDefault(e) {
    let { value } = e.detail;
    let { key, index } = e.currentTarget.dataset;
    this.setData({ ['info.standardDtlList[' + index + '].' + key]: value });
  },
  changeAnswer(e) {
    let values = e.detail.value;
    let value;
    if (values.includes('0')) {
      value = 0;
    } else if (values.includes('1')) {
      value = 1;
    }
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.standardDtlList[' + index + '].contentAnswer']: value,
    });
    this.deleteImgItem(e);
  },

  async afterReadItem(event) {
    wx.showLoading();
    const { file } = event.detail;
    let { index } = event.currentTarget.dataset;
    let { data } = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    console.log(data);
    this.setData({
      ['info.standardDtlList[' + index + '].imgId']: data.content.flowId,
      ['info.standardDtlList[' + index + '].imgPath']: data.content.storePath,
      ['info.standardDtlList[' + index + '].urls']: [{ url: common.getBigImgPath(data.content.fullPath) }]
    })
  },
  // 删除照片
  deleteImgItem(e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.standardDtlList[' + index + '].imgId']: '',
      ['info.standardDtlList[' + index + '].imgPath']: '',
      ['info.standardDtlList[' + index + '].urls']: ''
    })
  },
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let { index } = event.currentTarget.dataset;
    let { data } = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    console.log(data);
    this.setData({
      ['info.imgList[' + index + '].imgId']: data.content.flowId,
      ['info.imgList[' + index + '].imgPath']: data.content.storePath,
      ['info.imgList[' + index + '].urls']: [{ url: common.getBigImgPath(data.content.fullPath) }]
    })
  },

  // 删除照片
  deleteImg(e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.imgList[' + index + '].imgId']: '',
      ['info.imgList[' + index + '].imgPath']: '',
      ['info.imgList[' + index + '].urls']: ''
    })
  },
  async submit() {
    await util.postByBeanName('wmsInspectionTaskService', 'saveOrUpdateWmsInspectionTask', this.data.info);
    await wxApi.showModal("提交成功")
    wx.navigateBack({
      delta: 1,
    })
  }
})