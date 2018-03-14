function ajax(url, cb, data) {
  var xhr = new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223 || xhr.status === 0) {
            cb(false, xhr.responseText, xhr.status);
        } else {
            cb(new Error('AjaxError'), xhr.statusText, xhr.status);
        }
    }
  };
  xhr.open(data ? 'POST' : 'GET', url + '&t=' + ~~(Math.random() * 1e6), true);

  if (data) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(data);
}
