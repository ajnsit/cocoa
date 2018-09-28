function _props_list(list) {
  var newProp = {};
  while(list && list.head) {
    var x = list.head
    newProp[x.fst] = x.snd
    list = list.tail
  }
  return newProp
}
