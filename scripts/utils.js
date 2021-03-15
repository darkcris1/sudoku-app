function checkProps(prop) {
  if (/^-+/.test(prop)) return prop
  if (/([^\-]+)([A-Z])/g.test(prop))
    return prop.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase())
  return prop.toLowerCase()
}
function styles(el, option) {
  for (let key in option) {
    el.style.setProperty(checkProps(key), option[key])
  }
}

function tag(el, option) {
  const newEl = el instanceof Element ? el : document.createElement(el)
  if (!option) return newEl
  for (let key in option) {
    const val = option[key]

    if (/^on([A-Z][a-z A-Z])+/.test(key)) {
      const event = key.toLowerCase().substr(2)
      newEl.addEventListener(event, val)
      continue
    }

    switch (key) {
      case 'style':
        styles(newEl, val)
        break
      case 'appendTo':
        if (!val) break
        val.appendChild(newEl)
        break
      case 'appendChild':
        newEl.appendChild(val)
        break
      case 'dataset':
        newEl.dataset[val[0]] = val[1] || ''
        break
      default:
        newEl[key] = val
    }
  }
  return newEl
}

function removeChilds(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

export { removeChilds, tag }
