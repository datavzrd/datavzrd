function custom_func_25c0740391f9f68757894e517ef35361(value, row) { try { 
    const total_minutes = parseInt(value.split(' ')[0]);
    const hours = Math.floor(total_minutes / 60);
    const minutes = total_minutes % 60;
    return `${hours}h ${minutes}m`;
 } catch (e) { datavzrd.custom_error(e, 'Runtime') }}
