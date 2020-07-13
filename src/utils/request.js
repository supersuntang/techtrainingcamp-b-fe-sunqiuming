import axios from 'axios'

/**
 * 快捷get方法
 * @param url
 * @param params {Object}
 * @param config {Object}
 * @returns {Object}
 */
export function get(url, params = null, config = {}) {
    return axios({
        url,
        params,
        ...config
    });
}

/**
 * 快捷post方法
 * @param url
 * @param payload
 * @param config {Object}
 * @returns {Object}
 */
export function post(url, payload, config = {}, params = null) {
    return axios({
        method: 'post',
        url,
        params,
        data: payload,
        ...config
    });
}

/**
 * 快捷put方法
 * @param url
 * @param payload
 * @param config {Object}
 * @returns {Object}
 */
export function put(url, payload, config = {}) {
    return axios({
        method: 'put',
        url,
        data: payload,
        ...config
    });
}

/**
 * 快捷delete方法
 * @param url
 * @param payload
 * @param config {Object}
 * @returns {Object}
 */
export function del(url, payload, config = {}) {
    return axios({
        method: 'delete',
        url,
        data: payload,
        ...config
    });
}