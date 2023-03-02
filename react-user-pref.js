/**
 * "react-user-pref"
 * License: MIT
 * Author: Dan Michael <dan@danmichael.consulting>, started early 2023
 * 
 * About: Use this to persist user preferences in their browser.
 * Thank you for using this!
 * 
 * 
 * Steps to use:
 * 1. --
 * 
 * Guidelines:
 * 1. Not intended for data caching
 * 
 * Remaining build tasks (in order):
 * validateLocalPreferences (?)
 * Complete getLocalPreference
 * Add localPackageStorageObject()
 * Finish comments
 * Fully test everything
 * Shorten "preference" function names to "pref"?
 * Finish "Steps to use" (above)
 */

/**Include dependencies */
import packageInfo from './package.json'
import React from 'react'


/**Initialize defaults */
const defaultUserId = 0
const defaultPreferenceValue = null


/**Revive specific values from the save */
function parseReviver(key, value) {
    switch (key) {
        case 'unix': return Number(value)
        default: return value;
    }
}

/**Retrieve the entire local save */
export const getLocal = () => {
    /**Check localStorage availability */
    if (!isLocalStorageAvailable()) {
        emitErrorLocalStorage()
        return false
    }
    let localRaw = localStorage.getItem(packageInfo.name)
    let local = null
    if (localRaw) local = JSON.parse(localRaw, parseReviver)
    return !localRaw || !local? null : local
}

/**Remove the entire local save */
export const removeLocal = () => localStorage.removeItem(packageInfo.name)

/**Initialize preferences for this user */
export const initializeLocalPreferences = (userId = defaultUserId) => {
    /**Check localStorage availability */
    if (!isLocalStorageAvailable()) {
        emitErrorLocalStorage()
        return false
    }
    let local = getLocal()
    if (!local) {
        localStorage.setItem(packageInfo.name, JSON.stringify(defaultLocalPreferences(userId)))
        return true
    }
}
//
/**Reset the entire local save */
export const resetLocal = initializeLocalPreferences

/**Retrieve all preferences */
export const getLocalPreferences = (
    userId = defaultUserId,
    returnObject = false
) => {
    let local = getLocal().find(userSave => userSave.meta.userId === userId)
    if (!returnObject) return local.preferences
    else local.preferences.reduce((result, userPref) => {
        result[userPref.code] = value
        return result
    }, {})
}
//
/**Retrieve a specfifc value by preference */
export const getLocalPreference = (
    code = undefined,
    defaultValue = defaultPreferenceValue,
    userId = defaultUserId
) => {
    // if (!validateLocalPreferences()) {
    //   initializeLocalPreferences(null)
    //   return null
    // }
    let local = getLocal()
    let preference = !local ? defaultValue : local.preferences.find(pref => pref.code === code)
    return !local ? defaultValue
        : local.preferences.length < 1 ? defaultValue : !preference ? defaultValue : preference.value
}

/**Set a preference's value */
export const setLocalPreference = (
    code = undefined,
    value = defaultPreferenceValue,
    userId = defaultUserId
) => {
    /**Check localStorage availability */
    if (!isLocalStorageAvailable()) {
        emitErrorLocalStorage()
        return false
    }
    let local = getLocal()
    if (!local) local = defaultLocalPreferences(userId)
    let prevPreferences = local.preferences
    let setPreferences = local.preferences
    let prevPreferenceIndex = prevPreferences.findIndex(pref => pref.code === code)
    let setItem = {
        code,
        value,
        time: newTime()
    }
    if (prevPreferenceIndex > -1) setPreferences[prevPreferenceIndex] = setItem
    else setPreferences.push(setItem)
    let setLocal = {
        ...local,
        preferences: setPreferences
    }
    localStorage.setItem(packageInfo.name, JSON.stringify(setLocal))
    return true
}

/**REMINDER: What does this do? */
export const validateLocalPreferences = () => {
    let local = getLocal()
    return !(
        !local
        || JSON.stringify(defaultLocalPreferences(0)).length < JSON.stringify(local).length
        || local.meta.version < defaultLocalPreferences(0).meta.version
    )
}

/**REMINDER: What does this do? */
const defaultLocalPreferences = (userId = defaultUserId) => ({
    meta: {
        userId,
        code: packageInfo.name+':user:metadata',
        time: newTime(),
        version: packageInfo.version
    },
    preferences: [
        // {
        //     code: 'darkMode',
        //     value: true
        //     time: {unix, iso, string}
        // }
    ]
})

/**This function consoles an error */
const emitErrorLocalStorage = () => console.error(packageInfo.name+': Local Storage is not available.')

/**Check the browser permissions and/or capability for localStorage */
function isLocalStorageAvailable() {
    if (typeof localStorage !== undefined)
        try {
            localStorage.setItem(packageInfo.name+':test', 'here')
            if (localStorage.getItem(packageInfo.name+':test') === 'here') {
                localStorage.removeItem(packageInfo.name+':test')
                /* localStorage is enabled */
                return true
            } else /* localStorage is disabled */
                return false
        } catch(e) {
            /* localStorage is disabled */
            return false
        }
    else /* localStorage is not available */
        return false
}

const useUserPrefDefaultOptions = {
    userId: defaultUserId,
    code: null
}
//
/**A React hook for retrieving user preferences as state */
export const useUserPref = (options = {}) => {
    /**Populate parameters with provided options object */
    let param = {...useUserPrefDefaultOptions, ...isObject(options)? options : {}}

    /**Determine what to return */
    return !!param.code? 
        getLocalPreference(param.code, defaultPreferenceValue, param.userId)
        : getLocalPreferences(param.userId, true)
}


/* Helper functions (2) */
//
/**Check if a variable is an object with keys */
const isObject = thisVariable => thisVariable instanceof Object && !Array.isArray(thisVariable)
//
//
/**Supplemental for newTime() */
const newTimeHumanReadable = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
}
//
/**Create an object of current time in various formats */
const newTime = () => {
    let datetime = new Date()
    return {
        unix: datetime/1000,
        iso: datetime.toISOString(),
        string: datetime.toString(),
        human: datetime.toLocaleString(undefined, newTimeHumanReadable)
    }
}