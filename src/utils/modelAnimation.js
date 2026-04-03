import * as THREE from 'three'

export function createAnimationController() {
  let mixer = null
  let actions = []
  let playing = false

  function clear() {
    actions.forEach((action) => action.stop())
    actions = []
    mixer = null
    playing = false
  }

  function load(root, clips = []) {
    clear()

    if (!root || clips.length === 0) {
      return false
    }

    mixer = new THREE.AnimationMixer(root)
    actions = clips.map((clip) => {
      const action = mixer.clipAction(clip)
      action.reset()
      action.setLoop(THREE.LoopRepeat)
      return action
    })

    return true
  }

  function play() {
    if (!actions.length) return false

    actions.forEach((action) => action.play())
    playing = true
    return true
  }

  function pause() {
    if (!actions.length) return false

    actions.forEach((action) => {
      action.paused = true
    })
    playing = false
    return true
  }

  function resume() {
    if (!actions.length) return false

    actions.forEach((action) => {
      action.paused = false
      action.play()
    })
    playing = true
    return true
  }

  function setPlaying(shouldPlay) {
    if (!actions.length) return false
    return shouldPlay ? resume() : pause()
  }

  function update(deltaSeconds) {
    if (!mixer || !playing || deltaSeconds <= 0) return
    mixer.update(deltaSeconds)
  }

  function hasAnimations() {
    return actions.length > 0
  }

  function isPlaying() {
    return playing
  }

  return {
    clear,
    hasAnimations,
    isPlaying,
    load,
    play,
    setPlaying,
    update
  }
}
