function timeFormatter(value, row) {
    const total_minutes = parseInt(value.split(' ')[0]);
    const hours = Math.floor(total_minutes / 60);
    const minutes = total_minutes % 60;
    return `${hours}h ${minutes}m`;
}