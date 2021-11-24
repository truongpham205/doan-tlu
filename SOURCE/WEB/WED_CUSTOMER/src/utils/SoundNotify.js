import React from 'react'
import { Howl } from 'howler'

export const soundPlay = (src) => {
  const sound = new Howl({
    src,
    html5: true,
  })
  sound.play()
}


