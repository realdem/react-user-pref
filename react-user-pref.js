/**
 * "react-user-pref"
 * Version: 0.5.0
 * License: MIT
 * Author: Dan Michael <dan@danmichael.consulting>, started early 2022
 * 
 * Requirements: For ReactJS running in web browsers, with zero dependencies
 * 
 * Use this to persist user preferences in their browser.
 * 
 * Thank you for using this!
 * 
 * 
 * Steps to use:
 * 1. --
 */
const packageName = 'react-user-pref'

export const getLocal = () => {
    let localRaw = localStorage.getItem(packageName)
    let local = null
    if (localRaw) local = JSON.parse(localRaw)
    return !localRaw || !local ? null
        : local
}

export const initializeLocalPreferences = userId => {
    let local = getLocal()
    if (!local) return localStorage.setItem(packageName, JSON.stringify(defaultLocalPreferences(userId)))
}

export const getLocalPreference = code => {
    // if (!validateLocalPreferences()) {
    //   initializeLocalPreferences(null)
    //   return null
    // }
    let local = getLocal()
    let preference = !local ? null : local.preferences.find(pref => pref.code === code)
    return !local ? null
        : local.preferences.length < 1 ? null : !preference ? null : preference.value
}

export const setLocalPreference = (userId, code, value) => {
    let local = getLocal()
    if (!local) local = defaultLocalPreferences(userId)
    let prevPreferences = local.preferences
    let setPreferences = local.preferences
    let prevPreferenceIndex = prevPreferences.findIndex(pref => pref.code === code)
    let setItem = { code: code, value: value }
    if (prevPreferenceIndex > -1) setPreferences[prevPreferenceIndex] = setItem
    else setPreferences.push(setItem)
    let setLocal = { ...local, preferences: setPreferences }
    localStorage.setItem(packageName, JSON.stringify(setLocal))
}

export const validateLocalPreferences = () => {
    let local = getLocal()
    return !(
        !local
        || JSON.stringify(defaultLocalPreferences(0)).length < JSON.stringify(local).length
        || local.meta.version < defaultLocalPreferences(0).meta.version
    )
}

export const defaultLocalPreferences = id => ({
    meta: {
        userId: id,
        time: + new Date()/1000,
        version: 0.9
    },
    preferences: [
        // {
        //     code: 'appFeatures',
        //     value: {
        //         darkMode: null
        //     }
        // },
        // {
        //     code: 'darkMode',
        //     value: null
        // }
    ]
})