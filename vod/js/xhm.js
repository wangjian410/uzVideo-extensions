// ignore
import {} from '../../core/uzVideo.js';
import {} from '../../core/uzHome.js';
import {} from '../../core/uz3lib.js';
import {} from '../../core/uzUtils.js';
// ignore

class XHamsterAPI extends WebApiBase {
  constructor() {
    super();
    this.host = 'https://zh.xhamster.com/x-api'; // API 请求地址
    this.webSite = 'https://zh.xhamster.com'; // 网站首页
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Referer': this.webSite,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * 获取分类列表
   */
  async getClassList(args) {
    let backData = new RepVideoClassList();
    try {
      let categories = [
        { type_id: 'straight', type_name: '直男' },
        { type_id: 'gay', type_name: '同性' },
        { type_id: 'trans', type_name: '变性' },
        { type_id: 'amateur', type_name: '素人' },
      ];
      backData.data = categories;
    } catch (error) {
      backData.error = `分类列表获取失败: ${error}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取分类视频列表
   */
  async getVideoList(args) {
    let backData = new RepVideoList();
    try {
      if (!args.type_id) {
        throw new Error('分类ID为空');
      }

      console.log(`请求视频列表: ${this.host}, 分类ID: ${args.type_id}`);

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          category: args.type_id,
          limit: 20,
          page: args.page || 1,
        }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.videos && Array.isArray(data.videos)) {
        let videos = data.videos.map((video) => ({
          vod_id: video.id,
          vod_name: video.title || '未知标题',
          vod_pic: video.thumbnail_url || '',
          vod_remarks: video.duration || '未知时长',
        }));

        backData.data = videos;
      } else {
        throw new Error('videos 数据格式错误');
      }
    } catch (error) {
      backData.error = `获取视频列表失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频详情
   */
  async getVideoDetail(args) {
    let backData = new RepVideoDetail();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      console.log(`请求视频详情: ${this.host}, 视频ID: ${args.vod_id}`);

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          video_id: args.vod_id,
        }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.video) {
        let video = data.video;
        backData.vod_id = video.id;
        backData.vod_name = video.title || '未知视频';
        backData.vod_pic = video.thumbnail_url || '';
        backData.vod_content = video.description || '暂无简介';
      } else {
        throw new Error('video 数据格式错误');
      }
    } catch (error) {
      backData.error = `获取视频详情失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频播放地址
   */
  async getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      console.log(`请求播放地址: ${this.host}, 视频ID: ${args.vod_id}`);

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          video_id: args.vod_id,
        }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.video && data.video.play_url) {
        backData.data = data.video.play_url;
      } else {
        throw new Error('play_url 数据错误');
      }
    } catch (error) {
      backData.error = `获取播放地址失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 搜索视频
   */
  async searchVideo(args) {
    let backData = new RepVideoList();
    try {
      if (!args.searchWord) {
        throw new Error('搜索关键词为空');
      }

      console.log(`请求搜索: ${this.host}, 关键词: ${args.searchWord}`);

      let response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          keyword: args.searchWord,
          limit: 20,
        }),
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      if (data.videos && Array.isArray(data.videos)) {
        let videos = data.videos.map((video) => ({
          vod_id: video.id,
          vod_name: video.title || '未知标题',
          vod_pic: video.thumbnail_url || '',
          vod_remarks: video.duration || '未知时长',
        }));

        backData.data = videos;
      } else {
        throw new Error('videos 数据格式错误');
      }
    } catch (error) {
      backData.error = `搜索失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }
}
var xhm20250219 = new xhm20250219();
