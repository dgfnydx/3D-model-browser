import * as THREE from 'three'

export function createAnimationController() {
  let mixer = null
  let actions = []
  let activeIndex = -1
  let playing = false

  function clear() {
    actions.forEach((action) => action.stop())
    actions = []
    mixer = null
    activeIndex = -1
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
      action.clampWhenFinished = false
      return action
    })

    activeIndex = actions.length ? 0 : -1

    return true
  }

  function stopAll() {
    actions.forEach((action) => {
      action.stop()
      action.paused = false
    })
  }

  function setActiveClip(index) {
    if (!actions.length || index < 0 || index >= actions.length) return false

    const wasPlaying = playing
    stopAll()
    activeIndex = index
    playing = false

    if (wasPlaying) {
      return play()
    }

    return true
  }

  function play() {
    if (!actions.length || activeIndex < 0) return false

    stopAll()
    const action = actions[activeIndex]
    action.reset()
    action.paused = false
    action.play()
    playing = true
    return true
  }

  function pause() {
    if (!actions.length || activeIndex < 0) return false

    actions[activeIndex].paused = true
    playing = false
    return true
  }

  function resume() {
    if (!actions.length || activeIndex < 0) return false

    const action = actions[activeIndex]
    action.paused = false
    action.play()
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

  function getActiveIndex() {
    return activeIndex
  }

  function isPlaying() {
    return playing
  }

  return {
    clear,
    getActiveIndex,
    hasAnimations,
    isPlaying,
    load,
    play,
    setActiveClip,
    setPlaying,
    update
  }
}
