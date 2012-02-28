var enc = require("./encode32"), assert = require("assert");

var scale = 14, N = Math.pow(2, scale);

console.log("Testing " + N + " random integers");
var start = new Date();
for (var i = 0; i < N; i++) {
   var r = Math.floor(Math.random() * Math.pow(2, 32));
   var a = enc.encode32(r);
   assert.equal(a.length, 7, "bad encoded length");
   var b = enc.decode32(a);
   assert.ok(!isNaN(b), "decode failed: " + [r, a, b].join(" => "));
   assert.equal(b, r, "decode yielded incorrect result: " + [r, a, b].join(" => "));
}
var elapsed = new Date() - start;
console.log("done. (approx.", Math.floor(N / (elapsed / 1000.0)), "encode/decode cycles per second)"); 
