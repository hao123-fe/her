function appendToHead(element) {
  var hardpoint,
    heads = document.getElementsByTagName('head');
  hardpoint = heads.length && heads[0] || document.body;

  appendToHead = function (element) {
    hardpoint.appendChild(element);
  };
  return appendToHead(element);
}
