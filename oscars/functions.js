var custom_func_681872f53fef3af326344cd4b9202655=(a=>{try{var b=a.birth_mo;const c=[`❄️`,`🌸`,`☀️`,`🍁`];return b<1||b>12?`Invalid month`:c[Math.floor((b%12)/3)]}catch(a){datavzrd.custom_error(a,`birth_season`)}});var custom_func_bdeb9ccd63a6f2944da7a80b24245f51=((a,b)=>{try{return [{"category":`wins`,"amount":a.split(`/`)[0]},{"category":`nominations`,"amount":a.split(`/`)[1]}]}catch(a){datavzrd.custom_error(a,`overall_wins_and_overall_nominations`)}})