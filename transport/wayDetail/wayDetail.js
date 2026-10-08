// supplier/transport/wayDetail/wayDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({info}) {
    info = JSON.parse(decodeURI(info));
    this.setData({info});
  },
  back(){
    wx.navigateBack({
      delta: 1,
    })
  }
})