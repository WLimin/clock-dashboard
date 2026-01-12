import type { LunarInfo } from '../types'
import { HolidayUtil, Solar } from 'lunar-typescript'

export function getLunarDate(date: Date): LunarInfo {
  try {
    // 将公历日期转换为 Solar 对象
    const solar = Solar.fromDate(date)
    // 转换为农历对象
    const lunar = solar.getLunar()

    // 获取农历月（如：正月、冬月、闰二月）
    const month = lunar.getMonthInChinese()
    // 获取农历日（如：初一、十五）
    const day = lunar.getDayInChinese()

    // 获取干支年份（如：乙巳）
    const yearGanzhi = lunar.getYearInGanZhiByLiChun()
    const jieQi = lunar.getJieQi()
    const festivals = lunar.getFestivals()
    const solarFestivals = solar.getFestivals()

    // 获取节日或节气
    const allFestivals = [...festivals, ...solarFestivals]
    const festival = allFestivals.length > 0 ? allFestivals[0] : (jieQi || '')

    const lunarDay = day === '初一' ? `${month}月` : day

    const holiday = HolidayUtil.getHoliday(solar.getYear(), solar.getMonth(), solar.getDay())
    const holidayLabel = holiday ? (holiday.isWork() ? '班' : '休') : undefined

    let fullDate = festival ? `${lunarDay}·${festival}` : lunarDay
    if (holidayLabel) {
      fullDate += `·${holidayLabel}`
    }

    return {
      fullDate,
      date: festival || lunarDay,
      year: yearGanzhi,
      month,
      yearShengxiao: lunar.getYearShengXiao(),
      monthGanzhi: lunar.getMonthInGanZhi(),
      dayInChinese: day,
      dayGanzhi: lunar.getDayInGanZhi(),
      isFestival: !!festival,
      festival,
      holiday: holidayLabel,
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      wuxing: lunar.getBaZiWuXing()[4], // 日柱五行
      pengzu: [lunar.getPengZuGan(), lunar.getPengZuZhi()],
      hours: lunar.getTimes().slice(0, 12).map(t => ({
        hour: `${t.getZhi()}时`,
        ganzhi: t.getGanZhi(),
        luck: t.getTianShenLuck(),
        tianShen: t.getTianShen(),
        js: t.getYi().join(' '),
        xs: t.getJi().join(' '),
      })),
    }
  }
  catch (e) {
    console.error('Lunar date error (lunar-typescript):', e)
    return {
      fullDate: '加载失败',
      date: '加载失败',
      year: '--年',
      month: '加载失败',
      yearShengxiao: '--',
      monthGanzhi: '--',
      dayInChinese: '--',
      dayGanzhi: '--',
      isFestival: false,
    }
  }
}
