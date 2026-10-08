import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codes:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  scan(){
    let _this = this;
    let codes = this.data.codes;
    wx.scanCode({
      success (res) {
        if(codes.indexOf(res.result)==-1){
          codes.push(res.result);
          _this.setData({codes})
        }else{
          wxApi.showModal("该二维码重复。")
        }
      }
    })
  }
})