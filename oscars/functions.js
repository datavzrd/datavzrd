function custom_func_bdeb9ccd63a6f2944da7a80b24245f51(value, row) { try { 
  return [{"category": "wins", "amount": value.split("/")[0]}, {"category": "nominations", "amount": value.split("/")[1]}]
 } catch (e) { datavzrd.custom_error(e, 'overall_wins_and_overall_nominations') }}
function custom_func_681872f53fef3af326344cd4b9202655(row) { try { 
    var month = row.birth_mo;
    const seasons = ["❄️", "🌸", "☀️", "🍁"];
    return (month < 1 || month > 12) ? "Invalid month" : seasons[Math.floor((month % 12) / 3)];
 } catch (e) { datavzrd.custom_error(e, 'birth_season') }}
