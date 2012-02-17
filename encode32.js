// encode32: Base32 encoding for 32-bit numbers inspired by Douglas Crockford
// cf. http://www.crockford.com/wrmg/base32.html
//
// This encoding uses 32 digits, the standard numbers and 22 alphabetic characters.
// Easily confused characters are accepted as aliases for some digits (e.g. l for 1).
// U is excluded so you don't wind up with certain common obscenities.
//
// All 32-bit unsigned integers will encode into 7 base-32 (5-bit) digits.
// Rather than use an additional check character as suggested in the original source,
// we use the otherwise unused bits of the final character to store a 3-bit parity
// checksum.
//
// TODO: needs performance work (probably should port to C++)

var digits = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
var aliases = {
  'I': '1', 'i': '1', 'L': '1', 'l': '1',
  'O': '0', 'o': '0',
};

var encode_table = digits.split('');
var decode_table = new Array(256);
for (var c = 0; c < 256; c++) {
  s = String.fromCharCode(c);
  if (s in aliases) s = aliases[s];
  var i = digits.indexOf(s.toUpperCase());
  decode_table[c] = i > 0 ? i: NaN;
}

// convert a number to an array of words of given size using string conversion magic
function numberToWords(num, bitsPerWord)
{
  var radix = Math.pow(2, bitsPerWord);
  return num.toString(radix).split('').map(function (a) { return parseInt(a, radix); });
}

// calculate 3 bit parity of number
var parity3 = function (num)
{
  return numberToWords(num, 3).reduce(function (a, b) { return a ^ b; });
}

function tob(n) { return n.toString(2); }

exports.encode32 = function(n)
{
  n = n >>> 0; // force n to UInt32 form
  var parity = parity3(n).toString(2).split('');
  while (parity.length < 3) parity.unshift('0');
  var bits = n.toString(2).split('').concat(parity);
  while (bits.length < 35) bits.unshift('0');
  var words = [];
  while (bits.length) words.push(parseInt(bits.splice(0, 5).join(''), 2));
  return words.map(function (w) { return encode_table[w]; }).join('');
}

exports.decode32 = function(s)
{
  if (s.length != 7) return NaN;
  var words = s.split('').map(function (c) { return decode_table[c.charCodeAt()]; });
  var check = words[6] & 0x7;
  words[6] >>= 3; // scoot the last 2 bits back
  var n = words.reduce(function (t, w, i) { return ((t << (i < 6 ? 5 : 2)) + w) >>> 0; });
  return check == parity3(n) ? n : NaN;
}
