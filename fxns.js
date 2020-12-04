
exports.capitalize = (s)=>{
  if (typeof s !== 'string') {
    return ''
  } else {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}
