// ignore
// 不支持导入，这里只是本地开发用于代码提示
// 如需添加通用依赖，请联系 https://t.me/uzVideoAppbot
import {} from '../uzVideo.js'
import {} from '../uzUtils.js'
import {} from '../uz3lib.js'
// ignore

const appConfig = {
    _webSite: 'https://zh.xhamster.com',
    get webSite() { return this._webSite; },
    set webSite(value) { this._webSite = value; },
    _uzTag: '',
    get uzTag() { return this._uzTag; },
    set uzTag(value) { this._uzTag = value; },
};

/**
 * 异步获取分类列表
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function getClassList(args) {
    var backData = new RepVideoClassList();
    try {
        const categories = [
            { type_id: '/', type_name: '首页' },
            { type_id: '/4k', type_name: '4K' },
            { type_id: '/categories/chinese', type_name: '国产' },
            { type_id: '/newest', type_name: '最新' },
            { type_id: '/best', type_name: '最佳' },
            { type_id: '/pornstars', type_name: '明星' },
            { type_id: '/channels', type_name: '频道' },
            { type_id: '/categories', type_name: '类别' }
        ];
        backData.data = categories;
    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}

/**
 * 获取二级分类列表筛选列表
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function getSubclassList(args) {
    var backData = new RepVideoSubclassList();
    try {
        // 暂无二级分类
    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}

/**
 * 获取分类视频列表
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function getVideoList(args) {
    var backData = new RepVideoList();
    try {
        const page = args.page || 1;
        const tid = args.type_id || '/';
        let url = tid === '/' ? `${appConfig.webSite}/${page}` : `${appConfig.webSite}${tid}/${page}`;

        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': getUserAgent(),
                'Referer': appConfig.webSite,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Cookie': 'cookie_accept_v2=%7B%22e%22%3A1%2C%22f%22%3A1%2C%22t%22%3A1%2C%22a%22%3A1%7D' // 基本Cookie，避免初次访问限制
            }
        });

        if (!response || !response.content) throw new Error('无法获取页面数据');

        console.log('请求URL:', url);
        let $ = parse(response.content);
        let videos = [];
        $('.thumb-list__item').forEach(element => {
            let $elem = $(element);
            let href = $elem.find('a[href*="/videos/"]').attr('href');
            if (href) {
                videos.push({
                    vod_id: href,
                    vod_name: $elem.find('.video-thumb-info__name').text().trim() || '未知标题',
                    vod_pic: $elem.find('img').attr('src'),
                    vod_remarks: $elem.find('.thumb-image-container__duration').text().trim()
                });
            }
        });

        console.log('找到视频数:', videos.length);
        backData.data = videos;
    } catch (error) {
        backData.error = error.toString();
        console.error('getVideoList错误:', error);
    }
    return JSON.stringify(backData);
}

/**
 * 获取二级分类视频列表或筛选视频列表
 * @param {UZSubclassVideoListArgs} args
 * @returns {Promise<string>}
 */
async function getSubclassVideoList(args) {
    var backData = new RepVideoList();
    try {
        // 暂无二级分类
    } catch (error) {
        backData.error = error.toString();
    }
    return JSON.stringify(backData);
}

/**
 * 获取视频详情
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function getVideoDetail(args) {
    var backData = new RepVideoDetail();
    try {
        if (!args.vod_id) throw new Error('视频ID为空');

        let url = `${appConfig.webSite}${args.vod_id}`;
        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': getUserAgent(),
                'Referer': appConfig.webSite,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });

        if (!response || !response.content) throw new Error('无法获取视频详情');

        let $ = parse(response.content);
        let jsData = extractJsData($);
        let playList = extractPlayUrls(jsData);

        backData.vod_name = $('meta[property="og:title"]').attr('content') || '未知标题';
        backData.vod_pic = $('meta[property="og:image"]').attr('content');
        backData.vod_remarks = $('.duration').text().trim() || '';
        backData.vod_play_from = 'xHamster';
        backData.vod_play_url = playList.length > 0 ? playList.join('#') : url;

        console.log('播放链接:', backData.vod_play_url);
    } catch (error) {
        backData.error = error.toString();
        console.error('getVideoDetail错误:', error);
    }
    return JSON.stringify(backData);
}

/**
 * 获取视频播放地址
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function getVideoPlayUrl(args) {
    var backData = new RepVideoPlayUrl();
    try {
        let url = args.url || `${appConfig.webSite}${args.vod_id}`;
        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': getUserAgent(),
                'Referer': url,
                'Origin': appConfig.webSite,
                'Accept': '*/*'
            },
            connectTimeout: 20000,
            readTimeout: 20000
        });

        if (!response || !response.content) throw new Error('无法获取视频数据');

        let $ = parse(response.content);
        let jsData = extractJsData($);
        let playUrl = extractPlayUrls(jsData).find(url => url.includes('1080p'))?.split('$')[1];
        if (!playUrl) playUrl = extractPlayUrls(jsData)[0]?.split('$')[1] || url;

        console.log('播放URL:', playUrl);
        backData.data = playUrl;
    } catch (error) {
        backData.error = error.toString();
        console.error('getVideoPlayUrl错误:', error);
    }
    return JSON.stringify(backData);
}

/**
 * 搜索视频
 * @param {UZArgs} args
 * @returns {Promise<string>}
 */
async function searchVideo(args) {
    var backData = new RepVideoList();
    try {
        if (!args.searchWord) throw new Error('搜索关键词为空');

        let url = `${appConfig.webSite}/search/${encodeURIComponent(args.searchWord)}?page=${args.page || 1}`;
        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': getUserAgent(),
                'Referer': appConfig.webSite,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });

        if (!response || !response.content) throw new Error('无法获取搜索结果');

        let $ = parse(response.content);
        let videos = [];
        $('.thumb-list__item').forEach(element => {
            let $elem = $(element);
            let href = $elem.find('a[href*="/videos/"]').attr('href');
            if (href) {
                videos.push({
                    vod_id: href,
                    vod_name: $elem.find('.video-thumb-info__name').text().trim(),
                    vod_pic: $elem.find('img').attr('src'),
                    vod_remarks: $elem.find('.thumb-image-container__duration').text().trim()
                });
            }
        });

        backData.data = videos;
    } catch (error) {
        backData.error = error.toString();
        console.error('searchVideo错误:', error);
    }
    return JSON.stringify(backData);
}

/**
 * 获取User-Agent
 * @returns {string}
 */
function getUserAgent() {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0';
}

/**
 * 提取脚本中的JSON数据
 * @param {$} $
 * @returns {object}
 */
function extractJsData($) {
    let script = $('script[id="initials-script"]').text();
    try {
        let jsonStr = script.split('initials=')[1]?.slice(0, -1);
        return JSON.parse(jsonStr || '{}');
    } catch (e) {
        console.error('解析JSON失败:', e);
        return {};
    }
}

/**
 * 提取播放地址
 * @param {object} jsData
 * @returns {string[]}
 */
function extractPlayUrls(jsData) {
    let playList = [];
    try {
        let sources = jsData?.xplayerSettings?.sources || {};
        let hls = sources.hls || {};
        let standard = sources.standard || {};

        for (let [format, info] of Object.entries(hls)) {
            if (info.url) playList.push(`${format}$${info.url}`);
        }
        for (let [key, value] of Object.entries(standard)) {
            if (Array.isArray(value)) {
                value.forEach(item => {
                    let url = item.url || item.fallback;
                    if (url) playList.push(`${item.label || item.quality}$${url}`);
                });
            }
        }
    } catch (e) {
        console.error('提取播放地址失败:', e);
    }
    return playList;
}
