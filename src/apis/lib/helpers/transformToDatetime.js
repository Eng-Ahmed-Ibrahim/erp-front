export function transformToDateTime(data) {
    const startDateTime = new Date(`${data.day}T${data.startHour}:00Z`);
    const endDateTime = new Date(`${data.day}T${data.endHour}:00Z`);

    return {
        startDateTime: startDateTime.toISOString().slice(0, 19).replace('T', ' '),
        endDateTime: endDateTime.toISOString().slice(0, 19).replace('T', ' ')
    };
}
export function transformSingleToDateTime({ day, hour }) {
    return (new Date(`${day}T${hour}:00Z`)).toISOString().slice(0, 19).replace('T', ' ')
}