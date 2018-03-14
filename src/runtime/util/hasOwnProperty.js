/**
 * hasOwnProperty
 *
 * @param obj $obj
 * @param key $key
 * @access public
 * @return void
 */
function hasOwnProperty(obj, key) {

  var native_hasOwnProperty = Object.prototype.hasOwnProperty;

  hasOwnProperty = function(obj, key) {
    return native_hasOwnProperty.call(obj, key);
  };

  return hasOwnProperty(obj, key);
}
