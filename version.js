////output version info
//module.exports = function () {
//  var content = [
//    '',
//    '  v' + fis.cli.info.version,
//    '',
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '00000000000000'.bold.yellow + '  ' + '0000000000000'.bold.green,
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '00000000000000'.bold.yellow + '  ' + '00000000000000'.bold.green,
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '0000'.bold.yellow + '            ' + '0000'.bold.green + '       ' + '0000'.bold.green,
//    '00000000000000'.bold.red + '  ' + '0000000000'.bold.yellow + '      ' + '00000000000000'.bold.green,
//    '00000000000000'.bold.red + '  ' + '0000000000'.bold.yellow + '      ' + '0000000000000'.bold.green,
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '0000'.bold.yellow + '            ' + '0000'.bold.green + '      ' + '0000'.bold.green,
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '00000000000000'.bold.yellow + '  ' + '0000'.bold.green + '       ' + '0000'.bold.green,
//    '0000'.bold.red + '      ' + '0000'.bold.red + '  ' + '00000000000000'.bold.yellow + '  ' + '0000'.bold.green + '        ' + '0000'.bold.green,
//  ].join('\n');
//  console.log(content);
//};

module.exports = function () {

  var content = [
    '',
    '  v' + fis.cli.info.version,
    '',
    '`--.'.bold.red + '       ' + ':ss-'.bold.red + '   ' + './////////////.'.bold.yellow + '  ' + '`/ossssso+:-'.bold.green,
    '.yyo'.bold.red + '       ' + '+yy/'.bold.red + '   ' + '+oo+//+++++++/.'.bold.yellow + '  ' + ':dmdhyyyyhddy/`'.bold.green,
    '.yyo'.bold.red + '       ' + '/yys`'.bold.red + '  ' + '+oo.'.bold.yellow + '             ' + '.ymh:'.bold.green + '    ' + '`:ymmy'.bold.green,
    '-yyo'.bold.red + '       ' + '/yyy`'.bold.red + '  ' + '/oo+'.bold.yellow + '              ' + 'omd:'.bold.green + '      ' + '`mmm'.bold.green,
    'oyys--::+oosyyy`'.bold.red + '  ' + '.ooo------..`'.bold.yellow + '     ' + 'omm/'.bold.green + '   ' + '`.-ommh'.bold.green,
    'syyyyyyssoo+yyy.'.bold.red + '  ' + '`oooo+++++++-'.bold.yellow + '     ' + 'ommysssyhddh+.'.bold.green,
    'yyyo-..``'.bold.red + '   ' + 'syy:'.bold.red + '  ' + '`ooo.```````'.bold.yellow + '      ' + 'ommdsssdmm+`'.bold.green,
    'yyy:'.bold.red + '        ' + 'oyyo'.bold.red + '  ' + '`+oo-'.bold.yellow + '             ' + '/dmh.'.bold.green + ' ' + '`.hmd:'.bold.green,
    'yyy`'.bold.red + '        ' + 'oyys'.bold.red + '  ' + '`/oo+---------.'.bold.yellow + '   ' + '`hmd.'.bold.green + '   ' + '.ymd/'.bold.green,
    'yyy'.bold.red + '         ' + ':yys'.bold.red + '   ' + '`:++++++++++:-'.bold.yellow + '    ' + 'hmy`'.bold.green + '    ' + '`oh+`'.bold.green
  ].join('\n');
  console.log(content);
};

