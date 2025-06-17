const directionOffset = (forward: boolean, backward: boolean, left: boolean, right: boolean) => {
    let offset = 0
    if (forward) {
      if (left) offset = Math.PI / 4
      else if (right) offset = -Math.PI / 4
    } else if (backward) {
      if (left) offset = (Math.PI / 4) + (Math.PI / 2)
      else if (right) offset = (-Math.PI / 4) - (Math.PI / 2)
      else offset = Math.PI
    } else if (left) {
      offset = Math.PI / 2
    } else if (right) {
      offset = -Math.PI / 2
    }
    return offset
  }
  export default directionOffset