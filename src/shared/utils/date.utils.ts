export const setDateToBeginningOfDay = (date: Date) => {
    date.setHours(0, 0, 0, 0)
    return date
}
