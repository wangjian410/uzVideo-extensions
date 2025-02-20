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
            { type_id: '/4k', type_name: '4K' },
            { type_id: 'two_click_/categories/chinese', type_name: '国产' },
            { type_id: '/newest', type_name: '最新' },
            { type_id: '/best', type_name: '最佳' },
            { type_id: '/channels', type_name: '频道' },
            { type_id: '/categories', type_name: '类别' },
            { type_id: '/pornstars', type_name: '明星' }
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
        // 暂无筛选需求
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
        let tid = args.type_id || '/newest';
        let url;

        if (tid.startsWith('two_click_')) tid = tid.replace('two_click_', '');
        url = tid === '/4k' ? `${appConfig.webSite}${tid}/${page}` : `${appConfig.webSite}${tid}/${page}`;

        let response = await req(url, {
            method: 'GET',
            headers: {
                'User-Agent': getUserAgent(),
                'Referer': appConfig.webSite,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });

        if (!response || !response.content) throw new Error('无法获取页面数据');

        console.log('请求URL:', url);
        let $ = parse(response.content);
        let videos = [];

        if (tid === '/channels') {
            let jsData = extractJsData($);
            (jsData.channels || []).forEach(channel => {
                videos.push({
                    vod_id: `two_click_${channel.channelURL}`,
                    vod_name: channel.channelName || '未知频道',
                    vod_pic: channel.siteLogoURL || '',
                    vod_remarks: `subscribers: ${channel.subscriptionModel?.subscribers || 0}`,
                    vod_tag: 'folder'
                });
            });
        } else if (tid === '/categories') {
            backData.pagecount = 1; // 单页
            let jsData = extractJsData($);
            (jsData.layoutPage?.store?.popular?.assignable || []).forEach(item => {
                videos.push({
                    vod_id: `one_click_${item.id}`,
                    vod_name: item.name || '未知类别',
                    vod_pic: '',
                    vod_tag: 'folder'
                });
            });
        } else if (tid === '/pornstars') {
            let jsData = extractJsData($);
            (jsData.pagesPornstarsComponent?.pornstarListProps?.pornstars || []).forEach(star => {
                videos.push({
                    vod_id: `two_click_${star.pageURL}`,
                    vod_name: star.name || '未知明星',
                    vod_pic: star.imageThumbUrl || '',
                    vod_remarks: star.translatedCountryName || ''
                });
            });
        } else if (tid.startsWith('one_click_')) {
            backData.pagecount = 1;
            let jsData = extractJsData(await req(`${appConfig.webSite}/categories`, { headers: { 'User-Agent': getUserAgent(), 'Referer': appConfig.webSite } }).content);
            let categoryId = tid.replace('one_click_', '');
            (jsData.layoutPage?.store?.popular?.assignable || []).forEach(category => {
                if (category.id === categoryId) {
                    (category.items || []).forEach(item => {
                        videos.push({
                            vod_id: `two_click_${item.url}`,
                            vod_name: item.name || '未知子类别',
                            vod_pic: item.thumb || '',
                            vod_tag: 'folder'
                        });
                    });
                }
            });
        } else {
            $('.thumb-list--sidebar .thumb-list__item').forEach(element => {
                let $elem = $(element);
                let href = $elem.find('.role-pop').attr('href');
                if (href) {
                    videos.push({
                        vod_id: href,
                        vod_name: $elem.find('.video-thumb-info__name').text().trim() || '未知标题',
                        vod_pic: $elem.find('.role-pop img').attr('src'),
                        vod_remarks: $elem.find('.thumb-image-container__duration').text().trim()
                    });
                }
            });
        }

        console.log('找到视频数:', videos.length);
        backData.data = videos;
        backData.page = page;
        backData.pagecount = 9999;
        backData.limit = 90;
        backData.total = 999999;
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
        let playList = [];

        try {
            let sources = jsData.xplayerSettings?.sources || {};
            let hls = sources.hls || {};
            let standard = sources.standard || {};

            for (let [format, info] of Object.entries(hls)) {
                if (info.url) playList.push(`${format}$${encodePlayUrl(`0@@@@${info.url}`)}`);
            }
            for (let [key, value] of Object.entries(standard)) {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        let url = item.url || item.fallback;
                        if (url) playList.push(`${item.label || item.quality}$${encodePlayUrl(`0@@@@${url}`)}`);
                    });
                }
            }
        } catch (e) {
            console.error('提取播放地址失败:', e);
            playList.push(`默认$${encodePlayUrl(`1@@@@${args.vod_id}`)}`);
        }

        backData.vod_name = $('meta[property="og:title"]').attr('content') || '未知标题';
        backData.vod_pic = $('meta[property="og:image"]').attr('content');
        backData.vod_remarks = $('.rb-new__info').text().trim() || '';
        backData.vod_play_from = 'xHamster';
        backData.vod_play_url = playList.join('#');

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
        let decoded = decodePlayUrl(args.url);
        let [parseFlag, url] = decoded.split('@@@@');
        let headers = {
            'User-Agent': getUserAgent(),
            'Referer': appConfig.webSite,
            'Origin': appConfig.webSite,
            'Accept': '*/*'
        };

        backData.data = url;
        backData.parse = parseInt(parseFlag);
        backData.header = headers;

        console.log('播放URL:', url);
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
        $('.thumb-list--sidebar .thumb-list__item').forEach(element => {
            let $elem = $(element);
            let href = $elem.find('.role-pop').attr('href');
            if (href) {
                videos.push({
                    vod_id: href,
                    vod_name: $elem.find('.video-thumb-info__name').text().trim(),
                    vod_pic: $elem.find('.role-pop img').attr('src'),
                    vod_remarks: $elem.find('.thumb-image-container__duration').text().trim()
                });
            }
        });

        backData.data = videos;
        backData.page = args.page || 1;
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
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
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
 * Base64编码播放URL
 * @param {string} text
 * @returns {string}
 */
function encodePlayUrl(text) {
    try {
        return btoa(encodeURIComponent(text));
    } catch (e) {
        console.error('Base64编码错误:', e);
        return '';
    }
}

/**
 * Base64解码播放URL
 * @param {string} encodedText
 * @returns {string}
 */
function decodePlayUrl(encodedText) {
    try {
        return decodeURIComponent(atob(encodedText));
    } catch (e) {
        console.error('Base64解码错误:', e);
        return '';
    }
}
